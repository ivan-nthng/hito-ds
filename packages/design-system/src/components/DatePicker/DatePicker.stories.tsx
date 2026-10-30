import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Text } from "../Text/Text";
import { Button } from "../Button/Button";
import { DatePicker, type DatePickerProps } from "./DatePicker";
import styles from "./DatePicker.stories.module.css";

function StatefulPicker({ value: initialValue, onValueChange, ...props }: DatePickerProps) {
  const [value, setValue] = useState(initialValue);
  return <DatePicker
    {...props}
    onValueChange={(next) => { setValue(next); onValueChange?.(next); }}
    value={value}
  />;
}

function FormValidityExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return <form
    className={styles.form}
    onSubmit={(event) => {
      event.preventDefault();
      setSubmitted(String(new FormData(event.currentTarget).get("deliveryDay")));
    }}
  >
    <StatefulPicker
      label="Delivery date"
      locale="en"
      name="deliveryDay"
      todayDay="2026-09-19"
      unavailableDays={{ "2026-09-22": { reason: "Date unavailable" } }}
      value="2026-09-24"
    />
    <Button intent="accent" size="md" type="submit" variant="primary">Submit</Button>
    <Text variant="body-sm">{submitted ? `Submitted ${submitted}` : "No submission"}</Text>
  </form>;
}

const meta = {
  id: "forms-date-picker",
  title: "Components/Forms/DatePicker",
  component: DatePicker,
  tags: ["test"],
  args: {
    appearance: "outlined",
    disabled: false,
    label: "Delivery date",
    locale: "en",
    required: false,
    size: "md",
    todayDay: "2026-09-19",
    unavailableDays: { "2026-09-22": { reason: "Date unavailable" } },
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
    todayDay: { control: "text" },
    minDay: { control: "text" },
    maxDay: { control: "text" },
    unavailableDays: { control: "object" },
    value: { control: "text" },
    width: { control: "inline-radio", options: ["fill", "hug"] },
    onValueChange: { control: false },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<DatePickerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">DatePicker</Text>
    <Text className={styles.secondary} variant="body-base">Type a calendar day or open the calendar. Calendar choices apply only after confirmation.</Text>
    <div className={styles.measure}><StatefulPicker key={`${args.locale}:${args.value}`} {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Open calendar" }));
    await expect(canvas.getByRole("grid", { name: "September 2026" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "September 25, 2026" }));
    await expect(canvas.getByRole("textbox", { name: "Delivery date Day" })).toHaveValue("24");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("textbox", { name: "Delivery date Day" })).toHaveValue("24");
  },
};

export const LocalesAndStates: Story = {
  name: "Locales and states",
  parameters: { controls: { disable: true } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Locale and availability</Text>
    <div className={styles.grid}>
      <StatefulPicker label="Delivery date" locale="en" todayDay="2026-09-19" value="2026-09-24" />
      <StatefulPicker label="Data de entrega" locale="pt" todayDay="2026-09-19" value="2026-09-24" />
      <StatefulPicker label="Required date" locale="en" required todayDay="2026-09-19" value={null} />
      <StatefulPicker disabled label="Disabled date" locale="en" todayDay="2026-09-19" value="2026-09-24" />
    </div>
  </main>,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: "Abrir calendário" })).toBeVisible();
    await expect(canvas.getAllByRole("button", { name: "Open calendar" }).filter((button) => button.hasAttribute("disabled"))).toHaveLength(1);
  },
};

export const NarrowPortuguese: Story = {
  name: "Narrow Portuguese",
  parameters: { controls: { disable: true }, viewport: { defaultViewport: "narrow" } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Escolha uma data</Text>
    <div className={styles.measure}>
      <StatefulPicker label="Data de entrega" locale="pt" todayDay="2026-09-19" value="2026-09-24" />
    </div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Abrir calendário" }));
    await expect(canvas.getByRole("grid", { name: "setembro de 2026" })).toBeVisible();
  },
};

export const FormValidity: Story = {
  name: "Form validity",
  parameters: { controls: { disable: true } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Unavailable typed date</Text>
    <FormValidityExample />
  </main>,
  play: async ({ canvas }) => {
    const day = canvas.getByRole("textbox", { name: "Delivery date Day" });
    await userEvent.clear(day);
    await userEvent.type(day, "22");
    await expect(canvas.getByText("Date unavailable")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Delivery date Day" })).toBeInvalid();
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("No submission")).toBeVisible();
    await userEvent.clear(day);
    await userEvent.type(day, "25");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("Submitted 2026-09-25")).toBeVisible();
  },
};
