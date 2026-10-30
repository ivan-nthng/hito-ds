import { useId } from "react";
import { classNames } from "../class-names";
import { Text } from "../Text/Text";
import styles from "./ProgressBar.module.css";

export type ProgressBarProps = {
  label: string;
  value: number;
  max?: number;
  /** Caller-localized numerical text, such as “60%” or “3 of 5”. */
  valueText: string;
  /** Hide the visible label/value row when the surrounding composition supplies it. */
  showHeading?: boolean;
  thickness?: "default" | "thin";
  /** Semantic fill; neutral remains the default for existing consumers. */
  tone?: "neutral" | "accent" | "info" | "destructive";
  className?: string;
};

/** Known numerical completion. The caller owns formatting, updates and announcements. */
export function ProgressBar({ label, value, max = 100, valueText, showHeading = true, thickness = "default", tone = "neutral", className }: ProgressBarProps) {
  const labelId = useId();
  if (!label.trim() || !valueText.trim()) throw new Error("ProgressBar requires a non-empty label and valueText.");
  if (!Number.isFinite(max) || max <= 0) throw new Error("ProgressBar max must be a finite positive number.");
  if (!Number.isFinite(value) || value < 0 || value > max) throw new Error("ProgressBar value must be finite and between zero and max.");

  return <div className={classNames(styles.root, className)} data-progress-bar="" data-tone={tone}>
    {showHeading && <div className={styles.heading}>
      <Text id={labelId} variant="label-sm" className={styles.label}>{label}</Text>
      <Text as="span" variant="data-sm" className={styles.value}>{valueText}</Text>
    </div>}
    <progress className={classNames(styles.track, thickness === "thin" && styles.thin)} aria-labelledby={showHeading ? labelId : undefined} aria-label={showHeading ? undefined : label} value={value} max={max} aria-valuetext={valueText}>{valueText}</progress>
  </div>;
}
