"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { classNames } from "../class-names";
import { Field, type FieldProps } from "../Field/Field";
import { NumberField } from "../NumberField/NumberField";
import { NumberFieldCompositionContext } from "../NumberField/number-field-composition";
import {
  getNumberConstraintIssue,
  parseNumberDraft,
  type NumberConstraintIssue,
} from "../NumberField/number-value";
import {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
  type RangeSliderHandle,
  type RangeSliderChangeDetails,
} from "../RangeSlider/RangeSlider";
import { RangeSliderCompositionContext } from "../RangeSlider/range-slider-composition";
import {
  continuousSliderRange,
  isLegalSliderValue,
  stepSliderValue,
} from "../Slider/slider-value";
import { Text } from "../Text/Text";
import styles from "./CompoundRangeField.module.css";

export type CompoundRangeFieldValue = RangeSliderValue;
export type CompoundRangeFieldIssue = {
  activeHandle: RangeSliderHandle;
  reason: NumberConstraintIssue;
};
export type CompoundRangeFieldChangeDetails = Omit<
  RangeSliderChangeDetails,
  "reason"
> & {
  source: "slider" | "number";
  reason: RangeSliderChangeDetails["reason"] | "commit";
};
export type CompoundRangeFieldProps = Pick<
  RangeSliderProps,
  | "min"
  | "max"
  | "size"
  | "disabled"
  | "readOnly"
  | "formatValue"
  | "formatRange"
  | "minValueLabel"
  | "maxValueLabel"
  | "markers"
  | "baseline"
  | "dir"
> &
  Pick<
    FieldProps,
    "label" | "hint" | "error" | "describedBy" | "className" | "style"
  > & {
    beginningLabel: string;
    endLabel: string;
    locale?: string;
    suffix?: string;
    id?: string;
    formatIssue?: (issue: CompoundRangeFieldIssue) => ReactNode;
    onConstraintIssueChange?: (
      issue: CompoundRangeFieldIssue | undefined,
    ) => void;
    onValueChange?: (
      value: RangeSliderValue,
      details: CompoundRangeFieldChangeDetails,
    ) => void;
    onValueCommit?: (
      value: RangeSliderValue,
      details: CompoundRangeFieldChangeDetails,
    ) => void;
  } & (
    | { value: RangeSliderValue; defaultValue?: never }
    | { value?: never; defaultValue: RangeSliderValue }
  ) &
  ({ mode?: "discrete"; step: number } | { mode: "continuous"; step?: never });
const handles = ["beginning", "end"] as const;

