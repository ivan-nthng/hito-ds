import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { DateRangePicker, type DateRangePickerProps } from "./DateRangePicker";
import { exampleQuickPeriods, exampleReferenceDay } from "./DateRangePicker.example";
import styles from "./DateRangePicker.stories.module.css";

function StatefulPicker({ value: initialValue, selectedQuickPeriodId: initialChoice, onValueChange, onQuickPeriodChange, ...props }: DateRangePickerProps) {
  const [value, setValue] = useState(initialValue);
  const [choice, setChoice] = useState(initialChoice ?? null);
  return <DateRangePicker
    {...props}
    onQuickPeriodChange={(next) => { setChoice(next); onQuickPeriodChange?.(next); }}
    onValueChange={(next) => { setValue(next); onValueChange?.(next); }}
    selectedQuickPeriodId={choice}
    value={value}
  />;
}

function FormExample() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  return <form className={styles.form} onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(`${data.get("startDay")} → ${data.get("endDay")}`);
  }}>
    <StatefulPicker
      endName="endDay"
      legend="Reporting period"
      locale="en"
      quickPeriods={exampleQuickPeriods}
      startName="startDay"
      todayDay={exampleReferenceDay}
      value={{ startDay: "2026-09-24", endDay: "2026-09-30" }}
    />
    <Button intent="accent" size="md" type="submit" variant="primary">Submit</Button>
    <Text variant="body-sm">{submitted ? `Submitted ${submitted}` : "No submission"}</Text>
  </form>;
}

