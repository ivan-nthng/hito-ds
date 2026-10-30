import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { controlSizes, type ControlSize } from "../control-size";
import { Text } from "../Text/Text";
import { getStoryContent } from "../../storybook/story-content";
import { EditableValue, type EditableValueProps } from "./EditableValue";
import styles from "./EditableValue.stories.module.css";

type StoryState = "disabled" | "editable" | "readOnly";
type EditableValueStoryProps = EditableValueProps & {
  storyState?: StoryState;
};

function ControlledExample(props: EditableValueProps) {
  const [value, setValue] = useState(props.value);
  const revision = useRef(0);
  return (
    <EditableValue
      {...props}
      onCommit={async (nextValue) => {
        const current = ++revision.current;
        await props.onCommit(nextValue);
        if (current === revision.current) setValue(nextValue);
      }}
      value={value}
    />
  );
}

const meta = {
  id: "forms-editable-value",
  title: "Components/Forms/EditableValue",
  component: EditableValue,
  tags: ["test"],
  args: {
    label: "Name",
    onCommit: fn(),
    size: "md",
    storyState: "editable",
    value: "Ivan Petrov",
    width: "hug",
  },
  argTypes: {
    cancelLabel: { control: false, table: { disable: true } },
    clearLabel: { control: false, table: { disable: true } },
    commitErrorMessage: { control: false, table: { disable: true } },
    commitMode: { control: "inline-radio", options: ["explicit", "change"], table: { category: "Behavior" } },
    commitOnBlur: { control: "boolean", table: { category: "Behavior" } },
    type: { control: "select", options: ["text", "email", "tel"], table: { category: "Behavior" } },
    autoComplete: { control: false, table: { disable: true } },
    inputAdapter: { control: false, table: { disable: true } },
    disabled: { control: false, table: { disable: true } },
    editLabel: { control: false, table: { disable: true } },
    emptyValueLabel: { control: false, table: { disable: true } },
    label: { control: "text", table: { category: "Content" } },
    prefix: { control: "text", table: { category: "Content" } },
    onCancel: { control: false, table: { disable: true } },
    onCommit: { control: false, table: { disable: true } },
    onDraftChange: { control: false, table: { disable: true } },
    onEdit: { control: false, table: { disable: true } },
    readOnly: { control: false, table: { disable: true } },
    saveLabel: { control: false, table: { disable: true } },
    savedLabel: { control: false, table: { disable: true } },
    savingLabel: { control: false, table: { disable: true } },
    size: {
      control: "inline-radio",
      options: controlSizes,
      table: { category: "Appearance" },
    },
    storyState: {
      control: "inline-radio",
      options: ["editable", "readOnly", "disabled"],
      table: { category: "State" },
    },
    validate: { control: false, table: { disable: true } },
    value: { control: "text", table: { category: "Content" } },
    width: {
      control: "inline-radio",
      options: ["hug", "fill"],
      table: { category: "Appearance" },
    },
  },
  render: ({ storyState = "editable", ...args }, { globals }) => (
    <div className={styles.measure}>
      <ControlledExample
        {...args}
        cancelLabel={getStoryContent(globals.storyContentProfile).editableValue.cancelLabel}
        disabled={storyState === "disabled"}
        readOnly={storyState === "readOnly"}
      />
    </div>
  ),
} satisfies Meta<EditableValueStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prefix: Story = {
  parameters: { figma: { label: "EditableValue prefix in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9315-300" } },
  args: { label: "Amount", prefix: "R$", value: "150,00", onCommit: fn() },
  render: ({ storyState, ...args }) => <div className={styles.measure}>
    <ControlledExample {...args} disabled={storyState === "disabled"} validate={value => value === "invalid" ? "Check the amount" : undefined} />
    <ControlledExample {...args} label="Empty" value="" />
    <EditableValue {...args} label="Read only" readOnly />
    <EditableValue {...args} label="Disabled" disabled />
  </div>,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Edit Amount" }));
    const input = canvas.getByRole("textbox", { name: "Amount" });
    expect(input).toHaveValue("150,00"); expect(input).not.toHaveAttribute("prefix");
    await userEvent.clear(input); await userEvent.type(input, "175,50{Enter}");
    await waitFor(() => expect(args.onCommit).toHaveBeenCalledWith("175,50"));
    await userEvent.click(canvas.getByRole("button", { name: "Edit Amount" }));
    await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
    expect(canvas.getByRole("textbox", { name: "Amount" })).toHaveValue("");
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(canvas.queryByRole("textbox", { name: "Amount" })).toBeNull());
  },
};

