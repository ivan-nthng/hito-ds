import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateField } from "./DateField";
import {
  dateDraftFromPastedText,
  getDateIssue,
  spokenCalendarDay,
} from "./date-value";

function ControlledDateField({ locale = "en" }: { locale?: "pt" | "en" }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <DateField
      label={locale === "pt" ? "Data de entrega" : "Delivery date"}
      locale={locale}
      name="deliveryDay"
      onValueChange={setValue}
      value={value}
    />
  );
}

describe("DateField calendar-day rules", () => {
  it("rejects impossible dates and accepts leap days without a timezone", () => {
    expect(getDateIssue({ day: "29", month: "02", year: "2024" }, "en")).toBeUndefined();
    expect(getDateIssue({ day: "29", month: "02", year: "2025" }, "en")).toEqual({ segment: "day", kind: "invalid" });
    expect(getDateIssue({ day: "31", month: "04", year: "2026" }, "pt")).toEqual({ segment: "day", kind: "invalid" });
    expect(getDateIssue({ day: "", month: "13", year: "" }, "en")).toEqual({ segment: "month", kind: "invalid" });
    expect(spokenCalendarDay({ day: "24", month: "09", year: "2026" }, "pt")).toBe("24 de setembro de 2026");
  });

  it("parses pasted local order explicitly and does not guess free-form dates", () => {
    expect(dateDraftFromPastedText("09/24/2026", "en")).toEqual({ month: "09", day: "24", year: "2026" });
    expect(dateDraftFromPastedText("24/09/2026", "pt")).toEqual({ day: "24", month: "09", year: "2026" });
    expect(dateDraftFromPastedText("2026-09-24", "pt")).toEqual({ year: "2026", month: "09", day: "24" });
    expect(dateDraftFromPastedText("September 24", "en")).toBeUndefined();
  });
});