const meta = {
  id: "forms-date-range-picker",
  title: "Components/Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["test"],
  args: {
    appearance: "outlined",
    calendarLayout: "regular",
    disabled: false,
    legend: "Reporting period",
    locale: "en",
    quickPeriods: exampleQuickPeriods,
    readOnly: false,
    required: false,
    selectedQuickPeriodId: "last-thirty-days",
    size: "md",
    todayDay: exampleReferenceDay,
    unavailableDays: { "2026-09-26": { reason: "Date unavailable" } },
    value: { startDay: "2026-08-31", endDay: "2026-09-29" },
  },
  argTypes: {
    appearance: { control: "inline-radio", options: ["outlined", "soft"] },
    calendarLayout: { control: "inline-radio", options: ["regular", "compact"] },
    disabled: { control: "boolean" },
    legend: { control: "text" },
    locale: { control: "inline-radio", options: ["en", "pt"] },
    quickPeriods: { control: "object" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    selectedQuickPeriodId: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    todayDay: { control: "text" },
    minDay: { control: "text" },
    maxDay: { control: "text" },
    unavailableDays: { control: "object" },
    value: { control: "object" },
    onValueChange: { control: false },
    onQuickPeriodChange: { control: false },
  },
  parameters: { layout: "fullscreen", figma: { label: "Assembled Calendar in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9080-653" } },
} satisfies Meta<DateRangePickerProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "Regular desktop Calendar in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9082-739" } },
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">DateRangePicker</Text>
    <Text className={styles.secondary} variant="body-base">Choose two inclusive endpoints or a caller-supplied quick period, then Apply.</Text>
    <div className={styles.measure}><StatefulPicker key={`${args.locale}:${JSON.stringify(args.value)}`} {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    if (window.matchMedia("(max-width: 39.999rem)").matches) {
      await expect(canvas.getByRole("grid", { name: "September 2026" })).toBeVisible();
      await expect(canvas.queryByRole("grid", { name: "August 2026" })).toBeNull();
      await userEvent.click(canvas.getByRole("button", { name: "Presets: Last 30 days" }));
    } else {
      await expect(canvas.getByRole("grid", { name: "August 2026" })).toBeVisible();
      await expect(canvas.getByRole("grid", { name: "September 2026" })).toBeVisible();
    }
    await expect(canvas.getByRole("button", { name: "Last 30 days" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Previous year" }));
    await expect(canvas.getByRole("button", { name: /Open date range picker/ })).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("button", { name: /August 31, 2026 – September 29, 2026/ })).toBeVisible();
  },
};

export const CompactDesktop: Story = {
  name: "Compact desktop",
  args: { calendarLayout: "compact" },
  tags: ["context-matrix"],
  parameters: { figma: { label: "Compact desktop Calendar in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9082-1311" } },
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Compact Calendar</Text>
    <div className={styles.measure}><StatefulPicker {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    await expect(canvas.getAllByRole("grid")).toHaveLength(1);
    await expect(canvas.getByRole("grid", { name: "September 2026" })).toBeVisible();
  },
};

function CompactTransaction({ locale }: { locale: "en" | "pt" }) {
  const [applied, setApplied] = useState(0);
  return <main className={styles.page}>
    <StatefulPicker calendarLayout="compact" desktopMonthCount={2} panelLayout="aligned" labelSize="sm" size="sm" required
      legend={locale === "pt" ? "Escolher período" : "Choose a period"} locale={locale} todayDay="2026-10-28"
      value={{ startDay: "2026-10-22", endDay: "2026-10-28" }} selectedQuickPeriodId="week"
      quickPeriods={[
        { id: "today", label: { en: "Today", pt: "Hoje" }, value: { startDay: "2026-10-28", endDay: "2026-10-28" } },
        { id: "week", label: { en: "Last 7 days", pt: "Últimos 7 dias" }, value: { startDay: "2026-10-22", endDay: "2026-10-28" } },
      ]} onApply={() => setApplied(count => count + 1)} />
    <Text role="status">Applied: {applied}</Text>
    <Button intent="neutral" variant="ghost" size="sm">Outside target</Button>
  </main>;
}

/** Native browser proof: real pointer/keyboard, no server reads or application session. */
export const ResponsiveCompact: Story = {
  name: "Responsive compact transaction", tags: ["context-matrix"],
  render: (_args, { globals }) => <CompactTransaction locale={String(globals.storyContentProfile).startsWith("pt") ? "pt" : "en"} />,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { userEvent: pointer, page } = await import("vitest/browser"), c = within(canvasElement);
    const pt = String(globals.storyContentProfile).startsWith("pt"), mobile = innerWidth < 640;
    const trigger = c.getByRole("button", { name: pt ? /^Abrir seletor de período:/ : /^Open date range picker:/ });
    expect(c.queryByRole("dialog")).toBeNull();
    const open = async () => { await pointer.click(trigger); await c.findByRole("dialog", { name: pt ? "Escolher período" : "Choose a period" }); };
    const preset = async () => {
      if (mobile) await pointer.click(c.getByRole("button", { name: pt ? /^Períodos:/ : /^Presets:/ }));
      await pointer.click(c.getByRole("button", { name: pt ? "Hoje" : "Today" }));
    };
    await open();
    await waitFor(() => expect(c.getAllByRole("grid")).toHaveLength(innerWidth >= 816 ? 2 : 1));
    const panel = c.getByRole("dialog", { name: pt ? "Escolher período" : "Choose a period" });
    expect(panel.getBoundingClientRect().right).toBeLessThanOrEqual(innerWidth);
    for (const field of panel.querySelectorAll("label")) {
      expect(getComputedStyle(field).fontSize).toBe("12px"); expect(parseFloat(getComputedStyle(field).lineHeight)).toBeCloseTo(16, 2);
    }
    for (const grid of c.getAllByRole("grid")) {
      const day = grid.querySelector("button")!;
      expect(day.getBoundingClientRect().width).toBeGreaterThanOrEqual(40);
      expect(day.getBoundingClientRect().height).toBeGreaterThanOrEqual(mobile ? 44 : 40);
    }
    const announcement = c.getByText(pt ? /^Período selecionado:/ : /^Selected range:/);
    expect(announcement).toHaveAttribute("aria-live", "polite"); expect(announcement.getBoundingClientRect().width).toBe(1);
    if (mobile) {
      const title = within(panel).getByRole("heading", { name: pt ? "Escolher período" : "Choose a period" });
      expect(getComputedStyle(title).fontSize).toBe("14px");
      const box = title.getBoundingClientRect(), bounds = panel.getBoundingClientRect();
      expect(box.left + box.width / 2).toBeCloseTo(bounds.left + bounds.width / 2, 1);
    }
    await page.screenshot({ path: `__screenshots__/v3/savi55-compact-${innerWidth}.png` });
    await preset(); expect(c.getByRole("status")).toHaveTextContent("Applied: 0");
    if (mobile) {
      await pointer.click(c.getByRole("button", { name: pt ? /^Períodos:/ : /^Presets:/ }));
      await page.screenshot({ path: `__screenshots__/v3/savi55-preset-back-${innerWidth}.png` });
      await pointer.click(c.getByRole("button", { name: pt ? "Calendário" : "Calendar" }));
      expect(c.getAllByRole("grid")).toHaveLength(1);
    }
    await pointer.click(c.getByRole("button", { name: pt ? "Cancelar" : "Cancel" }));
    await waitFor(() => expect(trigger).toHaveFocus()); expect(c.getByRole("status")).toHaveTextContent("Applied: 0");
    await open(); await preset();
    await pointer.click(c.getByRole("button", { name: pt ? "Aplicar período" : "Apply range" }));
    await waitFor(() => expect(trigger).toHaveFocus()); expect(c.getByRole("status")).toHaveTextContent("Applied: 1");
    await open();
    const day = canvasElement.querySelector<HTMLButtonElement>('[data-calendar-day="2026-10-28"]')!;
    await pointer.click(day); await pointer.keyboard("{PageUp}");
    await waitFor(() => expect(canvasElement.querySelector('[data-calendar-day="2026-09-28"]')).toHaveFocus());
    expect(getComputedStyle(document.activeElement!).outlineStyle).not.toBe("none");
    await pointer.keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus());
    expect(c.getByRole("status")).toHaveTextContent("Applied: 1");
    await open(); await preset();
    if (mobile) await pointer.click(c.getByRole("button", { name: pt ? "Fechar seletor de período" : "Close date range picker" }));
    else await pointer.click(canvasElement, { position: { x: innerWidth - 4, y: innerHeight - 4 } });
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    expect(c.queryByRole("dialog")).toBeNull();
    expect(c.getByRole("status")).toHaveTextContent("Applied: 1");
  },
};

