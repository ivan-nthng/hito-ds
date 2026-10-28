import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Popover } from "./Popover";
import { positionAnchoredPanel } from "../anchored/position";

describe("Popover trigger contract", () => {
  it("composes the existing Button relationship, caller ref and activation", () => {
    const ref = createRef<HTMLButtonElement>();
    const caller = vi.fn();
    const change = vi.fn();
    const { container, unmount } = render(<Popover open={false} onOpenChange={change} title="Example" description="Details" trigger={<Button ref={ref} onClick={caller} variant="secondary" intent="neutral" size="sm">Open</Button>}>Content</Popover>);
    const button = container.querySelector("button")!;
    const panel = container.querySelector('[role="dialog"]')!;
    expect(ref.current).toBe(button);
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.hasAttribute("aria-modal")).toBe(false);
    fireEvent.click(button);
    expect(caller).toHaveBeenCalledOnce();
    expect(change).toHaveBeenCalledExactlyOnceWith(true, "trigger");
    unmount(); expect(ref.current).toBeNull();
  });
  it("respects a caller-cancelled activation", () => {
    const change = vi.fn();
    const { container } = render(<Popover open={false} onOpenChange={change} title="Example" trigger={<button onClick={event => event.preventDefault()}>Open</button>}>Content</Popover>);
    fireEvent.click(container.querySelector("button")!); expect(change).not.toHaveBeenCalled();
  });
  it("preserves disabled and loading Button behavior", () => {
    const change = vi.fn();
    const { container, rerender } = render(<Popover open={false} onOpenChange={change} title="Example" trigger={<Button variant="secondary" intent="neutral" disabled>Open</Button>}>Content</Popover>);
    fireEvent.click(container.querySelector("button")!);
    rerender(<Popover open={false} onOpenChange={change} title="Example" trigger={<Button variant="secondary" intent="neutral" loading>Open</Button>}>Content</Popover>);
    fireEvent.click(container.querySelector("button")!); expect(change).not.toHaveBeenCalled();
  });
  it("requires a nonempty title even when the heading is visually hidden", () => {
    expect(() => render(<Popover open={false} onOpenChange={() => {}} title=" " headerVisibility="hidden" trigger={<button>Open</button>}>Content</Popover>)).toThrow("non-empty title");
  });
  it("keeps the dialog named while an opt-in composition owns visible caption and dismissal", () => {
    const { container } = render(<Popover open={false} onOpenChange={() => {}} title="Reporting period" headerVisibility="hidden" closeLabel="Close" trigger={<button>Open</button>} footer={<button>Cancel</button>}>Content</Popover>);
    const dialog = container.querySelector('[role="dialog"]')!;
    expect(dialog.querySelector("h2")?.id).toBe(dialog.getAttribute("aria-labelledby"));
    expect(dialog.querySelector("header")).toBeNull(); expect(dialog.querySelector("footer")?.textContent).toBe("Cancel");
  });
});

describe("Popover placement boundaries", () => {
  const viewport = { left: 0, top: 0, right: 320, bottom: 720, gap: 8, gutter: 12 };
  it("uses logical start below an anchor with room", () => {
    const result = positionAnchoredPanel({ left: 40, right: 120, top: 40, bottom: 68 }, { width: 200, height: 160 }, viewport, false);
    expect(result).toMatchObject({ left: 40, top: 76, side: "bottom" });
  });
  it("shifts at the inline edge and flips near the bottom", () => {
    const result = positionAnchoredPanel({ left: 250, right: 308, top: 650, bottom: 678 }, { width: 200, height: 160 }, viewport, false);
    expect(result).toMatchObject({ left: 108, top: 482, side: "top" });
  });
  it("uses logical start for RTL without a second placement API", () => {
    const result = positionAnchoredPanel({ left: 140, right: 240, top: 40, bottom: 68 }, { width: 200, height: 160 }, viewport, true);
    expect(result.left).toBe(40);
  });
  it("aligns a block menu to logical end and clamps at the viewport edge", () => {
    const panel = { width: 216, height: 64 };
    expect(positionAnchoredPanel({ left: 260, right: 288, top: 40, bottom: 68 }, panel, viewport, false, "block", "end").left).toBe(72);
    expect(positionAnchoredPanel({ left: 32, right: 60, top: 40, bottom: 68 }, panel, viewport, true, "block", "end").left).toBe(32);
    expect(positionAnchoredPanel({ left: 0, right: 28, top: 40, bottom: 68 }, panel, viewport, false, "block", "end").left).toBe(12);
  });
  it("respects offset visual viewport bounds", () => {
    const result = positionAnchoredPanel({ left: 10, right: 90, top: 200, bottom: 228 }, { width: 150, height: 100 }, { ...viewport, left: 30, right: 250, top: 150, bottom: 500 }, false);
    expect(result.left).toBe(42); expect(result.top).toBe(236);
  });
  it("flips an inline submenu and keeps its height within a narrow viewport", () => {
    const result = positionAnchoredPanel({ left: 200, right: 304, top: 650, bottom: 678 }, { width: 100, height: 800 }, viewport, false, "inline");
    expect(result).toEqual({ left: 92, top: 12, side: "left", maxHeight: 696 });
    const rtl = positionAnchoredPanel({ left: 16, right: 100, top: 40, bottom: 68 }, { width: 100, height: 80 }, viewport, true, "inline");
    expect(rtl).toMatchObject({ left: 108, top: 40, side: "right" });
  });
});