export const Playground: Story = {
  parameters: {
    figma: {
      label: "EditableValue in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8752-66",
    },
  },
  play: async ({ canvas }) => {
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Edit Name" });
    await expect(trigger).toHaveFocus();
    await expect(getComputedStyle(trigger).outlineOffset).toBe("2px");
    trigger.blur();
  },
};

export const EmailKeyboardCommit: Story = {
  parameters: { controls: { disable: true } },
  render: (_args, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    return <div className={styles.stack}>
      <ControlledExample label="Email" value="hello@example.test" type="email" autoComplete="email" commitOnBlur width="fill"
        clearLabel={content.editableValue.clearLabel} saveLabel={content.editableValue.saveLabel} cancelLabel={content.editableValue.cancelLabel} onCommit={fn()} />
      <Button variant="secondary" intent="neutral">{content.editableValue.outsideTarget}</Button>
    </div>;
  },
  play: async ({ canvas, globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: "Edit Email" }));
    const input = canvas.getByRole("textbox", { name: "Email" });
    await expect(input).toHaveAttribute("type", "email");
    await expect(input).toHaveAttribute("autocomplete", "email");
    await userEvent.clear(input); await userEvent.type(input, "updated@example.test");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: content.editableValue.clearLabel })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: content.editableValue.saveLabel })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: content.editableValue.cancelLabel })).toHaveFocus();
    await userEvent.tab();
    await waitFor(() => expect(canvas.queryByRole("textbox")).toBeNull());
    await expect(canvas.getByRole("button", { name: "Edit Email" })).toHaveTextContent("updated@example.test");
    await expect(canvas.getByRole("button", { name: content.editableValue.outsideTarget })).toHaveFocus();
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          EditableValue
        </Text>
        <Text className={styles.secondary} variant="body-base">
          One backdrop-backed label/value editor on the shared control scale.
        </Text>
      </header>
      <section className={styles.stack}>
        {controlSizes.map((size: ControlSize) => (
          <ControlledExample
            key={size}
            label={size.toUpperCase()}
            onCommit={fn()}
            size={size}
            value="Ivan Petrov"
          />
        ))}
        <ControlledExample
          label="Fill"
          onCommit={fn()}
          value="This value uses the available row"
          width="fill"
        />
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    const eyebrow = canvas.getByText("SM");
    const eyebrowStyle = getComputedStyle(eyebrow);
    await expect(eyebrowStyle.fontSize).toBe("10px");
    await expect(eyebrowStyle.lineHeight).toBe("12px");
    await expect(getComputedStyle(eyebrow.parentElement!).alignItems).toBe(
      "baseline",
    );

    for (const size of controlSizes) {
      const label = size.toUpperCase();
      const trigger = canvas.getByRole("button", { name: `Edit ${label}` });
      const root = trigger.closest<HTMLElement>("[data-phase]")!;
      const restHeight = root.getBoundingClientRect().height;
      await userEvent.click(trigger);
      const editor = canvas.getByRole("textbox", { name: label });
      const editorSurface = editor.parentElement!;
      const save = canvas.getByRole("button", { name: "Save" });
      await expect(save).toHaveAttribute("data-size", size);
      await expect(save.getBoundingClientRect().height).toBeCloseTo(
        editorSurface.getBoundingClientRect().height,
        0,
      );
      await expect(root.getBoundingClientRect().height).toBeCloseTo(
        restHeight,
        0,
      );
      await userEvent.keyboard("{Escape}");
    }
  },
};

export const ErrorGap: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => <div className={styles.stack}>
    {controlSizes.map(size => <ControlledExample key={size} size={size} label={size.toUpperCase()}
      value="Ivan Petrov" onCommit={fn()} validate={value => value.trim() ? undefined : "Enter a name."} />)}
  </div>,
  play: async ({ canvas }) => {
    for (const size of controlSizes) {
      const label = size.toUpperCase();
      await userEvent.click(canvas.getByRole("button", { name: `Edit ${label}` }));
      const editor = canvas.getByRole("textbox", { name: label });
      const root = editor.closest<HTMLElement>("[data-phase]")!;
      const save = within(root).getByRole("button", { name: "Save" });
      const row = save.parentElement!;
      await userEvent.clear(editor);
      await waitFor(() => expect(root.getAnimations({ subtree: true }).some(animation => animation.playState === "running")).toBe(false));
      const horizontal = () => [root, editor, save].map(element => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left, width: rect.width };
      });
      const before = horizontal();
      await userEvent.keyboard("{Enter}");
      const error = within(root).getByRole("alert");
      const gap = size === "sm" ? 6 : 8;
      expect(getComputedStyle(error).marginBlockStart).toBe(`${gap}px`);
      expect(error.getBoundingClientRect().top - row.getBoundingClientRect().bottom).toBeCloseTo(gap, 1);
      expect(horizontal()).toEqual(before);
      expect(getComputedStyle(row).columnGap).toBe(`${size === "sm" ? 6 : size === "xl" ? 10 : 8}px`);
      expect(editor).toHaveAttribute("aria-invalid", "true");
      expect(editor).toHaveAttribute("aria-describedby", error.id);
    }
  },
};

