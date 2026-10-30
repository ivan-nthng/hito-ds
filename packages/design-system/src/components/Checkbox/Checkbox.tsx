"use client";

import { forwardRef } from "react";
import {
  ChoiceControl,
  type ChoiceControlProps,
  type ChoiceControlSize,
} from "../choice-control/ChoiceControl";

export type CheckboxProps = ChoiceControlProps & { indeterminate?: boolean };
export type CheckboxSize = ChoiceControlSize;
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(props, ref) {
    return <ChoiceControl {...props} ref={ref} kind="checkbox" />;
  },
);
