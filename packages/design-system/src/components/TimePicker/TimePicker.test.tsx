import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { TimePicker } from "./TimePicker";

beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
afterEach(() => vi.unstubAllGlobals());

it("associates the visible control with its label/hint and submits only the caller's local HH:mm through an external form", () => {
  const view = render(<><form id="schedule" /><TimePicker locale="en" label="Start time" value="23:59" name="start" form="schedule" hint="Restaurant local time" /></>);
  const trigger = screen.getByRole("combobox", { name: "Start time" });
  expect(trigger.textContent).toBe("23:59");
  expect(trigger.getAttribute("aria-describedby")).toBe(screen.getByText("Restaurant local time").id);
  expect(new FormData(view.container.querySelector("form")!).get("start")).toBe("23:59");
  view.rerender(<><form id="schedule" /><TimePicker locale="en" label="Start time" value="02:03" name="start" form="schedule" /></>);
  expect(trigger.textContent).toBe("02:03");
  expect(new FormData(view.container.querySelector("form")!).get("start")).toBe("02:03");
});

it("keeps an empty required time empty and returns native invalid-form focus to the visible trigger", () => {
  const view = render(<form><TimePicker locale="pt" label="Horário inicial" value={null} name="start" required /></form>);
  const trigger = screen.getByRole("combobox", { name: "Horário inicial" });
  expect(trigger.textContent).toBe("--:--");
  expect(trigger.getAttribute("aria-required")).toBe("true");
  expect(view.container.querySelector("form")!.checkValidity()).toBe(false);
  expect(document.activeElement).toBe(trigger);
  expect(new FormData(view.container.querySelector("form")!).get("start")).toBe("");
});

it("reports caller-owned invalid state without deriving an interval or changing its value", () => {
  const view = render(<form><TimePicker locale="en" label="End time" value="11:00" name="end" error="End time must be later than start time." /></form>);
  const trigger = screen.getByRole("combobox", { name: "End time" });
  expect(trigger.getAttribute("aria-invalid")).toBe("true");
  expect(trigger.getAttribute("aria-errormessage")).toBe(screen.getByText("End time must be later than start time.").id);
  expect(view.container.querySelector("form")!.checkValidity()).toBe(false);
  expect(new FormData(view.container.querySelector("form")!).get("end")).toBe("11:00");
  view.rerender(<form><TimePicker locale="en" label="End time" value="11:00" name="end" /></form>);
  expect(view.container.querySelector("form")!.checkValidity()).toBe(true);
});

it("does not open or emit changes for disabled/read-only values, and omits disabled fields from submission", () => {
  const changed = vi.fn(), view = render(<form><TimePicker locale="en" label="Locked time" value="12:00" disabled name="locked" onValueChange={changed} />
    <TimePicker locale="en" label="Read-only time" value="12:00" readOnly name="readOnly" onValueChange={changed} /></form>);
  for (const name of ["Locked time", "Read-only time"]) {
    const trigger = screen.getByRole("combobox", { name });
    fireEvent.click(trigger); fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-disabled")).toBe("true");
  }
  expect(changed).not.toHaveBeenCalled();
  const data = new FormData(view.container.querySelector("form")!);
  expect(data.has("locked")).toBe(false); expect(data.get("readOnly")).toBe("12:00");
});

it.each(["24:00", "09:60", "9:00", "2026-10-28T12:00:00Z"])("rejects noncanonical caller values: %s", value => {
  expect(() => render(<TimePicker locale="en" label="Time" value={value} />)).toThrow("HH:mm");
});
