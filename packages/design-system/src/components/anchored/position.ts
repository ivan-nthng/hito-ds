export type Bounds = { left: number; top: number; right: number; bottom: number };
export type ViewportBounds = Bounds & { gutter: number; gap: number };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, Math.max(min, max)));

/** Coordinates use the layout viewport; the visible bounds include safe-area insets. */
export function positionAnchoredPanel(anchor: Bounds, panel: { width: number; height: number }, viewport: ViewportBounds, rtl: boolean, placement: "block" | "inline" = "block", align: "start" | "end" = "start") {
  const { gap, gutter } = viewport;
  const left = viewport.left + gutter;
  const right = viewport.right - gutter;
  const top = viewport.top + gutter;
  const bottom = viewport.bottom - gutter;
  if (placement === "inline") {
    const after = Math.max(0, right - anchor.right - gap);
    const before = Math.max(0, anchor.left - left - gap);
    const useLeft = rtl ? before >= panel.width || before >= after : after < panel.width && before > after;
    return {
      side: useLeft ? "left" : "right",
      left: clamp(useLeft ? anchor.left - gap - panel.width : anchor.right + gap, left, right - panel.width),
      top: clamp(anchor.top, top, bottom - Math.min(panel.height, bottom - top)),
      maxHeight: Math.max(0, bottom - top),
    };
  }
  const below = Math.max(0, bottom - anchor.bottom - gap);
  const above = Math.max(0, anchor.top - top - gap);
  const flipped = below < panel.height && above > below;
  const room = flipped ? above : below;
  // A viewport-sized anchor can leave neither side usable; shift within visible bounds.
  const availableHeight = room || Math.max(0, bottom - top);
  const height = Math.min(panel.height, availableHeight);
  return {
    side: flipped ? "top" : "bottom",
    left: clamp(align === "end" ? (rtl ? anchor.left : anchor.right - panel.width) : (rtl ? anchor.right - panel.width : anchor.left), left, right - panel.width),
    top: clamp(flipped ? anchor.top - gap - height : anchor.bottom + gap, top, bottom - height),
    maxHeight: availableHeight,
  };
}

export function intersects(anchor: Bounds, viewport: Bounds) {
  return anchor.bottom > viewport.top && anchor.top < viewport.bottom &&
    anchor.right > viewport.left && anchor.left < viewport.right;
}