export const StatesAndValidation: Story = {
  name: "States & validation",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          States and validation
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Empty, read-only, disabled, and caller-validated values keep one
          anatomy.
        </Text>
      </header>
      <section className={styles.stack}>
        <ControlledExample label="Phone" onCommit={fn()} value="" />
        <ControlledExample
          label="Email"
          onCommit={fn()}
          readOnly
          value="ivan@example.com"
        />
        <ControlledExample
          disabled
          label="Account ID"
          onCommit={fn()}
          value="SAV-2048"
        />
        <ControlledExample
          label="Required name"
          onCommit={fn()}
          validate={(nextValue) =>
            nextValue.trim() ? undefined : "Enter a name."
          }
          value="Ivan Petrov"
        />
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit Required name" }),
    );
    const editor = canvas.getByRole("textbox", { name: "Required name" });
    await userEvent.clear(editor);
    await userEvent.keyboard("{Enter}");
    const error = canvas.getByRole("alert");
    const root = error.closest<HTMLElement>('[data-phase="editing"]');
    await expect(root).not.toBeNull();
    await expect(error.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      root!.getBoundingClientRect().bottom,
    );
  },
};

const outsideCommit = fn();
const internalCommit = fn();

export const InteractionRegression: Story = {
  tags: [
    "!stable",
    "lifecycle-exception",
    "context-matrix",
    "!dev",
    "!autodocs",
    "!manifest",
  ],
  parameters: { controls: { disable: true } },
  render: (_args, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);

    return (
      <section className={styles.regression}>
        <ControlledExample
          clearLabel={content.editableValue.clearLabel}
          data-testid="outside-case"
          editLabel={content.editableValue.editLabel}
          label={content.editableValue.label}
          lang={content.lang}
          onCommit={outsideCommit}
          saveLabel={content.editableValue.saveLabel} cancelLabel={content.editableValue.cancelLabel}
          value={content.editableValue.committedValue}
        />
        <ControlledExample
          clearLabel={content.editableValue.clearLabel}
          data-testid="internal-case"
          editLabel={content.editableValue.nameEditLabel}
          label={content.editableValue.nameLabel}
          lang={content.lang}
          onCommit={internalCommit}
          saveLabel={content.editableValue.saveLabel} cancelLabel={content.editableValue.cancelLabel}
          value={content.editableValue.nameValue}
        />
        <ControlledExample
          clearLabel={content.editableValue.clearLabel}
          data-testid="autosize-case"
          editLabel={content.editableValue.nicknameEditLabel}
          label={content.editableValue.nicknameLabel}
          lang={content.lang}
          onCommit={fn()}
          saveLabel={content.editableValue.saveLabel} cancelLabel={content.editableValue.cancelLabel}
          value={content.inlineEdit.orderDraftShort}
        />
        <ControlledExample
          clearLabel={content.editableValue.clearLabel}
          data-testid="empty-transition-case"
          emptyValueLabel={content.editableValue.emptyLabel}
          label={content.editableValue.phoneLabel}
          lang={content.lang}
          onCommit={fn()}
          saveLabel={content.editableValue.saveLabel} cancelLabel={content.editableValue.cancelLabel}
          size="lg"
          value=""
        />
        <Button
          intent="neutral"
          lang={content.lang}
          size="md"
          variant="secondary"
        >
          {content.editableValue.outsideTarget}
        </Button>
      </section>
    );
  },
  play: async ({ canvas, globals }) => {
    outsideCommit.mockClear();
    internalCommit.mockClear();
    const content = getStoryContent(globals.storyContentProfile);
    const storyCanvas = document.querySelector(
      '[data-hito-story-canvas=""]',
    );
    await expect(storyCanvas).not.toBeNull();
    await expect(storyCanvas).toHaveAttribute("lang", "en");

    const outsideRoot = canvas.getByTestId("outside-case");
    const restSurface = outsideRoot.querySelector(
      '[data-editable-value-surface="true"]',
    );
    const editHint = outsideRoot.querySelector(
      '[data-icon-name="controls/edit"]',
    );
    await expect(restSurface).toBeTruthy();
    await expect(editHint).toBeTruthy();
    await expect(
      canvas
        .getByRole("button", { name: content.editableValue.editLabel })
        .closest("[lang]"),
    ).toHaveAttribute("lang", content.lang);
    const surfaceRect = restSurface!.getBoundingClientRect();
    const hintRect = editHint!.getBoundingClientRect();
    await expect(hintRect.left).toBeGreaterThanOrEqual(surfaceRect.right);
    await userEvent.click(
      canvas.getByRole("button", { name: content.editableValue.editLabel }),
    );
    const outsideEditor = canvas.getByRole("textbox", {
      name: content.editableValue.label,
    });
    await expect(outsideEditor.parentElement).toHaveAttribute(
      "data-appearance",
      "soft",
    );
    await expect(
      canvas.getByRole("button", { name: content.editableValue.saveLabel }),
    ).toHaveAttribute("data-size", "md");
    await userEvent.clear(outsideEditor);
    await userEvent.type(outsideEditor, content.editableValue.draftValue);
    await userEvent.click(
      canvas.getByRole("button", { name: content.editableValue.outsideTarget }),
    );
    await expect(outsideCommit).toHaveBeenCalledTimes(1);
    await expect(outsideCommit).toHaveBeenCalledWith(
      content.editableValue.draftValue,
    );

    const internalRoot = canvas.getByTestId("internal-case");
    await userEvent.click(
      canvas.getByRole("button", {
        name: content.editableValue.nameEditLabel,
      }),
    );
    const internalEditor = canvas.getByRole("textbox", {
      name: content.editableValue.nameLabel,
    });
    const clear = canvas.getByRole("button", {
      name: content.editableValue.clearLabel,
    });
    const inputSurface = internalEditor.parentElement;
    const clearInset =
      inputSurface!.getBoundingClientRect().right -
      clear.getBoundingClientRect().right;
    const expectedInset = Number.parseFloat(
      getComputedStyle(clear).insetInlineEnd,
    );
    await expect(clearInset).toBeCloseTo(expectedInset);
    await userEvent.click(clear);
    await expect(internalCommit).not.toHaveBeenCalled();
    await expect(internalEditor).toHaveFocus();
    await userEvent.type(internalEditor, content.editableValue.nameDraft);
    await userEvent.click(
      canvas.getByRole("button", { name: content.editableValue.saveLabel }),
    );
    await expect(internalCommit).toHaveBeenCalledTimes(1);
    await expect(internalCommit).toHaveBeenCalledWith(
      content.editableValue.nameDraft,
    );
    await expect(internalRoot).toHaveAttribute("data-phase", "rest");

    const autosizeRoot = canvas.getByTestId("autosize-case");
    await userEvent.click(
      canvas.getByRole("button", {
        name: content.editableValue.nicknameEditLabel,
      }),
    );
    const autosizeEditor = canvas.getByRole("textbox", {
      name: content.editableValue.nicknameLabel,
    });
    const autosizeControl = autosizeEditor.parentElement?.parentElement;
    await expect(autosizeControl).toHaveAttribute(
      "data-auto-size-text",
      content.inlineEdit.orderDraftShort,
    );
    const shortWidth = autosizeControl!.getBoundingClientRect().width;
    await userEvent.type(
      autosizeEditor,
      content.editableValue.autosizeDraftLong.slice(
        content.inlineEdit.orderDraftShort.length,
      ),
    );
    const longWidth = autosizeControl!.getBoundingClientRect().width;
    await expect(longWidth).toBeGreaterThan(shortWidth);
    await expect(
      autosizeRoot.getBoundingClientRect().right,
    ).toBeLessThanOrEqual(
      autosizeRoot.parentElement!.getBoundingClientRect().right,
    );
    await expect(
      autosizeRoot.querySelector("[data-auto-size-mirror]"),
    ).toBeNull();

    const emptyRoot = canvas.getByTestId("empty-transition-case");
    const emptyAction = canvas.getByRole("button", {
      name: content.editableValue.emptyLabel,
    });
    const restHeight = emptyRoot.getBoundingClientRect().height;
    await expect(emptyAction).toHaveAttribute("data-size", "lg");
    await userEvent.click(emptyAction);
    const emptyEditor = canvas.getByRole("textbox", {
      name: content.editableValue.phoneLabel,
    });
    const emptyEditorSurface = emptyEditor.parentElement!;
    const emptySave = canvas.getByRole("button", {
      name: content.editableValue.saveLabel,
    });
    await expect(emptySave).toHaveAttribute("data-size", "lg");
    await expect(emptySave.getBoundingClientRect().height).toBeCloseTo(
      emptyEditorSurface.getBoundingClientRect().height,
      0,
    );
    await expect(emptySave.getBoundingClientRect().top).toBeCloseTo(
      emptyEditorSurface.getBoundingClientRect().top,
      0,
    );
    await expect(emptyRoot.getBoundingClientRect().height).toBeCloseTo(
      restHeight,
      0,
    );
    await expect(getComputedStyle(emptySave).color).toBe("rgb(255, 255, 255)");
  },
};
