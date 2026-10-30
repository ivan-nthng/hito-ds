import type { ButtonHTMLAttributes } from "react";
import { classNames } from "../class-names";
import { Icon } from "../Icon/Icon";
import styles from "./InputFrame.module.css";

type ControlClearActionProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children" | "type"
> & {
  label: string;
};

export function ControlClearAction({
  className,
  label,
  ...props
}: ControlClearActionProps) {
  return (
    <button
      {...props}
      aria-label={label}
      className={classNames(styles.clearAction, className)}
      type="button"
    >
      <Icon name="controls/close-s" size="sm" />
    </button>
  );
}
