import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Disclosure } from "./Disclosure";

describe("Disclosure", () => {
  it("toggles an uncontrolled panel without discarding its content state", () => {
    const onOpenChange = vi.fn();
    render(<Disclosure title="Details" onOpenChange={onOpenChange}><input aria-label="Draft" defaultValue="Saved" /></Disclosure>);
    const trigger = screen.getByRole("button", { name: "Details" });
    expect(screen.queryByRole("textbox")).toBeNull();
    fireEvent.click(trigger);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Changed" } });
    fireEvent.click(trigger);
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(input.isConnected).toBe(true);
    fireEvent.click(trigger);
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Changed");
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it("requests controlled changes without changing the caller's state", () => {
    const onOpenChange = vi.fn();
    render(<Disclosure title="Details" open={false} onOpenChange={onOpenChange}>Content</Disclosure>);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
  });

  it("repairs focused content on external collapse, including a disabled trigger", () => {
    const view = (open: boolean) => <Disclosure title="Details" open={open} disabled onOpenChange={() => {}}><input aria-label="Draft" /></Disclosure>;
    const { rerender } = render(view(true));
    screen.getByRole("textbox").focus();
    rerender(view(false));
    expect(document.activeElement).toBe(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("does not steal focus from an external control on collapse", () => {
    const view = (open: boolean) => <><button>Outside</button><Disclosure title="Details" open={open} onOpenChange={() => {}}><input aria-label="Draft" /></Disclosure></>;
    const { rerender } = render(view(true));
    const outside = screen.getByRole("button", { name: "Outside" });
    outside.focus();
    rerender(view(false));
    expect(document.activeElement).toBe(outside);
  });

  it("rejects a missing title or switching state ownership", () => {
    expect(() => render(<Disclosure title=" ">Content</Disclosure>)).toThrow("non-empty visible title");
    const { rerender } = render(<Disclosure title="Details">Content</Disclosure>);
    expect(() => rerender(<Disclosure title="Details" open onOpenChange={() => {}}>Content</Disclosure>)).toThrow("cannot switch");
  });
});
