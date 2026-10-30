import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Field } from "../Field/Field";
import { InlineEdit } from "../InlineEdit/InlineEdit";
import { Text } from "../Text/Text";
import {
  NumberField,
  type NumberFieldProps,
  type NumberFieldSize,
} from "./NumberField";
import styles from "./NumberField.stories.module.css";

const sizes: NumberFieldSize[] = ["sm", "md", "lg", "xl"];
type StoryState = "disabled" | "editable" | "readOnly";
type NumberFieldStoryProps = NumberFieldProps & { storyState?: StoryState };

function StatefulNumberField({
  defaultValue,
  onValueChange,
  value: initialValue,
  ...props
}: NumberFieldProps) {
  const [value, setValue] = useState<number | null>(
    initialValue !== undefined ? initialValue : (defaultValue ?? null),
  );

  return (
    <NumberField
      {...props}
      onValueChange={(nextValue, details) => {
        setValue(nextValue);
        onValueChange?.(nextValue, details);
      }}
      value={value}
    />
  );
}

function ControlledNumberField(props: NumberFieldProps) {
  const storyValueKey =
    props.value === undefined
      ? `default:${props.defaultValue}`
      : `value:${props.value}`;
  return <StatefulNumberField key={storyValueKey} {...props} />;
}

function QuietNumberEdit() {
  const [value, setValue] = useState<number | null>(72);
  return (
    <InlineEdit
      bodySize="md"
      label="Weight"
      locale="en-US"
      min={0}
      onCommit={setValue}
      showSaveAction
      step={0.5}
      suffix=" kg"
      value={value}
      valueType="number"
    />
  );
}

const meta = {
  id: "forms-number-field",
  title: "Components/Forms/NumberField",
  component: NumberField,
  tags: ["test"],
  args: {
    appearance: "outlined",
    decrementLabel: "Decrease value",
    incrementLabel: "Increase value",
    locale: "en-US",
    max: 100,
    min: 0,
    mode: "decimal",
    showSteppers: true,
    size: "md",
    step: 0.5,
    storyState: "editable",
    suffix: " kg",
    value: 72,
  },
  parameters: {
    controls: {
      include: [
        "width",
        "appearance",
        "locale",
        "loading",
        "max",
        "min",
        "mode",
        "prefix",
        "showSteppers",
        "size",
        "step",
        "storyState",
        "suffix",
        "validationState",
        "value",
      ],
    },
  },
  argTypes: {
    width: { control: "inline-radio", options: ["hug", "fill"] },
    appearance: { control: "inline-radio", options: ["outlined", "soft"] },
    locale: { control: "inline-radio", options: ["en-US", "pt-BR"] },
    loading: { control: "boolean" },
    mode: { control: "inline-radio", options: ["decimal", "integer"] },
    showSteppers: { control: "boolean" },
    size: { control: "inline-radio", options: sizes },
    storyState: {
      control: "inline-radio",
      options: ["editable", "readOnly", "disabled"],
    },
    validationState: {
      control: "inline-radio",
      options: ["none", "invalid", "success"],
    },
  },
  render: ({ storyState = "editable", ...args }) => (
    <div className={styles.measure}>
      <ControlledNumberField
        {...args}
        aria-label="Weight"
        disabled={storyState === "disabled"}
        readOnly={storyState === "readOnly"}
      />
    </div>
  ),
} satisfies Meta<NumberFieldStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "NumberField in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8779-120",
    },
  },
  play: async ({ canvas }) => {
    await userEvent.tab();
    const input = canvas.getByRole("spinbutton", { name: "Weight" });
    await expect(input).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(input).toHaveValue("72.5");
  },
};

