"use client";

import { Children, Fragment, createContext, isValidElement, useContext, useEffectEvent, useId, useLayoutEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type PointerEvent, type ReactNode, type RefObject } from "react";
import { Button, type ButtonSize } from "../Button/Button";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import { containFocus } from "../modal/focus-scope";
import { useNativeModal } from "../modal/use-native-modal";
import styles from "./Dialog.module.css";

export type DialogDismissReason = "close" | "escape" | "backdrop";
export type DialogProps = {
  open: boolean;
  onDismiss: (reason: DialogDismissReason) => void;
  title: string;
  description?: string;
  /** Side panels become fullscreen below the large layout breakpoint. */
  presentation?: "center" | "side-panel" | "fullscreen";
  /** Called after the native modal has closed, including its exit transition. */
  onAfterClose?: () => void;
  dismissOnBackdrop?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Required when removing the opener. The successor must be focusable by the closing commit. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};
type Context = Pick<DialogProps, "title" | "description" | "onDismiss"> & { titleId: string; descriptionId: string };
const DialogContext = createContext<Context | null>(null);
function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error("Dialog parts must be rendered inside Dialog.");
  return context;
}

function directParts(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap(child =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? directParts(child.props.children) : [child]);
}

function assertAnatomy(title: string, children: ReactNode) {
  const parts = directParts(children);
  const headers = parts.filter(part => isValidElement<DialogHeaderProps>(part) && part.type === DialogHeader);
  const bodies = parts.filter(part => isValidElement(part) && part.type === DialogBody);
  const footers = parts.filter(part => isValidElement(part) && part.type === DialogFooter);
  if (!title.trim()) throw new Error("Dialog requires a non-empty visible title.");
  if (headers.length !== 1 || bodies.length !== 1 || footers.length > 1 || parts.length !== headers.length + bodies.length + footers.length) {
    throw new Error("Dialog requires exactly one direct Header and Body, and at most one Footer. Fragments are supported; compose other content inside those parts.");
  }
  const header = headers[0];
  if (!footers.length && (!isValidElement<DialogHeaderProps>(header) || !header.props.closeLabel?.trim())) {
    throw new Error("Dialog requires a Footer with a dismissal action or a Header with a non-empty closeLabel.");
  }
}

function DialogRoot({ open, onDismiss, title, description, presentation = "center", onAfterClose, dismissOnBackdrop = false, initialFocusRef, returnFocusRef, children, className, style }: DialogProps) {
  assertAnatomy(title, children);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const outsidePress = useRef<number | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const afterClose = useEffectEvent(() => onAfterClose?.());
  const wasPresent = useRef(present);
  useNativeModal({ open: present, dialogRef, titleId, initialFocusRef, returnFocusRef });
  useLayoutEffect(() => {
    if (open || !present) return;
    // Reading active CSS transitions flushes the closing style; reduced motion has none.
    const animations = presentation === "center" ? [] : dialogRef.current?.getAnimations?.() ?? [];
    if (!animations.length) { setPresent(false); return; }
    let current = true;
    void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
      if (current) setPresent(false);
    });
    return () => { current = false; };
  }, [open, present, presentation]);
  useLayoutEffect(() => {
    if (wasPresent.current && !present) afterClose();
    wasPresent.current = present;
  }, [present]);
  useLayoutEffect(() => { outsidePress.current = null; }, [open]);
  const outside = (event: PointerEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  return <DialogContext.Provider value={{ title, description, titleId, descriptionId, onDismiss }}>
    <dialog ref={dialogRef} className={classNames(styles.root, className)} style={style} aria-modal="true"
      data-presentation={presentation} data-state={open ? "open" : "closing"}
      aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
      onCancel={event => { event.preventDefault(); event.stopPropagation(); if (open) onDismiss("escape"); }}
      onKeyDown={event => {
        const heading = event.currentTarget.ownerDocument.getElementById(titleId);
        if (heading) containFocus(event, heading);
      }}
      onPointerDown={event => {
        outsidePress.current = dismissOnBackdrop && event.isPrimary && event.button === 0 && outside(event) ? event.pointerId : null;
      }}
      onPointerUp={event => {
        const dismiss = dismissOnBackdrop && outsidePress.current === event.pointerId && outside(event);
        outsidePress.current = null;
        if (dismiss) onDismiss("backdrop");
      }}
      onPointerCancel={() => { outsidePress.current = null; }}
    >
      {children}
    </dialog>
  </DialogContext.Provider>;
}

export type DialogHeaderProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  closeLabel?: string;
  closeSize?: ButtonSize;
  titleAdornment?: ReactNode;
  actions?: ReactNode;
};
function DialogHeader({ closeLabel, closeSize = "sm", titleAdornment, actions, className, ...props }: DialogHeaderProps) {
  const { title, description, titleId, descriptionId, onDismiss } = useDialog();
  return <header {...props} className={classNames(styles.header, className)}>
    <div className={styles.heading}>
      <div className={styles.titleRow}><Text as="h2" variant="heading-sm" id={titleId} tabIndex={-1}>{title}</Text>{titleAdornment}</div>
      {description ? <Text variant="body-sm" id={descriptionId} className={styles.description}>{description}</Text> : null}
    </div>
    {actions}
    {closeLabel ? <Button className={styles.close} variant="ghost" intent="neutral" size={closeSize} icon="controls/close-s" aria-label={closeLabel} onClick={() => onDismiss("close")} /> : null}
  </header>;
}
function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  useDialog();
  return <div {...props} className={classNames(styles.body, className)} data-dialog-body="" />;
}
function DialogFooter({ className, ...props }: HTMLAttributes<HTMLElement>) {
  useDialog();
  return <footer {...props} className={classNames(styles.footer, className)} />;
}

/** Controlled ordinary modal. Compose direct Header and Body (fragments allowed), plus Footer or a labelled Close.
 * Caller forms use ordinary submit handlers, never method="dialog" or formMethod="dialog".
 */
export const Dialog = Object.assign(DialogRoot, { Header: DialogHeader, Body: DialogBody, Footer: DialogFooter });
