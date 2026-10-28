"use client";

import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { classNames } from "../class-names";
import type {
  SliderBaseline,
  SliderMarker,
  SliderSize,
} from "../Slider/Slider";
import {
  assertLegalSliderValue,
  assertSliderRange,
  continuousSliderRange,
  continuousSliderKeySteps,
  quantizeSliderValue,
  sliderValuePercent,
  stepSliderValue,
  SLIDER_CONTINUOUS_PRECISION,
} from "../Slider/slider-value";
import {
  SliderFooter,
  SliderHeader,
  SliderMarkers,
  scaleMarkers,
} from "../Slider/slider-presentation";
import shared from "../Slider/Slider.module.css";
import styles from "./RangeSlider.module.css";
import { RangeSliderCompositionContext } from "./range-slider-composition";

export type RangeSliderValue = readonly [beginning: number, end: number];
export type RangeSliderHandle = "beginning" | "end";
export type RangeSliderChangeDetails = {
  previousValue: RangeSliderValue;
  activeHandle: RangeSliderHandle;
  reason: "keyboard" | "pointer" | "pointerCancel";
};
export type RangeSliderRef = { focus: (handle?: RangeSliderHandle) => void };
export type RangeSliderProps = {
  min: number;
  max: number;
  size?: SliderSize;
  label: ReactNode;
  beginningHandleLabel: string;
  endHandleLabel: string;
  formatValue?: (value: number) => string;
  formatRange?: (value: RangeSliderValue) => string;
  minValueLabel?: ReactNode;
  maxValueLabel?: ReactNode;
  markers?: readonly SliderMarker[];
  baseline?: SliderBaseline;
  disabled?: boolean;
  readOnly?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  className?: string;
  style?: CSSProperties;
  id?: string;
  dir?: "ltr" | "rtl";
  onValueChange?: (
    value: RangeSliderValue,
    details: RangeSliderChangeDetails,
  ) => void;
  onValueCommit?: (
    value: RangeSliderValue,
    details: Omit<RangeSliderChangeDetails, "reason"> & {
      reason: "keyboard" | "pointer";
    },
  ) => void;
} & (
  | { value: RangeSliderValue; defaultValue?: never }
  | { value?: never; defaultValue: RangeSliderValue }
) &
  ({ mode?: "discrete"; step: number } | { mode: "continuous"; step?: never });

const HANDLES = ["beginning", "end"] as const;
const EMPTY_MARKERS: readonly SliderMarker[] = [];
const keys = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);
type Gesture = {
  handle: RangeSliderHandle;
  start: RangeSliderValue;
  pointerId?: number;
};

