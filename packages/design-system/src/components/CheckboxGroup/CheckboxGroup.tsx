"use client";

import { forwardRef, type ChangeEvent } from "react";
import { Checkbox } from "../Checkbox/Checkbox";
import { Fieldset } from "../Fieldset/Fieldset";
import {
  groupPresentation,
  type ChoiceGroupProps,
  type ChoiceGroupOption,
} from "../choice-control/choice-group";

export type CheckboxGroupOption = ChoiceGroupOption;
export type CheckboxGroupProps = ChoiceGroupProps & {
  onValueChange?: (
    value: string[],
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
} & (
    | { value: readonly string[]; defaultValue?: never }
    | { value?: never; defaultValue?: readonly string[] }
  );

export const CheckboxGroup = forwardRef<
  HTMLFieldSetElement,
  CheckboxGroupProps
>(function CheckboxGroup(
  {
    name,
    options,
    value,
    defaultValue = [],
    onValueChange,
    controlSize = "base",
    appearance = "inline",
    cardSize,
    form,
    ...props
  },
  ref,
) {
  return (
    <Fieldset
      {...props}
      {...groupPresentation(appearance, cardSize)}
      ref={ref}
      form={form}
    >
      {({ controlProps }) =>
        options.map((option) => (
          <Checkbox
            key={option.value}
            {...controlProps}
            {...option}
            name={name}
            form={form}
            size={controlSize}
            {...(value !== undefined
              ? { checked: value.includes(option.value) }
              : { defaultChecked: defaultValue.includes(option.value) })}
            onChange={(event) => {
              // Read native selection so uncontrolled form reset needs no mirrored state.
              const fieldset = event.currentTarget.closest("fieldset")!;
              const next = Array.from(
                fieldset.querySelectorAll<HTMLInputElement>(
                  'input[type="checkbox"]:checked',
                ),
              ).map((input) => input.value);
              onValueChange?.(next, event);
            }}
          />
        ))
      }
    </Fieldset>
  );
});
