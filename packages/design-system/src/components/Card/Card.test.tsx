import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Card, CardHeader } from "./Card";

afterEach(cleanup);

describe("Card", () => {
  it("preserves caller-owned section semantics and does not add interactive wrappers", () => {
    const { container } = render(
      <Card as="section" aria-labelledby="card-title" id="summary" className="host-layout">
        <Text as="h2" id="card-title" variant="heading-sm">Summary</Text>
      </Card>,
    );
    const card = screen.getByRole("region", { name: "Summary" });
    expect(card.id).toBe("summary");
    expect(card.classList.contains("host-layout")).toBe(true);
    expect(card.children).toHaveLength(1);
    expect(container.querySelector("[tabindex], [aria-live], [aria-busy], button")).toBeNull();
  });

  it("leaves native action behavior and focus with the child", () => {
    const action = vi.fn();
    render(<Card as="article"><Button onClick={action}>Review details</Button></Card>);
    const button = screen.getByRole("button", { name: "Review details" });
    button.focus();
    fireEvent.click(button);
    expect(action).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button);
    expect(screen.getByRole("article").hasAttribute("tabindex")).toBe(false);
  });
});

describe("CardHeader", () => {
  it.each([1, 2, 3] as const)("keeps heading level %i independent from native adjacent actions", level => {
    const add = vi.fn();
    render(<Card as="section" aria-labelledby="contact-title"><CardHeader title="Contact" titleId="contact-title" headingLevel={level}
      action={<Button size="md" variant="secondary" intent="neutral" onClick={add}>Add</Button>} /></Card>);
    const heading = screen.getByRole("heading", { name: "Contact", level });
    const button = screen.getByRole("button", { name: "Add" });
    expect(heading.contains(button)).toBe(false);
    expect(screen.getByRole("region", { name: "Contact" })).toBeTruthy();
    button.focus(); fireEvent.click(button);
    expect(add).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button);
  });

  it("has no empty action slots, and omission leaves only Card content", () => {
    const view = render(<Card><CardHeader title="Address" /><Text>Content</Text></Card>);
    const header = view.container.querySelector("[data-card-header]")!;
    expect(header.children).toHaveLength(1);
    expect(header.firstElementChild?.children).toHaveLength(1);
    expect(header.hasAttribute("data-actions")).toBe(false);
    view.rerender(<Card><Text>Content</Text></Card>);
    expect(view.container.querySelector("[data-card-header]")).toBeNull();
    expect(view.container.querySelector("[data-card]")?.children).toHaveLength(1);
  });
});
