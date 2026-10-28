import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "../index";

describe("DescriptionList", () => {
  it("preserves native name–value semantics and caller-owned labeling/ref", () => {
    const ref = createRef<HTMLDListElement>();
    const { container } = render(<DescriptionList ref={ref} id="delivery" aria-label="Delivery details" className="host-class" items={[
      { id: "city", term: "City", value: "São Paulo" },
      { id: "instructions", term: "Instructions", value: "Not provided" },
    ]} />);
    const list = container.querySelector("dl")!;
    expect(ref.current).toBe(list);
    expect(list.id).toBe("delivery");
    expect(list.getAttribute("aria-label")).toBe("Delivery details");
    expect(list.classList.contains("host-class")).toBe(true);
    expect([...list.children].map(pair => [...pair.children].map(child => child.tagName))).toEqual([["DT", "DD"], ["DT", "DD"]]);
    expect(screen.getAllByRole("term").map(term => term.textContent)).toEqual(["City", "Instructions"]);
    expect(screen.getAllByRole("definition").map(value => value.textContent)).toEqual(["São Paulo", "Not provided"]);
    expect(container.querySelector("[tabindex], [role=grid], [role=table], [aria-live], button")).toBeNull();
  });

  it("keeps zero and intentionally empty values without inventing fallback copy", () => {
    const { rerender, container } = render(<DescriptionList items={[
      { id: "count", term: "Count", value: 0 },
      { id: "empty", term: "Instructions", value: null },
    ]} />);
    expect(screen.getAllByRole("definition").map(value => value.textContent)).toEqual(["0", ""]);
    rerender(<DescriptionList items={[]} />);
    expect(container.querySelector("dl")!.children).toHaveLength(0);
    expect(container.textContent).toBe("");
  });

  it("preserves interactive value identity when facts reorder", () => {
    function Counter() {
      const [count, setCount] = useState(0);
      return <button onClick={() => setCount(count + 1)}>Count {count}</button>;
    }
    const editable = { id: "editable", term: "Editable", value: <Counter /> };
    const fixed = { id: "reference", term: "Reference", value: "SV-2048" };
    const { rerender } = render(<DescriptionList items={[editable, fixed]} />);
    fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
    rerender(<DescriptionList items={[fixed, editable]} />);
    expect(screen.getByRole("button", { name: "Count 1" }).closest("dd")).not.toBeNull();
    expect(screen.getAllByRole("term").map(term => term.textContent)).toEqual(["Reference", "Editable"]);
  });
});
