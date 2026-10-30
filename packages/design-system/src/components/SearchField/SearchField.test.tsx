import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../Field/Field";
import { SearchField } from "./SearchField";

describe("SearchField", () => {
  it("renders one native search input over the governed frame", () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <SearchField
        aria-label="Search orders"
        clearLabel="Clear search"
        ref={ref}
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Search orders" });
    expect(input.getAttribute("type")).toBe("search");
    expect(input.parentElement?.getAttribute("data-appearance")).toBe(
      "outlined",
    );
    expect(input.parentElement?.getAttribute("data-size")).toBe("md");
    expect(ref.current).toBe(input);
    expect(
      container.querySelector('[data-icon-name="general/search"]'),
    ).toBeTruthy();
  });

  it("supports a layout-stable ghost surface", () => {
    render(
      <SearchField
        appearance="ghost"
        aria-label="Search"
        clearLabel="Clear search"
      />,
    );

    expect(
      screen
        .getByRole("searchbox", { name: "Search" })
        .parentElement?.getAttribute("data-appearance"),
    ).toBe("ghost");
  });

  it("keeps controlled string ownership with the caller", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SearchField
        aria-label="Search orders"
        clearLabel="Clear search"
        onValueChange={onValueChange}
        value="morning"
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search orders" });

    fireEvent.change(input, { target: { value: "evening" } });
    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenLastCalledWith("evening");

    rerender(
      <SearchField
        aria-label="Search orders"
        clearLabel="Clear search"
        onValueChange={onValueChange}
        value="morning"
      />,
    );
    expect((input as HTMLInputElement).value).toBe("morning");
  });

  it("clears an uncontrolled value once, notifies in order and restores focus", () => {
    const calls: string[] = [];
    render(
      <SearchField
        aria-label="Search orders"
        clearLabel="Clear search"
        defaultValue="morning"
        onClear={() => calls.push("clear")}
        onValueChange={(value) => calls.push(`value:${value}`)}
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search orders" });
    const clear = screen.getByRole("button", { name: "Clear search" });

    expect(clear.querySelector('[data-icon-name="controls/close-s"]')).toBeTruthy();

    clear.focus();
    fireEvent.click(clear);

    expect((input as HTMLInputElement).value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(calls).toEqual(["value:", "clear"]);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("guards native cancel suppression with the governed clear state", () => {
    const { rerender } = render(
      <SearchField aria-label="Search" clearLabel="Clear search" />,
    );
    const input = screen.getByRole("searchbox", { name: "Search" });
    const frame = input.parentElement;

    expect(frame?.hasAttribute("data-search-clear")).toBe(false);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    fireEvent.change(input, { target: { value: "orders" } });
    expect(frame?.getAttribute("data-search-clear")).toBe("true");
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy();

    rerender(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        defaultValue="orders"
        loading
      />,
    );
    expect(frame?.hasAttribute("data-search-clear")).toBe(false);
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  });

  it("keeps its clear action out of the tab order with an excluded input", () => {
    render(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        defaultValue="orders"
        tabIndex={-1}
      />,
    );

    expect(screen.getByRole("searchbox", { name: "Search" }).tabIndex).toBe(-1);
    expect(screen.getByRole("button", { name: "Clear search" }).tabIndex).toBe(
      -1,
    );
  });

  it("uses the same value seam when a controlled clear is accepted", () => {
    const onValueChange = vi.fn();

    function ControlledSearch() {
      const [value, setValue] = useState("orders");
      return (
        <SearchField
          aria-label="Search"
          clearLabel="Clear search"
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            setValue(nextValue);
          }}
          value={value}
        />
      );
    }

    render(<ControlledSearch />);
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onValueChange).toHaveBeenCalledOnce();
    expect(onValueChange).toHaveBeenCalledWith("");
    expect(
      (screen.getByRole("searchbox", { name: "Search" }) as HTMLInputElement)
        .value,
    ).toBe("");
  });

  it("resolves trailing interaction as disabled, loading, read-only or clear", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        loading
        onValueChange={onValueChange}
        value="orders"
      />,
    );
    let input = screen.getByRole("searchbox", { name: "Search" });
    expect(input.getAttribute("aria-busy")).toBe("true");
    expect(input.hasAttribute("readonly")).toBe(true);
    expect(container.querySelector("[data-loading-indicator]")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    rerender(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        disabled
        loading
        onValueChange={onValueChange}
        value="orders"
      />,
    );
    input = screen.getByRole("searchbox", { name: "Search" });
    expect(input.hasAttribute("disabled")).toBe(true);
    expect(container.querySelector("[data-loading-indicator]")).toBeNull();

    rerender(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        onValueChange={onValueChange}
        readOnly
        value="orders"
      />,
    );
    expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();

    rerender(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        onValueChange={onValueChange}
        value="orders"
      />,
    );
    expect(screen.getByRole("button", { name: "Clear search" })).toBeTruthy();
  });

  it("preserves Field relationships and invalid precedence", () => {
    render(
      <Field
        error="Enter a searchable value."
        hint="Search by name."
        label="Orders"
      >
        {({ controlProps }) => (
          <SearchField
            {...controlProps}
            clearLabel="Clear order search"
            defaultValue="Morning"
            validationState="success"
          />
        )}
      </Field>,
    );

    const input = screen.getByRole("searchbox", { name: "Orders" });
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")?.split(" ")).toHaveLength(2);
    expect(input.parentElement?.getAttribute("data-validation-state")).toBe(
      "invalid",
    );
  });

  it("does not repurpose native Enter or Escape", () => {
    const onValueChange = vi.fn();
    render(
      <SearchField
        aria-label="Search"
        clearLabel="Clear search"
        defaultValue="orders"
        onValueChange={onValueChange}
      />,
    );
    const input = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(onValueChange).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("orders");
  });

  it("restores the initial uncontrolled value on native form reset", async () => {
    render(
      <form aria-label="Search form">
        <SearchField
          clearLabel="Clear search"
          defaultValue="morning"
          name="query"
          aria-label="Search"
        />
      </form>,
    );
    const form = screen.getByRole("form", { name: "Search form" });
    const input = screen.getByRole("searchbox", { name: "Search" });

    fireEvent.change(input, { target: { value: "evening" } });
    expect((input as HTMLInputElement).value).toBe("evening");
    fireEvent.reset(form);

    await waitFor(() =>
      expect((input as HTMLInputElement).value).toBe("morning"),
    );
    expect(new FormData(form as HTMLFormElement).get("query")).toBe("morning");
  });
});
