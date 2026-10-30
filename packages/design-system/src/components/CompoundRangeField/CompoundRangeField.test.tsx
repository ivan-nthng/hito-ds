import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberField } from "../NumberField/NumberField";
import {
  CompoundRangeField,
  type CompoundRangeFieldProps,
  type CompoundRangeFieldValue,
} from "./CompoundRangeField";
const base = {
  label: "Interval",
  beginningLabel: "Beginning",
  endLabel: "End",
  min: 0,
  max: 1,
  step: 0.3,
} as const;
function numeric() {
  return screen.getAllByRole("spinbutton") as HTMLInputElement[];
}
function sliders() {
  return screen.getAllByRole("slider") as HTMLInputElement[];
}
function draft(input: HTMLElement, value: string) {
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
}
function key(input: HTMLElement, key: string) {
  fireEvent.keyDown(input, { key });
  fireEvent.keyUp(input, { key });
}
function Updating(props: CompoundRangeFieldProps) {
  const [value, setValue] = useState(props.value ?? props.defaultValue);
  return (
    <CompoundRangeField
      {...props}
      defaultValue={undefined}
      value={value}
      onValueChange={setValue}
    />
  );
}

describe("CompoundRangeField", () => {
  it("synchronizes an unfocused invalid peer draft when the slider changes the pair", () => {
    render(<Updating {...base} value={[0, 1]} />);
    draft(numeric()[1], "0.95");
    fireEvent.blur(numeric()[1]);
    expect(numeric()[1].getAttribute("aria-invalid")).toBe("true");
    key(sliders()[0], "ArrowRight");
    expect(numeric().map((n) => n.value)).toEqual(["0.3", "1"]);
    expect(numeric()[1].getAttribute("aria-invalid")).toBeNull();
  });
  it("commits both exact global endpoints without weakening interior legality", () => {
    const change = vi.fn();
    render(
      <CompoundRangeField
        {...base}
        defaultValue={[0.3, 0.9]}
        onValueChange={change}
      />,
    );
    draft(numeric()[0], "0");
    expect(sliders()[0].value).toBe("0.3");
    key(numeric()[0], "Enter");
    expect(sliders()[0].value).toBe("0");
    draft(numeric()[1], "1");
    key(numeric()[1], "Enter");
    expect(sliders()[1].value).toBe("1");
    expect(change).toHaveBeenLastCalledWith(
      [0, 1],
      expect.objectContaining({ activeHandle: "end", source: "number" }),
    );
    change.mockClear();
    draft(numeric()[1], "0.95");
    key(numeric()[1], "Enter");
    expect(numeric()[1].value).toBe("0.95");
    expect(numeric()[1].getAttribute("aria-invalid")).toBe("true");
    expect(sliders()[1].value).toBe("1");
    expect(change).not.toHaveBeenCalled();
  });
  it.each(["", "-", "0.", "words", "-1", "2", "0.95"])(
    "retains invalid/incomplete draft %j without moving a handle",
    (text) => {
      const change = vi.fn();
      render(
        <CompoundRangeField
          {...base}
          defaultValue={[0, 0.9]}
          onValueChange={change}
        />,
      );
      draft(numeric()[0], text);
      key(numeric()[0], "Enter");
      expect(numeric()[0].value).toBe(text);
      expect(sliders().map((i) => i.value)).toEqual(["0", "0.9"]);
      expect(change).not.toHaveBeenCalled();
    },
  );
  it("rejects crossing in both editors without sorting or pushing", () => {
    const change = vi.fn();
    render(
      <CompoundRangeField
        {...base}
        defaultValue={[0.3, 0.6]}
        onValueChange={change}
      />,
    );
    draft(numeric()[0], "0.9");
    key(numeric()[0], "Enter");
    draft(numeric()[1], "0");
    key(numeric()[1], "Enter");
    expect(sliders().map((i) => i.value)).toEqual(["0.3", "0.6"]);
    expect(change).not.toHaveBeenCalled();
  });
  it("steps to non-grid max and back through the shared step sequence", () => {
    render(<CompoundRangeField {...base} defaultValue={[0, 0.9]} />);
    const end = numeric()[1];
    key(end, "ArrowUp");
    expect(end.value).toBe("1");
    expect(sliders()[1].value).toBe("0.9");
    key(end, "Enter");
    expect(sliders()[1].value).toBe("1");
    key(end, "ArrowDown");
    expect(end.value).toBe("0.9");
    key(end, "Enter");
    expect(sliders()[1].value).toBe("0.9");
  });
  it("keeps standalone NumberField's endpoint rejection unchanged", () => {
    const commit = vi.fn();
    render(
      <NumberField
        aria-label="Standalone"
        min={0}
        max={1}
        step={0.3}
        value={0.9}
        onValueCommit={commit}
      />,
    );
    draft(numeric()[0], "1");
    key(numeric()[0], "Enter");
    expect(commit).not.toHaveBeenCalled();
    expect(numeric()[0].getAttribute("aria-invalid")).toBe("true");
  });
  it("updates both numeric controls from slider movement and cancellation", () => {
    render(<CompoundRangeField {...base} defaultValue={[0, 0.9]} />);
    key(sliders()[0], "ArrowRight");
    expect(numeric()[0].value).toBe("0.3");
    key(sliders()[1], "End");
    expect(numeric()[1].value).toBe("1");
    const row = sliders()[0].parentElement!;
    const travel = row.querySelector<HTMLElement>("[data-slider-travel]")!;
    vi.spyOn(travel, "getBoundingClientRect").mockReturnValue({
      x: 10,
      y: 0,
      left: 10,
      right: 110,
      top: 0,
      bottom: 44,
      width: 100,
      height: 44,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(row, { pointerId: 1, button: 0, clientX: 10 });
    fireEvent.pointerMove(row, { pointerId: 1, clientX: 70 });
    expect(numeric()[0].value).toBe("0.6");
    fireEvent.pointerCancel(row, { pointerId: 1 });
    expect(numeric()[0].value).toBe("0.3");
  });
  it("preserves an active draft/focus across controlled updates and accepts commit only", () => {
    const change = vi.fn();
    const { rerender } = render(
      <CompoundRangeField {...base} value={[0, 0.9]} onValueChange={change} />,
    );
    const start = numeric()[0];
    start.focus();
    draft(start, "0.3");
    expect(change).not.toHaveBeenCalled();
    rerender(
      <CompoundRangeField {...base} value={[0, 1]} onValueChange={change} />,
    );
    expect(numeric()[0]).toBe(start);
    expect(document.activeElement).toBe(start);
    expect(start.value).toBe("0.3");
    expect(numeric()[1].value).toBe("1");
    key(start, "Enter");
    expect(change).toHaveBeenCalledWith(
      [0.3, 1],
      expect.objectContaining({ previousValue: [0, 1] }),
    );
    expect(sliders()[0].value).toBe("0");
    key(start, "Escape");
    expect(start.value).toBe("0");
  });
  it("commits in a controlled updating parent without remounting", () => {
    render(<Updating {...base} value={[0, 1]} />);
    const start = numeric()[0];
    start.focus();
    draft(start, "0.3");
    key(start, "Enter");
    expect(sliders()[0].value).toBe("0.3");
    expect(numeric()[0]).toBe(start);
    expect(document.activeElement).toBe(start);
  });
  it("keeps one Field message and shares IDs consistently across four controls", () => {
    render(
      <CompoundRangeField
        {...base}
        defaultValue={[0, 1]}
        hint="Help"
        error="Validation"
        describedBy="outside"
      />,
    );
    expect(screen.getAllByRole("group")).toHaveLength(1);
    expect(screen.getByRole("group", { name: "Interval" })).toBeTruthy();
    expect(screen.getAllByText("Interval")).toHaveLength(1);
    expect(screen.getAllByText("Validation")).toHaveLength(1);
    const description = numeric()[0].getAttribute("aria-describedby");
    for (const input of [...numeric(), ...sliders()]) {
      expect(input.getAttribute("aria-describedby")).toBe(description);
      expect(input.getAttribute("aria-invalid")).toBe("true");
    }
    expect(screen.getByRole("spinbutton", { name: "Interval Beginning" })).toBe(
      numeric()[0],
    );
    expect(screen.getByRole("slider", { name: "Interval End" })).toBe(
      sliders()[1],
    );
  });
  it("presents caller-provided constraint copy once and clears it on correction", () => {
    render(
      <CompoundRangeField
        {...base}
        defaultValue={[0, 1]}
        formatIssue={(i) => `Issue: ${i.reason}`}
      />,
    );
    draft(numeric()[0], "0.95");
    key(numeric()[0], "Enter");
    expect(screen.getAllByText("Issue: stepMismatch")).toHaveLength(1);
    draft(numeric()[0], "0.3");
    key(numeric()[0], "Enter");
    expect(screen.queryByText("Issue: stepMismatch")).toBeNull();
  });
  it.each(["disabled", "readOnly"] as const)(
    "blocks compound changes when %s",
    (state) => {
      const change = vi.fn();
      render(
        <CompoundRangeField
          {...base}
          defaultValue={[0, 1]}
          {...{ [state]: true }}
          onValueChange={change}
        />,
      );
      for (const input of numeric()) {
        draft(input, "0.3");
        key(input, "Enter");
        fireEvent.blur(input);
      }
      for (const input of sliders()) key(input, "Home");
      expect(change).not.toHaveBeenCalled();
    },
  );
  it("supports localized decimal drafts and continuous precision without any-step substitution", () => {
    render(
      <CompoundRangeField
        {...base}
        step={undefined}
        mode="continuous"
        locale="pt-BR"
        defaultValue={[0, 1]}
      />,
    );
    draft(numeric()[0], "0,123456");
    key(numeric()[0], "Enter");
    expect(sliders()[0].value).toBe("0.123456");
    draft(numeric()[0], "0,1234567");
    key(numeric()[0], "Enter");
    expect(sliders()[0].value).toBe("0.123456");
    expect(numeric()[0].getAttribute("aria-invalid")).toBe("true");
  });
});

// Compile-time public ownership and movement boundaries.
const typed: CompoundRangeFieldProps = { ...base, value: [0, 1] };
void typed;
// @ts-expect-error a pair cannot be both controlled and uncontrolled
const both: CompoundRangeFieldProps = {
  ...base,
  value: [0, 1],
  defaultValue: [0, 1],
};
void both;
// @ts-expect-error continuous does not accept a discrete step
const mixed: CompoundRangeFieldProps = {
  ...base,
  mode: "continuous",
  value: [0, 1],
};
void mixed;
// @ts-expect-error pair endpoints are required numbers
const empty: CompoundRangeFieldValue = [null, 1];
void empty;
