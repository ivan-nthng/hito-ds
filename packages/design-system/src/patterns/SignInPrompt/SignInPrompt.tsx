"use client";

import { useCallback, useId, useRef, useState } from "react";
import { BottomSheet } from "../../components/BottomSheet/BottomSheet";
import { Button } from "../../components/Button/Button";
import { Popover } from "../../components/Popover/Popover";
import { Text } from "../../components/Text/Text";
import { AnchoredTrigger, type AnchoredTriggerElement } from "../../components/anchored/AnchoredTrigger";
import { assignTriggerRef } from "../../components/anchored/compose-trigger-ref";
import styles from "./SignInPrompt.module.css";

const artwork = new URL("../../../assets/hub-soft-3d/png-160/hub-navigation.png", import.meta.url).href;

export type SignInPromptProps = {
  trigger: AnchoredTriggerElement;
  title: string;
  description: string;
  actionLabel: string;
  closeLabel: string;
  mobile: boolean;
  loading?: boolean;
  /** The consumer owns provider navigation, sessions and validated return destinations. */
  onSignIn: () => void;
};

/** Explicit sign-in presentation only; opening or dismissing never authenticates a user. */
export function SignInPrompt({ trigger, title, description, actionLabel, closeLabel, mobile, loading = false, onSignIn }: SignInPromptProps) {
  const [open, setOpen] = useState(false), id = useId();
  const anchor = useRef<HTMLButtonElement>(null), callerRef = trigger.props.ref;
  const mergedRef = useCallback((node: HTMLButtonElement | null) => {
    anchor.current = node;
    const cleanup = assignTriggerRef(callerRef, node);
    return () => { anchor.current = null; if (typeof cleanup === "function") cleanup(); else assignTriggerRef(callerRef, null); };
  }, [callerRef]);
  const content = open ? <div className={styles.content}>
    <div className={styles.introduction}>
      <Text variant="body-sm" className={styles.description}>{description}</Text>
      {/* Decorative native asset shared by both overlay presentations. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artwork} alt="" width={160} height={160} className={styles.artwork} />
    </div>
    <Button variant="primary" intent="neutral" size="lg" width="full" leadingIcon="social/google/branded"
      loading={loading} onClick={() => { if (!loading) onSignIn(); }}>{actionLabel}</Button>
  </div> : null;
  return <>
    <AnchoredTrigger element={trigger} ref={mergedRef} popup="dialog" panelId={id} open={open} onActivate={() => setOpen(value => !value)} />
    {mobile ? <BottomSheet id={id} open={open} title={title} headerVariant="compact" closeLabel={closeLabel}
      initialFocus="title" returnFocusRef={anchor} dismissOnBackdrop onDismiss={() => setOpen(false)}>{content}</BottomSheet>
      : <Popover id={id} anchorRef={anchor} open={open} onOpenChange={setOpen} title={title} closeLabel={closeLabel}
        initialFocus="title" className={styles.panel}>{content}</Popover>}
  </>;
}
