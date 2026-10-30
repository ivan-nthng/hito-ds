import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
  type RangeSliderRef,
} from "./RangeSlider";
const base = {
  label: "Interval",
  beginningHandleLabel: "Beginning",
  endHandleLabel: "End",
  min: 0,
  max: 100,
  step: 5,
} as const;
function controls() {
  return screen.getAllByRole("slider") as HTMLInputElement[];
}
function press(input: HTMLElement, key: string) {
  fireEvent.keyDown(input, { key });
  fireEvent.keyUp(input, { key });
}
function Updating(props: RangeSliderProps) {
  const [value, setValue] = useState(props.value ?? props.defaultValue);
  return (
    <RangeSlider
      {...props}
      defaultValue={undefined}
      value={value}
      onValueChange={setValue}
    />
  );
}
function pointerRow() {
  const row = controls()[0].parentElement!;
  vi.spyOn(row, "getBoundingClientRect").mockReturnValue({
    left: 0,
    width: 120,
    right: 120,
    top: 0,
    bottom: 44,
    height: 44,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  vi.spyOn(
    row.querySelector<HTMLElement>("[data-slider-travel]")!,
    "getBoundingClientRect",
  ).mockReturnValue({
    left: 10,
    width: 100,
    right: 110,
    top: 0,
    bottom: 44,
    height: 44,
    x: 10,
    y: 0,
    toJSON: () => ({}),
  });
  return row;
}
describe("RangeSlider", () => {
  it("names stable ordered inputs, associates output, and exposes dynamic bounds", () => {
    render(
      <RangeSlider
        {...base}
        defaultValue={[20, 80]}
        aria-describedby="hint"
        aria-invalid
        formatValue={(n) => `${n} min`}
      />,
    );
    const [beginning, end] = controls();
    expect(screen.getByRole("slider", { name: "Interval Beginning" })).toBe(
      beginning,
    );
    expect(screen.getByRole("slider", { name: "Interval End" })).toBe(end);
    expect(screen.getByRole("group", { name: "Interval" })).toBeTruthy();
    expect(beginning.getAttribute("aria-valuemax")).toBe("80");
    expect(end.getAttribute("aria-valuemin")).toBe("20");
    for (const input of controls()) {
      expect(input.getAttribute("aria-describedby")).toBe("hint");
      expect(input.getAttribute("aria-invalid")).toBe("true");
    }
    expect(beginning.getAttribute("aria-valuetext")).toBe("20 min");
    expect(document.querySelector("output").getAttribute("for")).toBe(
      `${beginning.id} ${end.id}`,
    );
    expect(document.querySelector("output").getAttribute("role")).toBe(
      "presentation",
    );
  });
  it("clamps each handle without crossing or moving the other and honors Home/End", () => {
    render(<RangeSlider {...base} defaultValue={[20, 80]} />);
    const [b, e] = controls();
    press(b, "End");
    expect(b.value).toBe("80");
    expect(e.value).toBe("80");
    press(b, "ArrowRight");
    expect(b.value).toBe("80");
    press(b, "Home");
    expect(b.value).toBe("0");
    press(e, "Home");
    expect(e.value).toBe("0");
    press(e, "ArrowLeft");
    expect(e.value).toBe("0");
    press(e, "End");
    expect(e.value).toBe("100");
  });
  it("commits a repeated keyboard gesture once with the original pair and identity", () => {
    const change = vi.fn(),
      commit = vi.fn();
    render(
      <RangeSlider
        {...base}
        defaultValue={[20, 80]}
        onValueChange={change}
        onValueCommit={commit}
      />,
    );
    const b = controls()[0];
    fireEvent.keyDown(b, { key: "ArrowRight" });
    fireEvent.keyDown(b, { key: "ArrowRight", repeat: true });
    fireEvent.keyUp(b, { key: "a" });
    expect(commit).not.toHaveBeenCalled();
    fireEvent.keyUp(b, { key: "ArrowRight" });
    fireEvent.blur(b);
    expect(change).toHaveBeenLastCalledWith([30, 80], {
      previousValue: [25, 80],
      activeHandle: "beginning",
      reason: "keyboard",
    });
    expect(commit).toHaveBeenCalledExactlyOnceWith([30, 80], {
      previousValue: [20, 80],
      activeHandle: "beginning",
      reason: "keyboard",
    });
  });
  it("keeps controlled ownership and focus through rerenders", () => {
    const change = vi.fn();
    const { rerender } = render(
      <RangeSlider {...base} value={[20, 80]} onValueChange={change} />,
    );
    const [b, e] = controls();
    e.focus();
    press(e, "ArrowLeft");
    expect(e.value).toBe("80");
    expect(change).toHaveBeenCalledWith(
      [20, 75],
      expect.objectContaining({ activeHandle: "end" }),
    );
    rerender(<RangeSlider {...base} value={[20, 75]} onValueChange={change} />);
    expect(controls()[1]).toBe(e);
    expect(document.activeElement).toBe(e);
    expect(e.value).toBe("75");
    expect(controls()[0]).toBe(b);
  });
  it("updates controlled pair without losing either input", () => {
    render(<Updating {...base} value={[20, 80]} />);
    for (const input of controls()) {
      input.focus();
      press(input, "ArrowRight");
      expect(document.activeElement).toBe(input);
    }
    expect(controls().map((n) => n.value)).toEqual(["25", "85"]);
  });
  it.each(["readOnly", "disabled"] as const)(
    "blocks every mutation path while %s",
    (state) => {
      const change = vi.fn(),
        commit = vi.fn();
      render(
        <RangeSlider
          {...base}
          defaultValue={[20, 80]}
          {...{ [state]: true }}
          onValueChange={change}
          onValueCommit={commit}
        />,
      );
      for (const input of controls()) {
        press(input, "End");
        fireEvent.change(input, { target: { value: "90" } });
        expect(
          input.hasAttribute(
            state === "readOnly" ? "aria-readonly" : "disabled",
          ),
        ).toBe(true);
      }
      const row = pointerRow();
      fireEvent.pointerDown(row, { pointerId: 1, button: 0, clientX: 100 });
      fireEvent.pointerUp(row, { pointerId: 1 });
      expect(change).not.toHaveBeenCalled();
      expect(commit).not.toHaveBeenCalled();
      expect(controls().map((n) => n.value)).toEqual(["20", "80"]);
    },
  );
  it("preserves decimal non-grid global endpoints", () => {
    render(
      <RangeSlider
        {...base}
        min={0}
        max={1}
        step={0.3}
        defaultValue={[0.3, 1]}
      />,
    );
    const [b, e] = controls();
    press(e, "ArrowLeft");
    expect(e.value).toBe("0.9");
    press(b, "End");
    expect(b.value).toBe("0.9");
    press(e, "End");
    expect(e.value).toBe("1");
  });
  it("shares continuous precision and keyboard increments", () => {
    render(
      <RangeSlider
        {...base}
        step={undefined}
        mode="continuous"
        defaultValue={[20, 80]}
      />,
    );
    const [b, e] = controls();
    press(b, "ArrowRight");
    press(e, "PageDown");
    expect(b.value).toBe("21");
    expect(e.value).toBe("70");
    fireEvent.change(b, { target: { value: "21.1234567" } });
    expect(b.value).toBe("21.123457");
  });
  it("mirrors horizontal keyboard movement in RTL only", () => {
    render(
      <RangeSlider
        {...base}
        dir="rtl"
        style={{ direction: "rtl" }}
        defaultValue={[20, 80]}
      />,
    );
    const b = controls()[0];
    b.style.direction = "rtl";
    press(b, "ArrowRight");
    expect(b.value).toBe("15");
    press(b, "ArrowUp");
    expect(b.value).toBe("20");
  });
  it.each([
    [50, 50, 60, "end"],
    [50, 50, 40, "beginning"],
    [50, 50, 50, "end"],
    [100, 100, 100, "beginning"],
    [0, 0, 0, "end"],
    [20, 80, 50, "end"],
  ] as const)("arbitrates [%s,%s] at %s as %s", (a, b, position, handle) => {
    const commit = vi.fn();
    render(
      <RangeSlider {...base} defaultValue={[a, b]} onValueCommit={commit} />,
    );
    const row = pointerRow();
    fireEvent.pointerDown(row, {
      pointerId: 1,
      button: 0,
      clientX: position + 10,
    });
    fireEvent.pointerUp(row, { pointerId: 1 });
    expect(commit).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ activeHandle: handle }),
    );
  });
  it("retains most-recent handle at exact ties and captures one identity", () => {
    const commit = vi.fn();
    render(
      <RangeSlider {...base} defaultValue={[20, 80]} onValueCommit={commit} />,
    );
    const [b] = controls();
    fireEvent.focus(b);
    const capture = vi.fn();
    b.setPointerCapture = capture;
    const row = pointerRow();
    fireEvent.pointerDown(row, { pointerId: 7, button: 0, clientX: 60 });
    expect(capture).toHaveBeenCalledWith(7);
    fireEvent.pointerMove(row, { pointerId: 8, clientX: 110 });
    expect(b.value).toBe("50");
    fireEvent.pointerMove(row, { pointerId: 7, clientX: 110 });
    expect(b.value).toBe("80");
    fireEvent.pointerUp(row, { pointerId: 7 });
    expect(commit).toHaveBeenCalledExactlyOnceWith([80, 80], {
      previousValue: [20, 80],
      activeHandle: "beginning",
      reason: "pointer",
    });
  });
  it("rolls back the full pair and reports cancellation once without commit", () => {
    const change = vi.fn(),
      commit = vi.fn();
    render(
      <RangeSlider
        {...base}
        defaultValue={[20, 80]}
        onValueChange={change}
        onValueCommit={commit}
      />,
    );
    const row = pointerRow();
    fireEvent.pointerDown(row, { pointerId: 2, button: 0, clientX: 35 });
    fireEvent.pointerMove(row, { pointerId: 2, clientX: 70 });
    fireEvent.pointerCancel(row, { pointerId: 2 });
    fireEvent.lostPointerCapture(row, { pointerId: 2 });
    fireEvent.pointerUp(row, { pointerId: 2 });
    expect(controls().map((n) => n.value)).toEqual(["20", "80"]);
    expect(
      change.mock.calls.filter(([, d]) => d.reason === "pointerCancel"),
    ).toHaveLength(1);
    expect(commit).not.toHaveBeenCalled();
  });
  it("exposes a typed two-handle focus API", () => {
    const ref = createRef<RangeSliderRef>();
    render(<RangeSlider {...base} defaultValue={[20, 80]} ref={ref} />);
    ref.current?.focus();
    expect(document.activeElement).toBe(controls()[0]);
    ref.current?.focus("end");
    expect(document.activeElement).toBe(controls()[1]);
  });
  it.each([
    [80, 20],
    [0, Number.NaN],
    [-5, 80],
    [20, 81],
  ] as RangeSliderValue[])("rejects invalid pair %j", (pair) => {
    expect(() => render(<RangeSlider {...base} value={pair} />)).toThrow();
  });
});
