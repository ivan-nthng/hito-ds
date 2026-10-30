import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs, type TabsItem } from "./Tabs";

const items: TabsItem[] = [
  { id: "first", label: "First", content: <input aria-label="Draft" defaultValue="Keep me" /> },
  { id: "second", label: "Second", content: "Second panel" },
  { id: "disabled", label: "Unavailable", disabled: true, content: null },
];

describe("Tabs public contract", () => {
  it("requests selection while the caller retains control and panel drafts remain mounted", () => {
    const onValueChange = vi.fn();
    const view = (value: string) => <Tabs items={items} value={value} onValueChange={onValueChange} label="Sections" />;
    const { rerender } = render(view("first"));
    const draft = screen.getByRole("textbox");
    fireEvent.change(draft, { target: { value: "Changed draft" } });
    fireEvent.click(screen.getByRole("tab", { name: "Second" }));
    expect(onValueChange.mock.calls).toEqual([["second"]]);
    expect(screen.getByRole("tab", { selected: true }).textContent).toBe("First");
    rerender(view("second"));
    expect(screen.queryByRole("textbox")).toBeNull();
    expect(draft.isConnected).toBe(true);
    rerender(view("first"));
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("Changed draft");
  });

  it("forwards native root attributes and does not select disabled items", () => {
    const onValueChange = vi.fn();
    const { container } = render(<Tabs items={items} value="first" onValueChange={onValueChange} label="Sections" id="sections" dir="rtl" className="consumer" />);
    expect(container.firstElementChild?.id).toBe("sections");
    expect(container.firstElementChild?.getAttribute("dir")).toBe("rtl");
    expect(container.firstElementChild?.classList.contains("consumer")).toBe(true);
    fireEvent.click(screen.getByRole("tab", { name: "Unavailable" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
