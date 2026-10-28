import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { ControlWidth } from "../control-width";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import {
  resolveControlState,
  type ControlAppearance,
  type ControlValidationState,
} from "./control-state";
import styles from "./InputFrame.module.css";

export type InputFrameAppearance = ControlAppearance | "ghost";
export type InputFrameValidationState = ControlValidationState;

type InputFrameProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  ref?: Ref<HTMLSpanElement>;
  width?: ControlWidth;
  appearance: InputFrameAppearance;
  children: ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  size: ControlSize;
  trailing?: ReactNode;
  validationState?: InputFrameValidationState;
};

export function InputFrame({
  appearance,
  width = "fill",
  children,
  className,
  disabled = false,
  invalid = false,
  loading = false,
  readOnly = false,
  size,
  trailing,
  validationState = "none",
  ...props
}: InputFrameProps) {
  const state = resolveControlState({
    disabled,
    invalid,
    loading,
    readOnly,
    validationState,
  });

  return (
    <span
      {...props}
      className={classNames(styles.surface, styles.root, className)}
      data-hito-input-frame=""
      data-width={width}
      data-appearance={appearance}
      data-disabled={disabled || undefined}
      data-invalid={state.invalid || undefined}
      data-loading={state.isLoading || undefined}
      data-read-only={state.isReadOnly || undefined}
      data-size={size}
      data-validation-state={state.resolvedValidationState}
    >
      {children}
      {state.isLoading ? (
        <span
          aria-hidden
          className={styles.loadingIndicator}
          data-loading-indicator
        />
      ) : (
        trailing
      )}
    </span>
  );
}

export { styles as inputFrameStyles };
export type {
  ControlAppearance,
  ControlValidationState,
} from "./control-state";
