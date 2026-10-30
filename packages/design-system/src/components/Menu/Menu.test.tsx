import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Menu, type MenuProps } from "./Menu";
import { findTypeaheadMatch } from "./menu-keyboard";

const props: MenuProps = { open: false, label: "Actions", trigger: <button>Open</button>, items: [{ id: "edit", label: "Edit" }], onOpenChange: () => {}, onAction: () => {} };
describe("Menu input boundary", () => {
  it("limits hover requests to an eligible mouse and cancels pending entry on exit or unmount", () => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
    try {
      const change = vi.fn();
      const { container, unmount } = render(<Menu {...props} openOnHover onOpenChange={change} />);
      const button = container.querySelector("button")!;
      const enter = (pointerType: string) => fireEvent(button, Object.assign(new Event("pointerenter"), { pointerType }));
      enter("touch"); vi.advanceTimersByTime(400); expect(change).not.toHaveBeenCalled();
      enter("mouse"); fireEvent.pointerLeave(button); vi.advanceTimersByTime(400); expect(change).not.toHaveBeenCalled();
      enter("mouse"); button.disabled = true; vi.advanceTimersByTime(400); expect(change).not.toHaveBeenCalled();
      button.disabled = false; enter("mouse"); vi.advanceTimersByTime(400);
      expect(change).toHaveBeenLastCalledWith(true, "hover");
      // A controller may not have committed open yet; exit still cancels its pending request.
      fireEvent.pointerLeave(button); vi.advanceTimersByTime(200);
      expect(change).toHaveBeenLastCalledWith(false, "hover");
      change.mockClear(); enter("mouse"); unmount(); vi.advanceTimersByTime(400);
      expect(change).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); vi.useRealTimers(); }
  });
  it("keeps a loading shared Button unavailable to Arrow activation", () => {
    const change = vi.fn();
    const { container } = render(<Menu {...props} onOpenChange={change} trigger={<Button variant="secondary" intent="neutral" loading>Open</Button>} />);
    fireEvent.keyDown(container.querySelector("button")!, { key: "ArrowDown" });
    expect(change).not.toHaveBeenCalled();
  });
  it.each([
    { label: " " }, { items: [] }, { items: [{ id: "a", label: " " }] },
    { items: [{ id: "a", label: "Edit" }, { id: "a", separator: true as const }] },
  ])("rejects an unnamed or ambiguous command menu", invalid => {
    expect(() => render(<Menu {...props} {...invalid} />)).toThrow();
  });
  it("renders a passive badge inside the single command target while retaining its string label", () => {
    const { container } = render(<Menu {...props} items={[{ id: "ready", label: "Ready", statusBadge: { icon: "general/status-check-circle", intent: "success" } }]} />);
    const row = container.querySelector('[role="menuitem"]')!;
    expect(row.textContent).toBe("Ready"); expect(row.querySelector("button,a,[tabindex]")).toBeNull();
    expect(row.querySelector('[data-intent="success"]')).toBeTruthy();
  });
  it("requires an explicit localized close label for a sheet", () => {
    expect(() => render(<Menu {...props} presentation="sheet" />)).toThrow("closeLabel");
  });
});
describe("Localized command typeahead", () => {
  const labels = ["Editar", "Duplicar", "Exportar", "Áreas", "Ações"];
  it("matches a growing prefix without moving away from its current match", () => {
    expect(findTypeaheadMatch(labels, "du", 1)).toBe(1);
  });
  it("cycles repeated characters and wraps", () => {
    expect(findTypeaheadMatch(labels, "ee", 0)).toBe(2);
    expect(findTypeaheadMatch(labels, "eee", 2)).toBe(0);
  });
  it("matches Portuguese accents without requiring an accent key", () => {
    expect(findTypeaheadMatch(labels, "ar", 0)).toBe(3);
    expect(findTypeaheadMatch(labels, "ac", 0)).toBe(4);
  });
  it("preserves focus when nothing matches", () => {
    expect(findTypeaheadMatch(labels, "zzz", 0)).toBe(-1);
  });
});
