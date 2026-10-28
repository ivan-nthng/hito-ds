import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Fieldset } from "./Fieldset";
import { Legend } from "../Legend/Legend";

describe("Fieldset and Legend", () => {
  it("uses a first-child native legend and distinct described relationships", () => {
    render(
      <>
        <p id="external">External</p>
        <Fieldset
          legend="Contact"
          metadata="Required"
          description="Use current details"
          error="Complete the contact"
          aria-describedby=" external external "
        >
          {({ controlProps }) => <input aria-label="Name" {...controlProps} />}
        </Fieldset>
      </>,
    );
    const group = screen.getByRole("group", { name: "Contact Required" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group.firstElementChild?.tagName).toBe("LEGEND");
    const describedBy = group.getAttribute("aria-describedby")!;
    expect(describedBy.split(" ")).toHaveLength(3);
    for (const id of describedBy.split(" "))
      expect(document.getElementById(id)).not.toBeNull();
    const input = screen.getByRole("textbox");
    expect(input.getAttribute("aria-describedby")).toBe(describedBy);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-errormessage")).toBe(
      screen.getByText("Complete the contact").id,
    );
  });
  it("updates conditional descriptions/errors without replacing the focused child", () => {
    const view = (error?: string, description?: string) => (
      <Fieldset legend="Contact" description={description} error={error}>
        {({ controlProps }) => <input aria-label="Name" {...controlProps} />}
      </Fieldset>
    );
    const { rerender } = render(view("Required", "Description"));
    const input = screen.getByRole("textbox") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "Draft" } });
    const group = screen.getByRole("group");
    const id = group.id;
    rerender(view());
    expect(screen.getByRole("textbox")).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Draft");
    expect(group.id).toBe(id);
    expect(group.getAttribute("aria-describedby")).toBeNull();
    expect(input.getAttribute("aria-errormessage")).toBeNull();
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });
  it("preserves native disabled descendants and re-enables them", () => {
    const { rerender } = render(
      <Fieldset disabled legend="Contact">
        <input aria-label="Name" />
        <button>Save</button>
      </Fieldset>,
    );
    expect(screen.getByRole("textbox").matches(":disabled")).toBe(true);
    expect(screen.getByRole("button").matches(":disabled")).toBe(true);
    rerender(
      <Fieldset legend="Contact">
        <input aria-label="Name" />
        <button>Save</button>
      </Fieldset>,
    );
    expect(screen.getByRole("textbox").matches(":disabled")).toBe(false);
  });
  it("keeps generated relationships unique across groups and forwards native refs", () => {
    const ref = createRef<HTMLFieldSetElement>();
    render(
      <>
        <Fieldset
          ref={ref}
          legend="One"
          description="First"
          name="contact"
          form="form"
        >
          <input />
        </Fieldset>
        <Fieldset legend="Two" error="Second">
          <input />
        </Fieldset>
      </>,
    );
    const groups = screen.getAllByRole("group");
    expect(groups[0]).toBe(ref.current);
    expect(ref.current?.name).toBe("contact");
    expect(ref.current?.getAttribute("form")).toBe("form");
    expect(
      new Set([...document.querySelectorAll("[id]")].map((n) => n.id)).size,
    ).toBe(document.querySelectorAll("[id]").length);
  });
  it("supports the standalone Legend as the first native child", () => {
    const ref = createRef<HTMLLegendElement>();
    render(
      <fieldset>
        <Legend ref={ref} metadata="Optional">
          Preferences
        </Legend>
        <input />
      </fieldset>,
    );
    expect(
      screen.getByRole("group", { name: "Preferences Optional" })
        .firstElementChild,
    ).toBe(ref.current);
  });
});

const inline = (
  <Fieldset legend="Inline">
    <input />
  </Fieldset>
);
const card = (
  <Fieldset legend="Card" appearance="card" size="comfortable">
    <input />
  </Fieldset>
);
// @ts-expect-error size is only admitted for Card
const invalidInline = (
  <Fieldset legend="Invalid" appearance="inline" size="compact">
    <input />
  </Fieldset>
);
// @ts-expect-error no native fieldset readOnly simulation
const invalidReadOnly = (
  <Fieldset legend="Invalid" readOnly>
    <input />
  </Fieldset>
);
void [inline, card, invalidInline, invalidReadOnly];
