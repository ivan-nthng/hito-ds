"use client";

import { forwardRef, type ChangeEvent } from "react";
import { Radio } from "../Radio/Radio";
import { Fieldset } from "../Fieldset/Fieldset";
import {
  groupPresentation,
  type ChoiceGroupProps,
  type ChoiceGroupOption,
} from "../choice-control/choice-group";

export type RadioGroupOption = ChoiceGroupOption;
export type RadioGroupProps = ChoiceGroupProps & {
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
} & (
    | { value: string; defaultValue?: never }
    | { value?: never; defaultValue?: string }
  );

export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(
  function RadioGroup(
    {
      name,
      options,
      value,
      defaultValue,
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
            <Radio
              key={option.value}
              {...controlProps}
              {...option}
              name={name}
              form={form}
              size={controlSize}
              {...(value !== undefined
                ? { checked: value === option.value }
                : { defaultChecked: defaultValue === option.value })}
              onChange={(event) =>
                onValueChange?.(event.currentTarget.value, event)
              }
            />
          ))
        }
      </Fieldset>
    );
  },
);
