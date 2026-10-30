"use client";

import { Button, type ButtonIntent } from "../Button/Button";
import { classNames } from "../class-names";
import { Icon, type IconTone } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { Text, type TextElement } from "../Text/Text";
import styles from "./StatePanel.module.css";

export type StatePanelProps = {
  title: string;
  body?: string;
  icon?: IconName;
  iconTone?: IconTone;
  action?: { label: string; onClick: () => void; intent?: ButtonIntent };
  /** Match the surrounding document hierarchy without changing visual typography. */
  titleAs?: Extract<TextElement, "h1" | "h2" | "h3" | "h4" | "h5" | "h6">;
  className?: string;
};

/** Presentation only. The application owns outcomes, retry safety and announcements. */
export function StatePanel({ title, body, icon, iconTone = "muted", action, titleAs = "h2", className }: StatePanelProps) {
  if (!title.trim()) throw new Error("StatePanel requires a non-empty title.");
  if (action && !action.label.trim()) throw new Error("StatePanel action requires a localized label.");

  return <div className={classNames(styles.panel, className)} data-state-panel="">
    {icon ? <Icon name={icon} tone={iconTone} size="xl" /> : null}
    <div className={styles.copy}>
      <Text as={titleAs} variant="heading-sm">{title}</Text>
      {body?.trim() ? <Text variant="body-sm" className={styles.body}>{body}</Text> : null}
    </div>
    {action ? <Button intent={action.intent ?? "neutral"} variant="soft" size="md" onClick={action.onClick}>{action.label}</Button> : null}
  </div>;
}
