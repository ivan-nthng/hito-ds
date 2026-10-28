import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { InlineEdit, type InlineEditHandle } from "./InlineEdit";

function ControlledInlineEdit({ multiline = false }: { multiline?: boolean }) {
  const [value, setValue] = useState("Morning order");
  return (
    <InlineEdit
      label="Product name"
      multiline={multiline}
      onCommit={setValue}
      value={value}
    />
  );
}

function ExternallyActivatedInlineEdit() {
  const [value, setValue] = useState("Prepared fresh and ready for delivery.");
  const editorRef = useRef<InlineEditHandle>(null);

  return (
    <>
      <button onClick={() => editorRef.current?.edit()} type="button">
        Edit description externally
      </button>
      <InlineEdit
        label="Description"
        multiline
        onCommit={setValue}
        ref={editorRef}
        value={value}
        width="fill"
      />
    </>
  );
}

describe("InlineEdit", () => {
  it("does not apply an unfinished IME composition from a containing form", async () => {
    const ref = createRef<InlineEditHandle>(), onCommit = vi.fn();
    render(<InlineEdit ref={ref} label="Description" multiline value="Original" onCommit={onCommit} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Description" }));
    const input = screen.getByRole("textbox", { name: "Description" });
    fireEvent.compositionStart(input); fireEvent.change(input, { target: { value: "新しい" } });
    await act(async () => { expect(await ref.current!.apply()).toBe(false); });
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.compositionEnd(input, { target: { value: "新しい説明" } });
    await act(async () => { expect(await ref.current!.apply()).toBe(true); });
    expect(onCommit).toHaveBeenCalledExactlyOnceWith("新しい説明");
  });
  it("keeps semantic text in the document and activates from its edit button", () => {
    render(
      <InlineEdit
        headingLevel={1}
        kind="heading"
        label="Product name"
        onCommit={() => undefined}
        value="Morning order"
      />,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      "Morning order",
    );
    fireEvent.keyDown(
      screen.getByRole("button", { name: "Edit Product name" }),
      { key: "F2" },
    );
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Product name" }),
    );
  });

  it("commits a single line with Enter and returns focus to the trigger", async () => {
    render(<ControlledInlineEdit />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));
    const editor = screen.getByRole("textbox", { name: "Product name" });
    fireEvent.change(editor, { target: { value: "Evening order" } });
    fireEvent.keyDown(editor, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Evening order")).toBeTruthy();
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Edit Product name" }),
      );
    });
  });

  it("cancels with Escape and never commits on blur", () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit label="Name" onCommit={onCommit} value="Original name" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "Draft name" } });
    fireEvent.blur(editor);
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.keyDown(editor, { key: "Escape" });
    expect(screen.getByText("Original name")).toBeTruthy();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("commits exactly once on a real pointer interaction outside", async () => {
    const onCommit = vi.fn();
    render(
      <>
        <InlineEdit label="Name" onCommit={onCommit} value="Original name" />
        <button type="button">Outside target</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Updated name" },
    });

    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Outside target" }),
    );

    await waitFor(() => expect(onCommit).toHaveBeenCalledTimes(1));
    expect(onCommit).toHaveBeenCalledWith("Updated name");
  });

  it("keeps the empty label visible as the native editor placeholder", () => {
    render(
      <InlineEdit
        emptyValueLabel="Add product name"
        label="Product name"
        onCommit={() => undefined}
        value=""
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));

    expect(
      screen.getByPlaceholderText("Add product name").getAttribute("value"),
    ).toBe("");
  });

  it("marks an empty rest value as a placeholder and never as saved", async () => {
    const { container } = render(
      <InlineEdit
        emptyValueLabel="Add product name"
        label="Product name"
        onCommit={() => undefined}
        value=""
      />,
    );
    const root = container.firstElementChild;
    expect(root?.getAttribute("data-empty")).toBe("true");
    expect(
      root?.querySelector('[data-icon-name="controls/edit"]'),
    ).toBeTruthy();
    expect(
      root?.querySelector('[data-icon-name="general/check"][data-size="sm"]'),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Product name" }), {
      key: "Enter",
    });

    await waitFor(() =>
      expect(root?.getAttribute("data-outcome")).toBe("saved"),
    );
    expect(
      root?.querySelector('[data-icon-name="general/check"][data-size="sm"]'),
    ).toBeNull();
  });

  it("uses the Design System TextInput frame for a single-line editor", () => {
    render(
      <InlineEdit
        headingSize="lg"
        kind="heading"
        label="Product name"
        onCommit={() => undefined}
        value="Morning order"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));

    const editor = screen.getByRole("textbox", { name: "Product name" });
    expect(editor.parentElement?.getAttribute("data-appearance")).toBe("soft");
    expect(editor.parentElement?.getAttribute("data-size")).toBe("xl");
  });

  it("updates intrinsic measurement from the live single-line draft", () => {
    const { container } = render(<ControlledInlineEdit />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));
    const editor = screen.getByRole("textbox", { name: "Product name" });
    const field = container.querySelector("[data-auto-size-text]");

    expect(field?.getAttribute("data-auto-size-text")).toBe("Morning order");
    fireEvent.change(editor, {
      target: { value: "A considerably longer editable value" },
    });
    expect(field?.getAttribute("data-auto-size-text")).toBe(
      "A considerably longer editable value",
    );
    expect(field?.getAttribute("data-auto-size-type")).toBe("single-line");
  });

  it("updates multiline measurement from the live draft", () => {
    const { container } = render(<ControlledInlineEdit multiline />);
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));
    const editor = screen.getByRole("textbox", { name: "Product name" });
    const field = container.querySelector("[data-auto-size-text]");

    fireEvent.change(editor, {
      target: { value: "First line\nSecond line\n" },
    });

    expect(field?.getAttribute("data-auto-size-text")).toBe(
      "First line\nSecond line\n",
    );
    expect(field?.getAttribute("data-auto-size-type")).toBe("multiline");
  });

  it("clears the draft without committing or leaving edit mode", () => {
    const onCommit = vi.fn();
    const { container } = render(
      <InlineEdit label="Name" onCommit={onCommit} value="Original name" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));

    expect(
      (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement).value,
    ).toBe("");
    expect(container.firstElementChild?.getAttribute("data-phase")).toBe(
      "editing",
    );
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("keeps an invalid draft open and connects its message", () => {
    render(
      <InlineEdit
        label="Name"
        onCommit={() => undefined}
        validate={(nextValue) =>
          nextValue.trim() ? undefined : "Enter a product name."
        }
        value="Morning order"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    const editor = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(editor, { target: { value: "" } });
    fireEvent.keyDown(editor, { key: "Enter" });

    const error = document.getElementById(
      editor.getAttribute("aria-describedby") ?? "",
    );
    expect(error?.textContent).toBe("Enter a product name.");
    expect(editor.getAttribute("aria-invalid")).toBe("true");
    expect(editor.getAttribute("aria-describedby")).toBe(error?.id);
    expect(document.activeElement).toBe(editor);
  });

  it("uses an explicit shortcut for multiline commit", async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        label="Description"
        multiline
        onCommit={onCommit}
        value="Original"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Description" }));
    const editor = screen.getByRole("textbox", { name: "Description" });
    fireEvent.change(editor, { target: { value: "Two lines" } });
    fireEvent.keyDown(editor, { key: "Enter" });
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.keyDown(editor, { ctrlKey: true, key: "Enter" });
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith("Two lines"));
  });

  it("uses semantic paragraph rest content and the canonical Textarea editor", () => {
    render(<ControlledInlineEdit multiline />);

    expect(
      screen
        .getAllByText("Morning order")
        .find((element) => element.tagName === "P"),
    ).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));

    const editor = screen.getByRole("textbox", { name: "Product name" });
    expect(editor.tagName).toBe("TEXTAREA");
    expect(editor.getAttribute("data-appearance")).toBe("soft");
    expect(editor.getAttribute("data-size")).toBe("md");
  });

  it("opens from external state and restores focus to the external action", async () => {
    render(<ExternallyActivatedInlineEdit />);
    const externalAction = screen.getByRole("button", {
      name: "Edit description externally",
    });

    externalAction.focus();
    fireEvent.click(externalAction);
    const editor = screen.getByRole("textbox", { name: "Description" });
    await waitFor(() => expect(document.activeElement).toBe(editor));

    fireEvent.keyDown(editor, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(externalAction));
    expect(
      screen
        .getAllByText("Prepared fresh and ready for delivery.")
        .find((element) => element.tagName === "P"),
    ).toBeDefined();
  });

  it("does not enter external editing while disabled", () => {
    const editorRef = createRef<InlineEditHandle>();
    const { container } = render(
      <InlineEdit
        disabled
        label="Description"
        onCommit={() => undefined}
        ref={editorRef}
        value="Original description"
      />,
    );

    editorRef.current?.edit();

    expect(container.firstElementChild?.getAttribute("data-phase")).toBe(
      "rest",
    );
  });

  it.each([
    ["sm", "sm"],
    ["md", "md"],
    ["lg", "lg"],
    ["xl", "xl"],
  ] as const)(
    "maps the %s body size to matching control geometry",
    (bodySize, expectedSize) => {
      const { container } = render(
        <InlineEdit
          bodySize={bodySize}
          label="Name"
          onCommit={() => undefined}
          value="Morning order"
        />,
      );

      expect(container.firstElementChild?.getAttribute("data-size")).toBe(
        expectedSize,
      );
    },
  );

  it.each([
    ["sm", "lg"],
    ["lg", "xl"],
  ] as const)(
    "maps the %s heading size to stable action geometry",
    (headingSize, expectedSize) => {
      const { container } = render(
        <InlineEdit
          headingSize={headingSize}
          kind="heading"
          label="Name"
          onCommit={() => undefined}
          value="Morning order"
        />,
      );

      expect(container.firstElementChild?.getAttribute("data-size")).toBe(
        expectedSize,
      );
    },
  );

  it.each(["sm", "lg"] as const)(
    "keeps the %s heading Save action at MD and aligned independently",
    (headingSize) => {
      render(
        <InlineEdit
          headingSize={headingSize}
          kind="heading"
          label="Name"
          onCommit={() => undefined}
          showSaveAction
          value="Morning order"
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));

      expect(
        screen.getByRole("button", { name: "Save" }).getAttribute("data-size"),
      ).toBe("md");
    },
  );

  it("omits confirmation UI by default and keeps the pencil after save", async () => {
    const { container } = render(<ControlledInlineEdit />);

    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(
      container.querySelector('[data-editable-text-editor="true"]'),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Edit Product name" }));
    expect(
      container.querySelector('[data-editable-text-editor="true"]'),
    ).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Product name" }), {
      key: "Enter",
    });

    await waitFor(() =>
      expect(container.firstElementChild?.getAttribute("data-outcome")).toBe(
        "saved",
      ),
    );
    expect(
      container.querySelector('[data-icon-name="controls/edit"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-icon-name="general/check"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-editable-text-editor="true"]'),
    ).toBeNull();
  });

  it("renders the confirmation action only when explicitly requested", () => {
    const { container } = render(
      <InlineEdit
        label="Name"
        onCommit={() => undefined}
        showSaveAction
        value="Morning order"
      />,
    );

    const save = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Save"]',
    );
    expect(save).not.toBeNull();
    expect(save?.getAttribute("aria-hidden")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Edit Name" }));
    expect(save?.getAttribute("aria-hidden")).toBeNull();
  });

  it.each(["disabled", "readOnly"] as const)(
    "does not reserve confirmation geometry while %s",
    (state) => {
      const { container } = render(
        <InlineEdit
          disabled={state === "disabled"}
          label="Name"
          onCommit={() => undefined}
          readOnly={state === "readOnly"}
          showSaveAction
          value="Morning order"
        />,
      );

      expect(
        container.firstElementChild?.getAttribute("data-save-action"),
      ).toBeNull();
      expect(container.querySelector('button[aria-label="Save"]')).toBeNull();
    },
  );

  it("defaults to hug width and admits an explicit fill width", () => {
    const { container, rerender } = render(
      <InlineEdit
        label="Name"
        onCommit={() => undefined}
        value="Morning order"
      />,
    );
    expect(container.firstElementChild?.getAttribute("data-width")).toBe("hug");

    rerender(
      <InlineEdit
        label="Name"
        onCommit={() => undefined}
        value="Morning order"
        width="fill"
      />,
    );
    expect(container.firstElementChild?.getAttribute("data-width")).toBe(
      "fill",
    );
  });

  it("composes a canonical NumberField for backgroundless numeric editing", () => {
    const { container } = render(
      <InlineEdit
        label="Weight"
        onCommit={() => undefined}
        suffix=" kg"
        value={72}
        valueType="number"
      />,
    );

    expect(screen.getByText("72 kg")).toBeTruthy();
    expect(container.firstElementChild?.getAttribute("data-value-type")).toBe(
      "number",
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Weight" }));

    const editor = screen.getByRole("spinbutton", { name: "Weight" });
    expect((editor as HTMLInputElement).value).toBe("72");
    expect(editor.parentElement?.getAttribute("data-appearance")).toBe("soft");
    expect(editor.getAttribute("aria-valuetext")).toBe("72 kg");
  });

  it("commits a localized numeric draft as number or null", async () => {
    const onCommit = vi.fn();
    const { rerender } = render(
      <InlineEdit
        label="Weight"
        locale="pt-BR"
        onCommit={onCommit}
        value={1.5}
        valueType="number"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Weight" }));
    let editor = screen.getByRole("spinbutton", { name: "Weight" });
    fireEvent.change(editor, { target: { value: "2,75" } });
    fireEvent.keyDown(editor, { key: "Enter" });
    await waitFor(() => expect(onCommit).toHaveBeenCalledWith(2.75));

    rerender(
      <InlineEdit
        label="Weight"
        locale="pt-BR"
        onCommit={onCommit}
        value={null}
        valueType="number"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit Weight" }));
    editor = screen.getByRole("spinbutton", { name: "Weight" });
    fireEvent.keyDown(editor, { key: "Enter" });
    await waitFor(() => expect(onCommit).toHaveBeenLastCalledWith(null));
  });

  it("shows the empty label instead of a standalone numeric affix", () => {
    render(
      <InlineEdit
        emptyValueLabel="Add weight"
        label="Weight"
        onCommit={() => undefined}
        suffix=" kg"
        value={null}
        valueType="number"
      />,
    );

    expect(screen.getByText("Add weight")).toBeTruthy();
    expect(screen.queryByText("kg")).toBeNull();
  });

  it("keeps an intermediate numeric draft open and described", async () => {
    const onCommit = vi.fn();
    render(
      <InlineEdit
        invalidNumberMessage="Enter a complete quantity."
        label="Quantity"
        onCommit={onCommit}
        value={4}
        valueType="number"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Quantity" }));
    const editor = screen.getByRole("spinbutton", { name: "Quantity" });
    fireEvent.change(editor, { target: { value: "-" } });
    fireEvent.keyDown(editor, { key: "Enter" });

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Enter a complete quantity.",
    );
    expect(onCommit).not.toHaveBeenCalled();
    expect(screen.getByRole("spinbutton", { name: "Quantity" })).toBeTruthy();
  });

  it("measures zero as content instead of the empty placeholder", () => {
    const { container } = render(
      <InlineEdit
        emptyValueLabel="Add quantity"
        label="Quantity"
        onCommit={() => undefined}
        value={0}
        valueType="number"
      />,
    );

    expect(container.firstElementChild?.getAttribute("data-empty")).toBeNull();
    expect(
      container.querySelector("[data-auto-size-text]")?.getAttribute(
        "data-auto-size-text",
      ),
    ).toBe("0");
  });

  it("updates the quiet numeric width measurement from the live draft", () => {
    const { container } = render(
      <InlineEdit
        label="Quantity"
        onCommit={() => undefined}
        suffix=" kg"
        value={2}
        valueType="number"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit Quantity" }));
    const editor = screen.getByRole("spinbutton", { name: "Quantity" });
    const field = container.querySelector("[data-auto-size-text]");

    fireEvent.change(editor, { target: { value: "12345.75" } });

    expect(field?.getAttribute("data-auto-size-text")).toBe("12345.75 kg");
    expect(field?.getAttribute("data-auto-size-type")).toBe("single-line");
  });
});

it("offers explicit Cancel without committing and restores focus", async () => {
  const onCommit = vi.fn();
  const onCancel = vi.fn();
  render(<InlineEdit label="Comment" multiline value="Original" onCommit={onCommit} onCancel={onCancel} showSaveAction showCancelAction cancelLabel="Discard draft" />);
  expect(screen.queryByRole("button", { name: "Discard draft" })).toBeNull();
  const trigger = screen.getByRole("button", { name: "Edit Comment" });
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Discard draft" }));
  expect(onCommit).not.toHaveBeenCalled();
  expect(onCancel).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(screen.getByText("Original")).toBeTruthy();
});

it("disables explicit Cancel while saving", async () => {
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  const onCommit = vi.fn(() => pending);
  const onCancel = vi.fn();
  render(<InlineEdit label="Comment" value="Original" onCommit={onCommit} onCancel={onCancel} showSaveAction showCancelAction />);
  fireEvent.click(screen.getByRole("button", { name: "Edit Comment" }));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  const save = screen.getByRole("button", { name: "Save" });
  expect(save.getAttribute("aria-busy")).toBe("true");
  expect(save.querySelector("[data-spinner]")).not.toBeNull();
  expect(save.querySelector('[data-icon-name="general/check"]')).toBeNull();
  const cancel = screen.getByRole("button", { name: "Cancel" }) as HTMLButtonElement;
  expect(cancel.disabled).toBe(true);
  fireEvent.click(cancel);
  expect(onCancel).not.toHaveBeenCalled();
  finish();
  await waitFor(() => expect(screen.queryByRole("textbox")).toBeNull());
});

it("opts into one ghost Add trigger and returns to it after cancel", async () => {
  const onCommit = vi.fn();
  render(<InlineEdit bodySize="md" label="Comment" value="" onCommit={onCommit} multiline emptyActionLabel="Add comment" emptyValueLabel="Write a comment" showCancelAction />);
  const add = screen.getByRole("button", { name: "Add comment" });
  expect(add.getAttribute("data-variant")).toBe("ghost");
  expect(add.querySelector('[data-icon-name="controls/plus-s"]')).toBeTruthy();
  add.focus();
  fireEvent.click(add);
  expect(screen.queryByRole("button", { name: "Add comment" })).toBeNull();
  expect(screen.getByRole("textbox").getAttribute("placeholder")).toBe("Write a comment");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Draft" } });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(onCommit).not.toHaveBeenCalled();
  await waitFor(() => expect(document.activeElement).toBe(add));
});

it.each(["disabled", "readOnly"] as const)("preserves the %s boundary with an empty action", state => {
  const onCommit = vi.fn();
  render(<InlineEdit label="Comment" value="" onCommit={onCommit} emptyActionLabel="Add comment" disabled={state === "disabled"} readOnly={state === "readOnly"} showCancelAction />);
  if (state === "disabled") expect((screen.getByRole("button", { name: "Add comment" }) as HTMLButtonElement).disabled).toBe(true);
  else expect(screen.queryByRole("button")).toBeNull();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  expect(onCommit).not.toHaveBeenCalled();
});
