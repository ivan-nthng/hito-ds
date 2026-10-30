import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it.each(["neutral", "accent", "info", "destructive"] as const)("preserves native value and caller text in %s context", tone => {
    const { container } = render(<ProgressBar label="Completed steps" value={3} max={5} valueText="3 of 5" tone={tone} />);
    const bar = screen.getByRole("progressbar", { name: "Completed steps" }) as HTMLProgressElement;
    expect(bar.tagName).toBe("PROGRESS");
    expect(bar.value).toBe(3);
    expect(bar.max).toBe(5);
    expect(bar.position).toBe(0.6);
    expect(bar.getAttribute("aria-valuetext")).toBe("3 of 5");
    expect(container.querySelector("span")?.textContent).toBe("3 of 5");
    expect(container.querySelector("[aria-live], [aria-busy], [role='status'], [tabindex]")).toBeNull();
  });

  it("keeps both empty and full values determinate, without automatic status changes", () => {
    const { container, rerender } = render(<ProgressBar label="Upload" value={0} valueText="0%" />);
    const bar = screen.getByRole("progressbar") as HTMLProgressElement;
    expect(bar.hasAttribute("value")).toBe(true);
    expect(bar.position).toBe(0);
    rerender(<ProgressBar label="Upload" value={100} valueText="100%" />);
    expect(bar.position).toBe(1);
    expect(container.querySelector("[data-intent], [role='status'], [aria-live]")).toBeNull();
  });

  it("supports fractional values and unique label associations for adjacent instances", () => {
    render(<><ProgressBar label="First file" value={0.5} max={1} valueText="50%" /><ProgressBar label="Second file" value={1} max={5} valueText="1 of 5" /></>);
    const [first, second] = screen.getAllByRole("progressbar") as HTMLProgressElement[];
    expect(first.position).toBe(0.5);
    expect(first.getAttribute("aria-labelledby")).not.toBe(second.getAttribute("aria-labelledby"));
    expect(document.getElementById(first.getAttribute("aria-labelledby")!)?.textContent).toBe("First file");
  });

  it.each([0, 2, 4])("retains an accessible name and %s of 4 when the thin track has no visible heading", value => {
    const { container, rerender } = render(<ProgressBar label="Completed steps" value={value} max={4} valueText={`${value} of 4`} showHeading={false} thickness="thin" />);
    const bar = screen.getByRole("progressbar", { name: "Completed steps" }) as HTMLProgressElement;
    expect(bar.position).toBe(value / 4);
    expect(bar.getAttribute("aria-valuetext")).toBe(`${value} of 4`);
    expect(bar.hasAttribute("aria-labelledby")).toBe(false);
    expect(container.querySelector("[data-progress-bar]")?.children).toHaveLength(1);
    rerender(<ProgressBar label="Completed steps" value={value} max={4} valueText={`${value} of 4`} />);
    expect(screen.getByRole("progressbar", { name: "Completed steps" })).toBe(bar);
    expect(container.querySelector("span")?.textContent).toBe(`${value} of 4`);
    expect(bar.hasAttribute("aria-label")).toBe(false);
  });

  it.each([0, -1, NaN, Infinity])("rejects invalid max %s instead of exposing indeterminate or misleading progress", max => {
    expect(() => render(<ProgressBar label="Upload" value={0} max={max} valueText="0%" />)).toThrow("finite positive");
  });

  it.each([-1, 101, NaN, Infinity])("rejects invalid value %s rather than clamping it independently of its label", value => {
    expect(() => render(<ProgressBar label="Upload" value={value} valueText="Progress" />)).toThrow("between zero and max");
  });

  it.each([{ label: " ", valueText: "60%" }, { label: "Upload", valueText: " " }])("requires a name and numerical text with or without a visible heading: %j", copy => {
    for (const showHeading of [true, false]) {
      expect(() => render(<ProgressBar {...copy} value={60} showHeading={showHeading} />)).toThrow("non-empty label and valueText");
    }
  });
});
