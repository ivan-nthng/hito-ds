import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

describe("Tooltip composition boundary", () => {
  it("preserves existing description IDs, the shared Button ref and caller click action", () => {
    const ref = createRef<HTMLButtonElement>(); const click = vi.fn();
    const { container, rerender } = render(<Tooltip content="Extra help" trigger={<Button ref={ref} variant="ghost" intent="neutral" aria-describedby="existing-help" onClick={click}>Help</Button>} />);
    const trigger = container.querySelector("button")!; const tooltip = container.querySelector('[role="tooltip"]')!;
    const id = tooltip.id;
    expect(trigger.getAttribute("aria-describedby")).toBe(`existing-help ${id}`);
    expect(ref.current).toBe(trigger); fireEvent.click(trigger); expect(click).toHaveBeenCalledTimes(1);
    expect(trigger.hasAttribute("aria-expanded")).toBe(false); expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
    rerender(<Tooltip content="Updated help" trigger={<Button ref={ref} variant="ghost" intent="neutral" aria-describedby="existing-help">Help</Button>} />);
    expect(container.querySelector('[role="tooltip"]')!.id).toBe(id);
    expect(trigger.getAttribute("aria-describedby")).toBe(`existing-help ${id}`);
  });
  it("runs the caller's callback-ref cleanup on unmount", () => {
    const cleanup = vi.fn(); const ref = vi.fn(() => cleanup);
    const { unmount } = render(<Tooltip content="Help" trigger={<button ref={ref}>Details</button>} />);
    expect(ref).toHaveBeenCalledTimes(1); unmount(); expect(cleanup).toHaveBeenCalledTimes(1);
  });
  it("honors a prevented caller focus handler", () => {
    const focus = vi.fn(event => event.preventDefault());
    const { getByRole } = render(<Tooltip content="Help" trigger={<button onFocus={focus}>Details</button>} />);
    fireEvent.focus(getByRole("button")); expect(focus).toHaveBeenCalledTimes(1);
  });
  it("requires actual supplementary text", () => {
    expect(() => render(<Tooltip content=" " trigger={<button>Help</button>} />)).toThrow("non-empty supplementary text");
  });
});
