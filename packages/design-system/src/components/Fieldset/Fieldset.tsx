"use client";

import {
  forwardRef,
  useId,
  type FieldsetHTMLAttributes,
  type ReactNode,
} from "react";
import { classNames } from "../class-names";
import { Legend } from "../Legend/Legend";
import styles from "./Fieldset.module.css";

export type FieldsetControlProps = {
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: true;
};
export type FieldsetRenderProps = { controlProps: FieldsetControlProps };
export type FieldsetProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  | "children"
  | "aria-invalid"
  | "aria-errormessage"
  | "aria-label"
  | "aria-labelledby"
> & {
  legend: ReactNode;
  metadata?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  children: ReactNode | ((group: FieldsetRenderProps) => ReactNode);
} & (
    | { appearance?: "inline"; size?: never }
    | { appearance: "card"; size?: "compact" | "comfortable" }
  );

function hasContent(value: ReactNode) {
  return (
    value !== undefined && value !== null && value !== false && value !== ""
  );
}
function mergeIds(...values: Array<string | undefined>) {
  const ids = values.flatMap(
    (value) => value?.trim().split(/\s+/).filter(Boolean) ?? [],
  );
  return ids.length ? [...new Set(ids)].join(" ") : undefined;
}

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  function Fieldset(
    {
      appearance = "inline",
      size,
      legend,
      metadata,
      description,
      error,
      children,
      id,
      className,
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const groupId = id ?? `${generatedId}-group`;
    const hasDescription = hasContent(description);
    const hasError = hasContent(error);
    const controlProps: FieldsetControlProps = {
      "aria-describedby": mergeIds(
        describedBy,
        hasDescription ? `${groupId}-description` : undefined,
        hasError ? `${groupId}-error` : undefined,
      ),
      "aria-errormessage": hasError ? `${groupId}-error` : undefined,
      "aria-invalid": hasError ? true : undefined,
    };
    if (appearance === "inline" && size !== undefined) {
      throw new Error("Fieldset size is only supported with appearance=card.");
    }
    return (
      <fieldset
        {...props}
        {...controlProps}
        id={groupId}
        ref={ref}
        className={classNames(styles.root, className)}
        data-appearance={appearance}
        data-size={appearance === "card" ? (size ?? "compact") : undefined}
      >
        <Legend metadata={metadata}>{legend}</Legend>
        <div className={styles.body}>
          {hasDescription ? (
            <p className={styles.description} id={`${groupId}-description`}>
              {description}
            </p>
          ) : null}
          <div className={styles.controls}>
            {typeof children === "function"
              ? children({ controlProps })
              : children}
          </div>
          {hasError ? (
            <p className={styles.error} id={`${groupId}-error`}>
              {error}
            </p>
          ) : null}
        </div>
      </fieldset>
    );
  },
);
