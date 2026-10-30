import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../Field/Field";
import { NumberField } from "./NumberField";
import {
  formatNumberValue,
  getNumberConstraintIssue,
  parseNumberDraft,
  stepNumberValue,
} from "./number-value";

describe("numeric value helpers", () => {
  it("keeps empty, intermediate and canonical values distinct", () => {
    expect(parseNumberDraft("")).toEqual({ kind: "empty", value: null });
    expect(parseNumberDraft("-")).toEqual({ kind: "intermediate" });
    expect(parseNumberDraft("1.")).toEqual({ kind: "intermediate" });
    expect(parseNumberDraft("1.5")).toEqual({ kind: "valid", value: 1.5 });
    expect(parseNumberDraft("1e3")).toEqual({ kind: "invalid" });
  });

  it("parses and formats a locale decimal without grouping", () => {
    expect(parseNumberDraft("12,5", { locale: "pt-BR" })).toEqual({
      kind: "valid",
      value: 12.5,
    });
    expect(formatNumberValue(1234.5, { locale: "pt-BR" })).toBe("1234,5");
    expect(formatNumberValue(1.5, { mode: "integer" })).toBe("1.5");
  });

  it("validates integer, range and step rules without clamping drafts", () => {
    expect(getNumberConstraintIssue("1.5", { mode: "integer" })).toBe(
      "invalid",
    );
    expect(getNumberConstraintIssue("-1", { min: 0 })).toBe(
      "rangeUnderflow",
    );
    expect(getNumberConstraintIssue("11", { max: 10 })).toBe(
      "rangeOverflow",
    );
    expect(getNumberConstraintIssue("1.2", { step: 0.5 })).toBe(
      "stepMismatch",
    );
  });

  it("steps decimals without floating point drift", () => {
    expect(stepNumberValue(0.2, 1, { step: 0.1 })).toBe(0.3);
    expect(stepNumberValue(0, 1, { step: 1e-7 })).toBe(1e-7);
    expect(stepNumberValue(1, 1, { max: 1, step: 0.5 })).toBe(1);
    expect(stepNumberValue(null, 1, { min: 2, step: 1 })).toBe(2);
  });
});

