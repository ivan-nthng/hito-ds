/** Resolve an existing semantic paint in the same theme context as its trigger. */
export function resolvedBackground(trigger: HTMLElement, variable: string) {
  const probe = trigger.ownerDocument.createElement("span");
  probe.style.position = "absolute";
  probe.style.background = `var(${variable})`;
  trigger.append(probe);
  const background = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return background;
}
