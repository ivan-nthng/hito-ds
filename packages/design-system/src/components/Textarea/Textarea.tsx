import type { ControlWidth } from "../control-width";
import {
  forwardRef,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { inputFrameStyles } from "../input-frame/InputFrame";
import {
  resolveControlState,
  type ControlAppearance,
  type ControlValidationState,
} from "../input-frame/control-state";
import styles from "./Textarea.module.css";

export type TextareaAppearance = ControlAppearance;
export type TextareaSize = ControlSize;
export type TextareaValidationState = ControlValidationState;
export type TextareaWrap = "hard" | "soft";

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "size" | "wrap"
> & {
  width?: ControlWidth;
  appearance?: TextareaAppearance;
  leadingIcon?: IconName;
  size?: TextareaSize;
  validationState?: TextareaValidationState;
  trailingIcon?: IconName;
  wrap?: TextareaWrap;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      appearance = "outlined",
      width = "fill",
      "aria-invalid": ariaInvalid,
      className,
      disabled,
      leadingIcon,
      readOnly,
      rows = 3,
      size = "md",
      trailingIcon,
      validationState = "none",
      wrap = "soft",
      ...props
    },
    ref,
  ) {
    const state = resolveControlState({
      ariaInvalid,
      disabled,
      readOnly,
      validationState,
    });

    const control = (
      <textarea
        {...props}
        aria-invalid={state.invalid ? true : ariaInvalid}
        className={classNames(inputFrameStyles.surface, styles.root, className)}
        data-width={width}
        data-appearance={appearance}
        data-disabled={disabled || undefined}
        data-invalid={state.invalid || undefined}
        data-leading-icon={leadingIcon ? true : undefined}
        data-trailing-icon={trailingIcon ? true : undefined}
        data-read-only={readOnly || undefined}
        data-size={size}
        data-validation-state={state.resolvedValidationState}
        disabled={disabled}
        readOnly={readOnly}
        ref={ref}
        rows={rows}
        style={
          width === "hug"
            ? ({ "--textarea-rows": rows, ...props.style } as CSSProperties)
            : props.style
        }
        wrap={wrap}
      />
    );

    if (!leadingIcon && !trailingIcon) return control;

    return (
      <span
        className={classNames(inputFrameStyles.metrics, styles.adorned)}
        data-size={size}
        data-width={width}
      >
        {control}
        {leadingIcon ? (
          <Icon
            className={styles.leadingIcon}
            name={leadingIcon}
            size={size}
            state={disabled ? "disabled" : "default"}
          />
        ) : null}
        {trailingIcon ? (
          <Icon
            className={styles.trailingIcon}
            name={trailingIcon}
            size={size}
            state={disabled ? "disabled" : "default"}
          />
        ) : null}
      </span>
    );
  },
);
