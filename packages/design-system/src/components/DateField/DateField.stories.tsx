import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Text } from "../Text/Text";
import { DateField, type DateFieldProps } from "./DateField";
import styles from "./DateField.stories.module.css";

function StatefulDateField({ value: initialValue, onValueChange, ...props }: DateFieldProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <DateField
      {...props}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      value={value}
    />
  );
}

function CalendarActionExample() {
  const [value, setValue] = useState<string | null>("2026-09-24");
  const [requested, setRequested] = useState(false);
  return (
    <div className={styles.measure}>
      <DateField
        label="Delivery date"
        locale="en"
        onCalendarOpen={() => setRequested(true)}
        onValueChange={setValue}
        value={value}
      />
      {requested ? <Text variant="body-sm">Calendar requested</Text> : null}
    </div>
  );
}

const meta = {
  id: "forms-date-field",
  title: "Components/Forms/DateField",
  component: DateField,
  tags: ["test"],
  args: {
    appearance: "outlined",
    disabled: false,
    label: "Delivery date",
    locale: "en",
    required: false,
    size: "md",
    value: "2026-09-24",
    width: "fill",
  },
  argTypes: {
    appearance: { control: "inline-radio", options: ["outlined", "soft"] },
    disabled: { control: "boolean" },
    label: { control: "text" },
    locale: { control: "inline-radio", options: ["en", "pt"] },
    required: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    value: { control: "text" },
    width: { control: "inline-radio", options: ["fill", "hug"] },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<DateFieldProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">DateField</Text>
      <Text className={styles.secondary} variant="body-base">
        Edit calendar-day segments. The visible draft remains when incomplete or invalid.
      </Text>
      <div className={styles.measure}>
        <StatefulDateField key={`${args.locale}:${args.value}`} {...args} />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const month = canvas.getByRole("textbox", { name: "Delivery date Month" });
    await expect(month).toHaveValue("09");
    await userEvent.click(canvas.getByText("Delivery date"));
    await expect(month).toHaveFocus();
  },
};

export const LocalesAndStates: Story = {
  name: "Locales and states",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">Locale and validation</Text>
      <div className={styles.grid}>
        <StatefulDateField label="Delivery date" locale="en" value="2026-09-24" />
        <StatefulDateField label="Data de entrega" locale="pt" value="2026-09-24" />
        <StatefulDateField label="Required date" locale="en" required value={null} />
        <StatefulDateField error="Choose a permitted day." label="Unavailable date" locale="en" value="2026-09-24" />
        <StatefulDateField disabled label="Disabled date" locale="en" value="2026-09-24" />
        <StatefulDateField label="Read-only date" locale="en" readOnly value="2026-09-24" />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Formato: DD/MM/AAAA")).toBeInTheDocument();
    await expect(canvas.getByRole("textbox", { name: "Unavailable date Month" })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("textbox", { name: "Disabled date Month" })).toBeDisabled();
  },
};

export const Narrow: Story = {
  parameters: { controls: { disable: true }, viewport: { defaultViewport: "narrow" } },
  render: () => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">Narrow layout</Text>
      <div className={styles.measure}>
        <StatefulDateField hint="Use the day shown in your order." label="Scheduled delivery date" locale="en" value="2026-09-24" />
      </div>
    </main>
  ),
};

export const CalendarAction: Story = {
  name: "Calendar action",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">Optional calendar action</Text>
      <CalendarActionExample />
    </main>
  ),
};
