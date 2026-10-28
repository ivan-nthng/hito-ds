import { createRef } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Alert, type AlertProps } from "../Alert/Alert";
import { InlineMessage } from "../InlineMessage/InlineMessage";

function CompactAlert(props: AlertProps) { return <Alert {...props} size="sm"/>; }

describe.each([Alert, CompactAlert, InlineMessage])("message content", Component => {
  it("rejects empty or icon-only content", () => {
    expect(() => render(<Component body=" "/>)).toThrow("non-empty");
  });
  it("omits absent anatomy, retains text and does not announce static messages", () => {
    const { container } = render(<Component body="Local guidance" icon={false}/>);
    expect(screen.getByText("Local guidance")).toBeTruthy();
    expect(container.querySelector('[data-icon-name],button,[role="alert"],[aria-live="polite"]')).toBeNull();
    expect(container.querySelector('[data-message-kind]')?.hasAttribute('tabindex')).toBe(false);
  });
  it("keeps one announcement path and does not infer urgency from destructive intent", async () => {
    const { container, rerender } = render(<Component body="Failed" intent="destructive"/>);
    expect(container.querySelector('[aria-live]')?.textContent).toBe("");
    rerender(<Component body="Saved" announcement="polite"/>);
    await waitFor(() => expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe("Saved"));
    expect(container.querySelectorAll('[aria-live]')).toHaveLength(1);
    rerender(<Component body="Act now" announcement="assertive"/>);
    await waitFor(() => expect(container.querySelector('[aria-live="assertive"]')?.textContent).toBe("Act now"));
  });
  it("delegates actions and dismissal independently, with optional focus return", async () => {
    const action = vi.fn(), dismiss = vi.fn(), ref = createRef<HTMLButtonElement>();
    render(<><button ref={ref}>Trigger</button><Component title="Review" intent="success" action={{ label: "Act", onClick: action }} dismiss={{ label: "Close", onDismiss: dismiss, returnFocusRef: ref }}/></>);
    fireEvent.click(screen.getByRole("button", { name: "Act" }));
    expect(action).toHaveBeenCalledOnce(); expect(dismiss).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Act" }).getAttribute("data-intent")).toBe("success");
    const close = screen.getByRole("button", { name: "Close" }); close.focus(); fireEvent.click(close);
    expect(dismiss).toHaveBeenCalledOnce();
    await waitFor(() => expect(document.activeElement).toBe(ref.current));
  });
});
