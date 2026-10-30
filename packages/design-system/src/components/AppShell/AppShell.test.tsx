import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppShell, type AppShellProps } from "./AppShell";
import { ServiceSwitcher } from "../ServiceSwitcher/ServiceSwitcher";

let mobile = false;
const listeners = new Set<() => void>();
beforeEach(() => {
  mobile = false;
  vi.stubGlobal("matchMedia", () => ({ get matches() { return mobile; }, addEventListener: (_: string, change: () => void) => listeners.add(change), removeEventListener: (_: string, change: () => void) => listeners.delete(change) }));
});
afterEach(() => { vi.unstubAllGlobals(); listeners.clear(); });
const props: AppShellProps = {
  mainId: "workspace", skipLabel: "Skip to workspace", collapseLabel: "Collapse navigation", expandLabel: "Expand navigation",
  service: ({ compact, mobile }) => <span>{compact ? "Compact service" : mobile ? "Mobile service" : "Expanded service"}</span>,
  navigation: { label: "Workspace navigation", triggerLabel: "Navigation", items: [
    { id: "overview", label: "Overview", icon: "general/dashboard", current: true },
    { id: "production", label: "Production", icon: "general/kitchen", disabled: true, disabledReason: "Unavailable" },
  ], onAction: () => {} },
  children: <input aria-label="Retained draft" defaultValue="Unsaved description" />,
};
it("retains the actual Main/input and draft through collapse, section rerenders and a temporary mobile breakpoint", () => {
  const view = render(<AppShell {...props} />), input = screen.getByRole("textbox"), main = screen.getByRole("main");
  fireEvent.change(input, { target: { value: "Edited unsaved description" } });
  const collapse = screen.getByRole("button", { name: "Collapse navigation" });
  fireEvent.click(collapse);
  expect(screen.getByRole("button", { name: "Expand navigation" })).toBe(collapse);
  expect(main.parentElement?.hasAttribute("data-compact")).toBe(true);
  view.rerender(<AppShell {...props} navigation={{ ...props.navigation!, items: [...props.navigation!.items, { id: "menu", label: "Menu", icon: "delivery/food" }] }} />);
  act(() => { mobile = true; listeners.forEach(change => change()); });
  expect(main.parentElement?.hasAttribute("data-compact")).toBe(false);
  expect(screen.getByText("Mobile service")).toBeTruthy();
  act(() => { mobile = false; listeners.forEach(change => change()); });
  expect(main.parentElement?.hasAttribute("data-compact")).toBe(true);
  expect(screen.getByRole("main")).toBe(main);
  expect(screen.getByRole("textbox")).toBe(input);
  expect((input as HTMLInputElement).value).toBe("Edited unsaved description");
});
it("dispatches only enabled caller actions and retains current/disabled meaning in compact mode", () => {
  const onAction = vi.fn(), view = render(<AppShell {...props} navigation={{ ...props.navigation!, onAction }} />);
  fireEvent.click(screen.getByRole("button", { name: "Overview" }));
  expect(onAction).toHaveBeenCalledExactlyOnceWith("overview");
  fireEvent.click(screen.getByRole("button", { name: "Production" }));
  fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
  expect(screen.getByRole("button", { name: "Overview" }).getAttribute("aria-current")).toBe("page");
  expect((screen.getByRole("button", { name: "Production" }) as HTMLButtonElement).disabled).toBe(true);
  view.rerender(<AppShell {...props} navigation={{ ...props.navigation!, onAction }} navigationDisabled />);
  fireEvent.click(screen.getByRole("button", { name: "Overview" }));
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Compact service").parentElement?.hasAttribute("inert")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));
  expect(mainCompact()).toBe(false);
});
function mainCompact() { return screen.getByRole("main").parentElement?.hasAttribute("data-compact"); }
it("starts a fresh mount expanded without creating navigation for a service that has none", () => {
  const view = render(<AppShell {...props} navigation={undefined} />);
  expect(screen.queryByRole("navigation")).toBeNull();
  expect(screen.queryByRole("button", { name: "Navigation" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
  view.unmount();
  render(<AppShell {...props} />);
  expect(mainCompact()).toBe(false);
});
it("keeps temporary keyboard reveal separate from mounted collapse preference and restores compact focus on Escape", () => {
  render(<AppShell {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
  const main = screen.getByRole("main"), shell = main.parentElement!;
  act(() => screen.getByRole("button", { name: "Overview" }).focus());
  // Collapse returned focus to Overview without immediately reopening. Tab to another enabled slot reveals.
  act(() => screen.getByRole("textbox").focus());
  act(() => screen.getByRole("button", { name: "Overview" }).focus());
  expect(shell.hasAttribute("data-preview")).toBe(true);
  expect(shell.hasAttribute("data-compact")).toBe(true);
  expect(screen.getByRole("button", { name: "Overview" })).toBe(document.activeElement);
  fireEvent.keyDown(screen.getByRole("button", { name: "Overview" }), { key: "Escape" });
  expect(shell.hasAttribute("data-preview")).toBe(false);
  expect(mainCompact()).toBe(true);
  expect(screen.getByRole("button", { name: "Overview" })).toBe(document.activeElement);
});

it("returns Escape from the temporary pin to the committed compact ServiceSwitcher trigger", () => {
  render(<AppShell {...props} service={({ compact }) => <ServiceSwitcher compact={compact} label="Delivery" menuLabel="Services" artwork={{ src: "/delivery.png" }} open={false} onOpenChange={() => {}} items={[{ id: "hub", label: "Hub" }]} onAction={() => {}} />} />);
  fireEvent.click(screen.getByRole("button", { name: "Collapse navigation" }));
  const shell = screen.getByRole("main").parentElement!;
  act(() => screen.getByRole("textbox").focus());
  act(() => screen.getByRole("button", { name: "Delivery" }).focus());
  expect(shell.hasAttribute("data-preview")).toBe(true);
  act(() => screen.getByRole("button", { name: "Expand navigation" }).focus());
  fireEvent.keyDown(screen.getByRole("button", { name: "Expand navigation" }), { key: "Escape" });
  expect(shell.hasAttribute("data-preview")).toBe(false);
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delivery" }));
  expect(document.activeElement?.isConnected).toBe(true);
});
