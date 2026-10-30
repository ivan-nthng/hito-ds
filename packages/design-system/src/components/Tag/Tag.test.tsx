import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tag } from "../index";

describe("Tag", () => {
  it("renders passive text and a decorative icon without an action or focus stop", () => {
    const { container } = render(<Tag label="Vegetarian" leadingIcon="general/star" />);
    expect(screen.getByText("Vegetarian").textContent).toBe("Vegetarian");
    expect(container.querySelector("button, a, [tabindex]")).toBeNull();
    expect(container.querySelector("[data-icon-name]")?.getAttribute("aria-hidden")).toBe("true");
  });
  it("does not create an empty category", () => {
    const { container } = render(<Tag label="  " />);
    expect(container.childElementCount).toBe(0);
  });
});
