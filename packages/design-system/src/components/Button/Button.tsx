"use client";

import type {
  ButtonHTMLAttributes,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { forwardRef } from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { Icon } from "../Icon/Icon";
import { Spinner } from "../Spinner/Spinner";
import type { IconName } from "../Icon/icon-catalog";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost";
export type ButtonIntent = "neutral" | "accent" | "info" | "success" | "warning" | "destructive";
export type ButtonSize = ControlSize;
export type ButtonWidth = "content" | "full";

type ButtonTextContent = {
  children: ReactNode;
  icon?: never;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
};

type ButtonIconContent = {
  "aria-label": string;
  children?: never;
  icon: IconName;
  leadingIcon?: never;
  trailingIcon?: never;
};

type ButtonAvailability =
  | { disabled?: boolean; loading?: never }
  | { disabled?: never; loading?: boolean };

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  ButtonAvailability & {
    /** Expands the native pointer target; the caller reserves unclipped, nonoverlapping layout space. */
    hitArea?: "minimum";
    /** Ghost/neutral only: native contrast and inset focus on a caller-owned semantic scrim. */
    context?: "default" | "on-scrim";
    intent: ButtonIntent;
    size?: ButtonSize;
    variant: ButtonVariant;
    width?: ButtonWidth;
  } & (ButtonTextContent | ButtonIconContent);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    "aria-disabled": ariaDisabled,
    "aria-label": ariaLabel,
    children,
    className,
    context = "default",
    disabled = false,
    hitArea,
    icon,
    intent,
    leadingIcon,
    loading = false,
    onClick,
    size = "md",
    trailingIcon,
    type = "button",
    variant,
    width = "content",
    ...props
  },
  ref,
) {
  const isLoading = loading && !disabled;
  const onScrim = context === "on-scrim" && variant === "ghost" && intent === "neutral";
  const isAriaDisabled = ariaDisabled === true || ariaDisabled === "true";
  const iconPosition = icon
    ? "only"
    : leadingIcon && trailingIcon
      ? "both"
      : leadingIcon
        ? "leading"
        : trailingIcon
          ? "trailing"
          : undefined;

  function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (isLoading || isAriaDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event);
  }

  return (
    <button
      {...props}
      aria-label={ariaLabel}
      aria-busy={isLoading || undefined}
      aria-disabled={isLoading || isAriaDisabled || undefined}
      className={classNames(styles.root, className)}
      data-hit-area={hitArea}
      data-context={onScrim ? "on-scrim" : undefined}
      {...(onScrim ? { "data-hito-color-scheme": "dark" } : {})}
      data-icon-position={iconPosition}
      data-intent={intent}
      data-loading={isLoading || undefined}
      data-size={size}
      data-variant={variant}
      data-width={width}
      disabled={disabled}
      onClick={handleClick}
      ref={ref}
      type={type}
    >
      {icon ? (
        isLoading ? null : <Icon name={icon} size={size} />
      ) : (
        <>
          {leadingIcon ? <Icon name={leadingIcon} size={size} /> : null}
          <span>{children}</span>
          {trailingIcon ? <Icon name={trailingIcon} size={size} /> : null}
        </>
      )}
      {isLoading ? (
        <span aria-hidden className={styles.loadingIndicator}>
          <Spinner size={size} />
        </span>
      ) : null}
    </button>
  );
});
