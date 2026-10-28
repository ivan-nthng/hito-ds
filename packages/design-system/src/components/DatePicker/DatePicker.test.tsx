import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "./DatePicker";

vi.mock("../anchored/observe-position", () => ({ observeAnchoredPosition: () => () => {} }));

let narrow = false;
const mediaListeners = new Set<() => void>();
const matchMedia = vi.fn(() => ({
  get matches() { return narrow; },
  addEventListener: (_event: string, listener: () => void) => mediaListeners.add(listener),
  removeEventListener: (_event: string, listener: () => void) => mediaListeners.delete(listener),
}));
const nativeMatches = HTMLElement.prototype.matches;

function setNarrow(next: boolean) {
  act(() => { narrow = next; mediaListeners.forEach((listener) => listener()); });
}

function ControlledPicker({ locale = "en", disabled = false }: { locale?: "en" | "pt"; disabled?: boolean }) {
  const [value, setValue] = useState<string | null>("2026-09-24");
  return <form><DatePicker
    disabled={disabled}
    label={locale === "pt" ? "Data de entrega" : "Delivery date"}
    locale={locale}
    name="deliveryDay"
    onValueChange={setValue}
    todayDay="2026-09-19"
    unavailableDays={{ "2026-09-22": { reason: "Unavailable date" } }}
    value={value}
  /></form>;
}

beforeEach(() => {
  narrow = false;
  vi.stubGlobal("matchMedia", matchMedia);
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("IntersectionObserver", class { observe() {} disconnect() {} });
  Object.defineProperty(HTMLElement.prototype, "showPopover", { configurable: true, value() { this.dataset.testOpen = "true"; } });
  Object.defineProperty(HTMLElement.prototype, "hidePopover", { configurable: true, value() { delete this.dataset.testOpen; } });
  Object.defineProperty(HTMLElement.prototype, "matches", { configurable: true, value(selector: string) {
    return selector === ":popover-open" ? this.dataset.testOpen === "true" : nativeMatches.call(this, selector);
  } });
  Object.defineProperty(HTMLElement.prototype, "getClientRects", { configurable: true, value() { return [this.getBoundingClientRect()]; } });
  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", { configurable: true, value() {
    return { x: 10, y: 10, left: 10, top: 10, right: 110, bottom: 50, width: 100, height: 40, toJSON() {} };
  } });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value() { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value() { this.removeAttribute("open"); } });
});
afterEach(() => {
  vi.unstubAllGlobals(); mediaListeners.clear();
  delete (HTMLElement.prototype as { matches?: typeof nativeMatches }).matches;
  delete (HTMLElement.prototype as { getClientRects?: typeof HTMLElement.prototype.getClientRects }).getClientRects;
  delete (HTMLElement.prototype as { getBoundingClientRect?: typeof HTMLElement.prototype.getBoundingClientRect }).getBoundingClientRect;
});

describe("DatePicker", () => {
  it("keeps a calendar choice as draft until Apply and submits the ISO day", async () => {
    const { container } = render(<ControlledPicker />);
    const trigger = screen.getByRole("button", { name: "Open calendar" });
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(container.querySelector('[role="dialog"]')?.id);
    expect(screen.getByRole("grid", { name: "September 2026", hidden: true })).toBeTruthy();
    await waitFor(() => expect(screen.getByRole("button", { name: /September 24, 2026, Selected/, hidden: true })).toBe(document.activeElement));
    fireEvent.click(screen.getByRole("button", { name: "September 25, 2026", hidden: true }));
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-24");
    fireEvent.click(screen.getByRole("button", { name: "Apply date", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("deliveryDay")).toBe("2026-09-25");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("discards Cancel and Escape, and cannot select an unavailable day", () => {
    const { container } = render(<ControlledPicker />);
    const trigger = screen.getByRole("button", { name: "Open calendar" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: /September 22, 2026, Unavailable/, hidden: true }));
    expect(screen.getByRole("button", { name: /September 24, 2026, Selected/, hidden: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "September 25, 2026", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-24");
    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: /September 24, 2026, Selected/, hidden: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "September 25, 2026", hidden: true }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-24");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps typed unavailable days visible without committing them to the form", () => {
    const { container } = render(<ControlledPicker />);
    const day = screen.getByRole("textbox", { name: "Delivery date Day" }) as HTMLInputElement;
    fireEvent.change(day, { target: { value: "22" } });
    expect(day.value).toBe("22");
    expect(screen.getByText("Unavailable date")).toBeTruthy();
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-24");
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
    fireEvent.change(day, { target: { value: "25" } });
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-25");
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true);
  });

  it("uses a localized bottom sheet on narrow screens and preserves its draft across a viewport change", () => {
    setNarrow(true);
    const { container } = render(<ControlledPicker locale="pt" />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir calendário" }));
    expect(screen.getByRole("dialog", { name: "Escolha uma data" }).hasAttribute("open")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "25 de setembro de 2026", hidden: true }));
    setNarrow(false);
    expect(screen.getByRole("grid", { name: "setembro de 2026", hidden: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Aplicar data", hidden: true }));
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-25");
  });

  it("closes on a controlled external replacement and cannot open while disabled", async () => {
    const { rerender } = render(<DatePicker label="Delivery date" locale="en" todayDay="2026-09-19" value="2026-09-24" />);
    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    fireEvent.click(screen.getByRole("button", { name: "September 25, 2026", hidden: true }));
    rerender(<DatePicker label="Delivery date" locale="en" todayDay="2026-09-19" value="2026-10-03" />);
    expect(screen.getByRole("button", { name: "Open calendar" }).getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Open calendar" })));
    rerender(<DatePicker disabled label="Delivery date" locale="en" todayDay="2026-09-19" value="2026-10-03" />);
    const trigger = screen.getByRole("button", { name: "Open calendar" }) as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