export const RangeSlider = forwardRef<RangeSliderRef, RangeSliderProps>(
  function RangeSlider(
    {
      min,
      max,
      step,
      mode = "discrete",
      size = "md",
      label,
      beginningHandleLabel,
      endHandleLabel,
      formatValue: suppliedFormatter,
      formatRange: suppliedRangeFormatter,
      minValueLabel,
      maxValueLabel,
      markers = EMPTY_MARKERS,
      baseline,
      disabled = false,
      readOnly = false,
      value,
      defaultValue,
      onValueChange,
      onValueCommit,
      className,
      style,
      id,
      dir,
      "aria-describedby": describedBy,
      "aria-invalid": invalid,
    },
    ref,
  ) {
    const groupLabelId = useContext(RangeSliderCompositionContext);
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const range =
      mode === "continuous"
        ? continuousSliderRange(min, max)
        : { min, max, step: step! };
    assertSliderRange(range);
    const controlled = value !== undefined;
    const initial = value ?? defaultValue;
    function validate(pair: RangeSliderValue | undefined) {
      if (!pair || pair.length !== 2 || pair[0] > pair[1])
        throw new RangeError(
          "RangeSlider requires an ordered [beginning, end] pair.",
        );
      pair.forEach((next) => assertLegalSliderValue(next, range));
    }
    validate(initial);
    const [local, setLocal] = useState(initial!);
    const current = controlled ? value : local;
    validate(current);
    const currentRef = useRef(current);
    useEffect(() => {
      currentRef.current = current;
    }, [current]);
    const inputs = useRef<Array<HTMLInputElement | null>>([]);
    const control = useRef<HTMLDivElement>(null);
    const pointer = useRef<Gesture | null>(null);
    const keyboard = useRef<Gesture | null>(null);
    const recent = useRef<RangeSliderHandle | null>(null);
    const [active, setActive] = useState<RangeSliderHandle>("end");
    const [hovered, setHovered] = useState<RangeSliderHandle | null>(null);
    const [pressed, setPressed] = useState<RangeSliderHandle | null>(null);
    const formatValue =
      suppliedFormatter ??
      (mode === "continuous"
        ? (n: number) => n.toFixed(SLIDER_CONTINUOUS_PRECISION)
        : String);
    const formatRange =
      suppliedRangeFormatter ??
      ((pair: RangeSliderValue) =>
        `${formatValue(pair[0])}–${formatValue(pair[1])}`);
    const allMarkers = scaleMarkers(markers, baseline);
    allMarkers.forEach((marker) =>
      assertLegalSliderValue(marker.value, range, "marker.value"),
    );
    if (!beginningHandleLabel.trim() || !endHandleLabel.trim())
      throw new TypeError("RangeSlider requires both localized handle labels.");
    useImperativeHandle(
      ref,
      () => ({
        focus: (handle = "beginning") =>
          inputs.current[HANDLES.indexOf(handle)]?.focus(),
      }),
      [],
    );

    function activate(handle: RangeSliderHandle) {
      recent.current = handle;
      setActive(handle);
    }
    function emit(
      next: RangeSliderValue,
      handle: RangeSliderHandle,
      reason: RangeSliderChangeDetails["reason"],
      force = false,
    ) {
      const previousValue = currentRef.current;
      if (
        !force &&
        next[0] === previousValue[0] &&
        next[1] === previousValue[1]
      )
        return;
      if (!controlled) {
        currentRef.current = next;
        setLocal(next);
      }
      onValueChange?.(next, { previousValue, activeHandle: handle, reason });
    }
    function move(
      raw: number,
      handle: RangeSliderHandle,
      reason: "keyboard" | "pointer",
    ) {
      if (!Number.isFinite(raw)) return;
      const pair = currentRef.current;
      const n = quantizeSliderValue(raw, range);
      const next: RangeSliderValue =
        handle === "beginning"
          ? [Math.min(n, pair[1]), pair[1]]
          : [pair[0], Math.max(n, pair[0])];
      emit(next, handle, reason);
    }
    function commit(gesture: Gesture, reason: "keyboard" | "pointer") {
      onValueCommit?.(currentRef.current, {
        previousValue: gesture.start,
        activeHandle: gesture.handle,
        reason,
      });
    }
    function finishKeyboard() {
      const gesture = keyboard.current;
      keyboard.current = null;
      if (gesture && !disabled && !readOnly) commit(gesture, "keyboard");
    }
    function keyDown(
      event: KeyboardEvent<HTMLInputElement>,
      handle: RangeSliderHandle,
    ) {
      if (!keys.has(event.key)) return;
      event.preventDefault();
      if (disabled || readOnly || pointer.current) return;
      activate(handle);
      if (!keyboard.current)
        keyboard.current = { handle, start: currentRef.current };
      const pair = currentRef.current;
      const index = HANDLES.indexOf(handle);
      let n: number;
      if (event.key === "Home") n = handle === "beginning" ? min : pair[0];
      else if (event.key === "End") n = handle === "beginning" ? pair[1] : max;
      else {
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        const up =
          event.key === "ArrowUp" ||
          event.key === "PageUp" ||
          (event.key === "ArrowRight"
            ? !rtl
            : event.key === "ArrowLeft" && rtl);
        const increments =
          (mode === "continuous" ? continuousSliderKeySteps(range) : 1) *
          (event.key.startsWith("Page") ? 10 : 1);
        n = stepSliderValue(pair[index], up ? 1 : -1, range, increments);
      }
      move(n, handle, "keyboard");
    }
    // Native inputs retain global min/max for one shared centre-travel path. ARIA
    // exposes the peer-constrained bounds; all mutation paths clamp before emission.
    function pointerValue(clientX: number) {
      const row = control.current!;
      const travel = row
        .querySelector<HTMLElement>("[data-slider-travel]")!
        .getBoundingClientRect();
      if (travel.width <= 0) return min;
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - travel.left) / travel.width),
      );
      return (
        min +
        (max - min) *
          (getComputedStyle(row).direction === "rtl" ? 1 - ratio : ratio)
      );
    }
    function nearest(raw: number): RangeSliderHandle {
      const [beginning, end] = currentRef.current;
      const first = Math.abs(raw - beginning),
        last = Math.abs(raw - end);
      if (first < last) return "beginning";
      if (last < first) return "end";
      if (recent.current) return recent.current;
      if (raw < beginning) return "beginning";
      if (raw > end) return "end";
      return raw === max ? "beginning" : "end";
    }
    function pointerDown(event: PointerEvent<HTMLDivElement>) {
      if (disabled || readOnly || event.button !== 0 || pointer.current) return;
      event.preventDefault();
      finishKeyboard();
      const raw = pointerValue(event.clientX),
        handle = nearest(raw);
      const input = inputs.current[HANDLES.indexOf(handle)]!;
      pointer.current = {
        handle,
        start: currentRef.current,
        pointerId: event.pointerId,
      };
      activate(handle);
      setPressed(handle);
      input.focus();
      input.setPointerCapture?.(event.pointerId);
      move(raw, handle, "pointer");
    }
    function pointerMove(event: PointerEvent<HTMLDivElement>) {
      const gesture = pointer.current;
      if (gesture) {
        if (gesture.pointerId === event.pointerId && !disabled && !readOnly)
          move(pointerValue(event.clientX), gesture.handle, "pointer");
      } else if (!disabled && !readOnly)
        setHovered(nearest(pointerValue(event.clientX)));
    }
    function finishPointer(
      event: PointerEvent<HTMLDivElement>,
      cancel = false,
    ) {
      const gesture = pointer.current;
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      pointer.current = null;
      setPressed(null);
      if (cancel) emit(gesture.start, gesture.handle, "pointerCancel", true);
      else if (!disabled && !readOnly) commit(gesture, "pointer");
      const input = inputs.current[HANDLES.indexOf(gesture.handle)];
      if (input?.hasPointerCapture?.(event.pointerId))
        input.releasePointerCapture(event.pointerId);
    }
    const positions = current.map((n) => sliderValuePercent(n, range) / 100);
    return (
      <div
        id={rootId}
        role={groupLabelId ? undefined : "group"}
        aria-labelledby={groupLabelId ? undefined : `${rootId}-label`}
        className={classNames(shared.root, className)}
        style={style}
        dir={dir}
        data-size={size}
        data-mode={mode}
        data-disabled={disabled || undefined}
        data-read-only={readOnly || undefined}
      >
        {!groupLabelId && (
          <SliderHeader
            group
            label={groupLabelId ? undefined : label}
            labelId={`${rootId}-label`}
            inputId={HANDLES.map((h) => `${rootId}-${h}`).join(" ")}
            current={formatRange(current)}
            samples={[
              formatRange([min, max]),
              formatRange([
                Math.abs(min) > Math.abs(max) ? min : max,
                Math.abs(min) > Math.abs(max) ? min : max,
              ]),
            ]}
          />
        )}
        <div
          ref={control}
          className={classNames(shared.control, styles.control)}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerLeave={() => setHovered(null)}
          onPointerUp={(event) => finishPointer(event)}
          onPointerCancel={(event) => finishPointer(event, true)}
          onLostPointerCapture={(event) => finishPointer(event, true)}
        >
          {HANDLES.map((handle, index) => (
            <input
              key={handle}
              ref={(node) => {
                inputs.current[index] = node;
              }}
              id={`${rootId}-${handle}`}
              type="range"
              min={min}
              max={max}
              step="any"
              value={current[index]}
              disabled={disabled}
              aria-labelledby={`${groupLabelId ?? `${rootId}-label`} ${rootId}-${handle}-label`}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              aria-readonly={readOnly || undefined}
              aria-valuemin={index === 0 ? min : current[0]}
              aria-valuemax={index === 0 ? current[1] : max}
              aria-valuenow={current[index]}
              aria-valuetext={formatValue(current[index])}
              className={classNames(shared.input, styles.input)}
              data-handle={handle}
              data-active={active === handle || undefined}
              data-hovered={hovered === handle || undefined}
              data-pressed={pressed === handle || undefined}
              onFocus={() => activate(handle)}
              onBlur={finishKeyboard}
              onKeyDown={(event) => keyDown(event, handle)}
              onKeyUp={(event) => {
                if (keys.has(event.key)) finishKeyboard();
              }}
              onChange={(event) => {
                if (disabled || readOnly) {
                  event.currentTarget.value = String(currentRef.current[index]);
                  return;
                }
                move(event.currentTarget.valueAsNumber, handle, "pointer");
              }}
            />
          ))}
          <div aria-hidden className={shared.track}>
            <span
              className={classNames(shared.fill, styles.fill)}
              style={
                {
                  "--range-beginning": positions[0],
                  "--range-span": positions[1] - positions[0],
                } as CSSProperties
              }
            />
            <SliderMarkers allMarkers={allMarkers} range={range} />
          </div>
        </div>
        <span hidden id={`${rootId}-beginning-label`}>
          {beginningHandleLabel}
        </span>
        <span hidden id={`${rootId}-end-label`}>
          {endHandleLabel}
        </span>
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
  },
);
