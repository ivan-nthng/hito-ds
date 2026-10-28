"use client";

import { forwardRef } from "react";
import { Avatar, type AvatarProps } from "../Avatar/Avatar";
import { Button } from "../Button/Button";
import { Menu, type MenuProps } from "../Menu/Menu";
import { classNames } from "../class-names";
import styles from "./AccountTrigger.module.css";

export type AccountTriggerProps = Pick<MenuProps, "open" | "onOpenChange" | "items" | "onAction" | "returnFocusRef" | "openOnHover"> & {
  /** Visible localized account label; also the single button's accessible name. */
  label: string;
  menuLabel: string;
  avatar?: Pick<AvatarProps, "src" | "initials">;
  /** Avatar-only workspace rail/topbar; the full account name stays accessible. */
  compact?: boolean;
  className?: string;
};

/** Identity, permitted commands and preference state come from the application. */
export const AccountTrigger = forwardRef<HTMLButtonElement, AccountTriggerProps>(function AccountTrigger({
  label, menuLabel, avatar, compact = false, className, openOnHover = true, ...menu
}, ref) {
  if (!label.trim()) throw new Error("AccountTrigger requires a non-empty visible label.");
  return <Menu {...menu} openOnHover={openOnHover} label={menuLabel}
    trigger={<Button ref={ref} variant="ghost" intent="neutral" size="lg" aria-label={label} data-compact={compact || undefined} className={classNames(styles.trigger, className)}>
      <span className={styles.content}>
        <Avatar decorative size="xs" shape="circle" src={avatar?.src} initials={avatar?.initials} />
        {!compact ? <span className={styles.label}>{label}</span> : null}
      </span>
    </Button>} />;
});
