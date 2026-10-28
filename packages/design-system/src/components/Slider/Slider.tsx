"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import {
  assertLegalSliderValue,
  assertSliderRange,
  continuousSliderRange,
  continuousSliderKeySteps,
  SLIDER_CONTINUOUS_PRECISION,
  quantizeSliderValue,
  sliderValuePercent,
  stepSliderValue,
} from "./slider-value";
import styles from "./Slider.module.css";
import {
  SliderHeader,
  SliderFooter,
  SliderMarkers,
  scaleMarkers,
} from "./slider-presentation";

export type SliderSize = ControlSize;
export type SliderValueChangeReason = "keyboard" | "pointer" | "pointerCancel";

export type SliderValueChangeDetails = {
  previousValue: number;
  reason: SliderValueChangeReason;
};

export type SliderMarker = {
  label?: ReactNode;
  value: number;
};

export type SliderBaseline = {
  label: ReactNode;
  value: number;
};

type SliderValueProps =
  | { defaultValue?: never; value: number }
  | { defaultValue: number; value?: never };

type SliderMovementProps =
  { mode?: "discrete"; step: number } | { mode: "continuous"; step?: never };

type SliderBaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "defaultValue"
  | "max"
  | "min"
  | "onChange"
  | "readOnly"
  | "size"
  | "step"
  | "type"
  | "value"
> & {
  baseline?: SliderBaseline;
  disabled?: boolean;
  formatValue?: (value: number) => string;
  label?: ReactNode;
  markers?: readonly SliderMarker[];
  max: number;
  maxValueLabel?: ReactNode;
  min: number;
  minValueLabel?: ReactNode;
  onValueChange?: (value: number, details: SliderValueChangeDetails) => void;
  onValueCommit?: (
    value: number,
    details: Omit<SliderValueChangeDetails, "reason"> & {
      reason: Exclude<SliderValueChangeReason, "pointerCancel">;
    },
  ) => void;
  readOnly?: boolean;
  size?: SliderSize;
  valueLabel?: ReactNode;
};

export type SliderProps = SliderBaseProps &
  SliderValueProps &
  SliderMovementProps;

const EMPTY_SLIDER_MARKERS: readonly SliderMarker[] = [];

type SliderStyle = CSSProperties & {
  "--slider-progress": string;
};

