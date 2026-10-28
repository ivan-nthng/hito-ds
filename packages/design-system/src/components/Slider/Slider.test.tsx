import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../Field/Field";
import { Slider, type SliderProps } from "./Slider";
import {
  assertSliderRange,
  continuousSliderRange,
  continuousSliderKeySteps,
  sliderValuePercent,
  isLegalSliderValue,
  quantizeSliderValue,
  stepSliderValue,
} from "./slider-value";

function UpdatingSlider({
  value: initialValue,
  defaultValue,
  ...props
}: SliderProps) {
  const [value, setValue] = useState(initialValue ?? defaultValue);
  return <Slider {...props} value={value} onValueChange={setValue} />;
}

describe("slider value helpers", () => {
  it("rejects invalid ranges instead of inventing a value", () => {
    expect(() => assertSliderRange({ max: 0, min: 0, step: 1 })).toThrow(
      "finite min < max",
    );
    expect(() =>
      assertSliderRange({ max: 10, min: 0, step: Number.NaN }),
    ).toThrow("finite positive step");
  });

  it("keeps both endpoints legal on a non-aligned decimal range", () => {
    const range = { max: 1, min: 0, step: 0.3 };
    expect(isLegalSliderValue(0.9, range)).toBe(true);
    expect(isLegalSliderValue(1, range)).toBe(true);
    expect(isLegalSliderValue(0.95, range)).toBe(false);
    expect(stepSliderValue(0.9, 1, range)).toBe(1);
    expect(stepSliderValue(1, -1, range)).toBe(0.9);
  });

  it.each([
    [3, 2, 10, 4],
    [-4, 2, 10, 0],
    [14, 2, 10, 10],
    [0.15, 0.1, 1, 0.2],
    [0.35, 0.1, 1, 0.4],
    [0.145, 0.01, 1, 0.15],
    [1.005, 0.01, 2, 1.01],
    [0.1449, 0.01, 1, 0.14],
    [0.1451, 0.01, 1, 0.15],
  ])(
    "quantizes %s with step %s and max %s to %s",
    (value, step, max, expected) => {
      expect(quantizeSliderValue(value, { min: 0, max, step })).toBe(expected);
    },
  );

  it("steps negative and fractional values without floating-point drift", () => {
    const range = { max: 0.3, min: -0.3, step: 0.1 };
    expect(stepSliderValue(-0.1, 1, range)).toBe(0);
    expect(stepSliderValue(0, 1, range)).toBe(0.1);
    expect(stepSliderValue(0.3, 1, range)).toBe(0.3);
  });

  it("steps negative non-aligned endpoints or rejects unsupported precision", () => {
    const range = { max: 0.4, min: -0.25, step: 0.2 };
    expect(stepSliderValue(-0.25, 1, range)).toBe(-0.05);
    expect(stepSliderValue(0.35, 1, range)).toBe(0.4);
    expect(stepSliderValue(0.4, -1, range)).toBe(0.35);
    expect(
      stepSliderValue(0, 1, {
        max: 0.00000000001,
        min: 0,
        step: 0.000000000001,
      }),
    ).toBe(0.000000000001);
    expect(() =>
      assertSliderRange({ max: 0.000000000001, min: 0, step: 0.0000000000001 }),
    ).toThrow("at most 12 decimal places");
  });
});

