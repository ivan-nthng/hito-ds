import { controlSelector, eligibleFocusTarget } from "../../anchored/focus";

export function initialPopoverFocus(panel: HTMLElement, title: HTMLElement, requested: HTMLElement | null | "title" | undefined) {
  const body = panel.querySelector<HTMLElement>("[data-popover-body]")!;
  const first = [...body.querySelectorAll<HTMLElement>(controlSelector)].find(element => element.tabIndex >= 0 && eligibleFocusTarget(element));
  const target = requested === "title" ? title : requested && panel.contains(requested) && eligibleFocusTarget(requested) ? requested : first ?? title;
  target.focus();
}
