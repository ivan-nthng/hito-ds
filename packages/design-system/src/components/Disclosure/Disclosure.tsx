"use client";

import { useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { classNames } from "../class-names";
import styles from "./Disclosure.module.css";

type DisclosureState =
  | { open: boolean; onOpenChange: (open: boolean) => void; defaultOpen?: never }
  | { open?: never; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void };

export type DisclosureProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title" | "onChange"> & DisclosureState & {
  title: string;
  children: ReactNode;
  disabled?: boolean;
  /** Use soft for content controls inside cards. */
  variant?: "ghost" | "soft";
};

/** One independently expandable section. The panel stays mounted to preserve caller state. */
export function Disclosure({ title, children, open, defaultOpen = false, onOpenChange, disabled = false, variant = "ghost", className, ...props }: DisclosureProps) {
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [controlled] = useState(open !== undefined);
  const [localOpen, setLocalOpen] = useState(defaultOpen);
  const expanded = open ?? localOpen;

  useLayoutEffect(() => {
    if (!expanded && panel.current?.contains(document.activeElement)) {
      trigger.current?.focus({ preventScroll: true });
    }
  }, [expanded]);

  if (!title.trim()) throw new Error("Disclosure requires a non-empty visible title.");
  if (controlled !== (open !== undefined)) throw new Error("Disclosure cannot switch between controlled and uncontrolled state.");

  const toggle = () => {
    if (disabled) return;
    if (!controlled) setLocalOpen(!expanded);
    onOpenChange?.(!expanded);
  };

  return <div {...props} className={classNames(styles.root, className)} data-disclosure>
    <Button ref={trigger} intent="neutral" variant={variant} size="md" width="full"
      aria-expanded={expanded} aria-controls={panelId} aria-disabled={disabled || undefined}
      trailingIcon="arrows/basic/down" className={styles.trigger} onClick={toggle}>
      {title}
    </Button>
    <div ref={panel} id={panelId} hidden={!expanded} className={styles.panel}>{children}</div>
  </div>;
}
