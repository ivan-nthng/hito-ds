"use client";

import { forwardRef } from "react";
import {
  ChoiceControl,
  type ChoiceControlProps,
  type ChoiceControlSize,
} from "../choice-control/ChoiceControl";

export type RadioProps = ChoiceControlProps;
export type RadioSize = ChoiceControlSize;
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    return <ChoiceControl {...props} ref={ref} kind="radio" />;
  },
);