describe("DateField", () => {
  it("connects one Field label and localized format hint to all segments", () => {
    const ref = createRef<HTMLInputElement>();
    render(<DateField label="Data de entrega" locale="pt" ref={ref} value="2026-09-24" />);

    const day = screen.getByRole("textbox", { name: "Data de entrega Dia" }) as HTMLInputElement;
    const month = screen.getByRole("textbox", { name: "Data de entrega Mês" }) as HTMLInputElement;
    const year = screen.getByRole("textbox", { name: "Data de entrega Ano" }) as HTMLInputElement;
    expect(ref.current).toBe(day);
    expect([day.value, month.value, year.value]).toEqual(["24", "09", "2026"]);
    expect(screen.getByText("Formato: DD/MM/AAAA")).toBeTruthy();
    expect(screen.getByText("24 de setembro de 2026")).toBeTruthy();
    expect(day.closest('[role="group"]')?.getAttribute("data-size")).toBe("md");
  });

  it("keeps incomplete and impossible drafts visible, then identifies the bad segment", () => {
    const onValueChange = vi.fn();
    render(<DateField label="Delivery date" locale="en" onValueChange={onValueChange} value={null} />);
    const month = screen.getByRole("textbox", { name: "Delivery date Month" }) as HTMLInputElement;
    const day = screen.getByRole("textbox", { name: "Delivery date Day" }) as HTMLInputElement;
    const year = screen.getByRole("textbox", { name: "Delivery date Year" }) as HTMLInputElement;

    fireEvent.change(month, { target: { value: "02" } });
    fireEvent.change(day, { target: { value: "29" } });
    fireEvent.change(year, { target: { value: "2025" } });
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.blur(year);
    expect(day.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Enter a valid day.")).toBeTruthy();
    expect([month.value, day.value, year.value]).toEqual(["02", "29", "2025"]);

    fireEvent.change(year, { target: { value: "2024" } });
    expect(onValueChange).toHaveBeenCalledWith("2024-02-29");
  });

  it("commits a complete pasted date, submits ISO, and blocks an invalid draft", () => {
    const { container } = render(<form><ControlledDateField locale="pt" /></form>);
    const day = screen.getByRole("textbox", { name: "Data de entrega Dia" }) as HTMLInputElement;
    fireEvent.paste(day, { clipboardData: { getData: () => "24/09/2026" } });
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-24");
    expect(new FormData(container.querySelector("form")!).get("deliveryDay")).toBe("2026-09-24");

    fireEvent.change(day, { target: { value: "31" } });
    const month = screen.getByRole("textbox", { name: "Data de entrega Mês" }) as HTMLInputElement;
    fireEvent.change(month, { target: { value: "02" } });
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
    expect((container.querySelector('input[name="deliveryDay"]') as HTMLInputElement).value).toBe("2026-09-24");
  });

  it("supports keyboard segment movement, read-only and disabled calendar action", () => {
    const onCalendarOpen = vi.fn();
    const { rerender } = render(
      <DateField label="Delivery date" locale="en" onCalendarOpen={onCalendarOpen} value={null} />,
    );
    const month = screen.getByRole("textbox", { name: "Delivery date Month" }) as HTMLInputElement;
    const day = screen.getByRole("textbox", { name: "Delivery date Day" }) as HTMLInputElement;
    month.focus();
    fireEvent.keyDown(month, { key: "/" });
    expect(document.activeElement).toBe(day);
    fireEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(onCalendarOpen).toHaveBeenCalledTimes(1);

    rerender(<DateField disabled label="Delivery date" locale="en" onCalendarOpen={onCalendarOpen} value={null} />);
    expect(month.disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Open calendar" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("replaces a focused draft when the controlled day changes externally", () => {
    const { container, rerender } = render(
      <form><DateField label="Delivery date" locale="en" name="day" value="2026-09-24" /></form>,
    );
    const month = screen.getByRole("textbox", { name: "Delivery date Month" }) as HTMLInputElement;
    const day = screen.getByRole("textbox", { name: "Delivery date Day" }) as HTMLInputElement;
    const year = screen.getByRole("textbox", { name: "Delivery date Year" }) as HTMLInputElement;
    year.focus();
    fireEvent.change(year, { target: { value: "202" } });
    expect(year.value).toBe("202");

    rerender(<form><DateField label="Delivery date" locale="en" name="day" value="2027-10-03" /></form>);
    fireEvent.blur(year);
    expect([month.value, day.value, year.value]).toEqual(["10", "03", "2027"]);
    expect((container.querySelector('input[name="day"]') as HTMLInputElement).value).toBe("2027-10-03");
    expect(screen.queryByText("Enter a valid year.")).toBeNull();
  });

  it("resets focused Portuguese segments and keeps the submitted ISO value aligned", () => {
    const { container, rerender } = render(
      <form><DateField label="Data" locale="pt" name="day" value="2026-09-24" /></form>,
    );
    const day = screen.getByRole("textbox", { name: "Data Dia" }) as HTMLInputElement;
    const month = screen.getByRole("textbox", { name: "Data Mês" }) as HTMLInputElement;
    const year = screen.getByRole("textbox", { name: "Data Ano" }) as HTMLInputElement;
    day.focus();
    fireEvent.change(day, { target: { value: "31" } });
    fireEvent.change(month, { target: { value: "02" } });

    rerender(<form><DateField label="Data" locale="pt" name="day" value={null} /></form>);
    fireEvent.blur(month);
    expect([day.value, month.value, year.value]).toEqual(["", "", ""]);
    expect((container.querySelector('input[name="day"]') as HTMLInputElement).value).toBe("");
    expect(screen.queryByText("Informe um dia válido.")).toBeNull();
  });

  it("keeps an incomplete edit after an ordinary controlled echo, then follows a post-blur replacement", () => {
    const onValueChange = vi.fn();
    const renderField = (value: string) => (
      <DateField label="Delivery date" locale="en" onValueChange={onValueChange} value={value} />
    );
    const { rerender } = render(renderField("2026-09-24"));
    const month = screen.getByRole("textbox", { name: "Delivery date Month" }) as HTMLInputElement;
    const year = screen.getByRole("textbox", { name: "Delivery date Year" }) as HTMLInputElement;
    month.focus();
    fireEvent.change(month, { target: { value: "10" } });
    expect(onValueChange).toHaveBeenLastCalledWith("2026-10-24");
    fireEvent.change(year, { target: { value: "202" } });
    rerender(renderField("2026-10-24"));
    expect(year.value).toBe("202");
    fireEvent.blur(year);
    expect(year.value).toBe("202");
    expect(screen.getByText("Enter the year.")).toBeTruthy();

    rerender(renderField("2028-11-05"));
    expect([month.value, year.value]).toEqual(["11", "2028"]);
  });

  it("reorders the same focused draft when the application language changes", () => {
    const { rerender } = render(
      <DateField label="Data" locale="pt" value="2026-09-24" />,
    );
    const day = screen.getByRole("textbox", { name: "Data Dia" }) as HTMLInputElement;
    day.focus();
    fireEvent.change(day, { target: { value: "2" } });
    rerender(<DateField label="Date" locale="en" value="2026-09-24" />);
    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    expect(inputs.map((input) => input.value)).toEqual(["09", "2", "2026"]);
    expect(screen.getByText("Format: MM/DD/YYYY")).toBeTruthy();
  });

  it("shows a localized required-segment error on form validation", () => {
    const { container } = render(
      <form><DateField label="Data" locale="pt" required value={null} /></form>,
    );
    act(() => {
      expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);
    });
    expect(screen.getByText("Informe o dia.")).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Data Dia" }).getAttribute("aria-invalid")).toBe("true");
  });
});
