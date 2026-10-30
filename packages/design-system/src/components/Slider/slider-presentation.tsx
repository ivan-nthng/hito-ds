import type { CSSProperties, ReactNode } from "react";
import type { SliderMarker, SliderBaseline } from "./Slider";
import { sliderValuePercent, type SliderRange } from "./slider-value";
import styles from "./Slider.module.css";

export type ScaleMarker = SliderMarker & { baseline: boolean };
export function scaleMarkers(
  markers: readonly SliderMarker[],
  baseline?: SliderBaseline,
): ScaleMarker[] {
  return [
    ...markers.map((marker) => ({ ...marker, baseline: false })),
    ...(baseline ? [{ ...baseline, baseline: true }] : []),
  ];
}
export function SliderHeader({
  label,
  inputId,
  labelId,
  current,
  samples,
  group = false,
}: {
  label?: ReactNode;
  inputId: string;
  labelId?: string;
  current: ReactNode;
  samples: readonly [string, string];
  group?: boolean;
}) {
  return (
    <div className={styles.header}>
      {label !== undefined ? (
        group ? (
          <span id={labelId} className={styles.label}>
            {label}
          </span>
        ) : (
          <label className={styles.label} htmlFor={inputId}>
            {label}
          </label>
        )
      ) : (
        <span />
      )}
      <output
        className={styles.current}
        data-min-value={samples[0]}
        data-max-value={samples[1]}
        htmlFor={inputId}
        {...(group ? { role: "presentation" as const } : {})}
      >
        <span>{group ? <bdi dir="ltr">{current}</bdi> : current}</span>
      </output>
    </div>
  );
}
export function SliderMarkers({
  allMarkers,
  range,
}: {
  allMarkers: readonly ScaleMarker[];
  range: SliderRange;
}) {
  return (
    <div className={styles.markerTrack} data-slider-travel>
      {allMarkers.map((marker, index) => (
        <span
          className={styles.marker}
          data-baseline={marker.baseline || undefined}
          data-marker-value={marker.value}
          key={`${marker.value}:${index}`}
          style={
            {
              "--slider-marker-position": `${sliderValuePercent(marker.value, range)}%`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
export function SliderFooter({
  min,
  max,
  minValueLabel,
  maxValueLabel,
  formatValue,
  allMarkers,
}: {
  min: number;
  max: number;
  minValueLabel?: ReactNode;
  maxValueLabel?: ReactNode;
  formatValue: (value: number) => string;
  allMarkers: readonly ScaleMarker[];
}) {
  return (
    <>
      {" "}
      <div className={styles.values}>
        <span className={styles.limit} data-position="minimum">
          {minValueLabel ?? formatValue(min)}
        </span>
        <span className={styles.limit} data-position="maximum">
          {maxValueLabel ?? formatValue(max)}
        </span>
      </div>
      {allMarkers.some((marker) => marker.label !== undefined) ? (
        <div className={styles.markerLabels}>
          {allMarkers.map((marker, index) =>
            marker.label !== undefined ? (
              <span
                className={styles.markerLabel}
                data-baseline={marker.baseline || undefined}
                key={`${marker.value}:${index}`}
              >
                <span>{marker.label}</span>
                <span>{formatValue(marker.value)}</span>
              </span>
            ) : null,
          )}
        </div>
      ) : null}
    </>
  );
}
