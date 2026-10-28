import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Field } from "../Field/Field";
import { iconCatalog } from "../Icon/icon-catalog";
import { SearchField } from "../SearchField/SearchField";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { getStoryContent } from "../../storybook/story-content";
import {
  Textarea,
  type TextareaAppearance,
  type TextareaSize,
  type TextareaValidationState,
} from "./Textarea";
import styles from "./Textarea.stories.module.css";

const appearances: TextareaAppearance[] = ["outlined", "soft"];
const sizes: TextareaSize[] = ["sm", "md", "lg", "xl"];
const insetCases = sizes.flatMap((size) =>
  [false, true].flatMap((icons) =>
    [2, 3, 6].flatMap((rows) =>
      (["fill", "hug"] as const).map((width) => ({ size, icons, rows, width })),
    ),
  ),
);
const validationStates: TextareaValidationState[] = [
  "none",
  "invalid",
  "success",
];

const meta = {
  id: "forms-textarea",
  title: "Components/Forms/Textarea",
  component: Textarea,
  tags: ["test"],
  args: {
    appearance: "outlined",
    placeholder: "Add delivery notes",
    rows: 3,
    size: "md",
    validationState: "none",
  },
  argTypes: {
    width: { control: "inline-radio", options: ["hug", "fill"] },
    "aria-label": { control: false, table: { disable: true } },
    appearance: { control: "inline-radio", options: appearances },
    disabled: { control: "boolean" },
    leadingIcon: { control: "select", options: Object.keys(iconCatalog) },
    placeholder: { control: "text" },
    readOnly: { control: "boolean" },
    rows: { control: { min: 2, step: 1, type: "number" } },
    size: { control: "inline-radio", options: sizes },
    trailingIcon: { control: "select", options: Object.keys(iconCatalog) },
    validationState: {
      control: "inline-radio",
      options: validationStates,
    },
  },
  parameters: {
    controls: {
      include: [
        "width",
        "appearance",
        "size",
        "validationState",
        "rows",
        "leadingIcon",
        "trailingIcon",
        "placeholder",
        "disabled",
        "readOnly",
      ],
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Textarea in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8409-63",
    },
  },
  render: (args) => (
    <div className={styles.measure}>
      <Textarea {...args} aria-label="Delivery notes" />
    </div>
  ),
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox", { name: "Delivery notes" });
    await expect(textarea).toHaveAttribute("rows", "3");
    await userEvent.tab();
    await expect(textarea).toHaveFocus();
  },
};

