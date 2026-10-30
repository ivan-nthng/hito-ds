import { useEffectEvent, useLayoutEffect, useRef, type RefObject } from "react";
import { visibleReturnTarget } from "./focus";
import { observeAnchoredPosition } from "./observe-position";

declare const process: { env: { NODE_ENV: string } };

/** Non-modal lifecycle only: no background inertness, focus trap or scroll lock. */
export type AnchoredDismissReason = "escape" | "outside-pointer" | "focus-exit" | "anchor-hidden";
export type AnchoredCloseReason = AnchoredDismissReason | "trigger" | "close" | "action" | "tab" | "hover";
export type AnchoredPanelOptions = {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  onInitialFocus: (panel: HTMLDivElement) => void;
  preserveTriggerFocus?: () => boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  align?: "start" | "end";
  onDismiss: (reason: AnchoredDismissReason) => void;
  closeReasonRef: RefObject<AnchoredCloseReason | null>;
};
export function useAnchoredPanel({ open, anchorRef, panelRef, onInitialFocus, preserveTriggerFocus, returnFocusRef, align = "start", onDismiss, closeReasonRef }: AnchoredPanelOptions) {
  const generation = useRef(0);
  const options = useEffectEvent(() => ({ onInitialFocus, preserveTriggerFocus, successor: returnFocusRef?.current, onDismiss }));
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = anchorRef.current;
    if (!open || !panel) return;
    if (!(anchor instanceof HTMLButtonElement)) throw new Error("Anchored overlay trigger must forward its ref to one native button.");
    const opening = ++generation.current;
    const isCurrent = () => generation.current === opening;
    const document = panel.ownerDocument;
    let pointerOnTrigger = false;
    let pointerOutside = false;
    let closing = false;
    closeReasonRef.current = null;
    const requestClose = (reason: AnchoredDismissReason) => {
      if (closing) return;
      closeReasonRef.current = reason;
      options().onDismiss(reason);
    };
    if (!panel.matches(":popover-open")) panel.showPopover();
    const stopPositioning = observeAnchoredPosition(anchor, panel, () => requestClose("anchor-hidden"), "block", align);
    options().onInitialFocus(panel);
    const pointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      const path = event.composedPath();
      pointerOnTrigger = path.includes(anchor);
      pointerOutside = !pointerOnTrigger && !path.includes(panel);
      if (path.includes(panel)) closeReasonRef.current = null;
      if (pointerOutside) requestClose("outside-pointer");
    };
    const pointerEnd = () => { pointerOnTrigger = false; pointerOutside = false; };
    const focusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      // A declined light dismissal no longer describes a later Save after returning inside.
      if (panel.contains(target)) { closeReasonRef.current = null; return; }
      if (target === anchor && options().preserveTriggerFocus?.()) return;
      if (pointerOutside || closeReasonRef.current === "tab" || (target === anchor && pointerOnTrigger)) return;
      requestClose("focus-exit");
    };
    const keyDown = (event: KeyboardEvent) => {
      pointerEnd();
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault(); event.stopPropagation(); requestClose("escape");
    };
    document.addEventListener("pointerdown", pointerDown, true);
    // Touch compatibility focus occurs after pointerup; retain provenance through click.
    document.addEventListener("click", pointerEnd, true);
    document.addEventListener("pointercancel", pointerEnd, true);
    document.addEventListener("focusin", focusIn);
    document.addEventListener("keydown", keyDown);
    return () => {
      closing = true;
      document.removeEventListener("pointerdown", pointerDown, true);
      document.removeEventListener("click", pointerEnd, true);
      document.removeEventListener("pointercancel", pointerEnd, true);
      document.removeEventListener("focusin", focusIn);
      document.removeEventListener("keydown", keyDown);
      stopPositioning();
      const focused = document.activeElement;
      const focusWasInside = panel.contains(focused);
      const reason = closeReasonRef.current;
      if (panel.matches(":popover-open")) panel.hidePopover();
      if (reason === "outside-pointer" || reason === "focus-exit" || reason === "tab" || reason === "hover" || (!focusWasInside && focused !== anchor)) return;
      queueMicrotask(() => {
        if (!isCurrent() || panel.matches(":popover-open")) return;
        const modal = document.querySelector("dialog:modal");
        if (modal && !modal.contains(anchor)) return;
        const active = document.activeElement;
        const successor = options().successor;
        // Disabling the opener can make the parent modal repair focus to its title first.
        // Complete the requested action return, without overriding a user's other focus move.
        const modalFallback = reason === "action" && successor && modal?.contains(successor) &&
          modal.getAttribute("aria-labelledby")?.split(/\s+/).some(id => document.getElementById(id) === active);
        if (active !== document.body && active !== anchor && !panel.contains(active) && !modalFallback) return;
        const eligible = (target: HTMLElement | null | undefined) => visibleReturnTarget(target) && target.ownerDocument === document && !panel.contains(target);
        const target = eligible(successor) ? successor : reason !== "anchor-hidden" && eligible(anchor) ? anchor : null;
        if (target) target.focus({ preventScroll: true });
        else if (process.env.NODE_ENV !== "production") console.warn("Anchored overlay: provide a visible, focusable returnFocusRef when its trigger can disappear or become unavailable.");
      });
    };
  }, [open, anchorRef, panelRef, closeReasonRef, align]);
}
