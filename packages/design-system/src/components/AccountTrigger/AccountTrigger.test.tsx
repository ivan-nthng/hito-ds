import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountTrigger, type AccountTriggerProps } from "../index";

const props: AccountTriggerProps = {
  label: "Conta de Alex Silva", menuLabel: "Menu da conta", open: false,
  onOpenChange: () => {}, items: [{ id: "language", label: "Idioma" }], onAction: () => {},
};
describe("AccountTrigger", () => {
  it("owns one named button and ref; avatar fallback never becomes a second target or name", () => {
    const ref = createRef<HTMLButtonElement>(); const change = vi.fn();
    const { container, rerender } = render(<AccountTrigger {...props} ref={ref} onOpenChange={change} avatar={{ src: "/bad.jpg", initials: "AS" }} />);
    const button = screen.getByRole("button", { name: props.label });
    expect(ref.current).toBe(button); expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(button.getAttribute("aria-haspopup")).toBe("menu"); expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.querySelector('[data-avatar][aria-hidden="true"]')).not.toBeNull();
    fireEvent.error(button.querySelector("img")!); fireEvent.click(button);
    expect(change).toHaveBeenCalledExactlyOnceWith(true, "trigger");
    rerender(<AccountTrigger {...props} ref={ref} />);
    expect(ref.current).toBe(button); expect(button.querySelector('[data-icon-name="general/user-filled"]')).not.toBeNull();
  });
  it("rejects an unnamed trigger and delegates invalid command boundaries to Menu", () => {
    expect(() => render(<AccountTrigger {...props} label=" " />)).toThrow("visible label");
    expect(() => render(<AccountTrigger {...props} items={[]} />)).toThrow("labelled commands");
  });
  it("keeps one named/ref-forwarding account trigger and menu while switching to avatar-only presentation", () => {
    const ref = createRef<HTMLButtonElement>();
    const view = render(<AccountTrigger {...props} ref={ref} avatar={{ initials: "AS" }} />);
    const trigger = screen.getByRole("button", { name: props.label });
    view.rerender(<AccountTrigger {...props} ref={ref} compact avatar={{ initials: "AS" }} />);
    expect(ref.current).toBe(trigger);
    expect(trigger.getAttribute("data-compact")).toBe("true");
    expect(trigger.querySelector('[data-avatar]')).not.toBeNull();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
