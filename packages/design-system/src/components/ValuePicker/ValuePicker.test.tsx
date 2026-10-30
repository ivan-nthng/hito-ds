import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ValuePicker } from "./ValuePicker";

const options = [
  { value: "four", label: "4 px" },
  { value: "six", label: "6 px" },
  { value: "blocked", label: "Unavailable", disabled: true },
];
const base = { source: "custom" as const, options, label: "Padding value", closeLabel: "Close values" };

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  HTMLElement.prototype.showPopover = function () { this.style.display = "block"; };
  HTMLElement.prototype.hidePopover = vi.fn();
});

describe("ValuePicker", () => {
  it("keeps the source explicit, selects with the keyboard and returns focus", () => {
    const change = vi.fn();
    render(<ValuePicker {...base} defaultValue="four" onValueChange={change} />);
    const trigger = screen.getByRole("combobox", { name: "Padding value" });
    expect(trigger.getAttribute("data-source")).toBe("custom");
    expect(trigger.textContent).toBe("4 px");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const list = screen.getByRole("listbox", { name: "Padding value" });
    expect(document.activeElement).toBe(list);
    fireEvent.keyDown(list, { key: "ArrowDown" });
    fireEvent.keyDown(list, { key: "Enter" });
    expect(change).toHaveBeenCalledExactlyOnceWith("six");
    expect(trigger.textContent).toBe("6 px");
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("preserves controlled value, skips disabled options and dismisses without committing", () => {
    const change = vi.fn();
    const view = render(<ValuePicker {...base} source="token" value="four" onValueChange={change} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("data-source")).toBe("token");
    fireEvent.click(trigger);
    const list = screen.getByRole("listbox");
    fireEvent.keyDown(list, { key: "End" });
    expect(list.getAttribute("aria-activedescendant")).toContain("-six");
    fireEvent.keyDown(list, { key: "Enter" });
    expect(change).toHaveBeenCalledWith("six");
    expect(trigger.textContent).toBe("4 px");
    view.rerender(<ValuePicker {...base} source="token" value="six" onValueChange={change} />);
    expect(trigger.textContent).toBe("6 px");
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    expect(change).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps inferred numeric matches separate from proven token selections", () => {
    render(<ValuePicker {...base} source="inferred" value="four" title="Numeric match; binding unverified" />);
    const trigger = screen.getByRole("combobox", { name: "Padding value" });
    expect(trigger.getAttribute("data-source")).toBe("inferred");
    expect(trigger.title).toContain("binding unverified");
  });

  it("does not open when disabled or without enabled choices", () => {
    const { rerender } = render(<ValuePicker {...base} disabled />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
    rerender(<ValuePicker {...base} options={options.filter(option => option.disabled)} />);
    expect(trigger.hasAttribute("disabled")).toBe(true);
    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("keeps selected option announcement and dismisses after focus leaves the list", () => {
    render(<><ValuePicker {...base} defaultValue="four" /><button type="button">Outside</button></>);
    fireEvent.click(screen.getByRole("combobox"));
    const list = screen.getByRole("listbox");
    expect(screen.getByRole("option", { name: "4 px" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.blur(list.closest('[role="dialog"]')!, { relatedTarget: screen.getByRole("button", { name: "Outside" }) });
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
