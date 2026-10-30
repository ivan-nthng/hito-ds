import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EditableValue, type EditableValueHandle } from "./EditableValue";
import userEvent from "@testing-library/user-event";

function deferredCommit() {
  let resolve!: () => void; let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe("EditableValue explicit Cancel", () => {
  it.each(["Changed", "invalid", ""])("discards %s without blur or outside commit and restores focus", async draft => {
    const user = userEvent.setup(); const onCommit = vi.fn(); const onCancel = vi.fn();
    render(<EditableValue label="Name" value="Confirmed" onCommit={onCommit} onCancel={onCancel}
      commitOnBlur cancelLabel="Discard draft" validate={next => next === "invalid" ? "Invalid" : undefined} />);
    const trigger = screen.getByRole("button", { name: "Edit Name" });
    await user.click(trigger);
    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: draft } });
    if (draft === "invalid") { fireEvent.keyDown(input, { key: "Enter" }); expect(screen.getByRole("alert")).toBeTruthy(); }
    const cancel = screen.getByRole("button", { name: "Discard draft" });
    expect(cancel.getAttribute("data-variant")).toBe("soft");
    expect(cancel.getAttribute("data-intent")).toBe("neutral");
    await user.click(cancel);
    expect(screen.queryByRole("textbox")).toBeNull(); expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: "Edit Name" }).textContent).toContain("Confirmed");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit Name" }));
    expect(onCancel).toHaveBeenCalledOnce(); expect(onCommit).not.toHaveBeenCalled();
  });

  it("allows keyboard Cancel, keeping Clear and Save inside the same blur boundary", async () => {
    const user = userEvent.setup(); const onCommit = vi.fn(); const onCancel = vi.fn();
    render(<EditableValue label="Name" value="Confirmed" onCommit={onCommit} onCancel={onCancel} commitOnBlur />);
    await user.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } });
    await user.tab(); await user.tab(); await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancel" }));
    await user.keyboard("{Enter}");
    expect(onCancel).toHaveBeenCalledOnce(); expect(onCommit).not.toHaveBeenCalled();
  });

  it("disables Cancel during a pending save and can discard a rejected draft", async () => {
    const pending = deferredCommit(); const onCommit = vi.fn(() => pending.promise); const onCancel = vi.fn();
    render(<EditableValue label="Name" value="Confirmed" onCommit={onCommit} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    const cancel = screen.getByRole<HTMLButtonElement>("button", { name: "Cancel" });
    expect(cancel.disabled).toBe(true); fireEvent.click(cancel); expect(onCancel).not.toHaveBeenCalled();
    await act(async () => pending.reject(new Error("Save failed")));
    expect(cancel.disabled).toBe(false); fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledOnce(); expect(onCommit).toHaveBeenCalledExactlyOnceWith("Draft");
    expect(screen.getByText("Confirmed")).toBeTruthy(); expect(screen.queryByRole("alert")).toBeNull();
  });

  it("offers no rollback action in automatic change mode", () => {
    render(<EditableValue label="Name" value="Confirmed" onCommit={vi.fn()} commitMode="change" />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });
});

