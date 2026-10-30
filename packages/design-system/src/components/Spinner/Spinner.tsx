import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import styles from "./Spinner.module.css";

export type SpinnerProps = {
  size?: ControlSize;
  className?: string;
};

/** Decorative only. The owning control/region supplies loading text and busy state. */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return <span aria-hidden="true" className={classNames(styles.spinner, className)} data-spinner="" data-size={size} />;
}
