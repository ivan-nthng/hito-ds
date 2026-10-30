import { intersects, positionAnchoredPanel, type ViewportBounds } from "./position";
import { hasVisibleBox } from "./focus";

export function observeAnchoredPosition(anchor: HTMLElement, panel: HTMLElement, unavailable: () => void, side: "block" | "inline" = "block", align: "start" | "end" = "start", inlineParent?: HTMLElement) {
  const document = panel.ownerDocument;
  const window = document.defaultView!;
  let frame = 0;
  let reportedUnavailable = false;
  const reportUnavailable = () => {
    if (reportedUnavailable) return;
    reportedUnavailable = true;
    unavailable();
  };
  const position = () => {
    if (!hasVisibleBox(anchor)) {
      reportUnavailable(); return;
    }
    const visual = window.visualViewport;
    const css = getComputedStyle(panel);
    const safe = (edge: string) => parseFloat(css.getPropertyValue(`--anchored-safe-${edge}`)) || 0;
    const viewport: ViewportBounds = {
      left: (visual?.offsetLeft ?? 0) + safe("left"),
      right: (visual?.offsetLeft ?? 0) + (visual?.width ?? window.innerWidth) - safe("right"),
      top: (visual?.offsetTop ?? 0) + safe("top"),
      bottom: (visual?.offsetTop ?? 0) + (visual?.height ?? window.innerHeight) - safe("bottom"),
      gap: parseFloat(css.scrollMarginTop), gutter: parseFloat(css.scrollPaddingTop),
    };
    const anchorBounds = anchor.getBoundingClientRect();
    if (!intersects(anchorBounds, viewport)) { reportUnavailable(); return; }
    reportedUnavailable = false;
    panel.style.setProperty("--anchored-available-inline-size", `${Math.max(0, viewport.right - viewport.left - viewport.gutter * 2)}px`);
    // Picker children align to a row vertically but overlap the parent shell horizontally.
    // Ordinary Menu/Popover geometry remains unchanged when no parent is supplied.
    const parentBounds = inlineParent?.getBoundingClientRect();
    const inset = parseFloat(css.paddingTop);
    if (parentBounds) panel.style.width = `${parentBounds.width}px`;
    const geometryAnchor = parentBounds ? { left: parentBounds.left, right: parentBounds.right,
      top: anchorBounds.top - inset - parseFloat(css.borderTopWidth), bottom: anchorBounds.bottom } : anchorBounds;
    if (parentBounds) viewport.gap = -inset;
    const box = panel.getBoundingClientRect();
    const naturalHeight = panel.scrollHeight + parseFloat(css.borderTopWidth) + parseFloat(css.borderBottomWidth);
    const placement = positionAnchoredPanel(geometryAnchor, { width: box.width, height: naturalHeight }, viewport, getComputedStyle(anchor).direction === "rtl", side, align);
    panel.style.maxHeight = `${placement.maxHeight}px`;
    panel.style.left = `${placement.left}px`;
    panel.style.top = `${placement.top}px`;
    panel.dataset.side = placement.side;
    panel.dataset.positioned = "true";
  };
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(position); };
  position();
  const resize = new ResizeObserver(schedule);
  resize.observe(anchor); resize.observe(panel); if (inlineParent) resize.observe(inlineParent);
  if (panel.firstElementChild) resize.observe(panel.firstElementChild);
  const intersection = new IntersectionObserver(entries => {
    if (entries.some(entry => !entry.isIntersecting)) reportUnavailable();
  });
  intersection.observe(anchor);
  const mutations = new MutationObserver(records => {
    if (records.some(record => record.target !== panel)) schedule();
  });
  mutations.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "style", "hidden", "dir", "open"] });
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
  window.visualViewport?.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("scroll", schedule);
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect(); intersection.disconnect(); mutations.disconnect();
    window.removeEventListener("resize", schedule);
    window.removeEventListener("scroll", schedule, true);
    window.visualViewport?.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("scroll", schedule);
    delete panel.dataset.positioned;
  };
}
