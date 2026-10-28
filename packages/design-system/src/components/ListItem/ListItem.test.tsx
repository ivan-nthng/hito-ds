import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KeyboardShortcut, List, ListItem } from "../index";

describe("ListItem composition", () => {
  it("keeps raster artwork decorative and noninteractive in the existing leading slot", () => {
    render(<List><ListItem size="md" label="Hub" leading={{ artwork: { src: "/hub.png" } }} /></List>);
    const row = screen.getByRole("listitem"), image = row.querySelector("img")!;
    expect(image.getAttribute("src")).toBe("/hub.png");
    expect(image.alt).toBe("");
    expect(image.parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(row.dataset.size).toBe("md");
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("keeps visual selection noninteractive and forwards the list reference", () => {
    const ref = createRef<HTMLLIElement>();
    render(
      <List>
        <ListItem
          ref={ref}
          label="Workspace"
          selected
          leading={{ selectionMark: true }}
          trailing={{ keyboardShortcut: "⌘ K" }}
        />
      </List>,
    );
    expect(ref.current).toBe(screen.getByRole("listitem"));
    expect(ref.current?.hasAttribute("tabindex")).toBe(false);
    expect(ref.current?.hasAttribute("aria-selected")).toBe(false);
    expect(screen.queryByRole("button")).toBeNull();
    const shortcut = screen.getByText("Command K").closest("kbd")!;
    expect(shortcut.tagName).toBe("KBD");
    expect(shortcut.querySelector('[data-icon-name="keyboard/command"]')).not.toBeNull();
  });

  it("distinguishes selected rows with an explicit mark from those needing a structural cue", () => {
    render(
      <List>
        <ListItem label="Implicit selection" selected />
        <ListItem label="Reserved empty mark" selected leading={{ selectionMark: false }} />
        <ListItem label="Leading mark" selected leading={{ selectionMark: true }} />
        <ListItem label="Trailing mark" selected trailing={{ selectionMark: true }} />
        <ListItem label="Unselected" />
      </List>,
    );
    const row = (label: string) => screen.getByText(label).closest("li")!;
    expect(row("Implicit selection").dataset.selected).toBe("true");
    expect(row("Implicit selection").dataset.hasSelectionMark).toBeUndefined();
    expect(row("Reserved empty mark").dataset.hasSelectionMark).toBeUndefined();
    expect(row("Leading mark").dataset.hasSelectionMark).toBe("true");
    expect(row("Trailing mark").dataset.hasSelectionMark).toBe("true");
    expect(row("Unselected").dataset.selected).toBeUndefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("associates the visible label with a native form checkbox", () => {
    const { container } = render(
      <form>
        <List>
          <ListItem
            label="Alerts"
            leading={{ checkbox: { name: "alerts", value: "enabled" } }}
          />
        </List>
      </form>,
    );
    const checkbox = screen.getByRole("checkbox", {
      name: "Alerts",
    }) as HTMLInputElement;
    const form = container.querySelector("form")!;
    expect(new FormData(form).has("alerts")).toBe(false);
    fireEvent.click(screen.getByText("Alerts"));
    expect(checkbox.checked).toBe(true);
    expect(new FormData(form).get("alerts")).toBe("enabled");
    form.reset();
    expect(checkbox.checked).toBe(false);
  });

  it("connects supporting copy and preserves caller description references", () => {
    render(
      <>
        <span id="external-note">Optional</span>
        <List>
          <ListItem
            label="Alerts"
            description="Inventory notifications"
            leading={{ checkbox: { "aria-describedby": "external-note" } }}
          />
        </List>
      </>,
    );
    const input = screen.getByRole("checkbox", { name: "Alerts" });
    const ids = input.getAttribute("aria-describedby")!.split(" ");
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
      "Optional",
      "Inventory notifications",
    ]);
  });

  it("preserves the disabled native checkbox", () => {
    render(
      <List>
        <ListItem
          label="Locked"
          leading={{ checkbox: { disabled: true, defaultChecked: true } }}
        />
      </List>,
    );
    fireEvent.click(screen.getByText("Locked"));
    const checkbox = screen.getByRole("checkbox", {
      name: "Locked",
    }) as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.checked).toBe(true);
  });

  it("exposes keyboard notation without adding focus or command behavior", () => {
    const ref = createRef<HTMLElement>();
    render(
      <KeyboardShortcut ref={ref} aria-label="Command Shift K">
        ⌘ ⇧ K
      </KeyboardShortcut>,
    );
    expect(ref.current?.tagName).toBe("KBD");
    expect(ref.current?.textContent).toContain("Command Shift K");
    expect(ref.current?.hasAttribute("tabindex")).toBe(false);
    expect(ref.current?.querySelectorAll('[data-icon-name^="keyboard/"]')).toHaveLength(2);
  });

  it("supports typed icon-only and mixed shortcuts while preserving arbitrary text callers", () => {
    render(<>
      <KeyboardShortcut keys={["command", "shift"]} />
      <KeyboardShortcut keys={["option", { text: "K" }]} />
      <KeyboardShortcut keys={["control", "return", { text: "M" }]} />
      <KeyboardShortcut>Ctrl+K</KeyboardShortcut>
    </>);
    expect(screen.getByText("Command Shift").closest("kbd")?.querySelectorAll('[data-icon-name^="keyboard/"]')).toHaveLength(2);
    expect(screen.getByText("Option K").closest("kbd")?.textContent).toContain("K");
    expect(screen.getByText("Control Return M").closest("kbd")?.textContent).toContain("M");
    expect(screen.getAllByText("Ctrl+K").some((element) => element.closest("kbd")?.tagName === "KBD")).toBe(true);
  });
});
