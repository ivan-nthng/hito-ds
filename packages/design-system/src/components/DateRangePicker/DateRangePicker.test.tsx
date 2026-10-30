import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker, type DateRangeQuickPeriod } from "./DateRangePicker";
import { exampleQuickPeriods, exampleReferenceDay } from "./DateRangePicker.example";
import type { DateRangeValue } from "../DateRangeField/DateRangeField";

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

const periods: DateRangeQuickPeriod[] = [
  { id: "week", label: { en: "This week", pt: "Esta semana" }, value: { startDay: "2026-09-13", endDay: "2026-09-19" } },
  { id: "blocked", label: { en: "Blocked", pt: "Bloqueado" }, value: { startDay: "2026-09-20", endDay: "2026-09-24" }, disabledReason: { en: "Not available", pt: "Indisponível" } },
];

function ControlledPicker({ locale = "en", quickPeriods = periods, minDay, maxDay }: { locale?: "en" | "pt"; quickPeriods?: readonly DateRangeQuickPeriod[]; minDay?: string; maxDay?: string }) {
  const [value, setValue] = useState<DateRangeValue | null>({ startDay: "2026-09-24", endDay: "2026-09-30" });
  const [choice, setChoice] = useState<string | null>(null);
  return <form><DateRangePicker
    endName="endDay"
    legend={locale === "pt" ? "Período" : "Period"}
    locale={locale}
    minDay={minDay}
    maxDay={maxDay}
    onQuickPeriodChange={setChoice}
    onValueChange={setValue}
    quickPeriods={quickPeriods}
    selectedQuickPeriodId={choice}
    startName="startDay"
    todayDay="2026-09-19"
    unavailableDays={{ "2026-09-26": { reason: "Not available" } }}
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

describe("DateRangePicker", () => {
  it("shows two consecutive months, commits only after Apply, and allows an unavailable interior day", async () => {
    const { container } = render(<ControlledPicker />);
    const form = container.querySelector("form")!;
    const opener = screen.getByRole("button", { name: /Open date range picker/ });
    fireEvent.click(opener);
    expect(screen.getByRole("grid", { name: "September 2026", hidden: true })).toBeTruthy();
    expect(screen.getByRole("grid", { name: "October 2026", hidden: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^September 25, 2026/, hidden: true }));
    expect((screen.getByRole("button", { name: "Apply range", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /^September 28, 2026/, hidden: true }));
    expect(new FormData(form).get("startDay")).toBe("2026-09-24");
    act(() => { expect(form.checkValidity()).toBe(false); });
    fireEvent.click(screen.getByRole("button", { name: "Apply range", hidden: true }));
    expect(new FormData(form).get("startDay")).toBe("2026-09-25");
    expect(new FormData(form).get("endDay")).toBe("2026-09-28");
    expect(form.checkValidity()).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  it("restarts an earlier second day and discards Cancel and Escape", () => {
    const { container } = render(<ControlledPicker />);
    const opener = screen.getByRole("button", { name: /Open date range picker/ });
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: /^September 28, 2026/, hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: /^September 25, 2026/, hidden: true }));
    expect(screen.getByRole("button", { name: /September 25, 2026, Range start/, hidden: true })).toBeTruthy();
    expect((screen.getByRole("button", { name: "Apply range", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("endDay")).toBe("2026-09-30");
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: /^September 25, 2026/, hidden: true }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(opener.getAttribute("aria-expanded")).toBe("false");
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-09-24");
  });

  it("uses caller-supplied choices, rejects a disabled choice, and returns to Custom after manual edit", () => {
    const { container } = render(<ControlledPicker />);
    fireEvent.click(screen.getByRole("button", { name: /Open date range picker/ }));
    expect((screen.getByRole("button", { name: "Blocked", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Not available")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "This week", hidden: true }));
    expect((screen.getByRole("button", { name: "This week", hidden: true }) as HTMLButtonElement).getAttribute("aria-pressed")).toBe("true");
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-09-24");
    fireEvent.change(screen.getByRole("textbox", { name: "End date Day", hidden: true }), { target: { value: "18" } });
    expect((screen.getByRole("button", { name: "Custom", hidden: true }) as HTMLButtonElement).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByRole("button", { name: "Apply range", hidden: true }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("keeps incomplete manual edits invalid until corrected, and Clear is explicit", () => {
    const { container } = render(<ControlledPicker />);
    const form = container.querySelector("form")!;
    fireEvent.click(screen.getByRole("button", { name: /Open date range picker/ }));
    const endYear = screen.getByRole("textbox", { name: "End date Year", hidden: true }) as HTMLInputElement;
    fireEvent.change(endYear, { target: { value: "202" } });
    expect(endYear.value).toBe("202");
    expect(form.checkValidity()).toBe(false);
    expect((screen.getByRole("button", { name: "Apply range", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(endYear, { target: { value: "2026" } });
    expect((screen.getByRole("button", { name: "Apply range", hidden: true }) as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Clear", hidden: true }));
    expect(new FormData(form).get("startDay")).toBe("2026-09-24");
    fireEvent.click(screen.getByRole("button", { name: "Apply range", hidden: true }));
    expect(new FormData(form).get("startDay")).toBe("");
    expect(new FormData(form).get("endDay")).toBe("");
  });

  it("keeps a Portuguese draft while switching between one-month sheet and two-month popover", () => {
    setNarrow(true);
    const { container } = render(<ControlledPicker locale="pt" />);
    fireEvent.click(screen.getByRole("button", { name: /Abrir seletor de período/ }));
    expect(screen.getByRole("dialog", { name: "Período" }).hasAttribute("open")).toBe(true);
    expect(screen.getAllByRole("grid", { hidden: true })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /^25 de setembro de 2026/, hidden: true }));
    setNarrow(false);
    expect(screen.getAllByRole("grid", { hidden: true })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: /^28 de setembro de 2026/, hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Aplicar período", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("endDay")).toBe("2026-09-28");
  });

  it("requires an applied pair before a form can submit", () => {
    const { container } = render(<form><DateRangePicker legend="Period" locale="en" required todayDay="2026-09-19" value={null} /></form>);
    const form = container.querySelector("form")!;
    act(() => { expect(form.checkValidity()).toBe(false); });
    expect(screen.getByRole("button", { name: /Open date range picker/ }).getAttribute("aria-expanded")).toBe("true");
  });

  it("disables an out-of-bounds caller period without changing or clamping its dates", () => {
    const oldPeriod: DateRangeQuickPeriod = {
      id: "old",
      label: { en: "Old period", pt: "Período antigo" },
      value: { startDay: "2026-09-01", endDay: "2026-09-05" },
    };
    const { container } = render(<form><DateRangePicker
      endName="endDay"
      legend="Period"
      locale="en"
      minDay="2026-09-10"
      quickPeriods={[oldPeriod]}
      startName="startDay"
      todayDay="2026-09-19"
      value={{ startDay: "2026-09-24", endDay: "2026-09-30" }}
    /></form>);
    fireEvent.click(screen.getByRole("button", { name: /Open date range picker/ }));
    expect((screen.getByRole("button", { name: "Old period", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText("Before the earliest available date")).toBeTruthy();
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-09-24");
  });

  it("shows caller periods in a desktop sidebar and commits only the applied choice", () => {
    const { container } = render(<ControlledPicker quickPeriods={exampleQuickPeriods} />);
    const opener = screen.getByRole("button", { name: /Open date range picker/ });
    fireEvent.click(opener);
    expect(screen.getByRole("group", { name: "Quick periods", hidden: true }).querySelectorAll("button")).toHaveLength(9);
    fireEvent.click(screen.getByRole("button", { name: "Last 6 months", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-09-24");
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: "Last 6 months", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Apply range", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-03-30");
    expect(new FormData(container.querySelector("form")!).get("endDay")).toBe(exampleReferenceDay);
    fireEvent.click(opener);
    expect(screen.getByRole("button", { name: "Last 6 months", hidden: true }).getAttribute("aria-pressed")).toBe("true");
  });

  it("uses one month in compact desktop and a separate presets view in the same mobile sheet", async () => {
    const { container, rerender } = render(<ControlledPicker quickPeriods={exampleQuickPeriods} />);
    const opener = screen.getByRole("button", { name: /Open date range picker/ });
    fireEvent.click(opener);
    expect(screen.getAllByRole("grid", { hidden: true })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    rerender(<DateRangePicker calendarLayout="compact" legend="Period" locale="en" todayDay="2026-09-29" value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} />);
    fireEvent.click(screen.getByRole("button", { name: /Open date range picker/ }));
    expect(screen.getAllByRole("grid", { hidden: true })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Cancel", hidden: true }));
    rerender(<ControlledPicker quickPeriods={exampleQuickPeriods} />);
    setNarrow(true);
    fireEvent.click(screen.getByRole("button", { name: /Open date range picker/ }));
    expect(screen.getAllByRole("grid", { hidden: true })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Previous month", hidden: true }).getAttribute("data-size")).toBe("lg");
    fireEvent.click(screen.getByRole("button", { name: "Presets: Custom", hidden: true }));
    expect(screen.queryByRole("grid", { hidden: true })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Last 30 days", hidden: true }));
    expect((screen.getByRole("textbox", { name: "Start date Day", hidden: true }) as HTMLInputElement).value).toBe("31");
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-09-24");
    fireEvent.click(screen.getByRole("button", { name: "Apply range", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-08-31");
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: /Open date range picker/ })));
  });

  it("navigates allowed leap years without a fixed year range and drafts a whole year separately", () => {
    const { container } = render(<ControlledPicker maxDay="2026-09-30" minDay="2024-02-29" />);
    const opener = screen.getByRole("button", { name: /Open date range picker/ });
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole("button", { name: "September 2026", hidden: true }));
    expect((screen.getByRole("button", { name: "2023", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "2024", hidden: true }));
    expect((screen.getByRole("button", { name: "January", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Use entire year 2024", hidden: true }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "February", hidden: true }));
    expect(screen.getByRole("grid", { name: "February 2024", hidden: true })).toBeTruthy();
    expect((screen.getByRole("button", { name: /^February 29, 2024/, hidden: true }) as HTMLButtonElement).getAttribute("aria-disabled")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "February 2024", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "2025", hidden: true }));
    fireEvent.click(screen.getByRole("button", { name: "Use entire year 2025", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2026-09-24");
    fireEvent.click(screen.getByRole("button", { name: "Apply range", hidden: true }));
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2025-01-01");
    expect(new FormData(container.querySelector("form")!).get("endDay")).toBe("2025-12-31");
  });
});

describe("DateRangePicker synthetic quick periods", () => {
  it("supplies eight bilingual caller-resolved periods with the accepted inclusive reference", () => {
    expect(exampleReferenceDay).toBe("2026-09-29");
    expect(exampleQuickPeriods.map(({ id, label, value }) => [id, label.en, label.pt, value.startDay, value.endDay])).toEqual([
      ["last-seven-days", "Last 7 days", "Últimos 7 dias", "2026-09-23", "2026-09-29"],
      ["last-thirty-days", "Last 30 days", "Últimos 30 dias", "2026-08-31", "2026-09-29"],
      ["last-six-months", "Last 6 months", "Últimos 6 meses", "2026-03-30", "2026-09-29"],
      ["last-twelve-months", "Last 12 months", "Últimos 12 meses", "2025-09-30", "2026-09-29"],
      ["current-week", "Current week", "Semana atual", "2026-09-27", "2026-09-29"],
      ["current-month", "Current month", "Mês atual", "2026-09-01", "2026-09-29"],
      ["previous-year", "Previous year", "Ano anterior", "2025-01-01", "2025-12-31"],
      ["this-month-last-year", "This month last year", "Este mês no ano passado", "2025-09-01", "2025-09-29"],
    ]);
    expect(new Set(exampleQuickPeriods.map((period) => period.id)).size).toBe(8);
    for (const period of exampleQuickPeriods) expect(period.value.startDay <= period.value.endDay).toBe(true);
  });
});
