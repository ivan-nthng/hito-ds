"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { ListItemArtwork } from "../ListItem/ListItem";
import { Menu, type MenuProps } from "../Menu/Menu";
import { Text } from "../Text/Text";
import { Tooltip } from "../Tooltip/Tooltip";
import { classNames } from "../class-names";
import styles from "./ServiceSwitcher.module.css";

export type ServiceSwitcherProps = Pick<MenuProps,
  "open" | "onOpenChange" | "items" | "onAction" | "returnFocusRef" | "openOnHover"
> & {
  /** Current service name, including when only artwork is visible. */
  label: string;
  menuLabel: string;
  artwork: ListItemArtwork;
  compact?: boolean;
  disabled?: boolean;
  /** Layout of the reserved interaction slot; the visual button remains 36px. */
  className?: string;
};

type TriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & Pick<ServiceSwitcherProps, "label" | "artwork" | "compact">;

// Menu and Tooltip attach their native relationships to the same forwarded button.
const ServiceTrigger = forwardRef<HTMLButtonElement, TriggerProps>(function ServiceTrigger({ label, artwork, compact, ...props }, ref) {
  const button = <Button {...props} ref={ref} variant="soft" intent="neutral" size="md" hitArea="minimum"
    aria-label={label} className={styles.trigger} data-compact={compact || undefined}>
    <span className={styles.content}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Framework-neutral decorative caller-supplied artwork. */}
      <img src={artwork.src} alt="" className={styles.artwork} />
      {!compact ? <><Text as="span" variant="heading-sm" className={styles.label}>{label}</Text><Icon name="arrows/compact/down" size="sm" /></> : null}
    </span>
  </Button>;
  return compact && !props.disabled ? <Tooltip trigger={button} content={label} /> : button;
});

/** Presentation only: callers supply the permitted commands, routes and current service. */
export const ServiceSwitcher = forwardRef<HTMLButtonElement, ServiceSwitcherProps>(function ServiceSwitcher({
  label, menuLabel, artwork, compact = false, disabled = false, className, openOnHover = true, ...menu
}, ref) {
  if (!label.trim()) throw new Error("ServiceSwitcher requires a non-empty service label.");
  return <div className={classNames(styles.slot, className)} data-service-switcher data-compact={compact || undefined}>
    <Menu {...menu} size="md" label={menuLabel} openOnHover={openOnHover && !disabled}
      trigger={<ServiceTrigger ref={ref} label={label} artwork={artwork} compact={compact} disabled={disabled} />} />
  </div>;
});
