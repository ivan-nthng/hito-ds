export type NumberFieldMode = "decimal" | "integer";
export type NumberFieldStep = number | "any";

export type ParsedNumberDraft =
  | { kind: "empty"; value: null }
  | { kind: "intermediate" }
  | { kind: "invalid" }
  | { kind: "valid"; value: number };

export type NumberConstraintIssue =
  | "invalid"
  | "rangeOverflow"
  | "rangeUnderflow"
  | "required"
  | "stepMismatch";

type NumberRules = {
  locale?: string;
  max?: number;
  min?: number;
  mode?: NumberFieldMode;
  required?: boolean;
  step?: NumberFieldStep;
};

function numberFormat(locale?: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 20,
    useGrouping: false,
  });
}

function localeSymbols(locale?: string) {
  const formatter = numberFormat(locale);
  const decimal =
    formatter.formatToParts(1.1).find((part) => part.type === "decimal")
      ?.value ?? ".";
  const digits = new Map<string, string>();

  for (let digit = 0; digit <= 9; digit += 1) {
    digits.set(formatter.format(digit), String(digit));
  }

  return { decimal, digits };
}

function normalizeDraft(rawDraft: string, locale?: string) {
  const { decimal, digits } = localeSymbols(locale);
  let draft = rawDraft.replaceAll("−", "-");

  for (const [localized, ascii] of digits) {
    draft = draft.replaceAll(localized, ascii);
  }

  if (decimal !== ".") draft = draft.replaceAll(decimal, ".");
  return draft;
}

export function parseNumberDraft(
  draft: string,
  {
    locale,
    mode = "decimal",
  }: Pick<NumberRules, "locale" | "mode"> = {},
): ParsedNumberDraft {
  if (draft.length === 0) return { kind: "empty", value: null };
  if (draft.trim() !== draft) return { kind: "invalid" };

  const normalized = normalizeDraft(draft, locale);
  if (normalized === "+" || normalized === "-") {
    return { kind: "intermediate" };
  }

  if (
    mode === "decimal" &&
    /^[+-]?(?:\d+\.|\.)$/.test(normalized)
  ) {
    return { kind: "intermediate" };
  }

  const pattern =
    mode === "integer" ? /^[+-]?\d+$/ : /^[+-]?(?:\d+|\d*\.\d+)$/;
  if (!pattern.test(normalized)) return { kind: "invalid" };

  const value = Number(normalized);
  if (!Number.isFinite(value)) return { kind: "invalid" };
  if (mode === "integer" && !Number.isInteger(value)) {
    return { kind: "invalid" };
  }

  return { kind: "valid", value };
}

export function formatNumberValue(
  value: number | null,
  options: Pick<NumberRules, "locale" | "mode"> = {},
) {
  if (value === null || !Number.isFinite(value)) return "";
  return numberFormat(options.locale).format(value);
}

function isStepMismatch(value: number, min: number | undefined, step: number) {
  const quotient = (value - (min ?? 0)) / step;
  return Math.abs(quotient - Math.round(quotient)) > 1e-9;
}

export function getNumberConstraintIssue(
  draft: string,
  {
    locale,
    max,
    min,
    mode = "decimal",
    required = false,
    step = "any",
  }: NumberRules = {},
): NumberConstraintIssue | undefined {
  const parsed = parseNumberDraft(draft, { locale, mode });

  if (parsed.kind === "empty") return required ? "required" : undefined;
  if (parsed.kind !== "valid") return "invalid";
  if (min !== undefined && parsed.value < min) return "rangeUnderflow";
  if (max !== undefined && parsed.value > max) return "rangeOverflow";
  if (
    step !== "any" &&
    Number.isFinite(step) &&
    step > 0 &&
    isStepMismatch(parsed.value, min, step)
  ) {
    return "stepMismatch";
  }

  return undefined;
}

function decimalPlaces(value: number) {
  const [coefficient, exponentText = "0"] = String(value)
    .toLowerCase()
    .split("e");
  const exponent = Number(exponentText);
  const coefficientFraction = coefficient.split(".")[1]?.length ?? 0;
  return Math.max(0, coefficientFraction - exponent);
}

function roundStep(value: number, step: number, min?: number) {
  const precision = Math.min(
    12,
    Math.max(decimalPlaces(step), min === undefined ? 0 : decimalPlaces(min)),
  );
  return Number(value.toFixed(precision));
}

export function stepNumberValue(
  value: number | null,
  direction: -1 | 1,
  { max, min, step }: Pick<NumberRules, "max" | "min" | "step">,
) {
  if (typeof step !== "number" || !Number.isFinite(step) || step <= 0) {
    return value;
  }

  const candidate =
    value === null
      ? direction === 1
        ? (min ?? 0)
        : (max ?? 0)
      : value + direction * step;
  const bounded = Math.min(max ?? Number.POSITIVE_INFINITY, candidate);
  return roundStep(Math.max(min ?? Number.NEGATIVE_INFINITY, bounded), step, min);
}

export function isNumberStepDisabled(
  value: number | null,
  direction: -1 | 1,
  { max, min }: Pick<NumberRules, "max" | "min">,
) {
  if (value === null) return false;
  return direction === -1
    ? min !== undefined && value <= min
    : max !== undefined && value >= max;
}
