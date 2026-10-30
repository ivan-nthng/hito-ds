import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { getStoryContent } from "../../storybook/story-content";
import {
  InlineEdit,
  type InlineEditHandle,
  type InlineEditProps,
} from "./InlineEdit";
import styles from "./InlineEdit.stories.module.css";

const bodySizes = ["sm", "md", "lg", "xl"] as const;
const headingSizes = ["sm", "lg"] as const;
type InlineEditStoryState = "disabled" | "editable" | "readOnly";
type InlineEditStoryProps = InlineEditProps & {
  storyState?: InlineEditStoryState;
};
type InlineEditNumberProps = Extract<
  InlineEditProps,
  { valueType: "number" }
>;
type InlineEditTextProps = Exclude<InlineEditProps, InlineEditNumberProps>;

function ControlledTextExample(props: InlineEditTextProps) {
  const [value, setValue] = useState(props.value);
  return (
    <InlineEdit
      {...props}
      onCommit={async (nextValue: string) => {
        await props.onCommit(nextValue);
        setValue(nextValue);
      }}
      value={value}
    />
  );
}

function ControlledNumberExample(props: InlineEditNumberProps) {
  const [value, setValue] = useState(props.value);
  return (
    <InlineEdit
      {...props}
      onCommit={async (nextValue: number | null) => {
        await props.onCommit(nextValue);
        setValue(nextValue);
      }}
      value={value}
    />
  );
}

function ControlledExample(props: InlineEditProps) {
  return props.valueType === "number" ? (
    <ControlledNumberExample {...props} />
  ) : (
    <ControlledTextExample {...props} />
  );
}

function ExternalActivationExample() {
  const [value, setValue] = useState("Prepared fresh and ready for delivery.");
  const editorRef = useRef<InlineEditHandle>(null);

  return (
    <>
      <Button
        intent="neutral"
        onClick={() => editorRef.current?.edit()}
        size="md"
        variant="secondary"
      >
        Edit description externally
      </Button>
      <InlineEdit
        label="External description"
        multiline
        onCommit={setValue}
        ref={editorRef}
        value={value}
        width="fill"
      />
    </>
  );
}

const meta = {
  id: "forms-inline-edit",
  title: "Components/Forms/InlineEdit",
  component: InlineEdit,
  tags: ["test"],
  parameters: {
    controls: {
      include: [
        "bodySize",
        "headingLevel",
        "headingSize",
        "kind",
        "multiline",
        "showSaveAction",
        "showCancelAction",
        "emptyActionLabel",
        "storyState",
        "value",
        "width",
      ],
    },
  },
  args: {
    bodySize: "md",
    kind: "body",
    label: "Product name",
    multiline: false,
    onCommit: fn(),
    showSaveAction: false,
    showCancelAction: false,
    storyState: "editable",
    value: "Morning order",
    width: "hug",
  },
  argTypes: {
    bodySize: {
      control: "inline-radio",
      if: { arg: "kind", eq: "body" },
      options: bodySizes,
      table: { category: "Appearance" },
    },
    headingLevel: {
      control: "inline-radio",
      if: { arg: "kind", eq: "heading" },
      options: [1, 2, 3, 4, 5, 6],
      table: { category: "Content" },
    },
    headingSize: {
      control: "inline-radio",
      if: { arg: "kind", eq: "heading" },
      options: headingSizes,
      table: { category: "Appearance" },
    },
    kind: {
      control: "inline-radio",
      options: ["body", "heading"],
      table: { category: "Appearance" },
    },
    multiline: {
      control: "boolean",
      if: { arg: "kind", eq: "body" },
      table: { category: "Content" },
    },
    showSaveAction: {
      control: "boolean",
      table: { category: "Behavior" },
    },
    showCancelAction: { control: "boolean", table: { category: "Behavior" } },
    emptyActionLabel: { control: "text", table: { category: "Content" }, description: "Optional ghost Add action for an empty value; emptyValueLabel remains the editor placeholder." },
    storyState: {
      control: "inline-radio",
      options: ["editable", "readOnly", "disabled"],
      table: { category: "State" },
    },
    value: { control: "text", table: { category: "Content" } },
    width: {
      control: "inline-radio",
      options: ["hug", "fill"],
      table: { category: "Appearance" },
    },
  },
  render: ({ storyState = "editable", ...args }) => {
    const stateProps = {
      disabled: storyState === "disabled",
      readOnly: storyState === "readOnly",
    };

    return (
      <div className={styles.measure}>
        <ControlledExample {...args} {...stateProps} />
      </div>
    );
  },
} satisfies Meta<InlineEditStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "InlineEdit in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8769-34",
    },
  },
  play: async ({ canvas }) => {
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Edit Product name" });
    await expect(trigger).toHaveFocus();
    const focusStyle = getComputedStyle(trigger);
    await expect(focusStyle.outlineWidth).toBe("2px");
    await expect(focusStyle.outlineOffset).toBe("2px");
  },
};