export function CompoundRangeField({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  onConstraintIssueChange,
  formatIssue,
  label,
  hint,
  error,
  describedBy,
  beginningLabel,
  endLabel,
  locale,
  suffix,
  id,
  className,
  style,
  mode = "discrete",
  step,
  min,
  max,
  size = "md",
  disabled = false,
  readOnly = false,
  ...sliderProps
}: CompoundRangeFieldProps) {
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const controlled = value !== undefined;
  const [local, setLocal] = useState<RangeSliderValue>(value ?? defaultValue!);
  const pair = controlled ? value : local;
  const pairRef = useRef(pair);
  useEffect(() => {
    pairRef.current = pair;
  }, [pair]);
  const [issues, setIssues] = useState<
    Partial<Record<RangeSliderHandle, NumberConstraintIssue>>
  >({});
  const issuesRef = useRef(issues);
  const range =
    mode === "continuous"
      ? continuousSliderRange(min, max)
      : { min, max, step: step! };
  const activeIssue = handles.find((h) => issues[h]);
  const issue = activeIssue
    ? { activeHandle: activeIssue, reason: issues[activeIssue]! }
    : undefined;
  const message = error ?? (issue ? formatIssue?.(issue) : undefined);
  const invalid = Boolean(error) || Boolean(issue);
  const movement =
    mode === "continuous"
      ? { mode: "continuous" as const }
      : { mode: "discrete" as const, step: step! };
  function setIssue(
    handle: RangeSliderHandle,
    next: NumberConstraintIssue | undefined,
  ) {
    const updated = { ...issuesRef.current, [handle]: next };
    issuesRef.current = updated;
    setIssues(updated);
    const active = handles.find((h) => updated[h]);
    onConstraintIssueChange?.(
      active ? { activeHandle: active, reason: updated[active]! } : undefined,
    );
  }
  function emit(
    next: RangeSliderValue,
    details: CompoundRangeFieldChangeDetails,
  ) {
    if (disabled || readOnly) return;
    if (
      next[0] === pairRef.current[0] &&
      next[1] === pairRef.current[1] &&
      details.reason !== "pointerCancel"
    )
      return;
    if (!controlled) {
      pairRef.current = next;
      setLocal(next);
    }
    onValueChange?.(next, details);
  }
  function numericIssue(
    n: number,
    handle: RangeSliderHandle,
  ): NumberConstraintIssue | undefined {
    if (n < min) return "rangeUnderflow";
    if (n > max) return "rangeOverflow";
    if (!isLegalSliderValue(n, range)) return "stepMismatch";
    if (handle === "beginning" && n > pairRef.current[1])
      return "rangeOverflow";
    if (handle === "end" && n < pairRef.current[0]) return "rangeUnderflow";
  }
  function commitNumber(n: number | null, handle: RangeSliderHandle) {
    if (disabled || readOnly) return;
    const issue = n === null ? "required" : numericIssue(n, handle);
    setIssue(handle, issue);
    if (issue || n === null) return;
    const previousValue = pairRef.current;
    const next: RangeSliderValue =
      handle === "beginning" ? [n, previousValue[1]] : [previousValue[0], n];
    const details = {
      previousValue,
      activeHandle: handle,
      source: "number" as const,
      reason: "commit" as const,
    };
    emit(next, details);
    onValueCommit?.(next, details);
  }
  return (
    <Field
      label={label}
      hint={hint}
      error={message}
      describedBy={describedBy}
      controlId={`${rootId}-beginning`}
      role="group"
      aria-labelledby={`${rootId}-beginning-label`}
      className={classNames(styles.root, className)}
      style={style}
    >
      {({ controlProps }) => (
        <div className={styles.content} dir={sliderProps.dir}>
          <div className={styles.range}>
            <RangeSliderCompositionContext.Provider
              value={controlProps["aria-labelledby"]}
            >
              <RangeSlider
                className={styles.rangeControl}
                {...sliderProps}
                {...movement}
                min={min}
                max={max}
                size={size}
                disabled={disabled}
                readOnly={readOnly}
                label={label}
                beginningHandleLabel={beginningLabel}
                endHandleLabel={endLabel}
                value={pair}
                aria-describedby={controlProps["aria-describedby"]}
                aria-invalid={invalid || undefined}
                onValueChange={(next, details) => {
                  issuesRef.current = {};
                  setIssues({});
                  onConstraintIssueChange?.(undefined);
                  emit(next, {
                    ...details,
                    previousValue: pairRef.current,
                    source: "slider",
                  });
                }}
                onValueCommit={(next, details) =>
                  onValueCommit?.(next, { ...details, source: "slider" })
                }
              />
            </RangeSliderCompositionContext.Provider>
          </div>
          <div className={styles.editors}>
            {handles.map((handle, index) => (
              <div className={styles.editor} key={handle}>
                <Text variant="label-sm" id={`${rootId}-${handle}-qualifier`}>
                  {index === 0 ? beginningLabel : endLabel}
                </Text>
                <NumberFieldCompositionContext.Provider
                  value={{
                    acceptedRevision: `${pair[0]}:${pair[1]}`,
                    constraintIssue: (draft, rules) => {
                      const baseIssue = getNumberConstraintIssue(draft, rules);
                      if (baseIssue && baseIssue !== "stepMismatch")
                        return baseIssue;
                      const parsed = parseNumberDraft(draft, { locale });
                      return parsed.kind === "valid"
                        ? numericIssue(parsed.value, handle)
                        : "required";
                    },
                    stepValue: (n, direction) => {
                      const start =
                        n !== null && isLegalSliderValue(n, range)
                          ? n
                          : pairRef.current[index];
                      const next = stepSliderValue(start, direction, range);
                      return handle === "beginning"
                        ? Math.min(next, pairRef.current[1])
                        : Math.max(next, pairRef.current[0]);
                    },
                  }}
                >
                  <NumberField
                    appearance="soft"
                    id={`${rootId}-${handle}`}
                    aria-labelledby={`${controlProps["aria-labelledby"]} ${rootId}-${handle}-qualifier`}
                    aria-describedby={controlProps["aria-describedby"]}
                    aria-errormessage={controlProps["aria-errormessage"]}
                    aria-invalid={invalid || undefined}
                    aria-valuemin={index === 0 ? min : pair[0]}
                    aria-valuemax={index === 0 ? pair[1] : max}
                    value={pair[index]}
                    min={min}
                    max={max}
                    step={range.step}
                    locale={locale}
                    suffix={suffix}
                    size={size}
                    disabled={disabled}
                    readOnly={readOnly}
                    required
                    onConstraintIssueChange={(next) => setIssue(handle, next)}
                    onValueCommit={(next) => commitNumber(next, handle)}
                  />
                </NumberFieldCompositionContext.Provider>
              </div>
            ))}
          </div>
        </div>
      )}
    </Field>
  );
}
