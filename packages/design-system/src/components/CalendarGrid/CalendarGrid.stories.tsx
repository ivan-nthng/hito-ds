import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { Text } from "../Text/Text";
import { CalendarGrid, type CalendarGridProps } from "./CalendarGrid";
import styles from "./CalendarGrid.stories.module.css";

function StatefulGrid({ month: initialMonth, selection: initialSelection, onDaySelect, ...props }: CalendarGridProps) {
  const [month, setMonth] = useState(initialMonth);
  const [selection, setSelection] = useState(initialSelection);
  return (
    <CalendarGrid
      {...props}
      month={month}
      onDaySelect={(day) => {
        setSelection({ kind: "day", day });
        onDaySelect(day);
      }}
      onMonthChange={setMonth}
      selection={selection}
    />
  );
}

function RangeGrid(props: CalendarGridProps) {
  const [month, setMonth] = useState(props.month);
  return <CalendarGrid {...props} month={month} onMonthChange={setMonth} />;
}

const meta = {
  id: "internal-calendar-grid",
  title: "Internal/Date/CalendarGrid",
  component: CalendarGrid,
  tags: ["test"],
  args: {
    density: "regular",
    locale: "en",
    month: "2026-09",
    onDaySelect: () => {},
    onMonthChange: () => {},
    selection: { kind: "day", day: "2026-09-24" },
    todayDay: "2026-09-19",
    unavailableDays: { "2026-09-22": { reason: "Date unavailable" } },
  },
  argTypes: {
    density: { control: "inline-radio", options: ["regular", "compact", "mobile"] },
    locale: { control: "inline-radio", options: ["en", "pt"] },
    month: { control: "text" },
    selection: { control: "object" },
    todayDay: { control: "text" },
    minDay: { control: "text" },
    maxDay: { control: "text" },
    unavailableDays: { control: "object" },
    onDaySelect: { control: false },
    onMonthChange: { control: false },
    onHeadingClick: { control: false },
  },
  parameters: { layout: "fullscreen", figma: { label: "Calendar composition in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9080-653" } },
} satisfies Meta<CalendarGridProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">CalendarGrid</Text>
      <Text className={styles.secondary} variant="body-base">
        Internal one-month grid. Arrow keys move by day or week; Page Up and Down move by month.
      </Text>
      <div className={styles.measure}>
        <StatefulGrid key={`${args.locale}:${args.month}`} {...args} />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const selected = canvas.getByRole("button", { name: /September 24, 2026, Selected/ });
    await userEvent.click(selected);
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("button", { name: "September 25, 2026" })).toHaveFocus();
  },
};

export const RangeAndAvailability: Story = {
  name: "Range and availability",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">Range states</Text>
      <div className={styles.measure}>
        <RangeGrid
          locale="en"
          month="2026-09"
          onDaySelect={() => {}}
          onMonthChange={() => {}}
          selection={{ kind: "range", startDay: "2026-09-24", endDay: "2026-09-30" }}
          todayDay="2026-09-19"
          unavailableDays={{ "2026-09-22": { reason: "Date unavailable" } }}
        />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const unavailable = canvas.getByRole("button", { name: /September 22, 2026, Unavailable: Date unavailable/ });
    await expect(unavailable).toHaveAttribute("aria-disabled", "true");
    await userEvent.hover(unavailable);
    await expect(await canvas.findByText("September 22, 2026: Date unavailable")).toBeVisible();
  },
};

export const NarrowPortuguese: Story = {
  name: "Narrow Portuguese",
  parameters: { controls: { disable: true }, viewport: { defaultViewport: "narrow" } },
  render: () => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">Calendário</Text>
      <div className={styles.narrow}>
        <StatefulGrid
          density="mobile"
          locale="pt"
          month="2026-09"
          onDaySelect={() => {}}
          onMonthChange={() => {}}
          selection={{ kind: "day", day: "2026-09-24" }}
          todayDay="2026-09-19"
        />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("grid", { name: "setembro de 2026" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Próximo mês" })).toBeVisible();
  },
};
