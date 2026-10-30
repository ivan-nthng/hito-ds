import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar, type AvatarProps } from "../index";

describe("Avatar", () => {
  it("opts into a persistent strip without adding an action or changing the default presentation", () => {
    const onEdit = vi.fn();
    const { container, rerender } = render(<Avatar size="lg" label="Edit restaurant logo" editLabel="Edit" onEdit={onEdit} />);
    expect(container.querySelector("[data-avatar]")?.getAttribute("data-edit-presentation")).toBe("adaptive");
    rerender(<Avatar size="lg" label="Edit restaurant logo" editLabel="Edit" onEdit={onEdit} editPresentation="persistent-strip" />);
    expect(container.querySelector("[data-avatar]")?.getAttribute("data-edit-presentation")).toBe("persistent-strip");
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Edit restaurant logo" }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(() => render(<Avatar {...({ size: "sm", label: "Edit", editLabel: "Edit", onEdit, editPresentation: "persistent-strip" } as unknown as AvatarProps)} />)).toThrow("MD/LG");
  });
  it("disables editing without remounting a loaded photo", () => {
    const onEdit = vi.fn();
    const props = { size: "lg", label: "Edit logo", editLabel: "Edit", onEdit, src: "/logo.png", editPresentation: "persistent-strip" } as const;
    const { container, rerender } = render(<Avatar {...props} />);
    const photo = container.querySelector("img")!;
    fireEvent.load(photo);
    rerender(<Avatar {...props} disabled />);
    expect(container.querySelector("img")).toBe(photo);
    expect(photo.getAttribute("data-loaded")).toBe("true");
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onEdit).not.toHaveBeenCalled();
  });
  it("uses the configured fallback through photo recovery without changing initials or edit artwork", () => {
    const props = { label: "Add logo for Casa Verde", editLabel: "Add logo", onEdit: vi.fn(), fallbackIcon: "map/store", fallbackIconTone: "muted" } as const;
    const { container, rerender } = render(<Avatar {...props} />);
    const glyph = () => container.querySelector('[data-icon-name="map/store"]');
    expect(glyph()?.getAttribute("data-tone")).toBe("muted");
    expect(container.querySelector('[data-icon-name="controls/edit"]')?.getAttribute("data-tone")).not.toBe("muted");
    rerender(<Avatar {...props} initials="CV" />);
    expect(glyph()).toBeNull();
    expect(container.textContent).toContain("CV");
    rerender(<Avatar {...props} initials="invalid" src="/logo.jpg" />);
    expect(glyph()).not.toBeNull();
    const photo = container.querySelector("img")!;
    expect(photo.getAttribute("data-loaded")).toBe("false");
    fireEvent.load(photo);
    expect(photo.getAttribute("data-loaded")).toBe("true");
    fireEvent.error(photo);
    expect(glyph()).not.toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });
  it("owns one stable accessible name and exposes its host ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container, rerender } = render(<Avatar ref={ref} label="Alex Silva" src="/a.jpg" initials="AS" />);
    expect(screen.getByRole("img", { name: "Alex Silva" })).toBe(ref.current);
    const img = container.querySelector("img")!;
    expect(img.alt).toBe("");
    expect(container.querySelector("button, [tabindex]")).toBeNull();
    fireEvent.error(img);
    expect(screen.getByRole("img").getAttribute("aria-label")).toBe("Alex Silva");
    expect(container.textContent).toBe("AS");
    rerender(<Avatar decorative initials="AS" />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("loads a new source and ignores the outcome of a detached old image without replacing the action", () => {
    const onEdit = vi.fn();
    const { container, rerender } = render(<Avatar label="Edit Alex" editLabel="Edit" onEdit={onEdit} src="/a.jpg" initials="AS" />);
    const action = screen.getByRole("button");
    action.focus();
    const oldImage = container.querySelector("img")!;
    rerender(<Avatar label="Edit Alex" editLabel="Edit" onEdit={onEdit} src="/b.jpg" initials="AS" />);
    const newImage = container.querySelector("img")!;
    expect(newImage).not.toBe(oldImage);
    fireEvent.error(oldImage);
    fireEvent.load(newImage);
    expect(newImage.getAttribute("data-loaded")).toBe("true");
    expect(screen.getByRole("button")).toBe(action);
    expect(document.activeElement).toBe(action);
    fireEvent.error(newImage);
    expect(container.querySelector("img")).toBeNull();
    rerender(<Avatar label="Edit Alex" editLabel="Edit" onEdit={onEdit} src="/a.jpg" initials="AS" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/a.jpg");
    fireEvent.click(action);
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll("button")).toHaveLength(1);
  });

  it("accepts grapheme initials and falls back instead of truncating invalid input", () => {
    const { container, rerender } = render(<Avatar label="Person" initials=" É👩🏽‍💻 " />);
    expect(container.textContent).toBe("É👩🏽‍💻");
    rerender(<Avatar label="Person" initials="ABC" />);
    expect(container.textContent).toBe("");
    expect(container.querySelector('[data-icon-name="general/user-filled"]')).not.toBeNull();
    rerender(<Avatar label="Person" src="  " initials="  " />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector('[data-icon-name="general/user-filled"]')).not.toBeNull();
  });

  it("keeps SM pencil-only with a complete accessible action name", () => {
    const { container } = render(<Avatar size="sm" label="Editar foto de Alex" editLabel="Editar" onEdit={() => {}} />);
    expect(screen.getByRole("button", { name: "Editar foto de Alex" })).toBeTruthy();
    expect(container.textContent).not.toContain("Editar");
    expect(container.querySelector('[data-icon-name="controls/edit"]')).not.toBeNull();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("guards unnamed and XS edit combinations from untyped callers", () => {
    expect(() => render(<Avatar {...({ initials: "AS" } as AvatarProps)} />)).toThrow("accessible label");
    expect(() => render(<Avatar {...({ size: "xs", label: "Edit Alex", editLabel: "Edit", onEdit: () => {} } as unknown as AvatarProps)} />)).toThrow("SM/MD/LG");
  });
});
