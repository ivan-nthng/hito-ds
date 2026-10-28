import { useId, type HTMLAttributes, type ReactNode } from "react";
import { FieldDescriptionProvider } from "./field-description";
import { classNames } from "../class-names";
import styles from "./Field.module.css";

export type FieldControlProps = {
  "aria-describedby"?: string;
  "aria-errormessage"?: string;
  "aria-invalid"?: true;
  "aria-labelledby": string;
  "aria-required"?: true;
  id: string;
  required?: true;
};

export type FieldRenderProps = {
  controlProps: FieldControlProps;
};

export type FieldProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  auxiliary?: ReactNode;
  children: (field: FieldRenderProps) => ReactNode;
  controlId?: string;
  describedBy?: string;
  error?: ReactNode;
  hint?: ReactNode;
  label: ReactNode;
  /** Label typography is independent of the control's interaction size. */
  labelSize?: "base" | "sm";
  required?: boolean;
  requirementLabel?: ReactNode;
};

function hasContent(value: ReactNode) {
  return value !== undefined && value !== null && value !== false && value !== "";
}

function mergeIds(...values: Array<string | undefined>) {
  const ids = values.flatMap((value) => value?.trim().split(/\s+/) ?? []);
  return ids.length > 0 ? [...new Set(ids)].join(" ") : undefined;
}

export function Field({
  auxiliary,
  children,
  className,
  controlId,
  describedBy,
  error,
  hint,
  label,
  labelSize = "base",
  required = false,
  requirementLabel,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const resolvedControlId = controlId ?? `${generatedId}-control`;
  const labelId = `${resolvedControlId}-label`;
  const hintId = `${resolvedControlId}-hint`;
  const errorId = `${resolvedControlId}-error`;
  const hasError = hasContent(error);
  const hasHint = hasContent(hint);
  const controlProps: FieldControlProps = {
    "aria-describedby": mergeIds(
      describedBy,
      hasError ? errorId : undefined,
      hasHint ? hintId : undefined,
    ),
    "aria-errormessage": hasError ? errorId : undefined,
    "aria-invalid": hasError ? true : undefined,
    "aria-labelledby": labelId,
    "aria-required": required ? true : undefined,
    id: resolvedControlId,
    required: required ? true : undefined,
  };

  return (
    <div
      {...props}
      className={classNames(styles.root, className)}
      data-invalid={hasError || undefined}
      data-required={required || undefined}
      data-label-size={labelSize}
    >
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={resolvedControlId} id={labelId}>
          <span>{label}</span>
          {hasContent(requirementLabel) ? (
            <span className={styles.requirement}>{requirementLabel}</span>
          ) : null}
        </label>
        {hasContent(auxiliary) ? (
          <span className={styles.auxiliary}>{auxiliary}</span>
        ) : null}
      </div>

      <FieldDescriptionProvider describedBy={describedBy} hint={hasHint ? hint : undefined} error={hasError ? error : undefined}>
        {children({ controlProps })}
      </FieldDescriptionProvider>

      {hasError ? (
        <p className={styles.error} id={errorId}>
          {error}
        </p>
      ) : null}
      {hasHint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