export const TypographyAndWidths: Story = {
  name: "Typography & widths",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          InlineEdit
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Semantic text at rest; live drafts resize within their parent.
        </Text>
      </header>
      <section className={styles.stack}>
        <ControlledExample
          data-testid="heading-example"
          headingSize="lg"
          kind="heading"
          label="Product name"
          onCommit={fn()}
          showSaveAction
          value="Morning order"
        />
        <ControlledExample
          label="Customer name"
          onCommit={fn()}
          value="Ivan Petrov"
        />
        <ControlledExample
          label="Description"
          multiline
          onCommit={fn()}
          value="Prepared fresh and ready for delivery."
          width="fill"
        />
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    await document.fonts.ready;
    const fillTrigger = canvas.getByRole("button", {
      name: "Edit Description",
    });
    const fillRoot = fillTrigger.closest<HTMLElement>('[data-width="fill"]');
    const fillField = fillTrigger.parentElement;
    const fillText = canvas
      .getAllByText("Prepared fresh and ready for delivery.")
      .find((element) => element.tagName === "P");
    const fillIcon = fillField?.querySelector<HTMLElement>(
      '[data-icon-name="controls/edit"]',
    );
    await expect(fillRoot).not.toBeNull();
    await expect(fillIcon).not.toBeNull();
    await expect(fillText).toBeDefined();
    const trailingPadding = Number.parseFloat(
      getComputedStyle(fillIcon!).insetInlineEnd,
    );
    await expect(
      fillField!.getBoundingClientRect().right -
        fillIcon!.getBoundingClientRect().right,
    ).toBeCloseTo(trailingPadding);

    const hoverBefore = fillRoot!.getBoundingClientRect();
    await userEvent.hover(fillTrigger);
    const hoverAfter = fillRoot!.getBoundingClientRect();
    const hoverBackdrop = getComputedStyle(fillField!, "::before");
    await expect(hoverAfter.width).toBeCloseTo(hoverBefore.width);
    await expect(hoverAfter.height).toBeCloseTo(hoverBefore.height);
    await expect(hoverBackdrop.position).toBe("absolute");
    await expect(hoverBackdrop.pointerEvents).toBe("none");
    await expect(hoverBackdrop.transitionProperty).toContain(
      "background-color",
    );
    await userEvent.unhover(fillTrigger);

    const example = canvas.getByTestId("heading-example");
    const headingText = canvas.getByRole("heading", {
      level: 2,
      name: "Morning order",
    });
    const headingTextRect = headingText.getBoundingClientRect();
    const headingTextStyle = getComputedStyle(headingText);
    const before = example.getBoundingClientRect();
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit Product name" }),
    );
    const after = example.getBoundingClientRect();
    await expect(after.width).toBe(before.width);
    await expect(after.height).toBe(before.height);
    const headingEditor = canvas.getByRole("textbox", { name: "Product name" });
    await expect(headingEditor).toHaveFocus();
    const headingEditorRect = headingEditor.getBoundingClientRect();
    const headingEditorStyle = getComputedStyle(headingEditor);
    await expect(headingEditorRect.left).toBeCloseTo(headingTextRect.left);
    await expect(headingEditorRect.top).toBeCloseTo(headingTextRect.top);
    await expect(headingEditorRect.height).toBeCloseTo(headingTextRect.height);
    await expect(headingEditorStyle.fontFamily).toBe(
      headingTextStyle.fontFamily,
    );
    await expect(headingEditorStyle.fontSize).toBe(headingTextStyle.fontSize);
    await expect(headingEditorStyle.lineHeight).toBe(
      headingTextStyle.lineHeight,
    );
    await expect(headingEditorStyle.letterSpacing).toBe(
      headingTextStyle.letterSpacing,
    );
    await expect(headingEditor.parentElement).toHaveAttribute(
      "data-appearance",
      "soft",
    );
    await expect(canvas.getByRole("button", { name: "Save" })).toHaveAttribute(
      "data-size",
      "md",
    );
    await userEvent.clear(headingEditor);
    await expect(headingEditor).toHaveAttribute("placeholder", "Add value");
    await userEvent.keyboard("{Escape}");

    const fillBefore = fillRoot!.getBoundingClientRect();
    const fillFieldBefore = fillField!.getBoundingClientRect();
    const fillTextRect = fillText!.getBoundingClientRect();
    await userEvent.click(fillTrigger);
    const fillAfter = fillRoot!.getBoundingClientRect();
    const fillEditor = canvas.getByRole("textbox", { name: "Description" });
    const fillEditorField = fillEditor.closest<HTMLElement>(
      "[data-auto-size-text]",
    );
    await expect(fillEditorField).not.toBeNull();
    const fillEditorFieldRect = fillEditorField!.getBoundingClientRect();
    const fillEditorRect = fillEditor.getBoundingClientRect();
    const fillEditorStyle = getComputedStyle(fillEditor);
    await expect(fillAfter.width).toBeCloseTo(fillBefore.width);
    await expect(fillAfter.height).toBeCloseTo(fillBefore.height);
    await expect(
      fillEditorRect.left +
        Number.parseFloat(fillEditorStyle.paddingInlineStart) -
        fillEditorFieldRect.left,
    ).toBeCloseTo(fillTextRect.left - fillFieldBefore.left);
    await expect(
      fillEditorRect.top +
        Number.parseFloat(fillEditorStyle.paddingBlockStart) -
        fillEditorFieldRect.top,
    ).toBeCloseTo(fillTextRect.top - fillFieldBefore.top);
    await userEvent.keyboard("{Escape}");
  },
};

