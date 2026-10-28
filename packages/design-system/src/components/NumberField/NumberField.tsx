"use client";

import type { ControlWidth } from "../control-width";

import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";
import { Button } from "../Button/Button";
import type { ControlSize } from "../control-size";
import type {
  ControlAppearance,
  ControlValidationState,
} from "../input-frame/control-state";
import { NumberInputControl } from "./NumberInputControl";
import {
  formatNumberValue,
  getNumberConstraintIssue,
  isNumberStepDisabled,
  parseNumberDraft,
  stepNumberValue,
  type NumberConstraintIssue,
  type NumberFieldMode,
  type NumberFieldStep,
} from "./number-value";
import styles from "./NumberField.module.css";
import { NumberFieldCompositionContext } from "./number-field-composition";

export type NumberFieldAppearance = ControlAppearance;
export type NumberFieldSize = ControlSize;
export type NumberFieldValidationState = ControlValidationState;
export type NumberFieldChangeReason = "decrement" | "increment" | "input";

export type NumberFieldChangeDetails = {
  draft: string;
  reason: NumberFieldChangeReason;
};

type NumberFieldStepperProps =
  | {
      decrementLabel: string;
      incrementLabel: string;
      showSteppers: true;
      step: number;
    }
  | {
      decrementLabel?: string;
      incrementLabel?: string;
      showSteppers?: false;
      step?: NumberFieldStep;
    };

type NumberFieldValueProps =
  | {
      defaultValue?: never;
      value: number | null;
    }
  | {
      defaultValue?: number | null;
      value?: never;
    };

type NumberFieldBaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "defaultValue"
  | "inputMode"
  | "onChange"
  | "prefix"
  | "size"
  | "step"
  | "type"
  | "value"
  | "width"
> & {
  width?: ControlWidth;
  appearance?: NumberFieldAppearance;
  loading?: boolean;
  locale?: string;
  max?: number;
  min?: number;
  mode?: NumberFieldMode;
  onConstraintIssueChange?: (issue: NumberConstraintIssue | undefined) => void;
  onValueChange?: (
    value: number | null,
    details: NumberFieldChangeDetails,
  ) => void;
  onValueCommit?: (value: number | null) => void;
  prefix?: string;
  size?: NumberFieldSize;
  suffix?: string;
  validationState?: NumberFieldValidationState;
};

export type NumberFieldProps = NumberFieldBaseProps &
  NumberFieldStepperProps &
  NumberFieldValueProps;

