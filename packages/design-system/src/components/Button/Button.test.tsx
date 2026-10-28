import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("keeps native on-scrim semantics bounded to ghost/neutral and blocks inactive clicks", () => {
    const action = vi.fn();
    const props = { context: "on-scrim", variant: "ghost", intent: "neutral", icon: "controls/refresh", "aria-label": "Reset", onClick: action } as const;
    const { rerender } = render(<Button {...props} />);
    const button = screen.getByRole("button", { name: "Reset" });
    expect(button.getAttribute("data-hito-color-scheme")).toBe("dark");
    expect(button.getAttribute("data-context")).toBe("on-scrim");
    fireEvent.click(button);
    rerender(<Button {...props} disabled />); fireEvent.click(button);
    rerender(<Button {...props} aria-disabled />); fireEvent.click(button);
    expect(action).toHaveBeenCalledOnce();
    rerender(<Button {...props} variant="primary" />);
    expect(button.hasAttribute("data-context")).toBe(false);
    expect(button.hasAttribute("data-hito-color-scheme")).toBe(false);
  });

  it("keeps one native control and blocks inactive states with the minimum hit area", () => {
    const onClick = vi.fn(), ref = createRef<HTMLButtonElement>();
    const props = { ref, onClick, intent: "neutral", variant: "primary", children: "Add" } as const;
    const { rerender } = render(<Button {...props} />);
    const button = screen.getByRole("button", { name: "Add" });
    expect(button.hasAttribute("data-hit-area")).toBe(false);
    rerender(<Button {...props} hitArea="minimum" />);
    expect(ref.current).toBe(button);
    expect(screen.getAllByRole("button")).toHaveLength(1);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    rerender(<Button {...props} hitArea="minimum" disabled />);
    fireEvent.click(button);
    rerender(<Button {...props} hitArea="minimum" loading />);
    fireEvent.click(button);
    rerender(<Button {...props} hitArea="minimum" aria-disabled />);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBe(button);
  });

  it("renders a native button with safe defaults", () => {
    render(
      <Button intent="accent" variant="primary">
        Save changes
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save changes" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("data-size")).toBe("md");
    expect(button.getAttribute("data-width")).toBe("content");
  });

  it("uses governed decorative icons without changing the accessible name", () => {
    const { container } = render(
      <Button
        intent="neutral"
        leadingIcon="controls/plus-s"
        size="lg"
        variant="secondary"
      >
        Add item
      </Button>,
    );

    expect(screen.getByRole("button", { name: "Add item" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Add item" }).getAttribute(
        "data-icon-position",
      ),
    ).toBe("leading");
    expect(
      container.querySelector('[data-icon-name="controls/plus-s"][data-size="lg"]'),
    ).toBeTruthy();
  });

  it("supports leading and trailing icons together", () => {
    const { container } = render(
      <Button
        intent="success"
        leadingIcon="general/check"
        trailingIcon="arrows/basic/right"
        variant="soft"
      >
        Review order
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Review order" });
    expect(button.getAttribute("data-icon-position")).toBe("both");
    expect(container.querySelectorAll("[data-icon-name]")).toHaveLength(2);
    expect(button.children).toHaveLength(3);
    expect(button.children[0]?.getAttribute("data-icon-name")).toBe(
      "general/check",
    );
    expect(button.children[1]?.textContent).toBe("Review order");
    expect(button.children[2]?.getAttribute("data-icon-name")).toBe(
      "arrows/basic/right",
    );
  });

  it("renders an accessible square icon-only action", () => {
    const { container } = render(
      <Button
        aria-label="Add item"
        icon="controls/plus-s"
        intent="accent"
        variant="primary"
      />,
    );

    const button = screen.getByRole("button", { name: "Add item" });
    expect(button.getAttribute("data-icon-position")).toBe("only");
    expect(container.querySelector('[data-icon-name="controls/plus-s"]')).toBeTruthy();
  });

  it("keeps loading focusable and blocks activation", () => {
    const onClick = vi.fn();
    render(
      <Button intent="destructive" loading onClick={onClick} variant="primary">
        Delete order
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Delete order" });
    fireEvent.click(button);

    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(["sm", "md", "lg", "xl"] as const)(
    "replaces the %s icon with a spinner while loading",
    (size) => {
      const onClick = vi.fn();
      const { container } = render(
        <Button
          aria-label="Save changes"
          icon="general/check"
          intent="success"
          loading
          onClick={onClick}
          size={size}
          variant="primary"
        />,
      );

      const button = screen.getByRole("button", { name: "Save changes" });
      button.focus();
      fireEvent.click(button);

      expect(button.getAttribute("data-icon-position")).toBe("only");
      expect(button.getAttribute("data-size")).toBe(size);
      expect(button.getAttribute("aria-busy")).toBe("true");
      expect(button.getAttribute("aria-disabled")).toBe("true");
      expect(document.activeElement).toBe(button);
      expect(container.querySelector('[data-icon-name="general/check"]')).toBeNull();
      expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it("keeps an aria-disabled action focusable and blocks activation", () => {
    const onClick = vi.fn();
    render(
      <Button
        aria-disabled
        intent="neutral"
        onClick={onClick}
        variant="secondary"
      >
        Reset to baseline
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Reset to baseline" });
    button.focus();
    fireEvent.click(button);

    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(document.activeElement).toBe(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("uses native disabled semantics", () => {
    render(
      <Button disabled intent="neutral" variant="ghost">
        Disabled action
      </Button>,
    );

    expect(
      screen.getByRole("button", { name: "Disabled action" }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("exposes soft as a treatment without changing button semantics", () => {
    render(
      <Button intent="accent" trailingIcon="arrows/basic/right" variant="soft">
        Review order
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Review order" });
    expect(button.getAttribute("data-variant")).toBe("soft");
    expect(button.getAttribute("data-icon-position")).toBe("trailing");
  });
});
