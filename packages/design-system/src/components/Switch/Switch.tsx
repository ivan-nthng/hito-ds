"use client";

import { forwardRef } from "react";
import {
  ChoiceControl,
  type ChoiceControlProps,
  type ChoiceControlSize,
} from "../choice-control/ChoiceControl";

export type SwitchProps = ChoiceControlProps;
export type SwitchSize = ChoiceControlSize;
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, ref) {
    return <ChoiceControl {...props} ref={ref} kind="switch" />;
  },
);