export const MonthYearNavigation: Story = {
  name: "Month and year",
  parameters: { viewport: { defaultViewport: "narrow" }, figma: { label: "Mobile month and year navigation in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9084-1825" } },
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Month and year</Text>
    <div className={styles.measure}><StatefulPicker {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    await userEvent.click(canvas.getByRole("button", { name: "September 2026" }));
    await expect(canvas.getByRole("group", { name: "Choose month and year" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /^2025$/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Use entire year 2025" }));
    await expect(canvas.getByRole("button", { name: "Apply range" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.getByRole("button", { name: /August 31, 2026 – September 29, 2026/ })).toBeVisible();
  },
};

export const MobilePresets: Story = {
  name: "Mobile presets",
  parameters: { viewport: { defaultViewport: "narrow" }, figma: { label: "Mobile preset navigation in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9084-1584" } },
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Mobile presets</Text>
    <div className={styles.measure}><StatefulPicker {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    if (window.matchMedia("(max-width: 39.999rem)").matches) {
      await userEvent.click(canvas.getByRole("button", { name: "Presets: Last 30 days" }));
      await expect(canvas.queryByRole("grid")).toBeNull();
    }
    await expect(canvas.getByRole("button", { name: "Last 30 days" })).toHaveAttribute("aria-pressed", "true");
  },
};

export const DarkMobile: Story = {
  name: "Dark mobile",
  globals: { colorScheme: "dark" },
  parameters: { viewport: { defaultViewport: "narrow" }, figma: { label: "Dark mobile Calendar in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9084-2587" } },
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Dark mobile Calendar</Text>
    <div className={styles.measure}><StatefulPicker {...args} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    await expect(canvas.getByRole("grid", { name: "September 2026" })).toBeVisible();
  },
};

export const PortugueseLongCopy: Story = {
  name: "Portuguese long copy",
  args: { legend: "Período de análise e acompanhamento", locale: "pt" },
  parameters: { viewport: { defaultViewport: "narrow" } },
  render: (args) => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Período de relatório</Text>
    <div className={styles.measure}><StatefulPicker {...args} /></div>
  </main>,
};

export const NarrowPortuguese: Story = {
  name: "Narrow Portuguese",
  tags: ["context-matrix"],
  parameters: { controls: { disable: true }, viewport: { defaultViewport: "narrow" }, figma: { label: "Mobile Calendar in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9084-1316" } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Período de relatório</Text>
    <div className={styles.measure}><StatefulPicker legend="Período" locale="pt" quickPeriods={exampleQuickPeriods} todayDay={exampleReferenceDay} value={{ startDay: "2026-09-24", endDay: "2026-09-30" }} /></div>
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Abrir seletor de período/ }));
    await expect(canvas.getByRole("dialog", { name: "Período" })).toBeVisible();
    await expect(canvas.getByRole("grid", { name: "setembro de 2026" })).toBeVisible();
    if (window.matchMedia("(max-width: 39.999rem)").matches) {
      await expect(canvas.queryByRole("grid", { name: "outubro de 2026" })).not.toBeInTheDocument();
    } else {
      await expect(canvas.getByRole("grid", { name: "outubro de 2026" })).toBeVisible();
    }
    if (window.matchMedia("(max-width: 39.999rem)").matches) {
      await userEvent.click(canvas.getByRole("button", { name: "Períodos: Personalizado" }));
    }
    await expect(canvas.getByRole("button", { name: "Últimos 6 meses" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Últimos 6 meses" }));
    await expect(canvas.getByRole("textbox", { name: "Data de início Dia" })).toHaveValue("30");
    await userEvent.click(canvas.getByRole("button", { name: "Cancelar" }));
    await expect(canvas.getByRole("button", { name: /24 de setembro de 2026 – 30 de setembro de 2026/ })).toBeVisible();
  },
};

export const FormValidity: Story = {
  name: "Form validity",
  parameters: { controls: { disable: true } },
  render: () => <main className={styles.page}>
    <Text as="h1" variant="heading-lg">Draft and form submission</Text>
    <FormExample />
  </main>,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    await userEvent.clear(canvas.getByRole("textbox", { name: "End date Day" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "End date Day" }), "25");
    await expect(canvas.getByRole("textbox", { name: "End date Day" })).toBeInvalid();
    await expect(document.querySelector("form")!.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("No submission")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /Open date range picker/ }));
    await userEvent.clear(canvas.getByRole("textbox", { name: "End date Day" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "End date Day" }), "25");
    await userEvent.click(canvas.getByRole("button", { name: "Apply range" }));
    await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
    await expect(canvas.getByText("Submitted 2026-09-24 → 2026-09-25")).toBeVisible();
  },
};