export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
    {
      appearance = "outlined",
      width = "fill",
      "aria-invalid": ariaInvalid,
      className,
      defaultValue = null,
      decrementLabel,
      disabled,
      form,
      id,
      incrementLabel,
      loading = false,
      locale,
      max,
      min,
      mode = "decimal",
      name,
      onBlur,
      onConstraintIssueChange,
      onFocus,
      onValueChange,
      onValueCommit,
      prefix,
      readOnly,
      required,
      showSteppers = false,
      size = "md",
      step = "any",
      suffix,
      validationState = "none",
      value,
      ...props
    },
    ref,
  ) {
    const composition = useContext(NumberFieldCompositionContext);
    const isComposed = composition !== null;
    const acceptedRevision = composition?.acceptedRevision;
    const constraintIssueFor =
      composition?.constraintIssue ?? getNumberConstraintIssue;
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const controlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState<number | null>(
      defaultValue,
    );
    const canonicalValue = controlled ? (value ?? null) : uncontrolledValue;
    const [draft, setDraft] = useState(() =>
      formatNumberValue(canonicalValue, { locale, mode }),
    );
    const [constraintIssue, setConstraintIssue] = useState<
      NumberConstraintIssue | undefined
    >();
    const focusedRef = useRef(false);
    const latestCanonicalValueRef = useRef(canonicalValue);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const numericStep =
      typeof step === "number" && Number.isFinite(step) && step > 0
        ? step
        : undefined;
    const keyboardStep = step === "any" ? 1 : numericStep;
    const validStepperConfig =
      !showSteppers ||
      (numericStep !== undefined &&
        Boolean(decrementLabel?.trim()) &&
        Boolean(incrementLabel?.trim()));
    const isLoading = loading && !disabled;

    useEffect(() => {
      latestCanonicalValueRef.current = canonicalValue;
      if (!focusedRef.current) {
        setDraft(formatNumberValue(canonicalValue, { locale, mode }));
        if (isComposed) setConstraintIssue(undefined);
      }
    }, [canonicalValue, locale, mode, isComposed, acceptedRevision]);

    useEffect(() => {
      inputRef.current?.setCustomValidity(
        constraintIssueFor(draft, {
          locale,
          max,
          min,
          mode,
          required,
          step,
        }) ?? "",
      );
    }, [draft, locale, max, min, mode, required, step, constraintIssueFor]);

    function setIssue(nextIssue: NumberConstraintIssue | undefined) {
      setConstraintIssue(nextIssue);
      onConstraintIssueChange?.(nextIssue);
    }

    function acceptValue(
      nextValue: number | null,
      details: NumberFieldChangeDetails,
    ) {
      if (!isComposed) latestCanonicalValueRef.current = nextValue;
      if (!controlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue, details);
    }

    function handleDraftChange(nextDraft: string) {
      setDraft(nextDraft);
      setIssue(undefined);

      const issue = constraintIssueFor(nextDraft, {
        locale,
        max,
        min,
        mode,
        required,
        step,
      });
      const parsed = parseNumberDraft(nextDraft, { locale, mode });
      if (issue || (parsed.kind !== "empty" && parsed.kind !== "valid")) {
        return;
      }

      acceptValue(parsed.value, { draft: nextDraft, reason: "input" });
    }

    function commitDraft() {
      const issue = constraintIssueFor(draft, {
        locale,
        max,
        min,
        mode,
        required,
        step,
      });
      setIssue(issue);
      if (issue) return;

      const parsed = parseNumberDraft(draft, { locale, mode });
      if (parsed.kind !== "empty" && parsed.kind !== "valid") return;
      setDraft(formatNumberValue(parsed.value, { locale, mode }));
      onValueCommit?.(parsed.value);
    }

    function restoreDraft() {
      setDraft(
        formatNumberValue(latestCanonicalValueRef.current, { locale, mode }),
      );
      setIssue(undefined);
    }

    function handleFocus(event: FocusEvent<HTMLInputElement>) {
      focusedRef.current = true;
      onFocus?.(event);
    }

    function handleBlur(event: FocusEvent<HTMLInputElement>) {
      focusedRef.current = false;
      commitDraft();
      onBlur?.(event);
    }

    function handleStep(direction: -1 | 1) {
      if (
        !keyboardStep ||
        !validStepperConfig ||
        disabled ||
        readOnly ||
        isLoading
      ) {
        return;
      }

      const parsed = parseNumberDraft(draft, { locale, mode });
      const startingValue =
        parsed.kind === "valid"
          ? parsed.value
          : latestCanonicalValueRef.current;
      const nextValue = composition
        ? composition.stepValue(startingValue, direction)
        : stepNumberValue(startingValue, direction, {
            max,
            min,
            step: keyboardStep,
          });
      if (nextValue === null) return;

      const nextDraft = formatNumberValue(nextValue, { locale, mode });
      setDraft(nextDraft);
      setIssue(undefined);
      acceptValue(nextValue, {
        draft: nextDraft,
        reason: direction === 1 ? "increment" : "decrement",
      });
      inputRef.current?.focus();
    }

    const invalid =
      Boolean(constraintIssue) ||
      validationState === "invalid" ||
      ariaInvalid === true ||
      ariaInvalid === "true";
    const decrementDisabled =
      disabled ||
      readOnly ||
      isLoading ||
      !numericStep ||
      !validStepperConfig ||
      isNumberStepDisabled(latestCanonicalValueRef.current, -1, { min, max });
    const incrementDisabled =
      disabled ||
      readOnly ||
      isLoading ||
      !numericStep ||
      !validStepperConfig ||
      isNumberStepDisabled(latestCanonicalValueRef.current, 1, { min, max });

    return (
      <span
        className={styles.root}
        data-width={width}
        data-appearance={appearance}
        data-constraint-issue={constraintIssue}
        data-size={size}
        data-steppers={showSteppers || undefined}
      >
        <NumberInputControl
          {...props}
          aria-invalid={invalid || undefined}
          width={width}
          appearance={appearance}
          className={className}
          disabled={disabled}
          draft={draft}
          form={form}
          id={inputId}
          loading={isLoading}
          locale={locale}
          max={max}
          min={min}
          mode={mode}
          onBlur={handleBlur}
          onDraftChange={handleDraftChange}
          onFocus={handleFocus}
          onValueCommit={commitDraft}
          onValueRestore={restoreDraft}
          onStep={handleStep}
          prefix={prefix}
          readOnly={readOnly}
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          required={required}
          size={size}
          step={step}
          suffix={suffix}
          validationState={invalid ? "invalid" : validationState}
        />

        {name ? (
          <input
            disabled={disabled}
            form={form}
            name={name}
            type="hidden"
            value={
              canonicalValue === null || !Number.isFinite(canonicalValue)
                ? ""
                : String(canonicalValue)
            }
          />
        ) : null}

        {showSteppers ? (
          <>
            <Button
              aria-controls={inputId}
              aria-label={decrementLabel ?? ""}
              className={styles.stepper}
              disabled={decrementDisabled}
              icon="arrows/compact/down"
              intent="neutral"
              onClick={() => handleStep(-1)}
              size={size}
              tabIndex={-1}
              variant="soft"
            />
            <Button
              aria-controls={inputId}
              aria-label={incrementLabel ?? ""}
              className={styles.stepper}
              disabled={incrementDisabled}
              icon="arrows/compact/up"
              intent="neutral"
              onClick={() => handleStep(1)}
              size={size}
              tabIndex={-1}
              variant="soft"
            />
          </>
        ) : null}
      </span>
    );
  },
);
