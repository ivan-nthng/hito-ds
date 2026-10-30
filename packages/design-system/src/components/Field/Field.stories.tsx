import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { expect, userEvent } from "storybook/test";
import { Link } from "../Link/Link";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Field, type FieldControlProps } from "./Field";
import styles from "./Field.stories.module.css";

type ControlState = "enabled" | "disabled" | "read-only" | "loading";
type FieldStoryProps = {
  label: string;
  required: boolean;
  showError: boolean;
  showHelpAction: boolean;
  showHint: boolean;
};

function NativeControl({
  controlProps,
  state = "enabled",
}: {
  controlProps: FieldControlProps;
  state?: ControlState;
}) {
  return (
    <TextInput
      {...controlProps}
      disabled={state === "disabled"}
      loading={state === "loading"}
      readOnly={state === "read-only"}
    />
  );
}

function StoryPage({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          {title}
        </Text>
        <Text className={styles.secondary} variant="body-base">
          {description}
        </Text>
      </header>
      {children}
    </main>
  );
}

function StoryField({
  label,
  required,
  showError,
  showHelpAction,
  showHint,
}: FieldStoryProps) {
  return (
    <Field
      auxiliary={
        showHelpAction ? (
          <Link href="#privacy" size="sm">
            Why?
          </Link>
        ) : undefined
      }
      error={showError ? "Enter a valid email." : undefined}
      hint={showHint ? "We will send the receipt here." : undefined}
      label={label}
      required={required}
      requirementLabel={required ? undefined : "Optional"}
    >
      {({ controlProps }) => <NativeControl controlProps={controlProps} />}
    </Field>
  );
}

const meta = {
  id: "forms-field",
  title: "Components/Forms/Field",
  component: StoryField,
  tags: ["test"],
  args: {
    label: "Email",
    required: false,
    showError: false,
    showHelpAction: false,
    showHint: false,
  },
  argTypes: {
    label: { control: "text" },
    required: { control: "boolean" },
    showError: { control: "boolean", name: "error" },
    showHelpAction: { control: "boolean", name: "help action" },
    showHint: { control: "boolean", name: "hint" },
  },
  parameters: { layout: "fullscreen", figma: { label: "Field in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8371-3" } },
} satisfies Meta<FieldStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <StoryPage
      description="A visible label, one control slot and an optional message stack."
      title="Field"
    >
      <section className={styles.examples}>
        <StoryField {...args} />
      </section>
    </StoryPage>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: /Email/ });
    await userEvent.click(canvas.getByText("Email"));
    await expect(input).toHaveFocus();
    await expect(input).not.toHaveAttribute("aria-invalid");
  },
};

export const AnatomyAndMessages: Story = {
  name: "Anatomy & messages",
  parameters: { controls: { disable: true } },
  render: () => (
    <StoryPage
      description="Field owns relationships and layout; the slotted control owns interaction."
      title="Anatomy and messages"
    >
      <section className={styles.examples}>
        <Field label="Label only">
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field hint="We will send the receipt here." label="With hint">
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field error="Enter a valid email." label="With error">
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field
          controlId="order-reference"
          error="Enter the reference shown on the order."
          hint="Use 6–12 letters or numbers."
          label="Error and hint"
        >
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field label="Required" required>
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field label="Company name" requirementLabel="Optional">
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field
          auxiliary={
            <Link href="#format" size="sm">
              Formatting help
            </Link>
          }
          label="With help action"
        >
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <Field
          auxiliary={
            <Link href="#recovery" size="sm">
              How do I fix this?
            </Link>
          }
          error="Enter a valid email."
          label="Help action and error"
        >
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
      </section>
    </StoryPage>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("textbox", { name: "Error and hint" });
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(input).toHaveAttribute(
      "aria-describedby",
      "order-reference-error order-reference-hint",
    );
    await expect(canvas.getAllByRole("textbox")).toHaveLength(8);
  },
};

export const SemanticsAndStates: Story = {
  name: "Semantics & states",
  parameters: { controls: { disable: true } },
  render: () => (
    <StoryPage
      description="These native controls demonstrate ownership; the states are not Field props."
      title="Control-owned states"
    >
      <section className={styles.examples}>
        {(["enabled", "disabled", "read-only", "loading"] as const).map(
          (state) => (
            <Field key={state} label={state} required={state === "enabled"}>
              {({ controlProps }) => (
                <NativeControl controlProps={controlProps} state={state} />
              )}
            </Field>
          ),
        )}
      </section>
    </StoryPage>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "disabled" })).toBeDisabled();
    await expect(canvas.getByRole("textbox", { name: "read-only" })).toHaveAttribute(
      "readonly",
    );
    await expect(canvas.getByRole("textbox", { name: "loading" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    await expect(canvas.getByRole("textbox", { name: "loading" })).toHaveAttribute(
      "readonly",
    );
  },
};

export const LocalizationAndReflow: Story = {
  name: "Localization & reflow",
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "narrow" },
  },
  render: () => (
    <StoryPage
      description="Long labels, auxiliary actions and messages wrap without fixed heights."
      title="Localization and reflow"
    >
      <section className={styles.examples}>
        <Field
          auxiliary={
            <Link href="#privacy-pt" size="sm">
              Por que precisamos disso?
            </Link>
          }
          hint="Usaremos este endereço somente para enviar atualizações importantes sobre o pedido."
          label="Endereço de e-mail para notificações do pedido"
          requirementLabel="Opcional"
        >
          {({ controlProps }) => <NativeControl controlProps={controlProps} />}
        </Field>
        <div dir="rtl">
          <Field
            error="أدخل الاسم كما يظهر في المستند."
            label="الاسم الكامل للمستلم"
            required
          >
            {({ controlProps }) => <NativeControl controlProps={controlProps} />}
          </Field>
        </div>
      </section>
    </StoryPage>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("textbox")).toHaveLength(2);
  },
};