describe("EditableValue change commits", () => {
  it("validates an enclosing command's Apply, preserving the prefix-free buffer and deduplicating pending Apply", async () => {
    const ref = createRef<EditableValueHandle>(); const pending = deferredCommit(); const onCommit = vi.fn(() => pending.promise);
    render(<EditableValue ref={ref} label="Price" prefix="R$" value="150,00" onCommit={onCommit} validate={value => value === "bad" ? "Invalid amount" : undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Price" }));
    const input = screen.getByRole("textbox", { name: "Price" }) as HTMLInputElement;
    expect(input.value).toBe("150,00");
    fireEvent.change(input, { target: { value: "bad" } });
    let result: boolean | undefined;
    await act(async () => { result = await ref.current!.apply(); });
    expect(result).toBe(false); expect(onCommit).not.toHaveBeenCalled(); expect(ref.current!.dirty).toBe(true);
    fireEvent.change(input, { target: { value: "175,50" } });
    let first!: Promise<boolean>, second!: Promise<boolean>;
    act(() => { first = ref.current!.apply(); second = ref.current!.apply(); });
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("175,50");
    await act(async () => { pending.resolve(); expect(await first).toBe(true); expect(await second).toBe(true); });
    expect(ref.current!.dirty).toBe(false);
  });
  it("follows confirmed autofill in a settled editor without resubmitting or overwriting newer typing", async () => {
    const onCommit = vi.fn();
    const { rerender } = render(<EditableValue label="Street" value="Old street" commitMode="change" onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Street" }));
    const input = screen.getByRole("textbox", { name: "Street" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    await act(async () => undefined);
    rerender(<EditableValue label="Street" value="" commitMode="change" onCommit={onCommit} />);
    rerender(<EditableValue label="Street" value="Autofilled street" commitMode="change" onCommit={onCommit} />);
    expect(input.value).toBe("Autofilled street");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("");
    const pending = deferredCommit(); onCommit.mockReturnValueOnce(pending.promise);
    fireEvent.change(input, { target: { value: "New manual street" } });
    rerender(<EditableValue label="Street" value="Older confirmation" commitMode="change" onCommit={onCommit} />);
    expect(input.value).toBe("New manual street");
    await act(async () => pending.resolve());
  });

  it("commits the valid current draft without Save, Enter or blur", async () => {
    const onCommit = vi.fn(); const onDraftChange = vi.fn();
    render(<EditableValue label="Code" value="" commitMode="change" onCommit={onCommit} onDraftChange={onDraftChange}
      validate={value => value.length === 8 ? undefined : "Use eight digits"} />);
    fireEvent.click(screen.getByRole("button", { name: "Add Code" }));
    const input = screen.getByRole("textbox", { name: "Code" });
    fireEvent.change(input, { target: { value: "1234567" } });
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toBe("Use eight digits");
    fireEvent.change(input, { target: { value: "12345678" } });
    await waitFor(() => expect(onCommit).toHaveBeenCalledExactlyOnceWith("12345678"));
    expect(onDraftChange.mock.calls.map(args => args[0])).toEqual(["1234567", "12345678"]);
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    fireEvent.keyDown(input, { key: "Enter" }); fireEvent.pointerDown(document.body);
    expect(onCommit).toHaveBeenCalledOnce();
  });

  it.each(["resolve", "reject"] as const)("ignores an old %s while newer typing is pending, without stealing focus", async outcome => {
    const first = deferredCommit(); const second = deferredCommit();
    const onCommit = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const { container } = render(<><EditableValue label="Name" value="Original" commitMode="change" onCommit={onCommit} /><button>Elsewhere</button></>);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const input = screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "A" } });
    expect(input.readOnly).toBe(false);
    fireEvent.change(input, { target: { value: "B" } });
    screen.getByRole("button", { name: "Elsewhere" }).focus();
    await act(async () => { if (outcome === "resolve") first.resolve(); else first.reject(new Error("Old failure")); });
    expect(input.value).toBe("B");
    expect(container.querySelector('[data-phase="saving"]')).not.toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
    await act(async () => second.resolve());
    expect(container.querySelector('[data-outcome="saved"]')).not.toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Elsewhere" }));
  });

  it("distinguishes A→B→A revisions and keeps the newest rejection recoverable", async () => {
    const requests = [deferredCommit(), deferredCommit(), deferredCommit()];
    const onCommit = vi.fn().mockReturnValueOnce(requests[0].promise).mockReturnValueOnce(requests[1].promise).mockReturnValueOnce(requests[2].promise);
    const { container } = render(<EditableValue label="Name" value="Original" commitMode="change" onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const input = screen.getByRole("textbox", { name: "Name" });
    for (const value of ["A", "B", "A"]) fireEvent.change(input, { target: { value } });
    await act(async () => { requests[0].resolve(); requests[1].resolve(); });
    expect(container.querySelector('[data-outcome="saved"]')).toBeNull();
    await act(async () => requests[2].reject(new Error("Save failed")));
    expect(screen.getByRole("alert").textContent).toBe("Save failed");
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(container.querySelector('[data-outcome="saved"]')).not.toBeNull());
    expect(onCommit.mock.calls.map(args => args[0])).toEqual(["A", "B", "A", "A"]);
  });

  it("submits IME completion and Clear exactly once, allowing Clear during saving", async () => {
    const pending = deferredCommit(); const onCommit = vi.fn().mockReturnValue(pending.promise); const onDraftChange = vi.fn();
    render(<EditableValue label="Name" value="Original" commitMode="change" onCommit={onCommit} onDraftChange={onDraftChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.compositionStart(input); fireEvent.change(input, { target: { value: "あ" } });
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input); fireEvent.change(input, { target: { value: "あ" } });
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("あ");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onCommit.mock.calls.map(args => args[0])).toEqual(["あ", ""]);
    expect(onDraftChange.mock.calls.map(args => args[0])).toEqual(["あ", ""]);
    await act(async () => pending.resolve());
  });

  it("keeps an Escape draft visible and invalidates unmounted callbacks without claiming a rollback", async () => {
    const first = deferredCommit(); const onCancel = vi.fn(); const onCommit = vi.fn().mockReturnValue(first.promise);
    const { container, rerender } = render(<EditableValue key="first" label="Name" value="Original" commitMode="change" onCommit={onCommit} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: "New" } }); fireEvent.keyDown(input, { key: "Escape" });
    expect((screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value).toBe("New");
    expect(onCancel).not.toHaveBeenCalled();
    rerender(<EditableValue key="next" label="Name" value="Another context" commitMode="change" onCommit={onCommit} />);
    await act(async () => first.resolve());
    expect(container.querySelector('[data-outcome="saved"]')).toBeNull();
  });
});

function ControlledEditableValue({
  onCommit,
}: {
  onCommit?: (value: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState("Ivan Petrov");
  return (
    <EditableValue
      label="Name"
      onCommit={async (nextValue) => {
        await onCommit?.(nextValue);
        setValue(nextValue);
      }}
      value={value}
    />
  );
}

describe("EditableValue", () => {
  it("adapts a typed native input without persisting intermediate formatting", async () => {
    const onCommit = vi.fn();
    render(<EditableValue label="Phone" value="5550100" type="tel" inputMode="tel" autoComplete="tel" onCommit={onCommit}
      inputAdapter={draft => ({ placeholder: "Phone number", onChange: event => draft.onChange(event.currentTarget.value.replace(/\D/g, "")) })} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Phone" }));
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Phone" });
    expect([input.type, input.inputMode, input.autocomplete]).toEqual(["tel", "tel", "tel"]);
    fireEvent.change(input, { target: { value: "555-0101" } });
    expect(input.value).toBe("5550101"); expect(onCommit).not.toHaveBeenCalled();
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => expect(onCommit).toHaveBeenCalledExactlyOnceWith("5550101"));
  });

  it.each([false, true])("commits on leaving the whole field only when opted in (%s)", async commitOnBlur => {
    const onCommit = vi.fn();
    render(<><EditableValue label="Email" value="old@example.test" type="email" autoComplete="email" commitOnBlur={commitOnBlur} onCommit={onCommit} /><button>Next</button></>);
    fireEvent.click(screen.getByRole("button", { name: "Edit Email" }));
    const input = screen.getByRole("textbox", { name: "Email" });
    fireEvent.change(input, { target: { value: "new@example.test" } });
    const clear = screen.getByRole("button", { name: "Clear" });
    fireEvent.blur(input, { relatedTarget: clear });
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.blur(clear, { relatedTarget: screen.getByRole("button", { name: "Next" }) });
    await act(async () => undefined);
    expect(onCommit.mock.calls).toEqual(commitOnBlur ? [["new@example.test"]] : []);
  });

  it("locks uncertain explicit drafts and recognizes the caller's exact confirmed recovery", async () => {
    const onCommit = vi.fn().mockRejectedValue(new Error("Unconfirmed")); const onCancel = vi.fn();
    const field = (value: string, readOnly = false) => <EditableValue label="Email" value={value} readOnly={readOnly} onCommit={onCommit} onCancel={onCancel} />;
    const { rerender } = render(field("old@example.test"));
    fireEvent.click(screen.getByRole("button", { name: "Edit Email" }));
    const input = screen.getByRole<HTMLInputElement>("textbox", { name: "Email" });
    fireEvent.change(input, { target: { value: "new@example.test" } }); fireEvent.keyDown(input, { key: "Enter" });
    await screen.findByRole("alert");
    rerender(field("old@example.test", true));
    expect(input.readOnly).toBe(true);
    fireEvent.keyDown(input, { key: "Escape" }); fireEvent.keyDown(input, { key: "Enter" }); fireEvent.pointerDown(document.body);
    expect(onCancel).not.toHaveBeenCalled(); expect(onCommit).toHaveBeenCalledOnce();
    expect(input.value).toBe("new@example.test");
    rerender(field("new@example.test"));
    expect(screen.queryByRole("textbox")).toBeNull(); expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.getByRole("button", { name: "Edit Email" }).textContent).toContain("new@example.test");
  });

  it("presents a compact label/value chip and enters TextInput", () => {
    render(<ControlledEditableValue />);

    expect(screen.getByText("Name")).toBeTruthy();
    expect(screen.getByText("Ivan Petrov")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));

    const editor = screen.getByRole("textbox", { name: "Name" });
    expect(document.activeElement).toBe(editor);
    expect((editor as HTMLInputElement).value).toBe("Ivan Petrov");
    expect(editor.parentElement?.getAttribute("data-appearance")).toBe("soft");
    expect(
      editor.parentElement?.parentElement?.getAttribute("data-auto-size-text"),
    ).toBe("Ivan Petrov");
  });

  it("updates intrinsic measurement on the existing control wrapper", () => {
    render(<ControlledEditableValue />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    const control = editor.parentElement?.parentElement;

    fireEvent.change(editor, { target: { value: "A longer live draft" } });

    expect(control?.getAttribute("data-auto-size-text")).toBe(
      "A longer live draft",
    );
    expect(document.querySelector("[data-auto-size-mirror]")).toBeNull();
  });

  it("derives the empty Add label without adding another public state", () => {
    render(<EditableValue label="Phone" onCommit={() => undefined} value="" />);

    const emptyAction = screen.getByRole("button", { name: "Add Phone" });
    expect(emptyAction).toBeTruthy();
    expect(
      emptyAction.querySelector('[data-icon-name="controls/plus-s"]'),
    ).toBeTruthy();
  });

  it("hugs by default and exposes fill as the only alternative", () => {
    const { container, rerender } = render(
      <EditableValue
        label="Name"
        onCommit={() => undefined}
        value="Ivan Petrov"
      />,
    );

    expect(container.firstElementChild?.getAttribute("data-width")).toBe("hug");

    rerender(
      <EditableValue
        label="Name"
        onCommit={() => undefined}
        value="Ivan Petrov"
        width="fill"
      />,
    );
    expect(container.firstElementChild?.getAttribute("data-width")).toBe(
      "fill",
    );
  });

  it.each(["sm", "md", "lg", "xl"] as const)(
    "maps the %s size to the shared control lane",
    (size) => {
      const { container } = render(
        <EditableValue
          label="Name"
          onCommit={() => undefined}
          size={size}
          value="Ivan Petrov"
        />,
      );

      expect(container.firstElementChild?.getAttribute("data-size")).toBe(size);
    },
  );

  it("clears only the draft and keeps editing", () => {
    const onCommit = vi.fn();
    const { container } = render(
      <EditableValue label="Name" onCommit={onCommit} value="Ivan Petrov" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const clear = screen.getByRole("button", { name: "Clear" });
    fireEvent.pointerDown(clear);
    fireEvent.click(clear);

    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
    ).toBe("");
    expect(container.firstElementChild?.getAttribute("data-phase")).toBe(
      "editing",
    );
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("keeps the external Save action on the value control size", () => {
    render(
      <EditableValue
        label="Name"
        onCommit={() => undefined}
        size="xl"
        value="Ivan Petrov"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));

    expect(screen.getByRole("button", { name: "Save" }).dataset.size).toBe(
      "xl",
    );
  });

  it("commits with Enter and restores trigger focus", async () => {
    const onCommit = vi.fn();
    render(<ControlledEditableValue onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "Maria Silva" } });
    fireEvent.keyDown(editor, { key: "Enter" });

    await waitFor(() => expect(onCommit).toHaveBeenCalledWith("Maria Silva"));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Edit Name" }),
      ),
    );
  });

  it("cancels with Escape and restores the prior value", () => {
    const onCommit = vi.fn();
    render(
      <EditableValue label="Name" onCommit={onCommit} value="Ivan Petrov" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "Draft" } });
    fireEvent.keyDown(editor, { key: "Escape" });

    expect(screen.getByText("Ivan Petrov")).toBeTruthy();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits exactly once on a real pointer interaction outside", async () => {
    const onCommit = vi.fn();
    render(<ControlledEditableValue onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Ana Costa" },
    });

    fireEvent.pointerDown(document.body);

    await waitFor(() => expect(onCommit).toHaveBeenCalledTimes(1));
    expect(onCommit).toHaveBeenCalledWith("Ana Costa");
  });

  it("does not treat Clear or Save as an outside interaction", async () => {
    const onCommit = vi.fn();
    render(<ControlledEditableValue onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "Internal action" } });

    const clear = screen.getByRole("button", { name: "Clear" });
    fireEvent.pointerDown(clear);
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.change(editor, { target: { value: "Saved internally" } });
    const save = screen.getByRole("button", { name: "Save" });
    fireEvent.pointerDown(save);
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.click(save);

    await waitFor(() => expect(onCommit).toHaveBeenCalledTimes(1));
    expect(onCommit).toHaveBeenCalledWith("Saved internally");
  });

  it("keeps an invalid outside-click draft open and described", () => {
    const onCommit = vi.fn();
    render(
      <EditableValue
        label="Name"
        onCommit={onCommit}
        validate={(nextValue) =>
          nextValue.trim() ? undefined : "Enter a name."
        }
        value="Ivan Petrov"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "" } });
    fireEvent.pointerDown(document.body);

    expect(editor.getAttribute("aria-invalid")).toBe("true");
    expect(editor.getAttribute("aria-describedby")).toBe(
      screen.getByRole("alert").id,
    );
    expect(document.activeElement).toBe(editor);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("keeps a failed async draft and exposes busy state while saving", async () => {
    let rejectCommit: ((reason?: unknown) => void) | undefined;
    const onCommit = vi.fn(
      () =>
        new Promise<void>((_resolve, reject) => {
          rejectCommit = reject;
        }),
    );
    render(
      <EditableValue
        commitErrorMessage="Try again."
        label="Name"
        onCommit={onCommit}
        value="Ivan Petrov"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "Draft value" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(editor.getAttribute("aria-busy")).toBe("true");
    expect(editor.hasAttribute("readonly")).toBe(true);
    rejectCommit?.(new Error("Network failed"));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toBe("Network failed"),
    );
    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
    ).toBe("Draft value");
  });

  it("removes action semantics from disabled and read-only values", () => {
    const { rerender } = render(
      <EditableValue
        disabled
        label="Name"
        onCommit={() => undefined}
        value="Disabled"
      />,
    );
    expect(screen.queryByRole("button", { name: "Edit Name" })).toBeNull();
    expect(screen.getByText("Disabled")).toBeTruthy();

    rerender(
      <EditableValue
        label="Name"
        onCommit={() => undefined}
        readOnly
        value="Read only"
      />,
    );
    expect(screen.queryByRole("button", { name: "Edit Name" })).toBeNull();
    expect(screen.getByText("Read only")).toBeTruthy();
  });
});
