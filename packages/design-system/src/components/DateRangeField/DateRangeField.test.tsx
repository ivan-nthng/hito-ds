import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DateRangeField, type DateRangeFieldProps, type DateRangeValue } from "./DateRangeField";

function ControlledRange({ value: initialValue, onValueChange, ...props }: DateRangeFieldProps) {
  const [value, setValue] = useState(initialValue);
  return <form><DateRangeField
    {...props}
    endName="endDay"
    onValueChange={(next) => { setValue(next); onValueChange?.(next); }}
    startName="startDay"
    value={value}
  /></form>;
}

const pair: DateRangeValue = { startDay: "2026-09-24", endDay: "2026-09-30" };

describe("DateRangeField", () => {
  it("groups separately labelled endpoints and submits an inclusive ordered pair", () => {
    const { container } = render(<ControlledRange legend="Delivery period" locale="en" value={pair} />);
    expect(screen.getByRole("group", { name: "Delivery period" })).toBeTruthy();
    expect((screen.getByRole("textbox", { name: "Start date Month" }) as HTMLInputElement).value).toBe("09");
    expect((screen.getByRole("textbox", { name: "End date Day" }) as HTMLInputElement).value).toBe("30");
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("startDay")).toBe("2026-09-24");
    expect(new FormData(form).get("endDay")).toBe("2026-09-30");
    expect(form.checkValidity()).toBe(true);

    fireEvent.change(screen.getByRole("textbox", { name: "End date Day" }), { target: { value: "24" } });
    expect(new FormData(form).get("endDay")).toBe("2026-09-24");
    expect(form.checkValidity()).toBe(true);
  });

  it("keeps a reversed draft visible but blocks submission of the prior pair until corrected", () => {
    const onValueChange = vi.fn();
    const { container } = render(<ControlledRange legend="Delivery period" locale="en" onValueChange={onValueChange} value={pair} />);
    const form = container.querySelector("form")!;
    const endDay = screen.getByRole("textbox", { name: "End date Day" }) as HTMLInputElement;
    fireEvent.change(endDay, { target: { value: "20" } });
    expect(endDay.value).toBe("20");
    expect(screen.getByText("End date must be on or after start date.")).toBeTruthy();
    expect(endDay.getAttribute("aria-invalid")).toBe("true");
    expect(onValueChange).not.toHaveBeenCalled();
    expect(new FormData(form).get("endDay")).toBe("2026-09-30");
    expect(form.checkValidity()).toBe(false);

    fireEvent.change(endDay, { target: { value: "25" } });
    expect(onValueChange).toHaveBeenCalledWith({ startDay: "2026-09-24", endDay: "2026-09-25" });
    expect(new FormData(form).get("endDay")).toBe("2026-09-25");
    expect(form.checkValidity()).toBe(true);
  });

  it("preserves incomplete text and follows an external controlled replacement", async () => {
    const { container, rerender } = render(<form><DateRangeField legend="Delivery period" locale="en" startName="startDay" endName="endDay" value={pair} /></form>);
    const startYear = screen.getByRole("textbox", { name: "Start date Year" }) as HTMLInputElement;
    startYear.focus();
    fireEvent.change(startYear, { target: { value: "202" } });
    expect(startYear.value).toBe("202");
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(false);

    rerender(<form><DateRangeField legend="Delivery period" locale="en" startName="startDay" endName="endDay" value={{ startDay: "2027-01-02", endDay: "2027-01-04" }} /></form>);
    await waitFor(() => expect(startYear.value).toBe("2027"));
    expect(new FormData(container.querySelector("form")!).get("startDay")).toBe("2027-01-02");
    expect((container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(true);
  });

  it("requires both endpoints for a partial optional range and accepts the same day in Portuguese", () => {
    const { container } = render(<ControlledRange legend="Período de entrega" locale="pt" value={null} />);
    const form = container.querySelector("form")!;
    expect(form.checkValidity()).toBe(true);
    fireEvent.paste(screen.getByRole("textbox", { name: "Data de início Dia" }), { clipboardData: { getData: () => "24/09/2026" } });
    expect(form.checkValidity()).toBe(false);
    fireEvent.paste(screen.getByRole("textbox", { name: "Data de término Dia" }), { clipboardData: { getData: () => "24/09/2026" } });
    expect(form.checkValidity()).toBe(true);
    expect(new FormData(form).get("startDay")).toBe("2026-09-24");
    expect(new FormData(form).get("endDay")).toBe("2026-09-24");
  });

  it("localizes ordering errors and respects disabled and read-only states", () => {
    const { rerender } = render(<DateRangeField legend="Período" locale="pt" value={{ startDay: "2026-09-30", endDay: "2026-09-24" }} />);
    expect(screen.getByText("A data de término deve ser igual ou posterior à data de início.")).toBeTruthy();
    rerender(<DateRangeField disabled legend="Período" locale="pt" value={pair} />);
    expect((screen.getByRole("textbox", { name: "Data de início Dia" }) as HTMLInputElement).disabled).toBe(true);
    rerender(<DateRangeField legend="Período" locale="pt" readOnly value={pair} />);
    expect((screen.getByRole("textbox", { name: "Data de início Dia" }) as HTMLInputElement).readOnly).toBe(true);
  });
});
