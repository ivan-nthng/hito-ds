"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import { containFocus } from "../modal/focus-scope";
import { useNativeModal } from "../modal/use-native-modal";
import styles from "./AlertDialog.module.css";

export type AlertDialogCancelReason = "cancel" | "escape";
export type AlertDialogProps = {
  open: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: (reason: AlertDialogCancelReason) => void;
  /** One intent per committed opening; caller owns the operation and its result. */
  onConfirm: () => void;
  confirmIntent?: "accent" | "destructive";
  /** Caller-owned pending state, shown only on the existing Confirm Button. */
  confirmLoading?: boolean;
  /** Required when removing the opener; resolve a focusable successor by the closing commit. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Consequential confirmation with mandatory naming and safe, ordered actions. */
export function AlertDialog({ open, title, description, cancelLabel, confirmLabel, onCancel, onConfirm,
  confirmIntent = "accent", confirmLoading = false, returnFocusRef, children, className, style }: AlertDialogProps) {
  for (const [name, value] of Object.entries({ title, description, cancelLabel, confirmLabel })) {
    if (!value.trim()) throw new Error(`AlertDialog requires a non-empty ${name}.`);
  }
  if (cancelLabel.trim().toLocaleLowerCase() === confirmLabel.trim().toLocaleLowerCase()) {
    throw new Error("AlertDialog requires distinct Cancel and Confirm labels.");
  }
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const sent = useRef(false);
  const [confirmation, setConfirmation] = useState({ open, sent: false });
  // A committed close/reopen is a new decision; ordinary rerenders never unlock Confirm.
  if (confirmation.open !== open) setConfirmation({ open, sent: false });
  useLayoutEffect(() => { sent.current = false; }, [open]);
  const titleId = useId();
  const descriptionId = useId();
  useNativeModal({ open, dialogRef, titleId, initialFocusRef: cancelRef, returnFocusRef });
  const confirmAvailability = confirmLoading ? { loading: true as const } : { disabled: confirmation.sent };

  return <dialog ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descriptionId}
    className={classNames(styles.root, className)} style={style}
    onCancel={event => { event.preventDefault(); onCancel("escape"); }}
    onKeyDown={event => {
      const heading = event.currentTarget.ownerDocument.getElementById(titleId);
      if (heading) containFocus(event, heading);
    }}>
    <header className={styles.header}>
      <Text as="h2" variant="heading-sm" id={titleId} tabIndex={-1}>{title}</Text>
    </header>
    <div className={styles.body} data-dialog-body="">
      <Text variant="body-sm" id={descriptionId}>{description}</Text>
      {children != null ? <div className={styles.content}>{children}</div> : null}
    </div>
    <footer className={styles.footer}>
      <Button ref={cancelRef} autoFocus variant="ghost" intent="neutral" size="md" onClick={() => onCancel("cancel")}>{cancelLabel}</Button>
      <Button variant="primary" intent={confirmIntent} size="md" {...confirmAvailability}
        onClick={() => {
          if (sent.current || confirmLoading) return;
          sent.current = true;
          setConfirmation({ open, sent: true });
          onConfirm();
        }}>{confirmLabel}</Button>
    </footer>
  </dialog>;
}
