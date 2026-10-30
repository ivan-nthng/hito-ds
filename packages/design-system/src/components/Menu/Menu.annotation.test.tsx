import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Menu, type MenuCommand } from "./Menu";

describe("Menu passive annotation", () => {
  it.each([undefined, false, true])("keeps the annotation passive and preserves selection semantics (%s)", checked => {
    const item: MenuCommand = { id: "orders", label: "My orders", annotation: "2", ...(checked === undefined ? {} : { checked }) };
    const { container } = render(<Menu open={false} onOpenChange={() => {}} label="Account" trigger={<button>Account</button>}
      items={[item]} onAction={() => {}} />);
    const row = container.querySelector<HTMLElement>(checked === undefined ? '[role="menuitem"]' : '[role="menuitemradio"]')!;
    expect(row.textContent).toBe("My orders2");
    expect(row.querySelector("button,a,input,[tabindex]")).toBeNull();
    expect(row.getAttribute("aria-checked")).toBe(checked === undefined ? null : String(checked));
  });
});
