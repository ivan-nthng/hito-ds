import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { DateRangeField, type DateRangeFieldProps } from "./DateRangeField";
import styles from "./DateRangeField.stories.module.css";

function StatefulRange({ value: initialValue, onValueChange, ...props }: DateRangeFieldProps) {
  const [value, setValue] = useState(initialValue);
  return <DateRangeField {...props} onValueChange={(next) => { setValue(next); onValueChange?.(next); }} value={value} />;
}

function OrderingForm() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return <form className={styles.form} onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(`${data.get("startDay")} → ${data.get("endDay")}`);
  }}>
    <StatefulRange
      endName="endDay"
      legend="Delivery period"
      locale="en"
      startName="startDay"
      value={{ startDay: "2026-09-24", endDay: "2026-09-30" }}
    />
    <Button intent="accent" size="md" type="submit" variant="primary">Submit</Button>
    <Text variant="body-sm">{submitted ? `Submitted ${submitted}` : "No submission"}</Text>
  </form>;
}

const meta = {
  id: "forms-date-range-field",
  title: "Components/Forms/DateRangeField",
  component: DateRangeField,
  tags: ["test"],
  args: {
    appearance: "outlined",
    disabled: false,
    endLabel: "End date",
    endpointLayout: "responsive",
    legend: "Delivery period",
    locale: "en",
    readOnly: false,
    required: false,
    size: "md",
    startLabel: "Start date",
    value: { startDay: "2026-09-24", endDay: "2026-09-30" },
  },
  argTypes: {
    appearance: { control: "inline-radio", options: ["outlined", "soft"] },
    disabled: { control: "boolean" },
    endLabel: { control: "text" },
    endpointLayout: { control: "inline-radio", options: ["responsive", "columns"] },
    legend: { control: "text" },
    locale: { control: "inline-radio", options: ["en", "pt"] },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    startLabel: { control: "text" },
    value: { control: "object" },
    onValueChange: { control: false },
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<DateRangeFieldProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">DateRangeField</Text>
    <Text className={styles.secondary} variant="body-base">Enter an inclusive start and end day. Invalid order stays visible until corrected.</Text>
    <div className={styles.measure}><StatefulRange key={`${args.locale}:${JSON.stringify(args.value)}`} {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("group", { name: "Delivery period" })).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Start date Day" })).toHaveValue("24");
    await expect(canvas.getByRole("textbox", { name: "End date Day" })).toHaveValue("30");
  },
};

export const LocalesAndStates: Story = {
  name: "Locales and states",
  parameters: { controls: { disable: true } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Locale and states</Text>
    <div className={styles.grid}>
      <StatefulRange legend="Delivery period" locale="en" value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} />
      <StatefulRange legend="Período de entrega" locale="pt" value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} />
      <StatefulRange legend="Reversed period" locale="en" value={{ startDay: "2026-09-30", endDay: "2026-09-24" }} />
      <StatefulRange legend="Required period" locale="en" required value={null} />
      <StatefulRange disabled legend="Disabled period" locale="en" value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} />
      <StatefulRange legend="Read-only period" locale="en" readOnly value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} />
    </div>
  </main>,
  play: async ({ canvas }) => {
    await expect(canvas.queryByText("A data de término deve ser igual ou posterior à data de início.")).not.toBeInTheDocument();
    await expect(canvas.getByText("End date must be on or after start date.")).toBeVisible();
    await expect(canvas.getByRole("textbox", { name: "Data de início Dia" })).toBeVisible();
  },
};

export const NarrowPortuguese: Story = {
  name: "Narrow Portuguese",
  parameters: { controls: { disable: true }, viewport: { defaultViewport: "narrow" } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Período</Text>
    <div className={styles.measure}>
      <StatefulRange legend="Período de entrega" locale="pt" value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} />
    </div>
  </main>,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("textbox", { name: "Data de início Dia" })).toHaveValue("24");
    await expect(canvas.getByRole("textbox", { name: "Data de término Dia" })).toHaveValue("30");
  },
};

export const FormValidity: Story = {
  name: "Form validity",
  parameters: { controls: { disable: true } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Ordering and native validity</Text>
    <OrderingForm />
  </main>,
  play: async ({ canvas }) => {
    const endDay = canvas.getByRole("textbox", { name: "End date Day" });
    await userEvent.clear(endDay);
    await userEvent.type(endDay, "20");
    await expect(canvas.getByText("End date must be on or after start date.")).toBeVisible();
    await expect(endDay).toBeInvalid();
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("No submission")).toBeVisible();
    await userEvent.clear(endDay);
    await userEvent.type(endDay, "25");
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("Submitted 2026-09-24 → 2026-09-25")).toBeVisible();
  },
};
