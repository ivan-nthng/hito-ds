import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { Field } from "../Field/Field";
import { iconCatalog } from "../Icon/icon-catalog";
import { Text } from "../Text/Text";
import {
  TextInput,
  type TextInputAppearance,
  type TextInputSize,
  type TextInputType,
  type TextInputValidationState,
} from "./TextInput";
import styles from "./TextInput.stories.module.css";

const appearances: TextInputAppearance[] = ["outlined", "soft"];
const sizes: TextInputSize[] = ["sm", "md", "lg", "xl"];
const validationStates: TextInputValidationState[] = [
  "none",
  "invalid",
  "success",
];
const iconNames = Object.keys(iconCatalog);
const inputTypeExamples: Record<TextInputType, string> = {
  email: "name@example.com",
  password: "hito-password",
  tel: "+55 11 91234-5678",
  text: "Morning order",
  url: "https://example.com",
};

const meta = {
  id: "forms-text-input",
  title: "Components/Forms/TextInput",
  component: TextInput,
  tags: ["test"],
  args: {
    appearance: "outlined",
    loading: false,
    placeholder: "name@example.com",
    type: "email",
  },
  argTypes: {
    width: { control: "inline-radio", options: ["hug", "fill"] },
    "aria-label": { control: false, table: { disable: true } },
    appearance: { control: "inline-radio", options: appearances },
    leadingIcon: { control: "select", options: iconNames },
    loading: { control: "boolean" },
    size: { control: "inline-radio", options: sizes },
    trailingIcon: { control: "select", options: iconNames },
    type: {
      control: "inline-radio",
      options: ["text", "email", "password", "tel", "url"],
    },
    validationState: {
      control: "inline-radio",
      options: validationStates,
    },
  },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "TextInput in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8374-14",
    },
  },
  render: (args) => {
    const type = args.type ?? "text";

    return (
      <div className={styles.measure}>
        <TextInput
          {...args}
          aria-label={`${type} input`}
          defaultValue={args.defaultValue ?? inputTypeExamples[type]}
          key={type}
          type={type}
        />
      </div>
    );
  },
  play: async ({ args, canvasElement }) => {
    const input = canvasElement.querySelector("input");

    if (!input) {
      throw new Error("TextInput Playground did not render an input element.");
    }

    await expect(input).toHaveAccessibleName();
    await expect(input).toHaveAttribute("type", args.type ?? "text");
    await userEvent.tab();
    await expect(input).toHaveFocus();
  },
};

export const AppearancesAndSizes: Story = {
  name: "Appearances & sizes",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.stack}>
        <Text as="h1" variant="heading-lg">
          TextInput
        </Text>
        <Text className={styles.secondary} variant="body-base">
          One native control with outlined and alpha-surface appearances.
        </Text>
      </header>
      {appearances.map((appearance) => (
        <section className={styles.section} key={appearance}>
          <Text as="h2" variant="heading-sm">
            {appearance === "outlined"
              ? "Primary · outlined"
              : "Secondary · soft"}
          </Text>
          <div className={styles.row}>
            {sizes.map((size) => (
              <div className={styles.measure} key={size}>
                <TextInput
                  appearance={appearance}
                  aria-label={`${appearance} ${size}`}
                  placeholder={size.toUpperCase()}
                  size={size}
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  ),
};

export const StatesAndComposition: Story = {
  name: "States & composition",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.stack}>
        <Text as="h1" variant="heading-lg">
          Native states
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Field owns the message and relationship; TextInput owns the control
          shell.
        </Text>
      </header>
      <section className={styles.stack}>
        <div className={styles.measure}>
          <Field label="Website" requirementLabel="Optional">
            {({ controlProps }) => (
              <TextInput
                {...controlProps}
                leadingIcon="general/link"
                placeholder="https://example.com"
                trailingIcon="arrows/complex/up-right"
                type="url"
              />
            )}
          </Field>
        </div>
        <div className={styles.measure}>
          <Field error="Enter a valid email." label="Email">
            {({ controlProps }) => (
              <TextInput {...controlProps} appearance="soft" type="email" />
            )}
          </Field>
        </div>
        <div className={styles.measure}>
          <Field hint="The name is available." label="Product name">
            {({ controlProps }) => (
              <TextInput
                {...controlProps}
                defaultValue="Morning order"
                validationState="success"
              />
            )}
          </Field>
        </div>
        <div className={styles.row}>
          <div className={styles.measure}>
            <TextInput aria-label="Disabled" disabled placeholder="Disabled" />
          </div>
          <div className={styles.measure}>
            <TextInput aria-label="Read only" readOnly value="Read only" />
          </div>
          <div className={styles.measure}>
            <TextInput
              aria-label="Loading"
              loading
              placeholder="Checking availability"
              trailingIcon="general/check"
            />
          </div>
        </div>
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    const website = canvas.getByRole("textbox", { name: "Website Optional" });
    const invalid = canvas.getByRole("textbox", { name: "Email" });
    const readOnly = canvas.getByRole("textbox", { name: "Read only" });
    const success = canvas.getByRole("textbox", { name: "Product name" });

    await expect(invalid).toHaveAttribute("aria-invalid", "true");
    await expect(success.parentElement).toHaveAttribute(
      "data-validation-state",
      "success",
    );
    await expect(
      canvas.getByRole("textbox", { name: "Disabled" }),
    ).toBeDisabled();
    await expect(readOnly).toHaveAttribute("readonly");
    await expect(
      canvas.getByRole("textbox", { name: "Loading" }),
    ).toHaveAttribute("aria-busy", "true");

    for (const input of [website, invalid, success]) {
      input.focus();
      const shell = input.parentElement;

      if (!shell) {
        throw new Error("TextInput did not render its governed shell.");
      }

      const style = getComputedStyle(shell);
      await expect(style.borderTopWidth).toBe("1px");
      await expect(style.outlineWidth).toBe("1px");
      await expect(style.outlineOffset).toBe("0px");
      await expect(style.transitionProperty).toContain("border-color");
      await expect(style.transitionProperty).toContain("outline-color");
      await waitFor(() => {
        const settledStyle = getComputedStyle(shell);
        expect(settledStyle.outlineColor).toBe(settledStyle.borderTopColor);
      });
    }

    readOnly.focus();
    const readOnlyShell = readOnly.parentElement;
    if (!readOnlyShell) {
      throw new Error("TextInput did not render its governed shell.");
    }
    const readOnlyStyle = getComputedStyle(readOnlyShell);
    await expect(readOnlyStyle.outlineWidth).toBe("2px");
    await expect(readOnlyStyle.outlineOffset).toBe("2px");
    await expect(readOnlyStyle.borderTopColor).not.toBe(
      readOnlyStyle.outlineColor,
    );
  },
};
