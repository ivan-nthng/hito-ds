import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Spinner } from "./Spinner";

describe("Spinner ownership", () => {
  it("keeps the visual hidden and leaves the status to its owner", () => {
    const { container } = render(<div role="status" aria-busy="true"><Spinner />Loading content</div>);
    const spinner = container.querySelector("[data-spinner]")!;
    expect(spinner.getAttribute("aria-hidden")).toBe("true");
    expect(spinner.hasAttribute("tabindex")).toBe(false);
    expect(spinner.hasAttribute("aria-busy")).toBe(false);
    expect(spinner.hasAttribute("role")).toBe(false);
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toBe("Loading content");
  });

  it("is shared by Button while preserving focus, label and activation blocking", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button intent="accent" variant="primary" size="sm" loading onClick={onClick}>Save changes</Button>);
    const button = screen.getByRole("button", { name: "Save changes" });
    button.focus();
    fireEvent.click(button);
    expect(document.activeElement).toBe(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button.querySelector('[data-spinner][data-size="sm"]')).toBeTruthy();
    expect(button.querySelector('[data-icon-name="controls/refresh"]')).toBeNull();
    expect(button.getAttribute("aria-busy")).toBe("true");
    rerender(<Button intent="accent" variant="primary" size="sm" onClick={onClick}>Save changes</Button>);
    expect(button.querySelector("[data-spinner]")).toBeNull();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
