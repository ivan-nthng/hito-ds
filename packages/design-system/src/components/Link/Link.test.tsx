import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Link } from "./Link";

describe("Link", () => {
  it("renders native navigation with safe blank-target defaults", () => {
    render(
      <Link href="https://example.com" target="_blank">
        External resource
      </Link>,
    );

    const link = screen.getByRole("link", { name: "External resource" });
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("data-icon-position")).toBe("trailing");
  });

  it("retains safe blank-target rel values when a custom relation is supplied", () => {
    render(
      <Link href="https://example.com" rel="nofollow" target="_blank">
        Partner resource
      </Link>,
    );

    expect(
      screen.getByRole("link", { name: "Partner resource" }).getAttribute("rel"),
    ).toBe("noopener noreferrer nofollow");
  });

  it("supports leading and trailing icons together", () => {
    const { container } = render(
      <Link
        href="#transfer"
        leadingIcon="general/link"
        trailingIcon="arrows/basic/right"
      >
        Transfer
      </Link>,
    );

    const link = screen.getByRole("link", { name: "Transfer" });
    expect(link.getAttribute("data-icon-position")).toBe("both");
    expect(container.querySelectorAll("[data-icon-name]")).toHaveLength(2);
  });

  it("allows the automatic external icon to be suppressed", () => {
    const { container } = render(
      <Link external href="https://example.com" trailingIcon={null}>
        Same-tab external resource
      </Link>,
    );

    expect(container.querySelector("[data-icon-name]")).toBeNull();
  });

  it("renders accessible icon-only navigation", () => {
    render(
      <Link
        aria-label="Open external resource"
        href="https://example.com"
        icon="arrows/complex/up-right"
      />,
    );

    const link = screen.getByRole("link", { name: "Open external resource" });
    expect(link.getAttribute("data-icon-position")).toBe("only");
  });
});
