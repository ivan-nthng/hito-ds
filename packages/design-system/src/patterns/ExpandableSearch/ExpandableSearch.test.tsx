import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ExpandableSearch } from "./ExpandableSearch";

describe("ExpandableSearch", () => {
  it("reveals the real SearchField and focuses its input", async () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <ExpandableSearch
        aria-label="Search orders"
        clearLabel="Clear search"
        closeLabel="Close search"
        openLabel="Open search"
        ref={ref}
      />,
    );

    expect(
      screen.queryByRole("searchbox", { name: "Search orders" }),
    ).toBeNull();
    const trigger = screen.getByRole("button", { name: "Open search" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    const input = screen.getByRole("searchbox", { name: "Search orders" });
    await waitFor(() => expect(document.activeElement).toBe(input));
    expect(ref.current).toBe(input);
    expect(input.getAttribute("type")).toBe("search");
    expect(
      screen
        .getByRole("button", { name: "Close search" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });

  it.each([undefined, "ghost"] as const)("keeps clear and collapse distinct with collapse variant %s", async (collapseVariant) => {
    const onValueChange = vi.fn();
    render(
      <ExpandableSearch
        aria-label="Search orders"
        clearLabel="Clear search"
        collapseVariant={collapseVariant}
        closeLabel="Close search"
        defaultExpanded
        defaultValue="Morning"
        onValueChange={onValueChange}
        openLabel="Open search"
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Search orders" });
    const clear = screen.getByRole("button", { name: "Clear search" });
    expect(clear.querySelector('[data-icon-name="controls/close-s"]')).toBeTruthy();

    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenLastCalledWith("");
    expect((input as HTMLInputElement).value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(screen.getByRole("button", { name: "Close search" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Close search" }).dataset.variant).toBe(collapseVariant ?? "secondary");

    fireEvent.change(input, { target: { value: "Fresh" } });
    input.focus();
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    const collapsedTrigger = screen.getByRole("button", {
      name: "Open search",
    });
    await waitFor(() => expect(document.activeElement).toBe(collapsedTrigger));
    expect(collapsedTrigger.dataset.variant).toBe("ghost");
    expect(screen.queryByRole("searchbox", { name: "Search orders" })).toBeNull();
    expect(onValueChange).toHaveBeenLastCalledWith("Fresh");

    fireEvent.click(collapsedTrigger);
    await waitFor(() =>
      expect(
        (
          screen.getByRole("searchbox", {
            name: "Search orders",
          }) as HTMLInputElement
        ).value,
      ).toBe("Fresh"),
    );
  });

  it("reveals the mounted field when its native ref receives focus", async () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <ExpandableSearch
        aria-label="Search orders"
        clearLabel="Clear search"
        closeLabel="Close search"
        openLabel="Open search"
        ref={ref}
      />,
    );

    expect(ref.current?.tabIndex).toBe(-1);
    act(() => ref.current?.focus());

    const input = await screen.findByRole("searchbox", {
      name: "Search orders",
    });
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("tabindex")).toBeNull();
  });

  it("reveals the mounted field through its associated label", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label htmlFor="order-search">Search orders</label>
        <ExpandableSearch
          clearLabel="Clear search"
          closeLabel="Close search"
          id="order-search"
          openLabel="Open search"
        />
      </>,
    );

    await user.click(screen.getByText("Search orders"));

    const input = await screen.findByRole("searchbox", {
      name: "Search orders",
    });
    expect(document.activeElement).toBe(input);
  });

  it("collapses on Escape, preserves the query and returns focus", async () => {
    render(
      <ExpandableSearch
        aria-label="Search orders"
        clearLabel="Clear search"
        closeLabel="Close search"
        defaultExpanded
        defaultValue="Morning"
        openLabel="Open search"
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Search orders" });
    input.focus();
    fireEvent.keyDown(input, { key: "Escape" });

    const trigger = screen.getByRole("button", { name: "Open search" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    fireEvent.click(trigger);
    expect(
      (
        screen.getByRole("searchbox", {
          name: "Search orders",
        }) as HTMLInputElement
      ).value,
    ).toBe("Morning");
  });

  it("collapses on an outside pointer without blocking outside focus", () => {
    render(
      <>
        <ExpandableSearch
          aria-label="Search orders"
          clearLabel="Clear search"
          closeLabel="Close search"
          defaultExpanded
          openLabel="Open search"
        />
        <button type="button">Outside</button>
      </>,
    );

    const outside = screen.getByRole("button", { name: "Outside" });
    fireEvent.pointerDown(outside);
    outside.focus();

    expect(screen.getByRole("button", { name: "Open search" })).toBeTruthy();
    expect(document.activeElement).toBe(outside);
  });

  it("supports one controlled disclosure owner", () => {
    const onExpandedChange = vi.fn();

    function ControlledDisclosure() {
      const [expanded, setExpanded] = useState(false);
      return (
        <ExpandableSearch
          aria-label="Search orders"
          clearLabel="Clear search"
          closeLabel="Close search"
          expanded={expanded}
          onExpandedChange={(nextExpanded) => {
            onExpandedChange(nextExpanded);
            setExpanded(nextExpanded);
          }}
          openLabel="Open search"
        />
      );
    }

    render(<ControlledDisclosure />);
    fireEvent.click(screen.getByRole("button", { name: "Open search" }));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps the mounted native field in its form and restores its default", async () => {
    render(
      <form aria-label="Search form">
        <ExpandableSearch
          aria-label="Search orders"
          clearLabel="Clear search"
          closeLabel="Close search"
          defaultValue="Morning"
          name="query"
          openLabel="Open search"
        />
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open search" }));
    const input = screen.getByRole("searchbox", { name: "Search orders" });
    fireEvent.change(input, { target: { value: "Evening" } });
    fireEvent.click(screen.getByRole("button", { name: "Close search" }));
    fireEvent.reset(screen.getByRole("form", { name: "Search form" }));
    fireEvent.click(screen.getByRole("button", { name: "Open search" }));

    await waitFor(() => expect((input as HTMLInputElement).value).toBe("Morning"));
  });

  it("reveals a collapsed required field during native form validation", async () => {
    render(
      <form aria-label="Search form">
        <ExpandableSearch
          aria-label="Search orders"
          clearLabel="Clear search"
          closeLabel="Close search"
          name="query"
          openLabel="Open search"
          required
        />
      </form>,
    );

    const input = document.querySelector<HTMLInputElement>(
      'input[name="query"]',
    );
    const form = screen.getByRole("form", { name: "Search form" });
    let valid = true;

    act(() => {
      valid = (form as HTMLFormElement).checkValidity();
    });

    expect(valid).toBe(false);
    await screen.findByRole("button", { name: "Close search" });
    expect(screen.getByRole("searchbox", { name: "Search orders" })).toBe(input);
    await waitFor(() => expect(document.activeElement).toBe(input));
  });
});
