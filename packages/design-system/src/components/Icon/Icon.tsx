import type { HTMLAttributes } from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { type IconName } from "./icon-catalog";
import styles from "./Icon.module.css";

export type IconSize = ControlSize;
export type IconTone =
  | "default"
  | "secondary"
  | "muted"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "destructive";
export type IconState = "default" | "hover" | "disabled";

export type IconProps = Omit<HTMLAttributes<HTMLSpanElement>, "children" | "color"> & {
  label?: string;
  name: IconName;
  size?: IconSize;
  state?: IconState;
  tone?: IconTone;
};

export function Icon({
  className,
  label,
  name,
  size = "md",
  state = "default",
  tone = "default",
  ...props
}: IconProps) {
  return (
    <span
      {...props}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={classNames(styles.icon, className)}
      data-icon-name={name}
      data-size={size}
      data-state={state}
      data-tone={tone}
      role={label ? "img" : undefined}
    />
  );
}
