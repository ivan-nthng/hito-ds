"use client";

import { useId, useLayoutEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode, type RefObject } from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import { containFocus } from "../modal/focus-scope";
import { useNativeModal } from "../modal/use-native-modal";
import styles from "./BottomSheet.module.css";

export type BottomSheetDismissReason = "close" | "escape" | "backdrop";
export type BottomSheetProps = {
  /** Native dialog identity for an external trigger's aria-controls. */
  id?: string;
  open: boolean;
  /** A dismissal request, never a commit. The caller may keep open=true for a dirty guard. */
  onDismiss: (reason: BottomSheetDismissReason) => void;
  title: string;
  /** Opt in to the existing compact Label/Base title; Heading/SM remains the default. */
  headerVariant?: "default" | "compact";
  description?: string;
  closeLabel: string;
  /** One centered navigation header. Back changes caller-owned level, never dismisses or commits. */
  navigation?: { back?: { label: string; onBack: () => void } };
  children: ReactNode;
  /** Caller-owned Cancel/commit actions; route Cancel through the same dirty guard. */
  footer?: ReactNode;
  /** Opt in only when the contents are safe to discard. */
  dismissOnBackdrop?: boolean;
  /** Defaults to the first editable control, otherwise Title, as in Dialog. */
  initialFocus?: "title" | RefObject<HTMLElement | null>;
  /** Required when removing the opener; must be focusable by the closing commit. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
};

/** Modal bottom-anchored content. The host chooses presentation; there are no swipe gestures.
 * Forms use ordinary submit handlers, never method="dialog" or formMethod="dialog".
 */
export function BottomSheet({ id, open, onDismiss, title, headerVariant = "default", description, closeLabel, navigation, children, footer, dismissOnBackdrop = false, initialFocus, returnFocusRef, className, style }: BottomSheetProps) {
  if (!title.trim() || !closeLabel.trim()) throw new Error("BottomSheet requires a non-empty visible title and closeLabel.");
  if (navigation?.back && !navigation.back.label.trim()) throw new Error("BottomSheet Back requires a non-empty accessible label.");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const initialRef = useRef<HTMLElement | null>(null);
  const outsidePress = useRef<number | null>(null);
  const titleId = useId(); const descriptionId = useId();
  useLayoutEffect(() => {
    initialRef.current = initialFocus === "title" ? dialogRef.current?.ownerDocument.getElementById(titleId) ?? null : initialFocus?.current ?? null;
    outsidePress.current = null;
  }, [open, initialFocus, titleId]);
  useNativeModal({ open, dialogRef, titleId, initialFocusRef: initialRef, returnFocusRef });
  const outside = (event: PointerEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return false;
    const box = event.currentTarget.getBoundingClientRect();
    return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
  };
  const close = <Button className={navigation ? undefined : styles.close} hitArea={navigation ? "minimum" : undefined} variant="ghost" intent="neutral" size="sm"
    icon="controls/close-s" aria-label={closeLabel} onClick={() => onDismiss("close")} />;
  return <dialog id={id} ref={dialogRef} className={classNames(styles.root, className)} style={style} aria-modal="true"
    data-header-variant={headerVariant}
    aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
    onCancel={event => { event.preventDefault(); event.stopPropagation(); onDismiss("escape"); }}
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
    onPointerCancel={() => { outsidePress.current = null; }}>
    <header className={classNames(styles.header, navigation ? styles.navigationHeader : undefined)}>
      {navigation ? <div className={styles.navigationEdge} aria-hidden={!navigation.back || undefined}>
        {navigation.back ? <Button hitArea="minimum" variant="ghost" intent="neutral" size="sm"
          icon="arrows/basic/left" aria-label={navigation.back.label} onClick={navigation.back.onBack} /> : null}
      </div> : null}
      <div className={styles.heading}>
        <Text as="h2" variant={headerVariant === "compact" ? "label-base" : "heading-sm"} id={titleId} tabIndex={-1}>{title}</Text>
        {description ? <Text variant="body-sm" id={descriptionId} className={styles.description}>{description}</Text> : null}
      </div>
      {navigation ? <div className={styles.navigationEdge}>{close}</div> : close}
    </header>
    <div className={styles.body} data-bottom-sheet-body="">{children}</div>
    {footer ? <footer className={styles.footer}>{footer}</footer> : null}
  </dialog>;
}
