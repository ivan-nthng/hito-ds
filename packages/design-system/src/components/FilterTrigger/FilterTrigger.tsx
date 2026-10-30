"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button } from "../Button/Button";
import type { IconName } from "../Icon/icon-catalog";
import { SelectionPanel } from "../selection-panel/SelectionPanel";
import styles from "./FilterTrigger.module.css";

export type FilterTriggerSize = "sm" | "md";

export type FilterTriggerProps = {
  /** Localized empty-state action, e.g. Add city. */
  addLabel: string;
  /** Localized prefix, including punctuation, e.g. City:. */
  label: string;
  /** Applied display text. Null or an empty string restores Add. */
  value?: string | null;
  leadingIcon?: IconName;
  size?: FilterTriggerSize;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  closeLabel: string;
  searchRegion?: ReactNode;
  children: ReactNode;
};

/** Filter disclosure only. The caller owns options, committed values and draft policy. */
export function FilterTrigger({
  addLabel, label, value, leadingIcon, size = "md", disabled = false,
  open, onOpenChange, title, closeLabel, searchRegion, children,
}: FilterTriggerProps) {
  const id = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const filled = Boolean(value);
  const visible = open && !disabled;

  return (
    <>
      <Button
        ref={anchorRef}
        className={styles.trigger}
        intent="neutral"
        variant="soft"
        size={size}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={visible}
        aria-controls={visible ? id : undefined}
        leadingIcon={filled ? leadingIcon : "controls/plus-s"}
        trailingIcon={filled ? "arrows/compact/down" : undefined}
        onClick={() => onOpenChange(!visible)}
      >
        {filled ? (
          <span className={styles.summary}>
            <span className={styles.label}>{label}</span>{" "}
            <span className={styles.value}>{value}</span>
          </span>
        ) : addLabel}
      </Button>
      <SelectionPanel
        id={id}
        anchorRef={anchorRef}
        open={visible}
        onOpenChange={onOpenChange}
        size={size}
        title={title}
        closeLabel={closeLabel}
        searchRegion={searchRegion}
      >
        {children}
      </SelectionPanel>
    </>
  );
}
