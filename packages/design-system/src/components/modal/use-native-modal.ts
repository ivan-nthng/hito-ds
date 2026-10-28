import { useEffectEvent, useLayoutEffect, useRef, type RefObject } from "react";
import { captureFocusReturn } from "./focus-return";
import { canFocus, focusInitial } from "./focus-scope";

/** Native top-layer rendering keeps the dialog in its inherited theme and language scope. */
export function useNativeModal({
  open, dialogRef, titleId, initialFocusRef, returnFocusRef,
}: {
  open: boolean;
  dialogRef: RefObject<HTMLDialogElement | null>;
  titleId: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const generation = useRef(0);
  const options = useEffectEvent(() => ({
    titleId, initial: initialFocusRef?.current, returnTarget: returnFocusRef?.current,
  }));
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const opening = ++generation.current;
    const isCurrentOpening = () => generation.current === opening;
    const document = dialog.ownerDocument;
    const restoreFocus = captureFocusReturn(dialog);
    const root = document.documentElement;
    const overflow = root.style.getPropertyValue("overflow");
    const priority = root.style.getPropertyPriority("overflow");
    root.style.setProperty("overflow", "hidden");
    if (!dialog.open) dialog.showModal();
    const { initial, titleId: id } = options();
    const title = document.getElementById(id);
    if (title) focusInitial(dialog, initial, title);
    // Native inertness prevents background entry; recover when the focused child disappears.
    const observer = new MutationObserver(() => {
      const active = document.activeElement;
      if (dialog.open && title && (active === document.body ||
        (active instanceof HTMLElement && dialog.contains(active) && !canFocus(active)))) {
        title.focus({ preventScroll: true });
      }
    });
    observer.observe(dialog, { subtree: true, childList: true, attributes: true, attributeFilter: ["hidden", "disabled", "inert", "style", "class"] });
    return () => {
      observer.disconnect();
      if (dialog.open) dialog.close();
      if (root.style.overflow === "hidden") {
        if (overflow) root.style.setProperty("overflow", overflow, priority);
        else root.style.removeProperty("overflow");
      }
      queueMicrotask(() => {
        if (isCurrentOpening() && !dialog.open) restoreFocus(options().returnTarget);
      });
    };
  }, [open, dialogRef]);
}
