import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { TextInput } from "./TextInput";

describe("TextInput", () => {
  it("keeps a visual prefix outside the native value and RDFa attributes", () => {
    render(<TextInput aria-label="Amount in reais" prefix="R$" defaultValue="150,00" />);
    const input = screen.getByRole("textbox", { name: "Amount in reais" }) as HTMLInputElement;
    expect(input.value).toBe("150,00");
    expect(input.hasAttribute("prefix")).toBe(false);
    expect(screen.getByText("R$").getAttribute("aria-hidden")).toBe("true");
  });
  it("renders a native text input with governed defaults", () => {
    render(<TextInput aria-label="Name" />);

    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input.getAttribute("type")).toBe("text");
    expect(input.parentElement?.getAttribute("data-appearance")).toBe("outlined");
    expect(input.parentElement?.getAttribute("data-size")).toBe("md");
  });

  it("exposes the soft appearance without changing native semantics", () => {
    render(<TextInput appearance="soft" aria-label="Email" type="email" />);

    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input.getAttribute("type")).toBe("email");
    expect(input.parentElement?.getAttribute("data-appearance")).toBe("soft");
  });

  it("renders decorative icons at the control size", () => {
    const { container } = render(
      <TextInput
        aria-label="Website"
        leadingIcon="general/link"
        size="lg"
        trailingIcon="arrows/complex/up-right"
        type="url"
      />,
    );

    expect(container.querySelectorAll('[aria-hidden="true"][data-size="lg"]')).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: "Website" })).toBeTruthy();
  });

  it("preserves native invalid, disabled and read-only attributes", () => {
    const { rerender } = render(
      <TextInput aria-invalid aria-label="Order" disabled required />,
    );
    let input = screen.getByRole("textbox", { name: "Order" });
    expect(input.hasAttribute("disabled")).toBe(true);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.parentElement?.getAttribute("data-invalid")).toBe("true");

    rerender(<TextInput aria-label="Order" readOnly />);
    input = screen.getByRole("textbox", { name: "Order" });
    expect(input.hasAttribute("readonly")).toBe(true);
    expect(input.parentElement?.getAttribute("data-read-only")).toBe("true");
  });

  it("maps explicit validation results without inferring success from content", () => {
    const { rerender } = render(
      <TextInput
        aria-label="Validated name"
        defaultValue="Ivan"
        validationState="success"
      />,
    );

    let input = screen.getByRole("textbox", { name: "Validated name" });
    expect(input.parentElement?.getAttribute("data-validation-state")).toBe(
      "success",
    );
    expect(input.hasAttribute("aria-invalid")).toBe(false);

    rerender(
      <TextInput
        aria-label="Validated name"
        validationState="invalid"
      />,
    );
    input = screen.getByRole("textbox", { name: "Validated name" });
    expect(input.parentElement?.getAttribute("data-validation-state")).toBe(
      "invalid",
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("renders a busy read-only input with a trailing loading indicator", () => {
    const { container } = render(
      <TextInput
        aria-label="Availability"
        loading
        trailingIcon="general/check"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Availability" });
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(input.hasAttribute("readonly")).toBe(true);
    expect(input.parentElement?.getAttribute("data-loading")).toBe("true");
    expect(container.querySelector("[data-loading-indicator]")).toBeTruthy();
    expect(container.querySelector('[data-icon-name="controls/refresh"]')).toBeNull();
    expect(container.querySelector('[data-icon-name="general/check"]')).toBeNull();
  });

  it("forwards the native input ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextInput aria-label="Phone" ref={ref} type="tel" />);

    expect(ref.current).toBe(screen.getByRole("textbox", { name: "Phone" }));
  });
});
