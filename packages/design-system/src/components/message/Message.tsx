"use client";

import type { RefObject } from "react";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { Text } from "../Text/Text";
import { LiveRegion } from "./LiveRegion";
import styles from "./Message.module.css";

export type MessageIntent = "neutral" | "info" | "success" | "warning" | "destructive";
type Content = { title: string; body?: string } | { title?: string; body: string };
export type MessageProps = Content & {
  intent?: MessageIntent;
  /** Omit for the intent icon, or pass false to remove the icon and its slot. */
  icon?: IconName | false;
  action?: { label: string; onClick: () => void };
  dismiss?: { label: string; onDismiss: () => void; returnFocusRef?: RefObject<HTMLElement | null> };
  /** Off for initial/static content and Field-owned validation. Never inferred from intent. */
  announcement?: "off" | "polite" | "assertive";
};
export const messageIntents: MessageIntent[] = ["neutral", "info", "success", "warning", "destructive"];
const icons: Record<MessageIntent, IconName | undefined> = {
  neutral: undefined, info: "general/info-filled", success: "general/status-check-circle",
  warning: "general/status-exclamation-circle", destructive: "general/status-cross-circle",
};
/** Private anatomy only; no queue, timer, domain state or modal behavior. */
export function Message({ kind, size, title, body, intent = "info", icon, action, dismiss, announcement = "off" }: MessageProps & (
  { kind: "alert"; size?: "sm" | "md" } | { kind: "inline"; size?: never }
)) {
  if (!title?.trim() && !body?.trim()) throw new Error("A message requires a non-empty title or body.");
  if (action && !action.label.trim()) throw new Error("Message action requires a localized label.");
  if (dismiss && !dismiss.label.trim()) throw new Error("Message dismiss requires a localized label.");
  const resolvedIcon = icon === false ? undefined : icon ?? icons[intent];
  const text = [title, body].filter(Boolean).join(". ");
  const close = dismiss ? <Button className={kind === "inline" ? styles.inlineClose : undefined}
    intent={kind === "inline" ? intent : "neutral"} variant="ghost" size="sm"
    icon="controls/close-s" aria-label={dismiss.label} onClick={event => {
      const hadFocus = event.currentTarget === document.activeElement;
      dismiss.onDismiss();
      if (hadFocus && dismiss.returnFocusRef) queueMicrotask(() => dismiss.returnFocusRef?.current?.focus());
    }}/> : null;
  return <>
    <div className={styles.message} data-message-kind={kind} data-message-size={kind === "alert" ? size ?? "md" : undefined} data-intent={intent} data-icon={Boolean(resolvedIcon)} data-dismiss={Boolean(dismiss)}>
      {resolvedIcon ? <Icon className={styles.icon} name={resolvedIcon} size={kind === "inline" ? "sm" : "md"}/> : null}
      <div className={styles.content}>
        {title?.trim() ? <Text as="div" variant="ui-md" emphasis="strong">{title}</Text> : null}
        {body?.trim() ? <Text as="div" variant="body-sm" className={styles.body}>{body}</Text> : null}
        {action ? <div className={styles.actions}><Button intent={intent} variant="secondary" size="sm" onClick={action.onClick}>{action.label}</Button></div> : null}
      </div>
      {close ? kind === "inline" ? close : <div className={styles.close}>{close}</div> : null}
    </div>
    <LiveRegion text={text} announcement={announcement}/>
  </>;
}
