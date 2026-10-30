import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FilterTrigger } from "./FilterTrigger";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", { writable: true, value: vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })) });
});
const props = { addLabel: "Add city", label: "City:", title: "Cities", closeLabel: "Close", open: false, children: null };
describe("FilterTrigger", () => {
  it("keeps one button when controlled applied text changes and requests disclosure only", () => {
    const change = vi.fn();
    const {rerender} = render(<FilterTrigger {...props} onOpenChange={change}/>);
    const trigger = screen.getByRole("button", {name:"Add city"});
    fireEvent.click(trigger);
    expect(change).toHaveBeenCalledExactlyOnceWith(true);
    expect(trigger.textContent).toBe("Add city");
    rerender(<FilterTrigger {...props} onOpenChange={change} value="Lisbon" leadingIcon="general/location"/>);
    expect(screen.getByRole("button", {name:"City: Lisbon"})).toBe(trigger);
    expect(trigger.getAttribute("data-icon-position")).toBe("both");
    rerender(<FilterTrigger {...props} onOpenChange={change} value={null}/>);
    expect(screen.getByRole("button", {name:"Add city"})).toBe(trigger);
    expect(change).toHaveBeenCalledTimes(1);
  });
  it("does not disclose when disabled even if the caller requests an open panel", () => {
    const change = vi.fn();
    render(<FilterTrigger {...props} open disabled onOpenChange={change} value="Lisbon"/>);
    fireEvent.click(screen.getByRole("button"));
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe("false");
  });
  it("does not submit an enclosing form", () => {
    const submit = vi.fn();
    render(<form onSubmit={submit}><FilterTrigger {...props} onOpenChange={vi.fn()}/></form>);
    fireEvent.click(screen.getByRole("button"));
    expect(submit).not.toHaveBeenCalled();
  });
});
