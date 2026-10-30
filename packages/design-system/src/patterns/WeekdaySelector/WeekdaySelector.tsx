"use client";

import type { HTMLAttributes, Ref } from "react";
import { Button } from "../../components/Button/Button";
import { classNames } from "../../components/class-names";
import styles from "./WeekdaySelector.module.css";

export type WeekdaySelectorDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type WeekdaySelectorOption = { value: WeekdaySelectorDay; label: string; accessibleLabel: string };
export type WeekdaySelectorProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "role" | "aria-label"> & {
  /** Supply seven unique days in the desired display order; copy and locale belong to the caller. */
  options: readonly WeekdaySelectorOption[];
  label: string;
  value: readonly WeekdaySelectorDay[];
  onValueChange: (value: WeekdaySelectorDay[]) => void;
  size?: "md" | "lg";
  disabled?: boolean;
  firstButtonRef?: Ref<HTMLButtonElement>;
};

/** Independent native toggle buttons. Unknown/closed meaning, hints and persistence stay with the caller. */
export function WeekdaySelector({ options, label, value, onValueChange, size = "md", disabled = false, firstButtonRef, className, ...props }: WeekdaySelectorProps) {
  return <div {...props} role="group" aria-label={label} className={classNames(styles.root, className)}>
    {options.map((day, index) => {
      const selected = value.includes(day.value);
      return <Button key={day.value} ref={index === 0 ? firstButtonRef : undefined} size={size} type="button"
        variant={selected ? "primary" : "secondary"} intent={selected ? "accent" : "neutral"}
        aria-label={day.accessibleLabel} aria-pressed={selected} disabled={disabled}
        onClick={() => onValueChange(options.filter(option => option.value === day.value ? !selected : value.includes(option.value)).map(option => option.value))}>
        {day.label}
      </Button>;
    })}
  </div>;
}
