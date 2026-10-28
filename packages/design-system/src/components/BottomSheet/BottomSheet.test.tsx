import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./BottomSheet";

describe("BottomSheet composition", () => {
  const props = { open: false, title: "Edit details", closeLabel: "Close sheet", onDismiss: () => {} };
  it("owns one visible title, description and an accessible Close even without a footer", () => {
    const { container } = render(<BottomSheet {...props} id="caller-sheet" description="Review your draft.">Body</BottomSheet>);
    const sheet = container.querySelector("dialog")!;
    expect(sheet.id).toBe("caller-sheet");
    expect(document.getElementById(sheet.getAttribute("aria-labelledby")!)?.textContent).toBe(props.title);
    expect(document.getElementById(sheet.getAttribute("aria-describedby")!)?.textContent).toBe("Review your draft.");
    expect(sheet.querySelector("[data-bottom-sheet-body]")?.textContent).toBe("Body");
    expect(sheet.querySelector("button")?.getAttribute("aria-label")).toBe(props.closeLabel);
    expect(sheet.querySelector("footer")).toBeNull();
  });
  it("requests Close and Escape without directly changing the controlled open state", () => {
    const dismiss = vi.fn(); const { container } = render(<BottomSheet {...props} onDismiss={dismiss}>Body</BottomSheet>);
    const sheet = container.querySelector("dialog")!;
    fireEvent.click(sheet.querySelector("button")!);
    const event = new Event("cancel", { cancelable: true }); fireEvent(sheet, event);
    expect(dismiss.mock.calls).toEqual([["close"], ["escape"]]); expect(event.defaultPrevented).toBe(true);
  });
  it("isolates Escape from an enclosing editor dialog", () => {
    const outer = vi.fn(), dismiss = vi.fn();
    const { container } = render(<dialog onCancel={outer}><BottomSheet {...props} onDismiss={dismiss}>Body</BottomSheet></dialog>);
    fireEvent(container.querySelector("dialog dialog")!, new Event("cancel", { cancelable: true, bubbles: false }));
    expect(dismiss).toHaveBeenCalledWith("escape"); expect(outer).not.toHaveBeenCalled();
  });
  it.each(["default", "compact"] as const)("preserves the title association and separate Back/Close actions with %s navigation", headerVariant => {
    const dismiss = vi.fn(), back = vi.fn();
    const { container } = render(<BottomSheet {...props} headerVariant={headerVariant} navigation={{ back: { label: "Back", onBack: back } }} onDismiss={dismiss}>Body</BottomSheet>);
    const sheet = container.querySelector("dialog")!;
    expect(document.getElementById(sheet.getAttribute("aria-labelledby")!)?.textContent).toBe(props.title);
    const buttons = sheet.querySelectorAll("header button");
    expect(buttons[0].getAttribute("data-hit-area")).toBe("minimum");
    expect(buttons[1].getAttribute("data-hit-area")).toBe("minimum");
    fireEvent.click(buttons[0]); expect(back).toHaveBeenCalledOnce(); expect(dismiss).not.toHaveBeenCalled();
    fireEvent.click(buttons[1]); expect(dismiss).toHaveBeenCalledExactlyOnceWith("close");
  });
  it.each([{ title: " " }, { closeLabel: " " }])("rejects a missing visible title or Close name", invalid => {
    expect(() => render(<BottomSheet {...props} {...invalid}>Body</BottomSheet>)).toThrow("non-empty visible title and closeLabel");
  });
});
