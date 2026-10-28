import type { ControlWidth } from "../control-width";
import { forwardRef, type InputHTMLAttributes } from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { InputFrame, inputFrameStyles } from "../input-frame/InputFrame";
import {
  resolveControlState,
  type ControlAppearance,
  type ControlValidationState,
} from "../input-frame/control-state";

export type TextInputAppearance = ControlAppearance;
export type TextInputSize = ControlSize;
export type TextInputType = "email" | "password" | "tel" | "text" | "url";
export type TextInputValidationState = ControlValidationState;
/** Decorative image in the native leading icon slot; the input's label owns its meaning. */
export type TextInputArtwork = { src: string };
type LeadingContent = { leadingIcon?: IconName; leadingArtwork?: never }
  | { leadingArtwork: TextInputArtwork; leadingIcon?: never };

export type TextInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix" | "size" | "type" | "width"
> & {
  width?: ControlWidth;
  appearance?: TextInputAppearance;
  loading?: boolean;
  /** Noneditable affix. Include its meaning in the accessible label/description. */
  prefix?: string;
  size?: TextInputSize;
  trailingIcon?: IconName;
  type?: TextInputType;
  validationState?: TextInputValidationState;
} & LeadingContent;

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      appearance = "outlined",
      width = "fill",
      "aria-busy": ariaBusy,
      "aria-invalid": ariaInvalid,
      className,
      disabled,
      leadingIcon,
      leadingArtwork,
      loading = false,
      prefix,
      readOnly,
      size = "md",
      trailingIcon,
      type = "text",
      validationState = "none",
      ...props
    },
    ref,
  ) {
    if (leadingArtwork && (leadingIcon || !leadingArtwork.src?.trim())) {
      throw new Error("TextInput requires one leading icon or a nonempty decorative artwork source.");
    }
    const state = resolveControlState({
      ariaInvalid,
      disabled,
      loading,
      readOnly,
      validationState,
    });

    return (
      <InputFrame
        width={width}
        appearance={appearance}
        disabled={disabled}
        invalid={state.invalid}
        loading={state.isLoading}
        readOnly={readOnly}
        size={size}
        trailing={
          trailingIcon ? <Icon name={trailingIcon} size={size} /> : undefined
        }
        validationState={state.resolvedValidationState}
      >
        {leadingArtwork ? (
          // The framework-independent primitive contains caller-owned decorative imagery.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={leadingArtwork.src} alt="" aria-hidden draggable={false} className={inputFrameStyles.leadingArtwork} />
        ) : leadingIcon ? <Icon name={leadingIcon} size={size} /> : null}
        {prefix ? <span aria-hidden className={inputFrameStyles.affix}>{prefix}</span> : null}
        <input
          {...props}
          aria-busy={state.isLoading || ariaBusy || undefined}
          aria-invalid={state.invalid ? true : ariaInvalid}
          className={classNames(inputFrameStyles.input, className)}
          disabled={disabled}
          readOnly={state.isReadOnly}
          ref={ref}
          type={type}
        />
      </InputFrame>
    );
  },
);
