export const controlSelector = 'button, input:not([type="hidden"]), select, textarea, a[href], [tabindex], [contenteditable="true"]';

export function hasVisibleBox(element: HTMLElement) {
  const style = getComputedStyle(element);
  return element.isConnected && element.getClientRects().length > 0 &&
    style.visibility !== "hidden" && style.visibility !== "collapse" &&
    (element.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true);
}

export function eligibleFocusTarget(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!element?.isConnected || !element.matches(controlSelector) || element.matches(":disabled") || element.closest("[inert], [hidden]")) return false;
  return hasVisibleBox(element);
}

/** Returning focus must not scroll a clipped control back into view. */
export function visibleReturnTarget(element: HTMLElement | null | undefined): element is HTMLElement {
  if (!eligibleFocusTarget(element)) return false;
  const window = element.ownerDocument.defaultView!;
  const visual = window.visualViewport;
  const rect = element.getBoundingClientRect();
  let left = Math.max(rect.left, visual?.offsetLeft ?? 0);
  let right = Math.min(rect.right, (visual?.offsetLeft ?? 0) + (visual?.width ?? window.innerWidth));
  let top = Math.max(rect.top, visual?.offsetTop ?? 0);
  let bottom = Math.min(rect.bottom, (visual?.offsetTop ?? 0) + (visual?.height ?? window.innerHeight));
  for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const css = getComputedStyle(ancestor); const box = ancestor.getBoundingClientRect();
    if (css.overflowX !== "visible") { left = Math.max(left, box.left); right = Math.min(right, box.right); }
    if (css.overflowY !== "visible") { top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
  }
  return right > left && bottom > top;
}
