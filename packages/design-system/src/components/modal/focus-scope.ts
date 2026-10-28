import type { KeyboardEvent } from "react";

const focusableSelector = 'button, input, select, textarea, a[href], area[href], summary, iframe, [tabindex], [contenteditable="true"], audio[controls], video[controls]';

/** Native modal inertness owns the background; this seam keeps Tab inside the dialog. */
export function focusableElements(root: HTMLElement, backwards = false): HTMLElement[] {
  const elements = [...root.querySelectorAll<HTMLElement>(
    focusableSelector,
  )].filter(element => element.tabIndex >= 0 && canFocus(element));
  return elements.filter(element => {
    if (!(element instanceof HTMLInputElement) || element.type !== "radio" || !element.name) return true;
    const group = elements.filter((other): other is HTMLInputElement =>
      other instanceof HTMLInputElement && other.type === "radio" &&
      other.name === element.name && other.form === element.form);
    return element === (group.find(radio => radio.checked) ?? (backwards ? group.at(-1) : group[0]));
  });
}

export function canFocus(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element?.isConnected || !element.matches(focusableSelector) || element.matches(":disabled") || element.closest("[inert], [hidden]")) return false;
  const style = getComputedStyle(element);
  return element.getClientRects().length > 0 && style.visibility !== "hidden" && style.visibility !== "collapse";
}

export function focusInitial(dialog: HTMLDialogElement, requested: HTMLElement | null | undefined, title: HTMLElement) {
  const editable = [...dialog.querySelectorAll<HTMLElement>(
    'input:not([type="hidden"]):not([readonly]), textarea:not([readonly]), select, [contenteditable="true"]',
  )].find(canFocus);
  const target = requested && dialog.contains(requested) && canFocus(requested) ? requested : editable ?? title;
  // A deep control must scroll into view inside Body; external return uses its own policy.
  target.focus();
}

function sameRadioGroup(active: Element | null, edge?: HTMLElement) {
  return active instanceof HTMLInputElement && edge instanceof HTMLInputElement &&
    active.type === "radio" && edge.type === "radio" && Boolean(active.name) &&
    active.name === edge.name && active.form === edge.form;
}

export function containFocus(event: KeyboardEvent<HTMLDialogElement>, title: HTMLElement) {
  if (event.key !== "Tab" || event.defaultPrevented) return;
  const dialog = event.currentTarget;
  const stops = focusableElements(dialog, event.shiftKey);
  const first = stops[0];
  const last = stops.at(-1);
  const active = dialog.ownerDocument.activeElement;
  if (!first) {
    event.preventDefault();
    title.focus({ preventScroll: true });
  } else if (event.shiftKey && (active === first || active === title || sameRadioGroup(active, first))) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && (active === last || sameRadioGroup(active, last))) {
    event.preventDefault();
    first.focus();
  }
}
