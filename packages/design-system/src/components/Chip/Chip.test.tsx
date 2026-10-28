import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Chip, type ChipProps } from "../index";

describe("Chip", () => {
  it("requests a controlled selection exactly once per native activation without submitting a form", async () => {
    const onSelectedChange = vi.fn();
    const onSubmit = vi.fn(e => e.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(<form onSubmit={onSubmit}><Chip ref={ref} behavior="selectable" label="High protein" selected={false} onSelectedChange={onSelectedChange} /></form>);
    const action = screen.getByRole("button", { name: "High protein" });
    expect(ref.current).toBe(action);
    expect(action.querySelector('[data-icon-name="general/check"]')).toBeNull();
    await userEvent.click(action);
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onSelectedChange.mock.calls).toEqual([[true], [true], [true]]);
    expect(action.getAttribute("aria-pressed")).toBe("false");
    expect(onSubmit).not.toHaveBeenCalled();
    rerender(<Chip ref={ref} behavior="selectable" label="High protein" selected onSelectedChange={onSelectedChange} />);
    expect(screen.getByRole("button").querySelector('[data-icon-name="general/check"]')).not.toBeNull();
    fireEvent.click(screen.getByRole("button"));
    expect(onSelectedChange).toHaveBeenLastCalledWith(false);
  });
  it("exposes a single localized removal action and leaves collection/focus ownership with the parent", async () => {
    const onRemove = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(<Chip ref={ref} behavior="removable" label="São Paulo" removeLabel="Remover São Paulo" leadingIcon="general/star" onRemove={onRemove} />);
    const action = screen.getByRole("button", { name: "Remover São Paulo" });
    expect(action).toBe(ref.current);
    expect(action.hasAttribute("aria-pressed")).toBe(false);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    await userEvent.click(screen.getByText("São Paulo"));
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(screen.getByRole("button")).toBe(action);
    expect(document.activeElement).toBe(action);
  });
  it("makes both behaviors inert when disabled", () => {
    const change = vi.fn();
    const remove = vi.fn();
    render(<><Chip behavior="selectable" label="Choice" selected disabled onSelectedChange={change} /><Chip behavior="removable" label="Value" removeLabel="Remove Value" disabled onRemove={remove} /></>);
    screen.getAllByRole("button").forEach(button => fireEvent.click(button));
    expect(change).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
  it("omits empty values and rejects unnamed removal from untyped consumers", () => {
    const { container } = render(<Chip behavior="selectable" label=" " selected={false} onSelectedChange={() => {}} />);
    expect(container.childElementCount).toBe(0);
    expect(() => render(<Chip {...({ behavior: "removable", label: "Value", removeLabel: " ", onRemove: () => {} } as ChipProps)} />)).toThrow("removeLabel");
  });
});
