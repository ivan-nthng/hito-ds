import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Select } from "./Select";
import { Field } from "../Field/Field";
const options = [
  { value: "a", label: "Alpha" },
  { value: "disabled", label: "Blocked", disabled: true },
  { value: "b", label: "Beta" },
  { value: "c", label: "Beta", description: "Other value" },
];
const base = {
  options,
  label: "Window",
  closeLabel: "Close",
  placeholder: "Choose",
};
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  HTMLElement.prototype.showPopover = function () {
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = vi.fn();
});
function open() {
  fireEvent.click(screen.getByRole("combobox"));
  return screen.getByRole("listbox");
}
function key(element: Element, key: string) {
  fireEvent.keyDown(element, { key });
}

describe("Select", () => {
  it("announces trailing text without changing the label, native value or caller descriptions", () => {
    const change = vi.fn();
    const { container } = render(<form><p id="hint">For the whole cart</p><Select {...base} name="weeks" defaultValue="a" aria-describedby="hint" onValueChange={change}
      options={[{ value: "a", label: "1 week", trailingText: "R$32.50", description: "One delivery" }, { value: "blocked", label: "Unavailable", trailingText: "R$65.00", disabled: true }, { value: "b", label: "2 weeks", trailingText: "R$65.00" }, { value: "more", label: "More" }]} /></form>);
    const trigger = screen.getByRole("combobox", { name: "Window" });
    expect(trigger.textContent).toBe("1 week");
    expect(screen.getByRole("combobox", { description: "For the whole cart R$32.50" })).toBe(trigger);
    const list = open();
    expect(screen.getByRole("option", { name: "1 week R$32.50", description: "One delivery" })).toBeTruthy();
    fireEvent.click(screen.getByRole("option", { name: "Unavailable R$65.00" }));
    expect(change).not.toHaveBeenCalled();
    key(list, "2"); key(list, "Enter");
    expect(change).toHaveBeenCalledExactlyOnceWith("b");
    expect(new FormData(container.querySelector("form")!).get("weeks")).toBe("b");
    expect(trigger.textContent).toBe("2 weeks");
    expect(screen.getByRole("combobox", { description: "For the whole cart R$65.00" })).toBe(trigger);
    fireEvent.click(trigger); fireEvent.click(screen.getByRole("option", { name: "More" }));
    expect(screen.getByRole("combobox", { description: "For the whole cart" })).toBe(trigger);
    expect(trigger.getAttribute("aria-describedby")).toBe("hint");
  });
  it("opens when the trailing arrow is clicked", () => {
    const { container } = render(<Select {...base} />);
    const arrow = container.querySelector('[data-icon-name="arrows/compact/down"]');
    expect(arrow).not.toBeNull();
    fireEvent.click(arrow!);
    expect(screen.getByRole("listbox")).toBeTruthy();
    expect(screen.getByRole("combobox").getAttribute("aria-expanded")).toBe("true");
  });
  it("separates active from committed, skips disabled, commits once and returns focus", () => {
    const change = vi.fn();
    render(<Select {...base} onValueChange={change} />);
    const list = open();
    key(list, "ArrowDown");
    expect(screen.getByRole("combobox").textContent).toBe("Choose");
    expect(list.getAttribute("aria-activedescendant")).toBe(
      screen.getAllByRole("option")[2].id,
    );
    key(list, "Enter");
    expect(change).toHaveBeenCalledExactlyOnceWith("b");
    expect(document.activeElement).toBe(screen.getByRole("combobox"));
  });
  it("supports Home, End, prefix typeahead and Escape without committing", () => {
    const change = vi.fn();
    render(<Select {...base} defaultValue="a" onValueChange={change} />);
    const list = open();
    key(list, "End");
    expect(list.getAttribute("aria-activedescendant")).toContain("-c");
    key(list, "Home");
    key(list, "b");
    expect(list.getAttribute("aria-activedescendant")).toContain("-b");
    key(list, "Escape");
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("preserves controlled value until the parent updates it", () => {
    const change = vi.fn();
    const view = render(<Select {...base} value="a" onValueChange={change} />);
    const list = open();
    key(list, "End");
    key(list, " ");
    expect(change).toHaveBeenCalledWith("c");
    expect(screen.getByRole("combobox").textContent).toBe("Alpha");
    view.rerender(<Select {...base} value="c" onValueChange={change} />);
    expect(screen.getByRole("combobox").textContent).toBe("Beta");
  });
  it("submits and resets uncontrolled and controlled native values", async () => {
    const { container, rerender } = render(
      <form>
        <Select {...base} name="window" defaultValue="a" />
      </form>,
    );
    const list = open();
    key(list, "End");
    key(list, "Enter");
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("window")).toBe("c");
    await act(async () => form.reset());
    expect(new FormData(form).get("window")).toBe("a");
    rerender(
      <form>
        <Select {...base} name="window" value="b" defaultValue="a" />
      </form>,
    );
    await act(async () => form.reset());
    expect(new FormData(form).get("window")).toBe("b");
  });
  it.each([
    { disabled: true },
    { readOnly: true },
    { loading: true },
    { options: [] },
  ])("does not open when unavailable %j", (props) => {
    render(<Select {...base} {...props} />);
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    key(trigger, "ArrowDown");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("dismisses if it becomes read-only and does not reopen when enabled", () => {
    const view = render(<Select {...base} />);
    open();
    view.rerender(<Select {...base} readOnly />);
    expect(screen.queryByRole("listbox")).toBeNull();
    view.rerender(<Select {...base} />);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
  it("keeps unique option identities despite duplicate visible labels and ignores disabled clicks", () => {
    const change = vi.fn();
    render(<Select {...base} onValueChange={change} />);
    open();
    const rows = screen.getAllByRole("option");
    expect(new Set(rows.map((row) => row.id)).size).toBe(4);
    fireEvent.click(rows[1]);
    expect(change).not.toHaveBeenCalled();
    fireEvent.click(rows[3]);
    expect(change).toHaveBeenCalledWith("c");
  });
  it("preserves Field validation and required native form validity", () => {
    const { container } = render(
      <form>
        <Field label="Window" error="Required" required>
          {({ controlProps }) => <Select {...base} {...controlProps} />}
        </Field>
      </form>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(trigger.getAttribute("aria-errormessage")!)
        ?.textContent,
    ).toBe("Required");
    expect(container.querySelector("form")!.checkValidity()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
  it("keeps focus and open state across parent option updates", async () => {
    const view = render(<Select {...base} />);
    const list = open();
    list.focus();
    key(list, "End");
    view.rerender(<Select {...base} options={[options[0], options[2]]} />);
    await waitFor(() => expect(document.activeElement).toBe(list));
    expect(list.getAttribute("aria-activedescendant")).toContain("-a");
  });
});
