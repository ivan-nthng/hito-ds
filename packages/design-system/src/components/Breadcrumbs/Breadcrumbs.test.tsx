import { createEvent, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Breadcrumbs, type BreadcrumbsItem } from "./Breadcrumbs";

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  // jsdom has no layout. Keep this suite on the full-path branch; actual fit
  // decisions and both overflow presentations are exercised in browser stories.
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function () {
    return new DOMRect(0, 0, this.tagName === "OL" ? 1024 : 32, 20);
  });
});
afterAll(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const labels = { label: "Page location", overflowLabel: (count: number) => `Earlier levels (${count})`, closeLabel: "Close" };
const items: BreadcrumbsItem[] = [{ id: "home", label: "Home", href: "#home" }, { id: "team", label: "Team", href: "#team" }];

describe("Breadcrumbs public contract", () => {
  it("renders caller destinations, one non-link current page and native root attributes", () => {
    const { container } = render(<Breadcrumbs {...labels} items={items} currentPage="Page" id="location" dir="rtl" className="consumer" />);
    const nav = screen.getByRole("navigation", { name: labels.label });
    expect(nav.id).toBe("location");
    expect(nav.classList.contains("consumer")).toBe(true);
    expect(nav.getAttribute("dir")).toBe("rtl");
    expect(screen.getAllByRole("link").map(link => link.getAttribute("href"))).toEqual(["#home", "#team"]);
    const current = container.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].closest("a")).toBeNull();
    expect(current[0].parentElement?.tabIndex).toBe(-1);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it.each([false, true])("delivers the original native click once, including modifiers (%s)", ctrlKey => {
    const onClick = vi.fn(event => event.preventDefault());
    render(<Breadcrumbs {...labels} items={[{ ...items[0], onClick }]} currentPage="Page" />);
    const link = screen.getByRole("link");
    const native = createEvent.click(link, { ctrlKey, bubbles: true, cancelable: true });
    fireEvent(link, native);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0].nativeEvent).toBe(native);
    expect(onClick.mock.calls[0][0].ctrlKey).toBe(ctrlKey);
    expect(native.defaultPrevented).toBe(true);
  });

  it("does not cancel ordinary native navigation", () => {
    render(<Breadcrumbs {...labels} items={items} currentPage="Page" />);
    const link = screen.getByRole("link", { name: "Home" });
    const native = createEvent.click(link, { bubbles: true, cancelable: true });
    expect(fireEvent(link, native)).toBe(true);
    expect(native.defaultPrevented).toBe(false);
  });

  it("repairs focus when a focused ancestor disappears without changing overflow mode", () => {
    const { rerender } = render(<Breadcrumbs {...labels} items={items} currentPage="Page" />);
    screen.getByRole("link", { name: "Home" }).focus();
    rerender(<Breadcrumbs {...labels} items={items.slice(1)} currentPage="Page" />);
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Team" }));
    rerender(<Breadcrumbs {...labels} items={[]} currentPage="Page" />);
    expect(document.activeElement).toBe(document.querySelector('[aria-current="page"]')?.parentElement);
    expect((document.activeElement as HTMLElement).tabIndex).toBe(-1);
  });

  it("preserves destination focus that the caller already moved outside the component", () => {
    const view = (ancestors: BreadcrumbsItem[]) => <><h1 tabIndex={-1}>Destination</h1><Breadcrumbs {...labels} items={ancestors} currentPage="Page" /></>;
    const { rerender } = render(view(items));
    screen.getByRole("link", { name: "Home" }).focus();
    const heading = screen.getByRole("heading");
    heading.focus();
    rerender(view([]));
    expect(document.activeElement).toBe(heading);
  });

  it("omits an unknown location while allowing a current-only path", () => {
    const { rerender } = render(<Breadcrumbs {...labels} items={[]} currentPage=" " />);
    expect(screen.queryByRole("navigation")).toBeNull();
    rerender(<Breadcrumbs {...labels} items={[]} currentPage="Home" />);
    expect(screen.getByRole("navigation")).not.toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
