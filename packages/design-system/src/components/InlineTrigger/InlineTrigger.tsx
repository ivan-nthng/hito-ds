"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { classNames } from "../class-names";
import { Icon, type IconSize } from "../Icon/Icon";
import { Text, type TextVariant } from "../Text/Text";
import styles from "./InlineTrigger.module.css";

export const inlineTriggerHeadingSizes = ["sm", "lg"] as const;
export const inlineTriggerWidths = ["hug", "fill"] as const;

export type InlineTriggerHeadingSize =
  (typeof inlineTriggerHeadingSizes)[number];
export type InlineTriggerWidth = (typeof inlineTriggerWidths)[number];

export type InlineTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  /** Visible text and the native button's accessible name. */
  label: string;
  /** Reserved for the admitted heading treatment; semantic heading structure belongs to the consumer. */
  kind?: "heading";
  headingSize?: InlineTriggerHeadingSize;
  width?: InlineTriggerWidth;
};

const headingVariants: Record<InlineTriggerHeadingSize, TextVariant> = {
  sm: "heading-base",
  lg: "heading-lg",
};

const iconSizes: Record<InlineTriggerHeadingSize, IconSize> = {
  sm: "lg",
  lg: "xl",
};

/** A quiet inline action intended to be composed as an existing Menu trigger. */
export const InlineTrigger = forwardRef<HTMLButtonElement, InlineTriggerProps>(
  function InlineTrigger(
    {
      "aria-disabled": ariaDisabled,
      className,
      headingSize = "sm",
      kind = "heading",
      label,
      onClick,
      type = "button",
      width = "hug",
      ...props
    },
    ref,
  ) {
    if (!label.trim()) {
      throw new Error("InlineTrigger requires a non-empty visible label.");
    }
    const isAriaDisabled = ariaDisabled === true || ariaDisabled === "true";

    function handleClick(event: ReactMouseEvent<HTMLButtonElement>) {
      if (isAriaDisabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onClick?.(event);
    }

    return (
      <button
        {...props}
        aria-disabled={isAriaDisabled || undefined}
        className={classNames(styles.root, className)}
        data-heading-size={headingSize}
        data-kind={kind}
        data-size={iconSizes[headingSize]}
        data-width={width}
        onClick={handleClick}
        ref={ref}
        type={type}
      >
        <Text
          as="span"
          className={styles.label}
          variant={headingVariants[headingSize]}
        >
          {label}
        </Text>
        <Icon name="arrows/compact/down" size={iconSizes[headingSize]} />
      </button>
    );
  },
);
