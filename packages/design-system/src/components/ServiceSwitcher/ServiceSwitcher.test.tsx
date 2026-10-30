import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ServiceSwitcher, type ServiceSwitcherProps } from "../index";

const props: ServiceSwitcherProps = { label: "Platform Admin", menuLabel: "Switch service", artwork: { src: "/admin.png" },
  open: false, onOpenChange: () => {}, items: [{ id: "hub", label: "Hub" }], onAction: () => {} };

describe("ServiceSwitcher", () => {
  it.each([false, true])("forwards one named native trigger and ref, compact=%s", compact => {
    const ref = createRef<HTMLButtonElement>(), change = vi.fn();
    const { container } = render(<ServiceSwitcher {...props} compact={compact} ref={ref} onOpenChange={change} />);
    const button = screen.getByRole("button", { name: props.label });
    expect(ref.current).toBe(button); expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(button.querySelector("a,button,input")).toBeNull();
    expect(button.getAttribute("aria-haspopup")).toBe("menu"); expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.querySelector("img")?.alt).toBe("");
    expect(button.querySelector('[data-icon-name="arrows/compact/down"]') !== null).toBe(!compact);
    expect(button.textContent).toBe(compact ? "" : props.label);
    fireEvent.click(button); expect(change).toHaveBeenCalledExactlyOnceWith(true, "trigger");
    if (compact) expect(button.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip", { hidden: true }).id);
  });
  it("keeps disabled activation native", () => {
    const change = vi.fn(); render(<ServiceSwitcher {...props} compact disabled onOpenChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: props.label })); expect(change).not.toHaveBeenCalled();
  });
  it("requires a meaningful name and delegates command validation to Menu", () => {
    expect(() => render(<ServiceSwitcher {...props} label=" " />)).toThrow("service label");
    expect(() => render(<ServiceSwitcher {...props} items={[]} />)).toThrow("labelled commands");
  });
});
