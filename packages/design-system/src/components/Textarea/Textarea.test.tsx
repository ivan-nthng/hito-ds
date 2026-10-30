import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../Field/Field";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a native multiline control with governed defaults", () => {
    render(<Textarea aria-label="Notes" />);

    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.getAttribute("rows")).toBe("3");
    expect(textarea.getAttribute("wrap")).toBe("soft");
    expect(textarea.getAttribute("data-appearance")).toBe("outlined");
    expect(textarea.getAttribute("data-size")).toBe("md");
  });

  it("forwards its native ref and textarea attributes", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        aria-label="Instructions"
        autoComplete="off"
        cols={24}
        defaultValue="Leave at reception."
        maxLength={120}
        leadingIcon="general/search"
        name="instructions"
        ref={ref}
        required
        rows={5}
        spellCheck
        trailingIcon="general/check"
        wrap="hard"
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Instructions" });
    expect(ref.current).toBe(textarea);
    expect(textarea.getAttribute("rows")).toBe("5");
    expect(textarea.getAttribute("wrap")).toBe("hard");
    expect(textarea.getAttribute("maxlength")).toBe("120");
    expect(textarea.getAttribute("name")).toBe("instructions");
    expect(textarea.hasAttribute("required")).toBe(true);
    expect((textarea as HTMLTextAreaElement).value).toBe("Leave at reception.");
  });

  it("maps explicit validation without inferring success", () => {
    const { rerender } = render(
      <Textarea
        aria-label="Description"
        defaultValue="Fresh bread"
        validationState="success"
      />,
    );

    let textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea.getAttribute("data-validation-state")).toBe("success");
    expect(textarea.hasAttribute("aria-invalid")).toBe(false);

    rerender(
      <Textarea aria-label="Description" validationState="invalid" />,
    );
    textarea = screen.getByRole("textbox", { name: "Description" });
    expect(textarea.getAttribute("data-validation-state")).toBe("invalid");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
  });

  it("preserves native disabled and read-only behavior", () => {
    render(
      <>
        <Textarea aria-label="Disabled notes" disabled />
        <Textarea aria-label="Read-only notes" readOnly value="Saved note" />
      </>,
    );

    const disabled = screen.getByRole("textbox", { name: "Disabled notes" });
    const readOnly = screen.getByRole("textbox", { name: "Read-only notes" });
    expect((disabled as HTMLTextAreaElement).disabled).toBe(true);
    expect(disabled.getAttribute("data-disabled")).toBe("true");
    expect((readOnly as HTMLTextAreaElement).readOnly).toBe(true);
    expect(readOnly.getAttribute("data-read-only")).toBe("true");
  });

  it("composes the native control through Field relationships", () => {
    render(
      <Field error="Enter delivery notes." label="Delivery notes" required>
        {({ controlProps }) => (
          <Textarea {...controlProps} validationState="invalid" />
        )}
      </Field>,
    );

    const textarea = screen.getByRole("textbox", { name: "Delivery notes" });
    const error = screen.getByText("Enter delivery notes.");
    expect(textarea.getAttribute("aria-invalid")).toBe("true");
    expect(textarea.getAttribute("aria-describedby")).toContain(error.id);
    expect(textarea.getAttribute("aria-errormessage")).toBe(error.id);
    expect((textarea as HTMLTextAreaElement).required).toBe(true);
  });

  it("keeps uncontrolled and controlled value ownership native", () => {
    const handleChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState("Initial");
      return (
        <Textarea
          aria-label="Controlled"
          onChange={(event) => {
            handleChange(event.currentTarget.value);
            setValue(event.currentTarget.value);
          }}
          value={value}
        />
      );
    }

    render(
      <>
        <Textarea aria-label="Uncontrolled" defaultValue="Draft" />
        <Controlled />
      </>,
    );

    const uncontrolled = screen.getByRole("textbox", { name: "Uncontrolled" });
    const controlled = screen.getByRole("textbox", { name: "Controlled" });
    fireEvent.change(uncontrolled, { target: { value: "Draft\ncontinued" } });
    fireEvent.change(controlled, { target: { value: "Updated" } });
    expect((uncontrolled as HTMLTextAreaElement).value).toBe("Draft\ncontinued");
    expect((controlled as HTMLTextAreaElement).value).toBe("Updated");
    expect(handleChange).toHaveBeenCalledWith("Updated");
  });

  it("does not intercept native keyboard or composition events", () => {
    const handleCompositionEnd = vi.fn();
    const handleKeyDown = vi.fn();
    render(
      <Textarea
        aria-label="Localized notes"
        leadingIcon="general/search"
        onCompositionEnd={handleCompositionEnd}
        onKeyDown={handleKeyDown}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Localized notes" });
    fireEvent.compositionStart(textarea, { data: "配" });
    fireEvent.change(textarea, { target: { value: "配送" } });
    fireEvent.compositionEnd(textarea, { data: "配送" });
    fireEvent.keyDown(textarea, { key: "Enter" });
    fireEvent.keyDown(textarea, { key: "Escape" });
    expect((textarea as HTMLTextAreaElement).value).toBe("配送");
    expect(handleCompositionEnd).toHaveBeenCalledTimes(1);
    expect(handleKeyDown).toHaveBeenCalledTimes(2);
  });

  it("keeps decorative icons out of the form value and native reset", () => {
    const { container } = render(
      <form aria-label="Notes form">
        <Textarea
          aria-label="Notes"
          defaultValue="Original"
          name="notes"
          leadingIcon="general/search"
          trailingIcon="general/check"
          size="lg"
        />
      </form>,
    );
    const form = screen.getByRole("form", {
      name: "Notes form",
    }) as HTMLFormElement;
    const textarea = screen.getByRole("textbox", { name: "Notes" });
    expect(
      container.querySelectorAll('[data-icon-name][data-size="lg"][aria-hidden="true"]'),
    ).toHaveLength(2);
    fireEvent.change(textarea, { target: { value: "Changed\nsecond line" } });
    expect(new FormData(form).get("notes")).toBe("Changed\nsecond line");
    form.reset();
    expect((textarea as HTMLTextAreaElement).value).toBe("Original");
  });
});