describe("Slider", () => {
  it("renders one native range control with persistent values and a forwarded ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Slider
        label="Preparation time"
        formatValue={(value) => `${value} min`}
        max={90}
        min={10}
        ref={ref}
        step={5}
        value={30}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Preparation time" });
    expect(ref.current).toBe(slider);
    expect(slider.getAttribute("type")).toBe("range");
    expect(slider.getAttribute("aria-valuemin")).toBe("10");
    expect(slider.getAttribute("aria-valuemax")).toBe("90");
    expect(slider.getAttribute("aria-valuenow")).toBe("30");
    expect(slider.getAttribute("aria-valuetext")).toBe("30 min");
    expect(screen.getByText("10 min")).toBeTruthy();
    expect(screen.getByText("30 min")).toBeTruthy();
    expect(screen.getByText("90 min")).toBeTruthy();
  });

  it("supports controlled keyboard changes, endpoints and ten-step paging", () => {
    render(
      <UpdatingSlider
        aria-label="Temperature"
        min={0}
        max={100}
        step={2}
        value={20}
      />,
    );
    const slider = screen.getByRole("slider", { name: "Temperature" });
    slider.focus();
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect((slider as HTMLInputElement).value).toBe("22");
    fireEvent.keyDown(slider, { key: "PageUp" });
    expect((slider as HTMLInputElement).value).toBe("42");
    fireEvent.keyDown(slider, { key: "End" });
    expect((slider as HTMLInputElement).value).toBe("100");
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    expect((slider as HTMLInputElement).value).toBe("100");
    fireEvent.keyDown(slider, { key: "Home" });
    expect((slider as HTMLInputElement).value).toBe("0");
    expect(document.activeElement).toBe(slider);
  });

  it("does not advance controlled truth when the parent rejects a proposal", () => {
    const onValueChange = vi.fn();
    const onValueCommit = vi.fn();
    render(
      <Slider
        aria-label="Rejected temperature"
        max={100}
        min={0}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        step={2}
        value={20}
      />,
    );

    const slider = screen.getByRole("slider", {
      name: "Rejected temperature",
    });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyUp(slider, { key: "ArrowRight" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    fireEvent.keyUp(slider, { key: "ArrowRight" });

    expect(onValueChange.mock.calls.map(([next]) => next)).toEqual([22, 22]);
    expect(
      onValueChange.mock.calls.map(([, details]) => details.previousValue),
    ).toEqual([20, 20]);
    expect(onValueCommit.mock.calls.map(([committed]) => committed)).toEqual([
      20, 20,
    ]);
    expect((slider as HTMLInputElement).value).toBe("20");
  });

  it("maps horizontal arrow direction consistently in RTL", () => {
    render(
      <div dir="rtl">
        <UpdatingSlider
          aria-label="Priority"
          min={0}
          max={10}
          step={1}
          value={5}
        />
      </div>,
    );
    const slider = screen.getByRole("slider", { name: "Priority" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect((slider as HTMLInputElement).value).toBe("4");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect((slider as HTMLInputElement).value).toBe("5");
  });

  it("uses native input changes as the only pointer writer and can cancel", () => {
    const changes: Array<[number, string]> = [];
    render(
      <Slider
        aria-label="Volume"
        defaultValue={0}
        max={100}
        min={0}
        onValueChange={(value, details) =>
          changes.push([value, details.reason])
        }
        step={10}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Volume" });
    fireEvent.pointerDown(slider, { button: 0, pointerId: 7 });
    expect((slider as HTMLInputElement).value).toBe("0");
    fireEvent.change(slider, { target: { value: "80" } });
    expect((slider as HTMLInputElement).value).toBe("80");
    fireEvent.pointerCancel(slider, { pointerId: 7 });
    expect((slider as HTMLInputElement).value).toBe("0");
    expect(changes).toEqual([
      [80, "pointer"],
      [0, "pointerCancel"],
    ]);
  });

  it.each(["discrete", "continuous"] as const)(
    "keeps %s read-only focusable and blocks mutation",
    (mode) => {
      const onValueChange = vi.fn();
      render(
        <Slider
          {...(mode === "continuous" ? { mode } : { step: 1 })}
          aria-label="Locked value"
          max={10}
          min={0}
          onValueChange={onValueChange}
          readOnly
          value={4}
        />,
      );

      const slider = screen.getByRole("slider", { name: "Locked value" });
      expect(slider.getAttribute("aria-readonly")).toBe("true");
      expect(slider.getAttribute("tabindex")).not.toBe("-1");
      slider.focus();
      fireEvent.keyDown(slider, { key: "ArrowUp" });
      fireEvent.change(slider, { target: { value: "8" } });
      fireEvent.pointerDown(slider, { button: 0, clientX: 100, pointerId: 2 });
      expect((slider as HTMLInputElement).value).toBe("4");
      expect(onValueChange).not.toHaveBeenCalled();
    },
  );

  it("makes disabled state inert and removes it from the tab sequence", () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        aria-label="Unavailable value"
        disabled
        max={10}
        min={0}
        onValueChange={onValueChange}
        step={1}
        value={4}
      />,
    );

    const slider = screen.getByRole("slider", { name: "Unavailable value" });
    expect((slider as HTMLInputElement).disabled).toBe(true);
    expect(slider.getAttribute("tabindex")).toBeNull();
    fireEvent.keyDown(slider, { key: "ArrowUp" });
    fireEvent.change(slider, { target: { value: "8" } });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("renders passive markers and a readable baseline without extra tab stops", () => {
    const { container } = render(
      <Slider
        aria-label="Target"
        baseline={{ label: "Usual value", value: 60 }}
        markers={[{ value: 25 }, { label: "Half", value: 50 }]}
        max={100}
        min={0}
        step={5}
        value={70}
      />,
    );

    expect(screen.getByText("Usual value")).toBeTruthy();
    expect(screen.getByText("Half")).toBeTruthy();
    expect(container.querySelectorAll("[data-baseline='true']")).toHaveLength(
      2,
    );
    expect(container.querySelectorAll("[tabindex]")).toHaveLength(0);
    expect(screen.getAllByRole("slider")).toHaveLength(1);
  });

  it("composes through Field relationships without duplicating Field", () => {
    render(
      <Field error="Choose a supported value." label="Delivery window">
        {({ controlProps }) => (
          <Slider {...controlProps} max={60} min={0} step={5} value={25} />
        )}
      </Field>,
    );

    const slider = screen.getByRole("slider", { name: "Delivery window" });
    const error = screen.getByText("Choose a supported value.");
    expect(slider.getAttribute("aria-describedby")).toContain(error.id);
    expect(slider.getAttribute("aria-errormessage")).toBe(error.id);
    expect(slider.getAttribute("aria-invalid")).toBe("true");
  });
});

describe("Slider movement modes", () => {
  it("rounds continuous input to six places, retains endpoints and bounds precision", () => {
    const range = continuousSliderRange(-1, 1);
    expect(quantizeSliderValue(0.1234567, range)).toBe(0.123457);
    expect(quantizeSliderValue(-0.1234567, range)).toBe(-0.123457);
    expect(quantizeSliderValue(-2, range)).toBe(-1);
    expect(quantizeSliderValue(2, range)).toBe(1);
    expect(continuousSliderKeySteps(range)).toBe(20000);
    expect(() => continuousSliderRange(0, 0.0000001)).toThrow(
      "6 decimal places",
    );
    expect(continuousSliderKeySteps(continuousSliderRange(0, 0.000001))).toBe(
      1,
    );
  });

  it("preserves proportional marker positions and uniform numeric intervals", () => {
    const range = { min: -10, max: 30, step: 1 };
    expect(
      [-10, 0, 10, 20, 30].map((value) => sliderValuePercent(value, range)),
    ).toEqual([0, 25, 50, 75, 100]);
    expect(sliderValuePercent(4.8, range)).toBeCloseTo(37);
  });

  it("keeps native continuous pointer updates immediate and keyboard steps meaningful", () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        label="Continuous"
        mode="continuous"
        min={0}
        max={100}
        defaultValue={0}
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("slider", {
      name: "Continuous",
    }) as HTMLInputElement;
    expect(input.step).toBe("any");
    fireEvent.change(input, { target: { value: "42.1234567" } });
    expect(input.value).toBe("42.123457");
    expect(onValueChange).toHaveBeenLastCalledWith(42.123457, {
      previousValue: 0,
      reason: "pointer",
    });
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(input.value).toBe("43.123457");
    fireEvent.keyDown(input, { key: "PageUp" });
    expect(input.value).toBe("53.123457");
    fireEvent.keyDown(input, { key: "End" });
    expect(input.value).toBe("100");
    fireEvent.keyDown(input, { key: "Home" });
    expect(input.value).toBe("0");
  });
});
