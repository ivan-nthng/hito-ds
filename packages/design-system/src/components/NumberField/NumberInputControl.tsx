import type { ControlWidth } from "../control-width";
import {
  forwardRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import type { ControlSize } from "../control-size";
import { InputFrame, inputFrameStyles } from "../input-frame/InputFrame";
import {
  resolveControlState,
  type ControlAppearance,
  type ControlValidationState,
} from "../input-frame/control-state";
import { classNames } from "../class-names";
import {
  formatNumberValue,
  parseNumberDraft,
  type NumberFieldMode,
  type NumberFieldStep,
} from "./number-value";
import styles from "./NumberField.module.css";

export type NumberInputControlProps = Omit<
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
  appearance?: ControlAppearance;
  draft: string;
  loading?: boolean;
  locale?: string;
  max?: number;
  min?: number;
  mode?: NumberFieldMode;
  onDraftChange: (draft: string) => void;
  onValueCommit?: () => void;
  onValueRestore?: () => void;
  onStep?: (direction: -1 | 1) => void;
  prefix?: string;
  size?: ControlSize;
  step?: NumberFieldStep;
  suffix?: string;
  validationState?: ControlValidationState;
};

export const NumberInputControl = forwardRef<
  HTMLInputElement,
  NumberInputControlProps
>(function NumberInputControl(
  {
    appearance = "outlined",
    width = "fill",
    "aria-busy": ariaBusy,
    "aria-invalid": ariaInvalid,
    "aria-valuemax": ariaValueMax,
    "aria-valuemin": ariaValueMin,
    "aria-valuenow": ariaValueNow,
    "aria-valuetext": ariaValueText,
    className,
    disabled,
    draft,
    loading = false,
    locale,
    max,
    min,
    mode = "decimal",
    onDraftChange,
    onKeyDown,
    onValueCommit,
    onValueRestore,
    onStep,
    placeholder,
    prefix,
    readOnly,
    size = "md",
    step = "any",
    suffix,
    validationState = "none",
    ...props
  },
  ref,
) {
  const parsed = parseNumberDraft(draft, { locale, mode });
  const state = resolveControlState({
    ariaInvalid,
    disabled,
    loading,
    readOnly,
    validationState,
  });
  const canStep =
    step === "any" ||
    (typeof step === "number" && Number.isFinite(step) && step > 0);
  const resolvedValueText =
    ariaValueText ??
    (parsed.kind === "empty"
      ? (placeholder ?? "")
      : parsed.kind === "valid" && (prefix || suffix)
        ? `${prefix ?? ""}${formatNumberValue(parsed.value, { locale, mode })}${suffix ?? ""}`
        : undefined);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onDraftChange(event.currentTarget.value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (
      event.defaultPrevented ||
      disabled ||
      readOnly ||
      state.isLoading ||
      event.nativeEvent.isComposing
    ) {
      return;
    }

    if (event.key === "Enter" && onValueCommit) {
      event.preventDefault();
      onValueCommit();
      return;
    }

    if (event.key === "Escape" && onValueRestore) {
      event.preventDefault();
      onValueRestore();
      return;
    }

    if (
      canStep &&
      onStep &&
      (event.key === "ArrowUp" || event.key === "ArrowDown")
    ) {
      event.preventDefault();
      onStep(event.key === "ArrowUp" ? 1 : -1);
    }
  }

  return (
    <InputFrame
      width={width}
      appearance={appearance}
      className={styles.frame}
      data-has-suffix={Boolean(suffix) || undefined}
      disabled={disabled}
      invalid={state.invalid}
      loading={state.isLoading}
      readOnly={readOnly}
      size={size}
      validationState={state.resolvedValidationState}
    >
      {prefix ? (
        <span aria-hidden className={inputFrameStyles.affix} data-position="leading">
          {prefix}
        </span>
      ) : null}
      <input
        {...props}
        aria-busy={state.isLoading || ariaBusy || undefined}
        aria-invalid={state.invalid ? true : ariaInvalid}
        aria-valuemax={ariaValueMax ?? max}
        aria-valuemin={ariaValueMin ?? min}
        aria-valuenow={
          ariaValueNow ?? (parsed.kind === "valid" ? parsed.value : undefined)
        }
        aria-valuetext={resolvedValueText}
        className={classNames(inputFrameStyles.input, styles.input, className)}
        disabled={disabled}
        inputMode={mode === "integer" ? "numeric" : "decimal"}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly={state.isReadOnly}
        ref={ref}
        role="spinbutton"
        type="text"
        value={draft}
      />
      {suffix ? (
        <span aria-hidden className={inputFrameStyles.affix} data-position="trailing">
          {suffix}
        </span>
      ) : null}
    </InputFrame>
  );
});
