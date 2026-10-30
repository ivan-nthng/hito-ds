"use client";

import { Fragment, isValidElement, useCallback, useEffectEvent, useId, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { AnchoredTrigger, type AnchoredTriggerElement } from "../anchored/AnchoredTrigger";
import { assignTriggerRef } from "../anchored/compose-trigger-ref";
import { controlSelector, eligibleFocusTarget, visibleReturnTarget } from "../anchored/focus";
import { observeAnchoredPosition } from "../anchored/observe-position";
import { useAnchoredPanel } from "../anchored/use-anchored-panel";
import type { PopoverOpenChangeReason } from "../Popover/Popover";
import { classNames } from "../class-names";
import layerStyles from "../anchored/anchored.module.css";
import styles from "./PickerPanel.module.css";

type Subpanel = {
  label: string;
  anchorRef: RefObject<HTMLButtonElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onDismiss: () => void;
  children: ReactNode;
};
type BaseProps = {
  /** Supply a stable id when an external trigger owns aria-controls. */
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean, reason: PopoverOpenChangeReason) => void;
  label: string;
  size?: "sm" | "md";
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
  children: ReactNode;
  /** One caller-owned level; selection and creation do not implicitly dismiss it. */
  subpanel?: Subpanel;
};
export type PickerPanelProps = BaseProps & (
  | { trigger: AnchoredTriggerElement; anchorRef?: never }
  | {
      /** Caller supplies aria-haspopup="dialog", aria-expanded and aria-controls on this native button. */
      anchorRef: RefObject<HTMLButtonElement | null>;
      trigger?: never;
    }
);

function focusInitial(panel: HTMLElement, requested?: HTMLElement | null) {
  const target = requested && panel.contains(requested) && eligibleFocusTarget(requested) ? requested
    : [...panel.querySelectorAll<HTMLElement>(controlSelector)].find(eligibleFocusTarget);
  (target ?? panel).focus({ preventScroll: true });
}

/** Headerless nonmodal composition. Callers provide native actions, query and confirmed values. */
export function PickerPanel({ id: suppliedId, open, onOpenChange, label, trigger, anchorRef: externalAnchorRef,
  size = "md", initialFocusRef, returnFocusRef, children, subpanel }: PickerPanelProps) {
  if (!label.trim() || subpanel && !subpanel.label.trim()) throw new Error("PickerPanel requires non-empty accessible labels.");
  if (trigger && (!isValidElement(trigger) || trigger.type === Fragment)) throw new Error("PickerPanel requires one labelled button trigger.");
  const internalAnchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeReasonRef = useRef<PopoverOpenChangeReason | null>(null);
  const generatedId = useId(); const id = suppliedId ?? generatedId;
  const anchorRef = externalAnchorRef ?? internalAnchorRef;
  const callerRef = trigger?.props.ref;
  const mergedRef = useCallback((node: HTMLButtonElement | null) => {
    internalAnchorRef.current = node;
    const cleanup = assignTriggerRef(callerRef, node);
    return () => { internalAnchorRef.current = null; if (typeof cleanup === "function") cleanup(); else assignTriggerRef(callerRef, null); };
  }, [callerRef]);
  const request = (next: boolean, reason: PopoverOpenChangeReason) => {
    closeReasonRef.current = next ? null : reason; onOpenChange(next, reason);
  };
  useAnchoredPanel({ open, anchorRef, panelRef, closeReasonRef, returnFocusRef,
    onInitialFocus: panel => focusInitial(panel, initialFocusRef?.current),
    onDismiss: reason => request(false, reason),
  });
  return <>
    {trigger ? <AnchoredTrigger popup="dialog" element={trigger} ref={mergedRef} open={open} panelId={id} onActivate={() => request(!open, "trigger")} /> : null}
    <div ref={panelRef} id={id} popover="manual" role="dialog" aria-label={label} tabIndex={-1}
      data-size={size} className={classNames(layerStyles.panel, styles.panel)}>
      {children}
      {open && subpanel ? <PickerSubpanel {...subpanel} parentRef={panelRef} size={size} /> : null}
    </div>
  </>;
}

function PickerSubpanel({ label, anchorRef, initialFocusRef, onDismiss, children, parentRef, size }: Subpanel & {
  parentRef: RefObject<HTMLDivElement | null>; size: "sm" | "md";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const notifyDismiss = useEffectEvent(onDismiss);
  function dismiss() {
    const anchor = anchorRef.current;
    if (visibleReturnTarget(anchor)) anchor.focus({ preventScroll: true });
    else parentRef.current?.focus({ preventScroll: true });
    onDismiss();
  }
  useLayoutEffect(() => {
    const panel = panelRef.current, parent = parentRef.current, anchor = anchorRef.current;
    if (!panel || !parent || !anchor) { notifyDismiss(); return; }
    let stop: (() => void) | undefined;
    const show = () => {
      if (!parent.matches(":popover-open")) return;
      panel.showPopover();
      stop = observeAnchoredPosition(anchor, panel, () => {
        parent.focus({ preventScroll: true }); notifyDismiss();
      }, "inline", "start", parent);
      focusInitial(panel, initialFocusRef?.current);
    };
    // A controlled root and child can open together; the root owns the first lifecycle.
    const frame = parent.matches(":popover-open") ? (show(), 0) : requestAnimationFrame(show);
    return () => {
      cancelAnimationFrame(frame); stop?.();
      const focusedInside = panel.contains(panel.ownerDocument.activeElement);
      if (panel.matches(":popover-open")) panel.hidePopover();
      if (focusedInside && parent.matches(":popover-open") && visibleReturnTarget(anchor)) anchor.focus({ preventScroll: true });
    };
  }, [anchorRef, initialFocusRef, parentRef]);
  return <div ref={panelRef} popover="manual" role="dialog" aria-label={label} tabIndex={-1}
    data-size={size} className={classNames(layerStyles.panel, styles.panel)}
    onKeyDown={event => {
      if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); event.stopPropagation(); dismiss(); }
    }}>
    {children}
  </div>;
}