export const AppearancesAndSizes: Story = {
  name: "Appearances & sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.stack}>
        <Text as="h1" variant="heading-lg">
          Textarea
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Native multiline entry on the shared form-control scale.
        </Text>
      </header>
      {appearances.map((appearance) => (
        <section className={styles.section} key={appearance}>
          <Text as="h2" variant="heading-sm">
            {appearance === "outlined" ? "Outlined" : "Soft"}
          </Text>
          <div className={styles.row}>
            {sizes.map((size) => (
              <Textarea
                appearance={appearance}
                aria-label={`${appearance} ${size}`}
                defaultValue={`${size.toUpperCase()} · Three rows by default`}
                key={size}
                size={size}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  ),
  play: async ({ canvasElement }) => {
    const expectedMinHeights: Record<TextareaSize, number> = {
      sm: 44,
      md: 56,
      lg: 68,
      xl: 84,
    };

    for (const size of sizes) {
      const textarea = canvasElement.querySelector<HTMLTextAreaElement>(
        `textarea[data-size="${size}"]`,
      );
      if (!textarea) {
        throw new Error(`Textarea ${size} example is missing.`);
      }
      const style = getComputedStyle(textarea);
      await expect(Number.parseFloat(style.minBlockSize)).toBeCloseTo(
        expectedMinHeights[size],
      );
      await expect(textarea.getBoundingClientRect().height).toBeCloseTo(
        expectedMinHeights[size] + Number.parseFloat(style.lineHeight), 0,
      );
      await expect(style.resize).toBe("vertical");
    }
  },
};

function CountedTextarea() {
  const [value, setValue] = useState("Fresh bread and fruit.");
  const maximum = 120;

  return (
    <Field
      auxiliary={
        <span className={styles.counter}>
          {value.length}/{maximum}
        </span>
      }
      hint="Add delivery details only when they help the recipient."
      label="Delivery notes"
      requirementLabel="Optional"
    >
      {({ controlProps }) => (
        <Textarea
          {...controlProps}
          maxLength={maximum}
          onChange={(event) => setValue(event.currentTarget.value)}
          value={value}
        />
      )}
    </Field>
  );
}

export const FieldCompositionAndNativeStates: Story = {
  name: "Field composition & native states",
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_args, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);

    return (
      <main className={styles.page}>
        <header className={styles.stack}>
          <Text as="h1" variant="heading-lg">
            Field composition
          </Text>
          <Text className={styles.secondary} variant="body-base">
            Field owns labels and messages; Textarea keeps native multiline
            behavior.
          </Text>
        </header>
        <section className={styles.stack}>
          <div className={styles.measure}>
            <CountedTextarea />
          </div>
          <div className={styles.measure}>
            <Field
              error={content.textarea.instructionsError}
              label={content.textarea.instructionsLabel}
              lang={content.lang}
              required
            >
              {({ controlProps }) => (
                <Textarea
                  {...controlProps}
                  appearance="soft"
                  leadingIcon="general/search"
                  placeholder={content.textarea.instructionsPlaceholder}
                  validationState="invalid"
                />
              )}
            </Field>
          </div>
          <div className={styles.measure}>
            <Field hint="The description is ready." label="Product description">
              {({ controlProps }) => (
                <Textarea
                  {...controlProps}
                  defaultValue="Prepared fresh and ready for delivery."
                  trailingIcon="general/check"
                  validationState="success"
                />
              )}
            </Field>
          </div>
          <div className={styles.measure}>
            <Field
              label={content.textarea.localizedLongLabel}
              lang={content.lang}
            >
              {({ controlProps }) => (
                <Textarea
                  {...controlProps}
                  defaultValue={content.textarea.localizedLongValue}
                />
              )}
            </Field>
          </div>
          <div className={`${styles.measure} ${styles.row}`}>
            <Textarea
              aria-label="Disabled notes"
              disabled
              leadingIcon="general/search"
              placeholder="Disabled"
              rows={2}
            />
            <Textarea
              aria-label="Read-only notes"
              readOnly
              rows={2}
              trailingIcon="general/check"
              value="Saved notes remain selectable and scrollable."
            />
          </div>
        </section>
      </main>
    );
  },
  play: async ({ canvas, globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    const invalid = canvas.getByRole("textbox", {
      name: content.textarea.instructionsLabel,
    });
    const success = canvas.getByRole("textbox", {
      name: "Product description",
    });
    const disabled = canvas.getByRole("textbox", { name: "Disabled notes" });
    const readOnly = canvas.getByRole("textbox", { name: "Read-only notes" });
    const localizedLong = canvas.getByRole("textbox", {
      name: content.textarea.localizedLongLabel,
    });

    await expect(
      canvas
        .getByRole("heading", { name: "Field composition" })
        .closest("[lang]"),
    ).toHaveAttribute("lang", "en");
    await expect(invalid.closest("[lang]")).toHaveAttribute(
      "lang",
      content.lang,
    );
    await expect(localizedLong.closest("[lang]")).toHaveAttribute(
      "lang",
      content.lang,
    );
    await expect(localizedLong).toHaveValue(
      content.textarea.localizedLongValue,
    );

    await expect(invalid).toHaveAttribute("aria-invalid", "true");
    await expect(success).toHaveAttribute("data-validation-state", "success");
    await expect(disabled).toBeDisabled();
    await expect(readOnly).toHaveAttribute("readonly");
    await expect(getComputedStyle(disabled).resize).toBe("none");
    await expect(getComputedStyle(readOnly).resize).toBe("none");
    for (const control of [disabled, readOnly]) {
      const style = getComputedStyle(control);
      await expect(control).toHaveAttribute("rows", "2");
      await expect(control.getBoundingClientRect().height).toBeCloseTo(
        2 * Number.parseFloat(style.lineHeight) +
          2 * Number.parseFloat(style.paddingTop) +
          2 * Number.parseFloat(style.borderTopWidth), 0,
      );
    }

    for (let index = 0; index < 5; index += 1) {
      await userEvent.tab();
    }
    await expect(readOnly).toHaveFocus();
    await expect(getComputedStyle(readOnly).outlineStyle).toBe("solid");
    await expect(getComputedStyle(readOnly).outlineOffset).not.toBe("0px");
  },
};

export const SharedInsets: Story = {
  name: "Shared input insets",
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_args, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    const value = content.textarea.localizedLongValue;
    return (
      <main className={styles.page} lang={content.lang}>
        <header className={styles.stack}>
          <Text as="h1" variant="heading-lg">
            Shared input insets
          </Text>
          <Text className={styles.secondary} variant="body-base">
            The first line shares one inset. Multiline content grows downward.
          </Text>
        </header>
        {insetCases.map(({ size, icons, rows, width }) => {
          const label = `${size.toUpperCase()} · ${icons ? "Icons" : "Text"} · ${rows} rows · ${width}`;
          const leadingIcon = icons ? "general/search" as const : undefined;
          const trailingIcon = icons ? "general/check" as const : undefined;
          return (
            <section className={styles.stack} key={label} data-inset-case={size}>
              <Text as="h2" variant="heading-sm">
                {label}
              </Text>
              <div className={styles.comparison}>
                <TextInput
                  aria-label={`Text input ${label}`}
                  defaultValue={value}
                  leadingIcon={leadingIcon}
                  trailingIcon={trailingIcon}
                  size={size}
                />
                <SearchField
                  aria-label={`Search ${label}`}
                  clearLabel={`Clear ${label}`}
                  defaultValue={value}
                  size={size}
                />
                <Textarea
                  aria-label={`Textarea ${label}`}
                  defaultValue={value}
                  leadingIcon={leadingIcon}
                  trailingIcon={trailingIcon}
                  rows={rows}
                  size={size}
                  width={width}
                />
              </div>
            </section>
          );
        })}
      </main>
    );
  },
  play: async ({ canvasElement }) => {
    const heights = { sm: 28, md: 36, lg: 44, xl: 56 };
    const radii = { sm: 4, md: 6, lg: 8, xl: 12 };
    const cases = canvasElement.querySelectorAll<HTMLElement>("[data-inset-case]");
    for (const section of cases) {
      const size = section.dataset.insetCase as TextareaSize;
      const input = section.querySelector<HTMLInputElement>('input[type="text"]')!;
      const search = section.querySelector<HTMLInputElement>('input[type="search"]')!;
      const textarea = section.querySelector<HTMLTextAreaElement>("textarea")!;
      const textareaStyle = getComputedStyle(textarea);
      const textareaRect = textarea.getBoundingClientRect();
      const lineHeight = Number.parseFloat(textareaStyle.lineHeight);
      const border = Number.parseFloat(textareaStyle.borderTopWidth);
      const blockInset = border + Number.parseFloat(textareaStyle.paddingTop);
      for (const single of [input, search]) {
        const frame = single.parentElement!;
        const frameStyle = getComputedStyle(frame);
        const frameRect = frame.getBoundingClientRect();
        const singleStyle = getComputedStyle(single);
        await expect(frameRect.height).toBeCloseTo(heights[size], 1);
        await expect(single.getBoundingClientRect().top - frameRect.top).toBeCloseTo(
          blockInset, 1,
        );
        await expect(singleStyle.fontSize).toBe(textareaStyle.fontSize);
        await expect(singleStyle.lineHeight).toBe(textareaStyle.lineHeight);
        await expect(singleStyle.fontWeight).toBe(textareaStyle.fontWeight);
        await expect(Number.parseFloat(frameStyle.borderRadius)).toBe(radii[size]);
        await expect(Number.parseFloat(textareaStyle.borderRadius)).toBe(radii[size]);
        const leadingIcon = frame.querySelector<HTMLElement>("[data-icon-name]");
        const iconInset = textarea.hasAttribute("data-leading-icon")
          ? leadingIcon!.getBoundingClientRect().width + Number.parseFloat(frameStyle.gap)
          : 0;
        await expect(Number.parseFloat(frameStyle.paddingInlineStart)).toBe(
          Number.parseFloat(textareaStyle.paddingInlineStart) - iconInset,
        );
      }
      // Native rows set the line count; narrow long copy scrolls rather than changing the frame height.
      await expect(textareaRect.height).toBeCloseTo(
        textarea.rows * lineHeight + 2 * blockInset, 0,
      );
      await expect(textareaStyle.paddingTop).toBe(textareaStyle.paddingBottom);
      await expect(textarea.scrollWidth).toBeLessThanOrEqual(textarea.clientWidth + 1);
      await expect(textareaStyle.resize).toBe("vertical");
      if (textarea.hasAttribute("data-leading-icon")) {
        const frame = textarea.parentElement!;
        const icons = frame.querySelectorAll<HTMLElement>("[data-icon-name]");
        for (const icon of icons) {
          const rect = icon.getBoundingClientRect();
          await expect(rect.top - textareaRect.top + rect.height / 2).toBeCloseTo(
            blockInset + lineHeight / 2, 1,
          );
        }
        const textIcon = input.parentElement!.querySelector<HTMLElement>("[data-icon-name]")!;
        const areaIcon = icons[0];
        await expect(areaIcon.getBoundingClientRect().left - textareaRect.left).toBeCloseTo(
          textIcon.getBoundingClientRect().left - input.parentElement!.getBoundingClientRect().left, 1,
        );
        await expect(Number.parseFloat(textareaStyle.paddingLeft) + border).toBeCloseTo(
          input.getBoundingClientRect().left - input.parentElement!.getBoundingClientRect().left, 1,
        );
      }
    }
  },
};
