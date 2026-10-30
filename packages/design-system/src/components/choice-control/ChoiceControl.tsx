"use client";

import {
  forwardRef,
  useCallback,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { classNames } from "../class-names";
import { Text } from "../Text/Text";
import styles from "./ChoiceControl.module.css";

export const choiceControlSizes = ["sm", "base"] as const;
export type ChoiceControlSize = (typeof choiceControlSizes)[number];
export type ChoiceControlProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "role" | "children" | "readOnly"
> & {
  label: ReactNode;
  description?: ReactNode;
  size?: ChoiceControlSize;
};

type InternalProps = ChoiceControlProps & {
  kind: "checkbox" | "radio" | "switch";
  indeterminate?: boolean;
};

// Native input owns value, form participation, keyboard behavior and disabled inheritance.
export const ChoiceControl = forwardRef<HTMLInputElement, InternalProps>(
  function ChoiceControl(
    {
      kind,
      label,
      description,
      size = "base",
      indeterminate = false,
      className,
      id,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? `${generatedId}-choice`;
    const hasLabel =
      label !== undefined && label !== null && label !== false && label !== "";
    const hasDescription =
      description !== undefined &&
      description !== null &&
      description !== false &&
      description !== "";
    const descriptionIds =
      [describedBy, hasDescription ? `${inputId}-description` : undefined]
        .filter(Boolean)
        .join(" ") || undefined;
    const inputRef = useCallback(
      (input: HTMLInputElement | null) => {
        if (input && kind === "checkbox") input.indeterminate = indeterminate;
        if (typeof ref === "function") return ref(input);
        if (ref) ref.current = input;
      },
      [ref, kind, indeterminate],
    );

    return (
      <label
        className={classNames(styles.root, className)}
        data-has-copy={hasLabel || hasDescription ? true : undefined}
        data-kind={kind}
        data-size={size}
        htmlFor={inputId}
      >
        <span className={styles.target}>
          <input
            {...props}
            ref={inputRef}
            id={inputId}
            className={styles.input}
            type={kind === "radio" ? "radio" : "checkbox"}
            role={kind === "switch" ? "switch" : undefined}
            aria-describedby={descriptionIds}
            aria-labelledby={
              props["aria-labelledby"] ??
              (props["aria-label"] || !hasLabel
                ? undefined
                : `${inputId}-label`)
            }
          />
          <span className={styles.indicator} aria-hidden="true">
            {kind === "checkbox" ? <span className={styles.mark} /> : null}
            {kind === "radio" ? <span className={styles.dot} /> : null}
            {kind === "switch" ? (
              <span className={styles.thumbPosition}>
                <span className={styles.thumb} />
              </span>
            ) : null}
          </span>
        </span>
        {hasLabel || hasDescription ? (
          <span className={styles.copy}>
            {hasLabel ? (
              <Text as="span" variant="label-base" id={`${inputId}-label`}>
                {label}
              </Text>
            ) : null}
            {hasDescription ? (
              <Text
                as="span"
                variant="body-sm"
                className={styles.description}
                id={`${inputId}-description`}
              >
                {description}
              </Text>
            ) : null}
          </span>
        ) : null}
      </label>
    );
  },
);
