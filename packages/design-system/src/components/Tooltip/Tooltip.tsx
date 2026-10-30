"use client";

import { cloneElement, Fragment, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactElement, type RefAttributes } from "react";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import { assignTriggerRef } from "../anchored/compose-trigger-ref";
import { observeAnchoredPosition } from "../anchored/observe-position";
import layerStyles from "../anchored/anchored.module.css";
import styles from "./Tooltip.module.css";

export type TooltipProps = {
  /** One labelled, enabled button forwarding native props/ref, normally the shared Button. */
  trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>>;
  /** Short supplementary text. Keep the information visible to hoverless/coarse-pointer users. */
  content: string;
};

// Interaction tolerances, not motion tokens or public configuration.
const hoverDelay = 300;
const exitGrace = 150;

function TooltipTrigger({ element, ...props }: { element: TooltipProps["trigger"] } & ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>) {
  return cloneElement(element, props);
}

/** Supplemental help only; the caller supplies the trigger's name and touch-accessible copy. */
export function Tooltip({ trigger, content }: TooltipProps) {
  if (!content.trim()) throw new Error("Tooltip requires non-empty supplementary text.");
  if (!isValidElement(trigger) || trigger.type === Fragment) throw new Error("Tooltip requires one labelled button trigger.");
  const id = useId();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const intent = useRef({ trigger: false, panel: false, focus: false, dismissed: false });
  const [open, setOpen] = useState(false);
  // A disclosure owns Escape while its popup is open. Keep its tooltip and ref
  // mounted, but remove the supplemental popover and its document listener.
  const expanded = trigger.props["aria-expanded"] === true || trigger.props["aria-expanded"] === "true";
  const visible = open && !expanded;
  const callerRef = trigger.props.ref;
  const mergedRef = useCallback((node: HTMLButtonElement | null) => {
    anchorRef.current = node;
    const cleanup = assignTriggerRef(callerRef, node);
    return () => {
      anchorRef.current = null;
      if (typeof cleanup === "function") cleanup();
      else assignTriggerRef(callerRef, null);
    };
  }, [callerRef]);
  const active = () => intent.current.trigger || intent.current.panel || intent.current.focus;
  const clearTimer = () => { clearTimeout(timer.current); timer.current = undefined; };
  const enter = (region: "trigger" | "panel" | "focus", reveal = true) => {
    if (!active()) intent.current.dismissed = false;
    intent.current[region] = true;
    if (!reveal || intent.current.dismissed) return;
    clearTimer();
    if (region === "focus" || region === "panel") setOpen(true);
    else timer.current = setTimeout(() => setOpen(true), hoverDelay);
  };
  const leave = (region: "trigger" | "panel" | "focus") => {
    intent.current[region] = false;
    if (active()) return;
    clearTimer();
    intent.current.dismissed = false;
    timer.current = setTimeout(() => setOpen(false), exitGrace);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useLayoutEffect(() => {
    if (!visible) return;
    const panel = panelRef.current!;
    const anchor = anchorRef.current!;
    const dismiss = () => {
      clearTimeout(timer.current);
      intent.current.dismissed = true;
      // Hiding the panel does not consistently dispatch pointerleave.
      intent.current.panel = false;
      setOpen(false);
    };
    panel.showPopover();
    const stopPosition = observeAnchoredPosition(anchor, panel, dismiss);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); dismiss(); }
    };
    panel.ownerDocument.addEventListener("keydown", escape);
    return () => {
      stopPosition();
      panel.ownerDocument.removeEventListener("keydown", escape);
      if (panel.matches(":popover-open")) panel.hidePopover();
    };
  }, [visible]);
  const finePointer = (type: string) => type !== "touch" && anchorRef.current?.ownerDocument.defaultView?.matchMedia("(any-hover: hover)").matches;
  const describedBy = [trigger.props["aria-describedby"], id].filter(Boolean).join(" ");
  return <>
    <TooltipTrigger element={trigger} ref={mergedRef} aria-describedby={describedBy}
      onPointerEnter={event => {
        trigger.props.onPointerEnter?.(event);
        if (!event.defaultPrevented && finePointer(event.pointerType)) enter("trigger");
      }}
      onPointerLeave={event => { trigger.props.onPointerLeave?.(event); leave("trigger"); }}
      onFocus={event => {
        trigger.props.onFocus?.(event);
        if (!event.defaultPrevented) enter("focus", event.currentTarget.matches(":focus-visible"));
      }}
      onBlur={event => { trigger.props.onBlur?.(event); leave("focus"); }} />
    <div ref={panelRef} id={id} role="tooltip" popover="manual" className={classNames(layerStyles.panel, styles.panel)}
      onPointerEnter={event => { if (finePointer(event.pointerType)) enter("panel"); }} onPointerLeave={() => leave("panel")}>
      <Text variant="body-sm" className={styles.copy}>{content}</Text>
    </div>
  </>;
}
