import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AlertDialog } from "./AlertDialog";

describe("AlertDialog required decision anatomy", () => {
  const props = { open: false, title: "Discard draft?", description: "Unsaved text will be discarded.", cancelLabel: "Cancel", confirmLabel: "Discard", onCancel: () => {}, onConfirm: () => {} };
  it("always names the consequence and puts safe Cancel before Confirm", () => {
    const { container } = render(<AlertDialog {...props} confirmIntent="destructive"><p>Supporting context.</p></AlertDialog>);
    const dialog = container.querySelector("dialog")!;
    expect(dialog.getAttribute("role")).toBe("alertdialog");
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe(props.title);
    expect(document.getElementById(dialog.getAttribute("aria-describedby")!)?.textContent).toBe(props.description);
    const actions = [...container.querySelectorAll("button")];
    expect(actions.map(button => button.textContent)).toEqual(["Cancel", "Discard"]);
    expect(actions[0].getAttribute("data-intent")).toBe("neutral");
    expect(actions[1].getAttribute("data-intent")).toBe("destructive");
    expect(container.querySelector("header button")).toBeNull();
  });
  for (const key of ["title", "description", "cancelLabel", "confirmLabel"] as const) {
    it(`rejects empty ${key}`, () => {
      expect(() => render(<AlertDialog {...props} {...{ [key]: "  " }} />)).toThrow(`non-empty ${key}`);
    });
  }
  it("rejects indistinguishable action labels", () => {
    expect(() => render(<AlertDialog {...props} confirmLabel=" cancel " />)).toThrow("distinct Cancel and Confirm labels");
  });
});