export const ValuesAndComposition: Story = {
  name: "Values & composition",
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.stack}>
        <Text as="h1" variant="heading-lg">
          NumberField
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Canonical numbers keep locale-aware drafts, constraints and units
          separate.
        </Text>
      </header>
      <section className={styles.stack}>
        <Text as="h2" variant="heading-sm">
          Sizes
        </Text>
        <div className={styles.row}>
          {sizes.map((size) => (
            <div className={styles.measure} key={size}>
              <NumberField
                aria-label={`${size} quantity`}
                size={size}
                value={size === "sm" ? 0 : 12.5}
              />
            </div>
          ))}
        </div>
      </section>
      <section className={styles.grid}>
        <Field hint="Zero is a saved value." label="Servings">
          {({ controlProps }) => (
            <NumberField {...controlProps} min={0} value={0} />
          )}
        </Field>
        <Field label="Weight" requirementLabel="Optional">
          {({ controlProps }) => (
            <NumberField
              {...controlProps}
              appearance="soft"
              locale="pt-BR"
              min={0}
              prefix="≈ "
              suffix=" kg"
              value={1.5}
            />
          )}
        </Field>
        <Field hint="Use the arrows or type a value." label="Guests">
          {({ controlProps }) => (
            <ControlledNumberField
              {...controlProps}
              decrementLabel="Decrease guests"
              defaultValue={4}
              incrementLabel="Increase guests"
              max={8}
              min={1}
              showSteppers
              step={1}
            />
          )}
        </Field>
        <Field hint="Empty stays null." label="Optional adjustment">
          {({ controlProps }) => (
            <NumberField
              {...controlProps}
              placeholder="Add adjustment"
              value={null}
            />
          )}
        </Field>
        <div className={styles.constrained}>
          <Field
            hint="The value scrolls without moving the unit."
            label="Constrained signed value"
          >
            {({ controlProps }) => (
              <NumberField {...controlProps} suffix=" ml" value={-1234567.5} />
            )}
          </Field>
        </div>
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "NumberField" }).closest("[lang]"),
    ).toHaveAttribute("lang", "en");
    const empty = canvas.getByRole("spinbutton", {
      name: "Optional adjustment",
    });
    await expect(empty.closest("[lang]")).toHaveAttribute("lang", "en");
    await expect(empty).toHaveValue("");
    await expect(empty).toHaveAttribute("aria-valuetext", "Add adjustment");

    const increase = canvas.getByRole("button", { name: "Increase guests" });
    for (let index = 0; index < 4; index += 1) {
      await userEvent.click(increase);
    }
    await expect(
      canvas.getByRole("spinbutton", { name: "Guests" }),
    ).toHaveValue("8");
    await expect(increase).toBeDisabled();
  },
};

export const StatesAndQuietEditing: Story = {
  name: "States & quiet editing",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.stack}>
        <Text as="h1" variant="heading-lg">
          Numeric states
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Form fields own numeric entry; InlineEdit owns the backgroundless
          rest-to-edit transition.
        </Text>
      </header>
      <section className={styles.grid}>
        <Field error="Enter a value from 1 to 8." label="Invalid quantity">
          {({ controlProps }) => (
            <NumberField
              {...controlProps}
              max={8}
              min={1}
              validationState="invalid"
              value={12}
            />
          )}
        </Field>
        <Field hint="The quantity is available." label="Confirmed quantity">
          {({ controlProps }) => (
            <NumberField
              {...controlProps}
              validationState="success"
              value={6}
            />
          )}
        </Field>
        <NumberField aria-label="Checking stock" loading value={12} />
        <NumberField aria-label="Disabled quantity" disabled value={12} />
        <NumberField aria-label="Read-only quantity" readOnly value={12} />
      </section>
      <section className={styles.stack}>
        <Text as="h2" variant="heading-sm">
          Backgroundless numeric edit
        </Text>
        <QuietNumberEdit />
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Edit Weight" });
    const root = trigger.closest<HTMLElement>('[data-value-type="number"]');
    const before = root?.getBoundingClientRect();
    await userEvent.click(trigger);
    const input = canvas.getByRole("spinbutton", { name: "Weight" });
    const after = root?.getBoundingClientRect();
    await expect(input).toHaveFocus();
    await expect(input.parentElement).toHaveAttribute(
      "data-appearance",
      "soft",
    );
    await expect(after?.height).toBeCloseTo(before?.height ?? 0);

    await userEvent.keyboard("123456789.5");
    const expanded = root?.getBoundingClientRect();
    await expect(expanded?.width ?? 0).toBeGreaterThan(after?.width ?? 0);
    await expect(root?.querySelector("[data-auto-size-text]")).toHaveAttribute(
      "data-auto-size-text",
      "123456789.5 kg",
    );

    const suffix = root?.querySelector<HTMLElement>(
      '[data-position="trailing"]',
    );
    const clear = canvas.getByRole("button", { name: "Clear" });
    await expect(
      clear.getBoundingClientRect().left -
        (suffix?.getBoundingClientRect().right ?? 0),
    ).toBeGreaterThanOrEqual(0);

    await userEvent.click(canvas.getByRole("button", { name: "Save" }));
    const savedTrigger = canvas.getByRole("button", { name: "Edit Weight" });
    await expect(savedTrigger).toBeVisible();
    await userEvent.click(savedTrigger);
    const restoredEditor = canvas.getByRole("spinbutton", { name: "Weight" });
    await userEvent.keyboard("72");
    await expect(restoredEditor).toHaveValue("72");
  },
};