describe("NumberField", () => {
  it("renders one text-editable spinbutton with governed defaults", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberField aria-label="Quantity" ref={ref} value={12} />);

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    expect(ref.current).toBe(input);
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("inputmode")).toBe("decimal");
    expect(input.getAttribute("aria-valuenow")).toBe("12");
    expect(input.parentElement?.getAttribute("data-appearance")).toBe(
      "outlined",
    );
    expect(input.parentElement?.getAttribute("data-size")).toBe("md");
  });

  it("preserves a localized intermediate draft and emits only accepted values", () => {
    const onValueChange = vi.fn();
    render(
      <NumberField
        aria-label="Weight"
        locale="pt-BR"
        onValueChange={onValueChange}
        value={1.5}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Weight" });
    expect((input as HTMLInputElement).value).toBe("1,5");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "2," } });
    expect((input as HTMLInputElement).value).toBe("2,");
    expect(onValueChange).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "2,75" } });
    expect(onValueChange).toHaveBeenLastCalledWith(2.75, {
      draft: "2,75",
      reason: "input",
    });
  });

  it("does not confuse an empty value with zero", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <NumberField
        aria-label="Optional amount"
        onValueChange={onValueChange}
        value={0}
      />,
    );

    let input = screen.getByRole("spinbutton", { name: "Optional amount" });
    expect((input as HTMLInputElement).value).toBe("0");
    rerender(
      <NumberField
        aria-label="Optional amount"
        onValueChange={onValueChange}
        value={null}
      />,
    );
    input = screen.getByRole("spinbutton", { name: "Optional amount" });
    expect((input as HTMLInputElement).value).toBe("");

    fireEvent.change(input, { target: { value: "0" } });
    expect(onValueChange).toHaveBeenLastCalledWith(0, {
      draft: "0",
      reason: "input",
    });
  });

  it("exposes localized empty copy instead of the implicit spinbutton zero", () => {
    render(
      <NumberField
        aria-label="Optional amount"
        placeholder="Add amount"
        value={null}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Optional amount" });
    expect(input.getAttribute("aria-valuenow")).toBeNull();
    expect(input.getAttribute("aria-valuetext")).toBe("Add amount");
  });

  it("keeps an invalid range draft visible and reports it on blur", () => {
    const onConstraintIssueChange = vi.fn();
    const onValueChange = vi.fn();
    render(
      <NumberField
        aria-label="Guests"
        max={8}
        min={1}
        onConstraintIssueChange={onConstraintIssueChange}
        onValueChange={onValueChange}
        value={4}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Guests" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "12" } });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(input.getAttribute("aria-invalid")).toBeNull();

    fireEvent.blur(input);
    expect((input as HTMLInputElement).value).toBe("12");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(onConstraintIssueChange).toHaveBeenLastCalledWith("rangeOverflow");
  });

  it("submits only the canonical ASCII value while the visible draft owns validity", () => {
    const { container } = render(
      <form>
        <NumberField
          aria-label="Weight"
          defaultValue={1.5}
          locale="pt-BR"
          max={8}
          name="weight"
        />
      </form>,
    );

    const form = container.querySelector("form") as HTMLFormElement;
    const input = screen.getByRole("spinbutton", { name: "Weight" });
    const submittedValue = container.querySelector(
      'input[type="hidden"][name="weight"]',
    ) as HTMLInputElement;
    expect(input.getAttribute("name")).toBeNull();
    expect(submittedValue.value).toBe("1.5");

    fireEvent.change(input, { target: { value: "2,75" } });
    expect(submittedValue.value).toBe("2.75");
    expect(new FormData(form).get("weight")).toBe("2.75");
    expect(form.checkValidity()).toBe(true);

    fireEvent.change(input, { target: { value: "12" } });
    expect(submittedValue.value).toBe("2.75");
    expect(form.checkValidity()).toBe(false);
  });

  it("commits with Enter and restores the latest accepted value with Escape", () => {
    const onValueCommit = vi.fn();
    render(
      <NumberField
        aria-label="Quantity"
        defaultValue={2}
        onValueCommit={onValueCommit}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "3.5" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueCommit).toHaveBeenLastCalledWith(3.5);

    fireEvent.change(input, { target: { value: "-" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect((input as HTMLInputElement).value).toBe("3.5");
    expect(onValueCommit).toHaveBeenCalledTimes(1);
  });

  it("uses a deterministic keyboard step when the constraint step is any", () => {
    render(<NumberField aria-label="Quantity" defaultValue={2} />);

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect((input as HTMLInputElement).value).toBe("3");
  });

  it("steps with buttons and arrow keys while retaining one tab stop", () => {
    function Controlled() {
      const [value, setValue] = useState<number | null>(2);
      return (
        <NumberField
          aria-label="Portions"
          decrementLabel="Decrease value"
          incrementLabel="Increase value"
          max={3}
          min={1}
          onValueChange={setValue}
          showSteppers
          step={0.5}
          value={value}
        />
      );
    }

    render(<Controlled />);
    const input = screen.getByRole("spinbutton", { name: "Portions" });
    const decrease = screen.getByRole("button", { name: "Decrease value" });
    const increase = screen.getByRole("button", { name: "Increase value" });
    expect(decrease.getAttribute("tabindex")).toBe("-1");
    expect(increase.getAttribute("tabindex")).toBe("-1");

    fireEvent.click(increase);
    expect((input as HTMLInputElement).value).toBe("2.5");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect((input as HTMLInputElement).value).toBe("2");
    fireEvent.keyDown(input, { isComposing: true, key: "ArrowUp" });
    expect((input as HTMLInputElement).value).toBe("2");
    expect(document.activeElement).toBe(input);
  });

  it("does not mutate from the mouse wheel", () => {
    const onValueChange = vi.fn();
    render(
      <NumberField
        aria-label="Quantity"
        decrementLabel="Decrease value"
        incrementLabel="Increase value"
        onValueChange={onValueChange}
        showSteppers
        step={1}
        value={4}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.wheel(input, { deltaY: -100 });

    expect((input as HTMLInputElement).value).toBe("4");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disables the corresponding step command at a boundary", () => {
    render(
      <NumberField
        aria-label="Adults"
        decrementLabel="Decrease value"
        incrementLabel="Increase value"
        max={8}
        min={1}
        showSteppers
        step={1}
        value={8}
      />,
    );

    expect(
      (screen.getByRole("button", {
        name: "Increase value",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", {
        name: "Decrease value",
      }) as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it("disables invalid runtime step commands", () => {
    render(
      <NumberField
        aria-label="Quantity"
        decrementLabel="Decrease value"
        incrementLabel="Increase value"
        showSteppers
        step={-1}
        value={4}
      />,
    );

    expect(
      (screen.getByRole("button", {
        name: "Increase value",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", {
        name: "Decrease value",
      }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("exposes affixes in the accessible value without editing them", () => {
    render(
      <NumberField
        aria-label="Weight"
        prefix="~"
        suffix=" kg"
        value={72}
      />,
    );

    const input = screen.getByRole("spinbutton", { name: "Weight" });
    expect(input.getAttribute("aria-valuetext")).toBe("~72 kg");
    expect((input as HTMLInputElement).value).toBe("72");
  });

  it("freezes loading and availability states through the shared input frame", () => {
    const { container, rerender } = render(
      <NumberField aria-label="Stock" loading value={12} />,
    );
    let input = screen.getByRole("spinbutton", { name: "Stock" });
    expect((input as HTMLInputElement).readOnly).toBe(true);
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector("[data-loading-indicator]")).toBeTruthy();

    rerender(<NumberField aria-label="Stock" disabled value={12} />);
    input = screen.getByRole("spinbutton", { name: "Stock" });
    expect((input as HTMLInputElement).disabled).toBe(true);

    rerender(<NumberField aria-label="Stock" readOnly value={12} />);
    input = screen.getByRole("spinbutton", { name: "Stock" });
    expect((input as HTMLInputElement).readOnly).toBe(true);
  });

  it("composes through Field relationships", () => {
    render(
      <Field error="Enter a valid quantity." label="Quantity" required>
        {({ controlProps }) => (
          <NumberField
            {...controlProps}
            min={1}
            validationState="invalid"
            value={null}
          />
        )}
      </Field>,
    );

    const input = screen.getByRole("spinbutton", { name: "Quantity" });
    const error = screen.getByText("Enter a valid quantity.");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
    expect(input.getAttribute("aria-errormessage")).toBe(error.id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect((input as HTMLInputElement).required).toBe(true);
  });
});
