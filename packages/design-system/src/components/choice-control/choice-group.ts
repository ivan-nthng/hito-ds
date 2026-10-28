import type { ReactNode } from "react";
import type { FieldsetProps } from "../Fieldset/Fieldset";
import type { ChoiceControlSize } from "./ChoiceControl";

export type ChoiceGroupOption = {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
};
export type ChoiceGroupPresentation =
  | { appearance?: "inline"; cardSize?: never }
  | { appearance: "card"; cardSize?: "compact" | "comfortable" };
export type ChoiceGroupProps = Omit<
  FieldsetProps,
  "children" | "appearance" | "size" | "name" | "defaultValue"
> &
  ChoiceGroupPresentation & {
    name: string;
    options: readonly ChoiceGroupOption[];
    controlSize?: ChoiceControlSize;
  };
export function groupPresentation(
  appearance: "inline" | "card",
  cardSize?: "compact" | "comfortable",
) {
  if (appearance === "inline") {
    if (cardSize !== undefined)
      throw new Error("Choice group cardSize requires appearance=card.");
    return { appearance } as const;
  }
  return { appearance, size: cardSize } as const;
}
