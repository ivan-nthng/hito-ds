import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field } from "./Field";

describe("Field", () => {
  it("associates a visible label with one native control", () => {
    render(
      <Field controlId="email" label="Email">
        {({ controlProps }) => <input {...controlProps} />}
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.getAttribute("id")).toBe("email");
    expect(screen.getByText("Email").closest("label")?.htmlFor).toBe("email");
  });

  it("connects error before hint while preserving external descriptions", () => {
    render(
      <>
        <p id="external-note">External note</p>
        <Field
          controlId="name"
          describedBy="external-note"
          error="Enter a name"
          hint="Use the public name"
          label="Name"
        >
          {({ controlProps }) => <input {...controlProps} />}
        </Field>
      </>,
    );

    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input.getAttribute("aria-describedby")).toBe(
      "external-note name-error name-hint",
    );
    expect(input.getAttribute("aria-errormessage")).toBe("name-error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector("#name-error")?.parentElement).toBe(
      input.parentElement,
    );
    expect(document.querySelector("#name-hint")?.parentElement).toBe(
      input.parentElement,
    );
  });

  it("passes required semantics without using visible copy as a substitute", () => {
    render(
      <Field label="Order number" required requirementLabel="Required">
        {({ controlProps }) => <input {...controlProps} />}
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: /Order number/ });
    expect(input.hasAttribute("required")).toBe(true);
    expect(input.getAttribute("aria-required")).toBe("true");
  });

  it("keeps the auxiliary action outside the label", () => {
    render(
      <Field auxiliary={<a href="#help">Why?</a>} label="Reference">
        {({ controlProps }) => <input {...controlProps} />}
      </Field>,
    );

    const label = screen.getByText("Reference").closest("label");
    expect(label?.contains(screen.getByRole("link", { name: "Why?" }))).toBe(false);
  });

  it("generates unique control identifiers", () => {
    render(
      <>
        <Field label="First">{({ controlProps }) => <input {...controlProps} />}</Field>
        <Field label="Second">{({ controlProps }) => <input {...controlProps} />}</Field>
      </>,
    );

    const first = screen.getByRole("textbox", { name: "First" });
    const second = screen.getByRole("textbox", { name: "Second" });
    expect(first.id).not.toBe(second.id);
  });
});
