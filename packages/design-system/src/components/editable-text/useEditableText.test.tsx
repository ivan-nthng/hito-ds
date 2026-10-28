import { useState } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button/Button";
import { Textarea } from "../Textarea/Textarea";
import { useEditableText } from "./useEditableText";

function Harness({ onCommit, onCancel }: { onCommit: (value: string) => void | Promise<void>; onCancel?: () => void }) {
  const [value, setValue] = useState("Original");
  const { beginEdit, cancel, changeDraft, commit, draft, editorRef, handleEditorKeyDown, isEditing, rootRef, triggerRef } = useEditableText({ value, canEdit: true, multiline: true, commitOnOutsidePointer: true, commitErrorMessage: "Failed", onCancel,
    onCommit: async next => { await onCommit(next); setValue(next); } });
  return <div ref={rootRef}>
    {isEditing ? <>
      <Textarea aria-label="Comment" ref={node => { editorRef.current = node; }} value={draft} onChange={event => changeDraft(event.target.value)} onKeyDown={handleEditorKeyDown} />
      <Button variant="primary" intent="neutral" onClick={() => void commit(true)}>Save</Button>
      {/* Deliberately enabled to exercise the controller's own pending-save guard. */}
      <Button variant="ghost" intent="neutral" onClick={cancel}>Cancel</Button>
    </> : <Button ref={triggerRef} variant="ghost" intent="neutral" onClick={beginEdit}>Edit {value}</Button>}
  </div>;
}

describe("useEditableText explicit cancellation", () => {
  it.each(["button", "Escape"])("discards a draft without saving via %s and restores focus", async method => {
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    render(<Harness onCommit={onCommit} onCancel={onCancel} />);
    const trigger = screen.getByRole("button", { name: "Edit Original" });
    trigger.focus();
    fireEvent.click(trigger);
    const input = screen.getByRole("textbox");
    await waitFor(() => expect(document.activeElement).toBe(input));
    fireEvent.change(input, { target: { value: "Draft" } });
    if (method === "button") fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    else fireEvent.keyDown(input, { key: "Escape" });
    expect(onCommit).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit Original" })));
    fireEvent.click(screen.getByRole("button", { name: "Edit Original" }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Original");
  });

  it("does not cancel or submit twice while a save is pending", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>(done => { resolve = done; });
    const onCommit = vi.fn(() => pending);
    const onCancel = vi.fn();
    render(<Harness onCommit={onCommit} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Original" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Saved" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onCancel).not.toHaveBeenCalled();
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toBe("Saved");
    await act(async () => resolve());
    await waitFor(() => expect(screen.getByRole("button", { name: "Edit Saved" })).toBeTruthy());
  });
});
