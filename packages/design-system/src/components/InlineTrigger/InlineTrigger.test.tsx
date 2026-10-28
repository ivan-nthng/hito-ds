import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineTrigger } from "../index";
import { Menu } from "../Menu/Menu";

describe("InlineTrigger public boundary", () => {
  it("forwards native button props and its ref while preserving the full label", () => {
    const ref = createRef<HTMLButtonElement>();
    const action = vi.fn();
    const label = "Produção e capacidade da cozinha";

    const { container } = render(
      <InlineTrigger
        data-consumer="kitchen"
        headingSize="sm"
        label={label}
        onClick={action}
        ref={ref}
        width="fill"
      />,
    );

    const trigger = screen.getByRole("button", { name: label });
    fireEvent.click(trigger);

    expect(ref.current).toBe(trigger);
    expect(trigger.getAttribute("type")).toBe("button");
    expect(trigger.getAttribute("data-consumer")).toBe("kitchen");
    expect(trigger.getAttribute("data-heading-size")).toBe("sm");
    expect(trigger.getAttribute("data-size")).toBe("lg");
    expect(trigger.getAttribute("data-width")).toBe("fill");
    expect(action).toHaveBeenCalledOnce();
    expect(
      container.querySelector(
        '[data-icon-name="arrows/compact/down"][data-size="lg"]',
      ),
    ).toBeTruthy();
  });

  it("composes the existing Menu without creating a nested button or open state", () => {
    const change = vi.fn();
    const { container } = render(
      <Menu
        items={[{ id: "hub", label: "Hub" }]}
        label="Choose a service"
        onAction={() => {}}
        onOpenChange={change}
        open={false}
        trigger={<InlineTrigger label="Kitchen" />}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Kitchen" });
    expect(trigger.querySelector("button")).toBeNull();
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(change).toHaveBeenCalledWith(true, "trigger");
  });

  it("keeps a disabled trigger unavailable to Menu activation", () => {
    const change = vi.fn();
    render(
      <Menu
        items={[{ id: "hub", label: "Hub" }]}
        label="Choose a service"
        onAction={() => {}}
        onOpenChange={change}
        open={false}
        trigger={<InlineTrigger disabled label="Kitchen" />}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Kitchen" });
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(change).not.toHaveBeenCalled();
  });

  it("keeps an aria-disabled trigger focusable and blocks Menu activation", () => {
    const change = vi.fn();
    render(
      <Menu
        items={[{ id: "hub", label: "Hub" }]}
        label="Choose a service"
        onAction={() => {}}
        onOpenChange={change}
        open={false}
        trigger={<InlineTrigger aria-disabled label="Kitchen" />}
      />,
    );

    const trigger = screen.getByRole("button", { name: "Kitchen" });
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(document.activeElement).toBe(trigger);
    expect(trigger.hasAttribute("disabled")).toBe(false);
    expect(change).not.toHaveBeenCalled();
  });

  it("rejects an empty visible label", () => {
    expect(() => render(<InlineTrigger label=" " />)).toThrow(
      "non-empty visible label",
    );
  });
});