const outsideCommit = fn();

export const LayoutRegression: Story = {
  tags: [
    "!stable",
    "lifecycle-exception",
    "context-matrix",
    "!dev",
    "!autodocs",
    "!manifest",
  ],
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "narrow" },
  },
  render: (_args, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);

    return (
      <section className={styles.layoutRegression}>
        <ControlledExample
          clearLabel={content.inlineEdit.clearHeading}
          data-testid="localized-en"
          editLabel={content.inlineEdit.editHeading}
          headingSize="sm"
          kind="heading"
          label={content.inlineEdit.headingLabel}
          lang={content.lang}
          onCommit={fn()}
          saveLabel={content.inlineEdit.saveHeading}
          showSaveAction
          value={content.inlineEdit.heading}
          width="hug"
        />
        <ControlledExample
          clearLabel={content.inlineEdit.clearDescription}
          data-testid="localized-pt"
          editLabel={content.inlineEdit.editDescription}
          label={content.inlineEdit.descriptionLabel}
          lang={content.lang}
          multiline
          onCommit={fn()}
          saveLabel={content.inlineEdit.saveDescription}
          showSaveAction
          validate={(nextValue) =>
            nextValue.trim()
              ? undefined
              : content.inlineEdit.validationMessage
          }
          value={content.inlineEdit.description}
          width="fill"
        />
        <ControlledExample
          data-testid="outside-inline"
          editLabel={content.inlineEdit.editOrder}
          label={content.inlineEdit.orderLabel}
          lang={content.lang}
          onCommit={outsideCommit}
          // Fixture-only: neutralize CSS Grid's default stretch so hug-width
          // growth remains observable without changing component behavior.
          style={{ justifySelf: "start" }}
          value={content.inlineEdit.orderValue}
        />
        <Button
          intent="neutral"
          lang={content.lang}
          size="md"
          variant="secondary"
        >
          {content.inlineEdit.outsideTarget}
        </Button>
        <ExternalActivationExample />
        <ControlledExample
          data-testid="disabled-confirmation-geometry"
          disabled
          label="Disabled confirmation"
          lang="en"
          onCommit={fn()}
          showSaveAction
          value="Unavailable"
        />
        <ControlledExample
          data-testid="readonly-confirmation-geometry"
          label="Read-only confirmation"
          lang="en"
          onCommit={fn()}
          readOnly
          showSaveAction
          value="Reference"
        />
      </section>
    );
  },
  play: async ({ canvas, globals }) => {
    await document.fonts.ready;
    const content = getStoryContent(globals.storyContentProfile);

    if (
      globals.proofContext === "primary" ||
      globals.proofContext === "matrix"
    ) {
      const isMatrix = globals.proofContext === "matrix";
      const storyCanvas = document.querySelector(
        '[data-hito-story-canvas=""]',
      );
      await expect(storyCanvas).not.toBeNull();
      await expect(storyCanvas).toHaveAttribute("lang", "en");
      await expect(storyCanvas).toHaveAttribute(
        "data-hito-color-scheme",
        isMatrix ? "dark" : "light",
      );
      await expect(storyCanvas).toHaveAttribute(
        "data-hito-story-content",
        isMatrix ? "pt-long" : "en-short",
      );
      await expect(window.innerWidth).toBe(isMatrix ? 320 : 1024);
      await expect(
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      ).toBe(isMatrix);
    }

    await expect(canvas.getByText(content.inlineEdit.heading)).toBeVisible();
    const enRoot = canvas.getByTestId("localized-en");
    await expect(enRoot).toHaveAttribute("lang", content.lang);
    const enBefore = enRoot.getBoundingClientRect();
    await userEvent.click(
      canvas.getByRole("button", { name: content.inlineEdit.editHeading }),
    );
    const enAfter = enRoot.getBoundingClientRect();
    await expect(enAfter.width).toBeCloseTo(enBefore.width);
    await expect(enAfter.height).toBeCloseTo(enBefore.height);
    await expect(
      canvas.getByRole("button", { name: content.inlineEdit.saveHeading }),
    ).toBeVisible();
    const enClear = canvas.getByRole("button", {
      name: content.inlineEdit.clearHeading,
    });
    await expect(enClear).toBeVisible();
    const enField = canvas.getByRole("textbox", {
      name: content.inlineEdit.headingLabel,
    }).parentElement?.parentElement;
    await expect(enField).not.toBeNull();
    const enFieldRect = enField!.getBoundingClientRect();
    const enClearRect = enClear.getBoundingClientRect();
    const enClearInset = Number.parseFloat(
      getComputedStyle(enClear).insetInlineEnd,
    );
    await expect(enFieldRect.right - enClearRect.right).toBeCloseTo(
      enClearInset,
    );
    await expect(enClearRect.top + enClearRect.height / 2).toBeCloseTo(
      enFieldRect.top + enFieldRect.height / 2,
    );
    await userEvent.keyboard("{Escape}");

    const ptRoot = canvas.getByTestId("localized-pt");
    const ptText = ptRoot.querySelector<HTMLElement>("p");
    const ptField =
      ptRoot.querySelector<HTMLElement>("[data-auto-size-text]") ??
      canvas.getByRole("button", {
        name: content.inlineEdit.editDescription,
      }).parentElement;
    const ptRestIcon = ptRoot.querySelector<HTMLElement>(
      '[data-icon-name="controls/edit"]',
    );
    await expect(ptText).not.toBeNull();
    await expect(ptField).not.toBeNull();
    await expect(ptRestIcon).not.toBeNull();
    const ptRestIconRect = ptRestIcon!.getBoundingClientRect();
    const ptRestIconCenter = ptRestIconRect.top + ptRestIconRect.height / 2;
    const ptTextStyle = getComputedStyle(ptText!);
    const ptLineHeight = Number.parseFloat(ptTextStyle.lineHeight);
    const ptFieldRect = ptField!.getBoundingClientRect();
    const ptTextRect = ptText!.getBoundingClientRect();
    const expectedBlockInset =
      (Number.parseFloat(getComputedStyle(ptField!).minBlockSize) -
        ptLineHeight) /
      2;
    await expect(ptTextStyle.whiteSpace).toBe("pre-wrap");
    await expect(ptText!.textContent).toContain("\n");
    await expect(ptTextRect.top - ptFieldRect.top).toBeCloseTo(
      expectedBlockInset,
      1,
    );
    await expect(ptFieldRect.bottom - ptTextRect.bottom).toBeCloseTo(
      expectedBlockInset,
      1,
    );
    await expect(ptText!.getBoundingClientRect().height).toBeGreaterThan(
      ptLineHeight,
    );
    await expect(ptText!.scrollWidth).toBeLessThanOrEqual(
      ptText!.clientWidth + 1,
    );

    const ptBefore = ptRoot.getBoundingClientRect();
    await userEvent.click(
      canvas.getByRole("button", {
        name: content.inlineEdit.editDescription,
      }),
    );
    const ptAfter = ptRoot.getBoundingClientRect();
    await expect(ptAfter.width).toBeCloseTo(ptBefore.width);
    await expect(ptAfter.height).toBeCloseTo(ptBefore.height);

    const editor = canvas.getByRole("textbox", {
      name: content.inlineEdit.descriptionLabel,
    });
    const save = canvas.getByRole("button", {
      name: content.inlineEdit.saveDescription,
    });
    const clear = canvas.getByRole("button", {
      name: content.inlineEdit.clearDescription,
    });
    await expect(editor).toBeVisible();
    await expect(save).toBeVisible();
    await expect(clear).toBeVisible();
    const editorRect = editor.getBoundingClientRect();
    const editorStyle = getComputedStyle(editor);
    const editorField = editor.closest<HTMLElement>("[data-auto-size-text]");
    await expect(editorField).not.toBeNull();
    const editorFieldRect = editorField!.getBoundingClientRect();
    const clearRect = clear.getBoundingClientRect();
    const saveRect = save.getBoundingClientRect();
    await expect(
      Number.parseFloat(editorStyle.paddingBlockStart),
    ).toBeCloseTo(expectedBlockInset, 1);
    await expect(
      editorRect.top +
        Number.parseFloat(editorStyle.paddingBlockStart) -
        editorFieldRect.top,
    ).toBeCloseTo(ptTextRect.top - ptFieldRect.top, 1);
    await expect(clearRect.top + clearRect.height / 2).toBeCloseTo(
      saveRect.top + saveRect.height / 2,
    );
    await expect(ptRestIconCenter).toBeCloseTo(
      saveRect.top + saveRect.height / 2,
    );
    const editorContentEnd =
      editorRect.right -
      Number.parseFloat(getComputedStyle(editor).paddingInlineEnd);
    await expect(editorContentEnd).toBeLessThanOrEqual(clearRect.left);
    const clearTargetStyle = getComputedStyle(clear, "::before");
    await expect(clearTargetStyle.inlineSize).toBe("44px");
    await expect(clearTargetStyle.blockSize).toBe("44px");

    const expandedHeight = ptField!.getBoundingClientRect().height;
    await userEvent.click(clear);
    await expect(editor).toHaveValue("");
    await expect(editor).toHaveFocus();
    await expect(ptRoot).toHaveAttribute("data-phase", "editing");
    const compactHeight = ptField!.getBoundingClientRect().height;
    await expect(compactHeight).toBeLessThan(expandedHeight);
    await userEvent.type(editor, "Line one{Enter}Line two{Enter}Line three");
    const liveMultilineHeight = ptField!.getBoundingClientRect().height;
    await expect(liveMultilineHeight).toBeGreaterThan(compactHeight);
    await userEvent.type(editor, "{Enter}");
    const trailingNewlineHeight = ptField!.getBoundingClientRect().height;
    await expect(trailingNewlineHeight).toBeGreaterThan(liveMultilineHeight);
    await userEvent.click(clear);
    await userEvent.click(save);
    const error = canvas.getByRole("alert");
    await expect(error).toHaveTextContent(
      content.inlineEdit.validationMessage,
    );
    await expect(error).toBeVisible();
    await expect(save).toBeVisible();
    await expect(clear).toBeVisible();
    await expect(error.scrollWidth).toBeLessThanOrEqual(error.clientWidth + 1);
    await userEvent.keyboard("{Escape}");

    outsideCommit.mockClear();
    const outsideRoot = canvas.getByTestId("outside-inline");
    await userEvent.click(
      canvas.getByRole("button", { name: content.inlineEdit.editOrder }),
    );
    const outsideEditor = canvas.getByRole("textbox", {
      name: content.inlineEdit.orderLabel,
    });
    await userEvent.clear(outsideEditor);
    await userEvent.type(outsideEditor, content.inlineEdit.orderDraftShort);
    const shortWidth = outsideRoot.getBoundingClientRect().width;
    const singleLineHeight = outsideRoot.getBoundingClientRect().height;
    await userEvent.clear(outsideEditor);
    await userEvent.type(outsideEditor, content.inlineEdit.orderDraftMedium);
    const mediumWidth = outsideRoot.getBoundingClientRect().width;
    await expect(mediumWidth).toBeGreaterThan(shortWidth + 1);
    await userEvent.clear(outsideEditor);
    await userEvent.type(outsideEditor, content.inlineEdit.orderDraftShort);
    const shrunkWidth = outsideRoot.getBoundingClientRect().width;
    await expect(shrunkWidth).toBeLessThan(mediumWidth - 1);
    await expect(shrunkWidth).toBeCloseTo(shortWidth, 0);
    await userEvent.clear(outsideEditor);
    await userEvent.type(outsideEditor, content.inlineEdit.orderDraftLong);
    const longWidth = outsideRoot.getBoundingClientRect().width;
    const parentWidth = outsideRoot.parentElement!.getBoundingClientRect().width;
    await expect(longWidth).toBeCloseTo(parentWidth, 0);
    await expect(longWidth).toBeLessThanOrEqual(parentWidth + 1);
    await expect(outsideEditor.scrollWidth).toBeGreaterThan(
      outsideEditor.clientWidth,
    );
    await expect(
      canvas
        .getByRole("button", { name: content.inlineEdit.outsideTarget })
        .closest("[lang]"),
    ).toHaveAttribute("lang", content.lang);
    await userEvent.click(
      canvas.getByRole("button", { name: content.inlineEdit.outsideTarget }),
    );
    await expect(outsideCommit).toHaveBeenCalledTimes(1);
    await expect(outsideCommit).toHaveBeenCalledWith(
      content.inlineEdit.orderDraftLong,
    );
    await expect(outsideRoot).toHaveAttribute("data-phase", "rest");
    await expect(outsideRoot.getBoundingClientRect().height).toBeCloseTo(
      singleLineHeight,
    );
    const outsideRestText = canvas.getByText(
      content.inlineEdit.orderDraftLong,
    );
    await expect(getComputedStyle(outsideRestText).whiteSpace).toBe("nowrap");
    await expect(outsideRestText.scrollWidth).toBeGreaterThan(
      outsideRestText.clientWidth,
    );

    const externalAction = canvas.getByRole("button", {
      name: "Edit description externally",
    });
    await expect(externalAction.closest("[lang]")).toHaveAttribute(
      "lang",
      "en",
    );
    await userEvent.click(externalAction);
    const externalEditor = canvas.getByRole("textbox", {
      name: "External description",
    });
    await expect(externalEditor).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(externalAction).toHaveFocus();
    await expect(
      canvas
        .getAllByText("Prepared fresh and ready for delivery.")
        .find((element) => element.tagName === "P"),
    ).toBeDefined();

    for (const testId of [
      "disabled-confirmation-geometry",
      "readonly-confirmation-geometry",
    ]) {
      const inactiveRoot = canvas.getByTestId(testId);
      await expect(inactiveRoot).not.toHaveAttribute("data-save-action");
      await expect(
        inactiveRoot.querySelector('button[aria-label="Save"]'),
      ).toBeNull();
      await expect(getComputedStyle(inactiveRoot).columnGap).toBe("0px");
      await expect(
        getComputedStyle(inactiveRoot).gridTemplateColumns.split(" "),
      ).toHaveLength(1);
    }
  },
};