function directionOf(element: HTMLElement) {
  let current: HTMLElement | null = element;
  while (current) {
    const direction = current.getAttribute("dir");
    if (direction === "rtl" || direction === "ltr") return direction;
    current = current.parentElement;
  }
  return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    "aria-readonly": ariaReadOnly,
    "aria-valuetext": ariaValueText,
    baseline,
    className,
    defaultValue,
    disabled = false,
    formatValue: suppliedFormatter,
    label,
    markers = EMPTY_SLIDER_MARKERS,
    max,
    maxValueLabel,
    min,
    minValueLabel,
    mode = "discrete",
    onKeyDown,
    onKeyUp,
    onPointerCancel,
    onPointerDown,
    onPointerUp,
    onValueChange,
    onValueCommit,
    readOnly = false,
    size = "md",
    step,
    style,
    value,
    valueLabel,
    ...props
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputId = props.id ?? generatedId;
  const range =
    mode === "continuous"
      ? continuousSliderRange(min, max)
      : { max, min, step: step! };
  const keySteps = mode === "continuous" ? continuousSliderKeySteps(range) : 1;
  const formatValue =
    suppliedFormatter ??
    (mode === "continuous"
      ? (nextValue: number) => nextValue.toFixed(SLIDER_CONTINUOUS_PRECISION)
      : String);
  assertSliderRange(range);
  const controlled = value !== undefined;
  const initialValue = controlled ? value : defaultValue;
  assertLegalSliderValue(initialValue, range);
  markers.forEach((marker, index) =>
    assertLegalSliderValue(marker.value, range, `markers[${index}].value`),
  );
  if (baseline) assertLegalSliderValue(baseline.value, range, "baseline.value");

  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue);
  const currentValue = controlled ? value : uncontrolledValue;
  const currentValueRef = useRef(currentValue);
  const activePointerRef = useRef<number | null>(null);
  const pointerStartValueRef = useRef(currentValue);
  const keyboardStartValueRef = useRef(currentValue);
  const keyboardCommitPendingRef = useRef(false);
  const formattedValue = formatValue(currentValue);
  const progress = sliderValuePercent(currentValue, range);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  function setInputRef(node: HTMLInputElement | null) {
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }

  function emitValue(nextValue: number, reason: SliderValueChangeReason) {
    const previousValue = currentValueRef.current;
    if (Object.is(nextValue, previousValue)) return;
    if (!controlled) {
      currentValueRef.current = nextValue;
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue, { previousValue, reason });
  }

  function commitValue(reason: "keyboard" | "pointer", previousValue: number) {
    onValueCommit?.(currentValueRef.current, {
      previousValue,
      reason,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || readOnly) return;

    const rtl = directionOf(event.currentTarget) === "rtl";
    const directions: Record<string, -1 | 1> = {
      ArrowUp: 1,
      ArrowDown: -1,
      ArrowRight: rtl ? -1 : 1,
      ArrowLeft: rtl ? 1 : -1,
      PageUp: 1,
      PageDown: -1,
    };
    const direction = Object.hasOwn(directions, event.key)
      ? directions[event.key]
      : undefined;
    let nextValue: number;
    if (event.key === "Home") nextValue = min;
    else if (event.key === "End") nextValue = max;
    else if (direction) {
      const count = event.key.startsWith("Page") ? keySteps * 10 : keySteps;
      nextValue = stepSliderValue(
        currentValueRef.current,
        direction,
        range,
        count,
      );
    } else return;

    event.preventDefault();
    keyboardStartValueRef.current = currentValueRef.current;
    keyboardCommitPendingRef.current = true;
    emitValue(nextValue, "keyboard");
  }

  function handleKeyUp(event: KeyboardEvent<HTMLInputElement>) {
    onKeyUp?.(event);
    if (!keyboardCommitPendingRef.current) return;
    keyboardCommitPendingRef.current = false;
    commitValue("keyboard", keyboardStartValueRef.current);
  }

  function handlePointerDown(event: PointerEvent<HTMLInputElement>) {
    onPointerDown?.(event);
    if (event.defaultPrevented || disabled || readOnly || event.button !== 0)
      return;
    activePointerRef.current = event.pointerId;
    pointerStartValueRef.current = currentValueRef.current;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLInputElement>) {
    onPointerUp?.(event);
    if (activePointerRef.current !== event.pointerId) return;
    if (!disabled && !readOnly && !event.defaultPrevented) {
      commitValue("pointer", pointerStartValueRef.current);
    }
    activePointerRef.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handlePointerCancel(event: PointerEvent<HTMLInputElement>) {
    onPointerCancel?.(event);
    if (activePointerRef.current !== event.pointerId) return;
    activePointerRef.current = null;
    emitValue(pointerStartValueRef.current, "pointerCancel");
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const allMarkers = scaleMarkers(markers, baseline);

  return (
    <div
      className={styles.root}
      data-disabled={disabled || undefined}
      data-read-only={readOnly || undefined}
      data-size={size}
      data-mode={mode}
    >
      <SliderHeader
        label={label}
        inputId={inputId}
        current={valueLabel ?? formattedValue}
        samples={[formatValue(min), formatValue(max)]}
      />

      <div
        className={styles.control}
        style={{ "--slider-progress": String(progress / 100) } as SliderStyle}
      >
        <input
          {...props}
          id={inputId}
          aria-readonly={readOnly || ariaReadOnly || undefined}
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={currentValue}
          aria-valuetext={ariaValueText ?? formattedValue}
          className={classNames(styles.input, className)}
          disabled={disabled}
          max={max}
          min={min}
          onChange={(event) => {
            if (disabled || readOnly) {
              event.currentTarget.value = String(currentValueRef.current);
              return;
            }
            emitValue(
              quantizeSliderValue(event.currentTarget.valueAsNumber, range),
              "pointer",
            );
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          ref={setInputRef}
          step="any"
          style={style}
          type="range"
          value={currentValue}
        />
        <div aria-hidden className={styles.track}>
          <span className={styles.fill} />
          <SliderMarkers allMarkers={allMarkers} range={range} />
        </div>
      </div>

      <SliderFooter
        min={min}
        max={max}
        minValueLabel={minValueLabel}
        maxValueLabel={maxValueLabel}
        formatValue={formatValue}
        allMarkers={allMarkers}
      />
    </div>
  );
});
