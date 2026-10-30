import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("opts into one native button with a forwarded ref, internal chevron and unchanged pending label", () => {
    const ref = createRef<HTMLButtonElement>(), action = vi.fn();
    const { rerender } = render(<StatusBadge as="button" ref={ref} label="Not started" icon="general/status-dashed-circle" size="sm" onClick={action} />);
    const button = screen.getByRole("button", { name: "Not started" });
    expect(ref.current).toBe(button); expect(button.getAttribute("type")).toBe("button");
    expect(button.querySelector('[data-icon-name="arrows/compact/down"]')).toBeTruthy();
    fireEvent.click(button); expect(action).toHaveBeenCalledTimes(1);
    rerender(<StatusBadge as="button" ref={ref} label="Not started" icon="general/status-dashed-circle" pending onClick={action} />);
    expect(screen.getByRole("button", { name: "Not started" })).toBe(button);
    expect(button.getAttribute("aria-busy")).toBe("true"); expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.querySelector('[data-spinner]')).toBeTruthy(); fireEvent.click(button); expect(action).toHaveBeenCalledTimes(1);
    rerender(<StatusBadge label="Ready" icon="general/status-check-circle" />);
    expect(ref.current).toBeNull(); expect(screen.queryByRole("button")).toBeNull();
  });
  it("retains localized text when collapsed without introducing controls or announcements", () => {
    const { rerender, container } = render(<StatusBadge label="Concluído" icon="general/status-check-circle"/>);
    const text = screen.getByText("Concluído");
    rerender(<StatusBadge label="Concluído" icon="general/status-check-circle" collapsed/>);
    expect(screen.getByText("Concluído")).toBe(text);
    expect(text.closest('[aria-hidden="true"]')).toBeNull();
    expect(container.querySelector('[role],button,a,[tabindex]')).toBeNull();
    expect(container.querySelector('[data-icon-name]')?.getAttribute('aria-hidden')).toBe('true');
  });
  it("updates text and presentation from caller state without a business mapping", () => {
    const { rerender, container } = render(<StatusBadge label="Review" icon="general/status-check-circle" intent="warning" variant="solid" size="sm" collapsed/>);
    rerender(<StatusBadge label="Approved" icon="general/status-check-circle" intent="info" variant="soft" size="md"/>);
    expect(screen.queryByText("Review")).toBeNull();
    expect(screen.getByText("Approved")).toBeTruthy();
    expect(container.firstElementChild?.getAttribute('data-intent')).toBe('info');
    expect(container.firstElementChild?.getAttribute('data-collapsed')).toBe('false');
  });
});