export const ErrorAlignment: Story = {
  tags: ["context-matrix", "!dev", "!autodocs", "!manifest"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className={styles.stack}>
      {bodySizes.flatMap((bodySize) => [false, true].map((multiline) => (
        <ControlledTextExample
          key={`${bodySize}-${multiline}`}
          label={`Body ${bodySize} ${multiline ? "multiline" : "single"}`}
          bodySize={bodySize}
          multiline={multiline}
          value={multiline ? "Example draft value\nSecond line" : "Example draft value"}
          onCommit={fn()}
          validate={() => "Review this value."}
          showSaveAction
        />
      )))}
      {headingSizes.map((headingSize) => (
        <ControlledTextExample
          key={headingSize}
          label={`Heading ${headingSize}`}
          kind="heading"
          headingSize={headingSize}
          value="Example draft value"
          onCommit={fn()}
          validate={() => "Review this value."}
          showSaveAction
        />
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    await document.fonts.ready;
    for (const trigger of canvas.getAllByRole("button", { name: /^Edit / })) {
      await userEvent.click(trigger);
      const root = trigger.closest<HTMLElement>("[data-phase]")!;
      const contents = within(root);
      const editor = contents.getByRole("textbox");
      await userEvent.type(editor, "!");
      const field = root.firstElementChild!;
      const save = contents.getByRole("button", { name: "Save" });
      const measure = (element: Element) => {
        const rect = element.getBoundingClientRect();
        const origin = root.getBoundingClientRect();
        return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height };
      };
      const before = [field, editor, save].map(measure);
      const editorStyle = getComputedStyle(editor);
      const textInset = parseFloat(editorStyle.borderLeftWidth) + parseFloat(editorStyle.paddingLeft);
      await userEvent.click(save);
      const error = await contents.findByRole("alert");
      expect(Math.abs(error.getBoundingClientRect().left - editor.getBoundingClientRect().left - textInset)).toBeLessThanOrEqual(1);
      expect(getComputedStyle(error).marginBlockStart).toBe("8px");
      for (const [index, element] of [field, editor, save].entries()) {
        const after = measure(element);
        for (const dimension of ["x", "y", "width", "height"] as const) {
          expect(Math.abs(after[dimension] - before[index][dimension])).toBeLessThanOrEqual(1);
        }
      }
      await expect(editor).toHaveAttribute("aria-invalid", "true");
      await expect(editor).toHaveAttribute("aria-describedby", error.id);
      await expect(editor).toHaveAttribute("aria-errormessage", error.id);
      await expect(editor).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect(trigger).toHaveFocus();
      expect(contents.queryByRole("alert")).toBeNull();
    }
  },
};

export const StatesAndValidation: Story = {
  name: "States & validation",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className={styles.stateExamples} data-testid="inline-edit-states">
      <Text as="span" className={styles.stateLabel} variant="label-eyebrow">
        Validation
      </Text>
      <ControlledExample
        label="Product name"
        onCommit={fn()}
        showSaveAction
        validate={(nextValue) =>
          nextValue.trim() ? undefined : "Enter a product name."
        }
        value="Morning order"
      />
      <Text as="span" className={styles.stateLabel} variant="label-eyebrow">
        Empty value
      </Text>
      <ControlledExample
        emptyValueLabel="Add product name"
        label="Empty product name"
        onCommit={fn()}
        value=""
      />
    </div>
  ),
  play: async ({ canvas }) => {
    const stateExamples = canvas.getByTestId("inline-edit-states");
    const validationLabel = canvas.getByText("Validation");
    const emptyValueLabel = canvas.getByText("Empty value");
    await expect(validationLabel).toBeVisible();
    await expect(emptyValueLabel).toBeVisible();
    await expect(getComputedStyle(stateExamples).display).toBe("grid");
    await expect(getComputedStyle(stateExamples).rowGap).toBe("8px");
    await expect(getComputedStyle(emptyValueLabel).marginBlockStart).toBe(
      "12px",
    );
    await expect(getComputedStyle(validationLabel).fontSize).toBe("10px");
    await expect(getComputedStyle(validationLabel).lineHeight).toBe("12px");

    const emptyRoot = canvas
      .getByRole("button", { name: "Edit Empty product name" })
      .closest<HTMLElement>('[data-empty="true"]');
    await expect(emptyRoot).not.toBeNull();
    await expect(
      emptyRoot!.querySelector('[data-icon-name="controls/edit"]'),
    ).not.toBeNull();
    await expect(
      emptyRoot!.querySelector(
        '[data-icon-name="general/check"][data-size="sm"]',
      ),
    ).toBeNull();
    const emptyText = canvas.getByText("Add product name");
    const emptyTextColor = getComputedStyle(emptyText).color;
    await userEvent.click(
      canvas.getByRole("button", { name: "Edit Empty product name" }),
    );
    const emptyEditor = canvas.getByRole("textbox", {
      name: "Empty product name",
    });
    await expect(emptyTextColor).toBe(
      getComputedStyle(emptyEditor, "::placeholder").color,
    );
    await userEvent.keyboard("{Escape}");

    await userEvent.click(
      canvas.getByRole("button", { name: "Edit Product name" }),
    );
    const editor = canvas.getByRole("textbox", { name: "Product name" });
    await userEvent.clear(editor);
    await userEvent.keyboard("{Enter}");
    await expect(editor).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("alert")).toHaveTextContent(
      "Enter a product name.",
    );
    await expect(
      canvas.getByRole("alert").getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(emptyRoot!.getBoundingClientRect().top);

    const clear = canvas.getByRole("button", { name: "Clear" });
    const beforeHover = clear.getBoundingClientRect();
    await userEvent.hover(clear);
    await Promise.all(
      clear.getAnimations().map((animation) => animation.finished),
    );
    const afterHover = clear.getBoundingClientRect();
    await expect(afterHover.top).toBe(beforeHover.top);
    await expect(afterHover.bottom).toBe(beforeHover.bottom);
  },
};
