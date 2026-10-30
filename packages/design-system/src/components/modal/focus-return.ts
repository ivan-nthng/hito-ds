import { canFocus } from "./focus-scope";

// Replaced by the consumer's bundler; do not require Node types in the public package.
declare const process: { env: { NODE_ENV: string } };

export function captureFocusReturn(dialog: HTMLDialogElement) {
  const document = dialog.ownerDocument;
  const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const previousModals = new Set(document.querySelectorAll("dialog:modal"));
  const eligible = (element: HTMLElement | null | undefined) =>
    canFocus(element) && element.ownerDocument === document && !dialog.contains(element);
  return (requested?: HTMLElement | null) => {
    // Return within a surviving parent, without stealing focus from a new modal.
    const modals = [...document.querySelectorAll("dialog:modal")];
    if (modals.some(modal => !previousModals.has(modal))) return;
    const inScope = (element: HTMLElement | null | undefined) =>
      eligible(element) && (!modals.length || modals.some(modal => modal.contains(element!)));
    const target = [requested, opener].find(inScope);
    target?.focus({ preventScroll: true });
    const active = document.activeElement;
    // The caller may already have focused a logical successor during the closing commit.
    if (active instanceof HTMLElement && inScope(active)) return;
    if (process.env.NODE_ENV !== "production") {
      console.warn("Dialog: when removing its opener, supply returnFocusRef pointing to a visible, focusable logical successor mounted by the closing commit.");
    }
  };
}
