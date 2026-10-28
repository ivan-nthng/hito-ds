import type { ButtonHTMLAttributes, Ref } from "react";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { Spinner } from "../Spinner/Spinner";
import styles from "./StatusBadge.module.css";

type StatusBadgeAppearance = {
  /** Localized status text; retained in the accessibility tree when collapsed. */
  label: string;
  icon: IconName;
  variant?: "solid" | "soft";
  intent?: "neutral" | "info" | "success" | "warning" | "destructive";
  size?: "sm" | "md";
  /** Presentation only. The caller owns expansion and status announcements. */
  collapsed?: boolean;
};
export type StatusBadgeProps = StatusBadgeAppearance & (
  | { as?: "span" }
  | ({ as: "button"; ref?: Ref<HTMLButtonElement>; pending?: boolean } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "size">)
);

export function StatusBadge({ label, icon, variant = "soft", intent = "neutral", size = "md", collapsed = false, ...props }: StatusBadgeProps) {
  const pending = props.as === "button" && props.pending;
  const content = <>
    {pending ? <Spinner size={size} /> : <Icon name={icon} size={size}/>}
    <span className={styles.labelClip}><span className={styles.badgeLabel}>{label}</span></span>
    {props.as === "button" ? <Icon name="arrows/compact/down" size={size} /> : null}
  </>;
  const appearance = { "data-status-badge": "", "data-variant": variant, "data-intent": intent, "data-size": size, "data-collapsed": collapsed, title: label };
  if (props.as === "button") {
    const { as: Element, pending, className, disabled, ...button } = props;
    return <Element {...button} {...appearance} type={button.type ?? "button"} disabled={disabled || pending || undefined}
      aria-busy={pending || undefined} data-interactive="" className={[styles.badge, className].filter(Boolean).join(" ")}>{content}</Element>;
  }
  return <span {...appearance} className={styles.badge}>{content}</span>;
}
