import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatePanel } from "./StatePanel";

describe("StatePanel", () => {
  it("supports the complete semantic heading hierarchy", () => {
    render(<StatePanel title="No results" titleAs="h1" />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("No results");
  });
  it("requires readable title and action text", () => {
    expect(() => render(<StatePanel title="  " />)).toThrow("non-empty title");
    expect(() => render(<StatePanel title="Unavailable" action={{ label: " ", onClick: () => {} }} />)).toThrow("localized label");
  });

  it("omits absent parts and follows the caller's heading hierarchy without a live role", () => {
    const { container } = render(<StatePanel title="No results" body=" " titleAs="h3" />);
    expect(screen.getByRole("heading", { level: 3 }).textContent).toBe("No results");
    expect(container.querySelector("[data-icon-name], button, p")).toBeNull();
    expect(container.querySelector("[role], [aria-live], [aria-busy], [tabindex]")).toBeNull();
  });

  it("keeps action intent independent from the error icon and calls the application callback", () => {
    const onClick = vi.fn();
    render(<StatePanel title="Could not load" body="Your changes are safe." icon="general/status-cross-circle" iconTone="destructive" action={{ label: "Try again", onClick, intent: "accent" }} />);
    const button = screen.getByRole("button", { name: "Try again" });
    expect(button.getAttribute("data-intent")).toBe("accent");
    expect(button.getAttribute("data-size")).toBe("md");
    button.focus();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button);
    expect(screen.getByText("Your changes are safe.")).toBeTruthy();
  });
});
