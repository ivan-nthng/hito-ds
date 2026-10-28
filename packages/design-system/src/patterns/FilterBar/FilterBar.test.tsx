import { fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../../components/Button/Button";
import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("names independent sections from their visible headings without an extra h1 or toolbar keyboard model", () => {
    render(<><FilterBar title="Projects" /><FilterBar title="People" headingLevel={3} /></>);
    const projects = screen.getByRole("region", { name: "Projects" });
    const people = screen.getByRole("region", { name: "People" });
    expect(projects.getAttribute("aria-labelledby")).not.toBe(people.getAttribute("aria-labelledby"));
    expect(within(projects).getByRole("heading", { level: 2 }).textContent).toBe("Projects");
    expect(within(people).getByRole("heading", { level: 3 }).textContent).toBe("People");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
    expect(screen.queryByRole("toolbar")).toBeNull();
    expect(projects.children).toHaveLength(1);
  });

  it("preserves the consumer action ref and callback and removes the optional filter row", () => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    const action = <Button ref={ref} intent="neutral" variant="ghost" onClick={click}>Filters</Button>;
    const { rerender } = render(<FilterBar title="Projects" actions={action} filters={<span>City: Lisbon</span>} />);
    fireEvent.click(screen.getByRole("button", { name: "Filters" }));
    expect(click).toHaveBeenCalledOnce();
    expect(ref.current).toBe(screen.getByRole("button", { name: "Filters" }));
    expect(screen.getByRole("region").children).toHaveLength(2);
    rerender(<FilterBar title="Projects" actions={action} filters={null} />);
    expect(screen.queryByText("City: Lisbon")).toBeNull();
    expect(screen.getByRole("region").children).toHaveLength(1);
  });
});
