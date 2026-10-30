import type { AriaAttributes } from "react";

export type ControlAppearance = "outlined" | "soft";
export type ControlValidationState = "none" | "invalid" | "success";

type ResolveControlStateOptions = {
  ariaInvalid?: AriaAttributes["aria-invalid"];
  disabled?: boolean;
  invalid?: boolean;
  loading?: boolean;
  readOnly?: boolean;
  validationState?: ControlValidationState;
};

export function resolveControlState({
  ariaInvalid,
  disabled = false,
  invalid: invalidProp = false,
  loading = false,
  readOnly = false,
  validationState = "none",
}: ResolveControlStateOptions) {
  const invalid =
    invalidProp ||
    validationState === "invalid" ||
    ariaInvalid === true ||
    ariaInvalid === "true";
  const isLoading = loading && !disabled;

  return {
    invalid,
    isLoading,
    isReadOnly: readOnly || isLoading,
    resolvedValidationState: invalid
      ? ("invalid" as const)
      : validationState === "success"
        ? ("success" as const)
        : undefined,
  };
}
