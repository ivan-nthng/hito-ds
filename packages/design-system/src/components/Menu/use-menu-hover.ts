import { useCallback, useEffectEvent, useLayoutEffect, useRef, type RefObject } from "react";

// Pointer travel tolerances, matching Tooltip; not animation or public timing tokens.
const enterDelay = 300;
const exitGrace = 150;

/** A pointer preview never takes focus. Explicit activation hands control back to Menu. */
export function useMenuHover({ enabled, open, anchorRef, panelRef, onOpenChange }: {
  enabled: boolean;
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  onOpenChange: (open: boolean, reason: "hover") => void;
}) {
  const preview = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const change = useEffectEvent(onOpenChange);
  const cancelTimer = useCallback(() => { clearTimeout(timer.current); timer.current = undefined; }, []);
  const activate = useCallback(() => { cancelTimer(); preview.current = false; }, [cancelTimer]);

  useLayoutEffect(() => {
    if (!open) preview.current = false;
    if (!enabled) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!anchor || !panel) return;
    const media = anchor.ownerDocument.defaultView?.matchMedia?.("(hover: hover) and (pointer: fine)");
    const enter = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !media?.matches) return;
      cancelTimer();
      if (open || event.currentTarget !== anchor || anchor.disabled || anchor.getAttribute("aria-disabled") === "true") return;
      timer.current = setTimeout(() => {
        if (anchor.disabled || anchor.getAttribute("aria-disabled") === "true") return;
        preview.current = true; change(true, "hover");
      }, enterDelay);
    };
    const leave = () => {
      cancelTimer();
      if (preview.current) timer.current = setTimeout(() => change(false, "hover"), exitGrace);
    };
    const focus = () => activate();
    const capabilityChange = () => {
      cancelTimer();
      if (!media?.matches && open && preview.current) change(false, "hover");
    };
    anchor.addEventListener("pointerenter", enter);
    anchor.addEventListener("pointerleave", leave);
    panel.addEventListener("pointerenter", enter);
    panel.addEventListener("pointerleave", leave);
    panel.addEventListener("focusin", focus);
    media?.addEventListener("change", capabilityChange);
    return () => {
      cancelTimer();
      anchor.removeEventListener("pointerenter", enter);
      anchor.removeEventListener("pointerleave", leave);
      panel.removeEventListener("pointerenter", enter);
      panel.removeEventListener("pointerleave", leave);
      panel.removeEventListener("focusin", focus);
      media?.removeEventListener("change", capabilityChange);
    };
  }, [enabled, open, anchorRef, panelRef, activate, cancelTimer]);
  return { preview, activate };
}
