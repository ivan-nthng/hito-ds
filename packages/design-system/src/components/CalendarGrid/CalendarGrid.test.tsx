import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  calendarWeekday,
  parseCalendarDay,
  shiftCalendarDay,
  shiftCalendarDayByMonth,
} from "../date/calendar-day";
import { CalendarGrid, type CalendarGridProps } from "./CalendarGrid";

function ControlledGrid(props: Omit<CalendarGridProps, "month" | "onMonthChange"> & { initialMonth?: string }) {
  const { initialMonth = "2026-09", ...rest } = props;
  const [month, setMonth] = useState(initialMonth);
  return <CalendarGrid {...rest} month={month} onMonthChange={setMonth} />;
}

describe("calendar-day core", () => {
  it("handles leap years and calendar boundaries without timestamps", () => {
    expect(parseCalendarDay("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
    expect(parseCalendarDay("1900-02-29")).toBeNull();
    expect(parseCalendarDay("2000-02-29")).not.toBeNull();
    expect(calendarWeekday({ year: 2026, month: 9, day: 1 })).toBe(2);
    expect(shiftCalendarDay("2026-12-31", 1)).toBe("2027-01-01");
    expect(shiftCalendarDay("2026-01-01", -1)).toBe("2025-12-31");
    expect(shiftCalendarDayByMonth("2024-03-31", -1)).toBe("2024-02-29");
    expect(shiftCalendarDayByMonth("2024-02-29", -12)).toBe("2023-02-28");
  });
});

describe("internal CalendarGrid", () => {
  it("renders six Sunday-first weeks, localized headings and one tabbable date", () => {
    render(<ControlledGrid locale="pt" onDaySelect={vi.fn()} selection={{ kind: "day", day: "2026-09-24" }} todayDay="2026-09-19" />);
    const grid = screen.getByRole("grid", { name: "setembro de 2026" });
    expect(within(grid).getAllByRole("row")).toHaveLength(7);
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(42);
    expect(within(grid).getAllByRole("button")).toHaveLength(30);
    expect(within(grid).getAllByRole("columnheader")[0].textContent).toBe("dom");
    expect(screen.getByRole("button", { name: /24 de setembro de 2026, Selecionado/ }).getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("button", { name: /19 de setembro de 2026, Hoje/ }).getAttribute("aria-current")).toBe("date");
    expect(within(grid).getAllByRole("button").filter((button) => button.tabIndex === 0)).toHaveLength(1);
  });

  it("moves roving focus by day and week across months without selecting", () => {
    const onDaySelect = vi.fn();
    render(<ControlledGrid locale="en" onDaySelect={onDaySelect} selection={{ kind: "day", day: "2026-09-30" }} />);
    const last = screen.getByRole("button", { name: /September 30, 2026, Selected/ });
    last.focus();
    fireEvent.keyDown(last, { key: "ArrowRight" });
    const first = screen.getByRole("button", { name: "October 1, 2026" });
    expect(document.activeElement).toBe(first);
    expect(first.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("grid", { name: "October 2026" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "October 2026" }).getAttribute("aria-live")).toBe("polite");
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "October 8, 2026" }));
    expect(onDaySelect).not.toHaveBeenCalled();
  });

  it("supports Home, End, PageUp and shifted year navigation", () => {
    render(<ControlledGrid initialMonth="2024-03" locale="en" onDaySelect={vi.fn()} selection={{ kind: "day", day: "2024-03-31" }} />);
    const last = screen.getByRole("button", { name: /March 31, 2024, Selected/ });
    last.focus();
    fireEvent.keyDown(last, { key: "PageUp" });
    const leap = screen.getByRole("button", { name: "February 29, 2024" });
    expect(document.activeElement).toBe(leap);
    fireEvent.keyDown(leap, { key: "PageUp", shiftKey: true });
    const previousYear = screen.getByRole("button", { name: "February 28, 2023" });
    expect(document.activeElement).toBe(previousYear);
    fireEvent.keyDown(previousYear, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "February 26, 2023" }));
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "March 4, 2023" }));
  });

  it("keeps caller-unavailable and out-of-bounds days visible but unselectable with a reason", () => {
    const onDaySelect = vi.fn();
    render(
      <ControlledGrid
        locale="en"
        maxDay="2026-09-25"
        minDay="2026-09-18"
        onDaySelect={onDaySelect}
        unavailableDays={{ "2026-09-19": { reason: "Kitchen closed" } }}
      />,
    );
    const unavailable = screen.getByRole("button", { name: /September 19, 2026, Unavailable: Kitchen closed/ });
    expect(unavailable.getAttribute("aria-disabled")).toBe("true");
    fireEvent.focus(unavailable);
    expect(screen.getByText("September 19, 2026: Kitchen closed")).toBeTruthy();
    fireEvent.click(unavailable);
    expect(onDaySelect).not.toHaveBeenCalled();
    const before = screen.getByRole("button", { name: "September 18, 2026" });
    before.focus();
    fireEvent.keyDown(before, { key: "ArrowRight" });
    expect(document.activeElement).toBe(unavailable);
    expect(screen.getByText("September 19, 2026: Kitchen closed")).toBeTruthy();
    expect(screen.getByRole("button", { name: /September 17, 2026, Unavailable: Before the earliest available date/ }).getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByRole("button", { name: /September 26, 2026, Unavailable: After the latest available date/ }).getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "September 24, 2026" }));
    expect(onDaySelect).toHaveBeenCalledOnce();
    expect(onDaySelect).toHaveBeenCalledWith("2026-09-24");
    expect((screen.getByRole("button", { name: "Next month" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("distinguishes range endpoints, interior days, today and focus beyond color", () => {
    render(
      <ControlledGrid
        locale="pt"
        onDaySelect={vi.fn()}
        selection={{ kind: "range", startDay: "2026-09-24", endDay: "2026-09-27" }}
        todayDay="2026-09-25"
      />,
    );
    expect(screen.getByRole("button", { name: /24 de setembro de 2026, Início do intervalo/ }).closest("td")?.getAttribute("data-selection")).toBe("start");
    expect(screen.getByRole("button", { name: /25 de setembro de 2026, Hoje, No intervalo/ }).closest("td")?.getAttribute("data-selection")).toBe("inside");
    expect(screen.getByRole("button", { name: /27 de setembro de 2026, Fim do intervalo/ }).closest("td")?.getAttribute("data-selection")).toBe("end");
    expect(screen.getByRole("button", { name: /25 de setembro de 2026, Hoje/ }).getAttribute("aria-current")).toBe("date");
  });

  it("lets month actions change the controlled visible month", () => {
    render(<ControlledGrid locale="en" onDaySelect={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByRole("grid", { name: "August 2026" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: "August 2026" }).getAttribute("aria-live")).toBe("polite");
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("grid", { name: "September 2026" })).toBeTruthy();
  });

  it("announces controlled month changes once through the localized heading", () => {
    const onMonthChange = vi.fn();
    const { rerender } = render(
      <CalendarGrid locale="en" month="2026-09" onDaySelect={vi.fn()} onMonthChange={onMonthChange} />,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "September 2026" });
    expect(heading.getAttribute("aria-live")).toBe("polite");
    expect(heading.getAttribute("aria-atomic")).toBe("true");

    rerender(<CalendarGrid locale="pt" month="2026-10" onDaySelect={vi.fn()} onMonthChange={onMonthChange} />);
    const nextHeading = screen.getByRole("heading", { level: 2, name: "outubro de 2026" });
    expect(nextHeading).toBe(heading);
    expect(screen.getAllByText("outubro de 2026")).toHaveLength(1);
  });
});
