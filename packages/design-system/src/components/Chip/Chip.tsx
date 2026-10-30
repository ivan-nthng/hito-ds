"use client";

import { forwardRef } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { classNames } from "../class-names";
import styles from "./Chip.module.css";

export const chipSizes = ["sm", "md"] as const;
export const chipBehaviors = ["selectable", "removable"] as const;
export const chipElevations = ["flat", "raised"] as const;
export type ChipSize = (typeof chipSizes)[number];
export type ChipElevation = (typeof chipElevations)[number];

type ChipVisualProps = {
  /** Localized visible value. Empty labels render nothing. */
  label: string;
  leadingIcon?: IconName;
  size?: ChipSize;
  disabled?: boolean;
  id?: string;
  className?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
  "aria-describedby"?: string;
};

export type ChipProps = ChipVisualProps & (
  | {
      behavior: "selectable";
      selected: boolean;
      onSelectedChange: (selected: boolean) => void;
      onRemove?: never;
      removeLabel?: never;
      elevation?: never;
    }
  | {
      behavior: "removable";
      /** One remove action across the whole chip. The caller owns collection changes and focus. */
      onRemove: () => void;
      /** Localized action name including the visible value, e.g. Remove São Paulo. */
      removeLabel: string;
      elevation?: ChipElevation;
      selected?: never;
      onSelectedChange?: never;
    }
);

/** One native action: controlled toggle or removal, never a combination of the two. */
export const Chip = forwardRef<HTMLButtonElement, ChipProps>(function Chip(props, ref) {
  const { label, leadingIcon, size = "md", disabled = false, id, className, lang, dir, "aria-describedby": describedBy } = props;
  if (!label.trim()) return null;
  if (props.behavior === "removable" && !props.removeLabel.trim()) {
    throw new Error("Removable Chip requires a localized removeLabel containing its visible value.");
  }
  const selectable = props.behavior === "selectable";
  const selected = selectable && props.selected;
  return <Button
    ref={ref}
    id={id}
    lang={lang}
    dir={dir}
    className={classNames(styles.root, className)}
    data-chip
    data-behavior={props.behavior}
    data-elevation={selectable ? undefined : props.elevation ?? "flat"}
    size={size}
    variant={selected ? "primary" : "soft"}
    intent={selected ? "accent" : "neutral"}
    disabled={disabled}
    aria-describedby={describedBy}
    aria-label={selectable ? undefined : props.removeLabel}
    aria-pressed={selectable ? props.selected : undefined}
    title={label}
    onClick={() => {
      if (props.behavior === "selectable") props.onSelectedChange(!props.selected);
      else props.onRemove();
    }}
  >
    <span className={styles.content} data-leading-icon={Boolean(leadingIcon)}>
      {leadingIcon ? <Icon name={leadingIcon} size={size} /> : null}
      <span className={styles.label}>{label}</span>
      {!selectable || selected ? <span className={styles.actionIcon}>
        <Icon name={selectable ? "general/check" : "controls/close-s"} size={size} />
      </span> : null}
    </span>
  </Button>;
});
