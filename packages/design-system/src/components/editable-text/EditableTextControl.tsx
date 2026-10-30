import type { ReactNode } from "react";
import { classNames } from "../class-names";
import { ControlClearAction } from "../input-frame/ControlClearAction";
import styles from "./EditableTextControl.module.css";

type EditableTextControlProps = {
  autoSizeText?: string;
  children: ReactNode;
  className?: string;
  clearLabel: string;
  disabled?: boolean;
  onClear: () => void;
};

export function EditableTextControl({
  autoSizeText,
  children,
  className,
  clearLabel,
  disabled = false,
  onClear,
}: EditableTextControlProps) {
  return (
    <div
      className={classNames(styles.root, className)}
      data-auto-size-text={autoSizeText}
    >
      {children}
      <ControlClearAction
        className={styles.clearAction}
        disabled={disabled}
        label={clearLabel}
        onClick={onClear}
      />
    </div>
  );
}
