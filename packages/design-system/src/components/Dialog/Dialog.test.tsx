import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

describe("Dialog required anatomy", () => {
  const props = { open: false, title: "Edit details", onDismiss: () => {} };
  it("resolves one visible title and description through fragment composition", () => {
    const { container } = render(<Dialog {...props} description="Review your changes."><>
      <Dialog.Header closeLabel="Close dialog" /><Dialog.Body>Content</Dialog.Body>
    </></Dialog>);
    const dialog = container.querySelector("dialog")!;
    expect(container.querySelectorAll("h2")).toHaveLength(1);
    expect(document.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe(props.title);
    expect(document.getElementById(dialog.getAttribute("aria-describedby")!)?.textContent).toBe("Review your changes.");
    expect(container.querySelector("button")?.getAttribute("aria-label")).toBe("Close dialog");
  });
  it("rejects a missing Header rather than emitting a broken accessible name", () => {
    expect(() => render(<Dialog {...props}><Dialog.Body>Content</Dialog.Body></Dialog>)).toThrow("exactly one direct Header and Body");
  });
  it("rejects duplicate Headers and duplicate naming targets", () => {
    expect(() => render(<Dialog {...props}><Dialog.Header /><Dialog.Header /><Dialog.Body>Content</Dialog.Body></Dialog>)).toThrow("exactly one direct Header and Body");
  });
  it("requires exactly one Body", () => {
    expect(() => render(<Dialog {...props}><Dialog.Header closeLabel="Close" /></Dialog>)).toThrow("exactly one direct Header and Body");
    expect(() => render(<Dialog {...props}><Dialog.Header closeLabel="Close" /><Dialog.Body /><Dialog.Body /></Dialog>)).toThrow("exactly one direct Header and Body");
  });
  it("requires a visible Close when Footer is omitted", () => {
    expect(() => render(<Dialog {...props}><Dialog.Header /><Dialog.Body /></Dialog>)).toThrow("requires a Footer");
    expect(() => render(<Dialog {...props}><Dialog.Header closeLabel="  " /><Dialog.Body /></Dialog>)).toThrow("requires a Footer");
  });
  it("rejects duplicate Footers", () => {
    expect(() => render(<Dialog {...props}><Dialog.Header /><Dialog.Body /><Dialog.Footer /><Dialog.Footer /></Dialog>)).toThrow("at most one Footer");
  });
  it("rejects a blank title", () => {
    expect(() => render(<Dialog {...props} title="  "><Dialog.Header closeLabel="Close" /><Dialog.Body /></Dialog>)).toThrow("non-empty visible title");
  });
});
