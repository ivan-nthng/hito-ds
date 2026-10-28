import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Text } from "../Text/Text";
import { TimePicker, type TimePickerProps } from "./TimePicker";
import styles from "./TimePicker.stories.module.css";

function Example({ locale, value: initial = "12:00", label, ...props }: Partial<TimePickerProps> & { locale: "en" | "pt" }) {
  const [value, setValue] = useState(initial), [commits, setCommits] = useState(0), pt = locale === "pt";
  return <div className={styles.page}>
    <Text as="h1" variant="heading-sm">TimePicker</Text>
    <form aria-label="Time example" className={styles.measure}>
      <TimePicker {...props} label={label ?? (pt ? "Horário inicial" : "Start time")} locale={locale} value={value} name="time"
        onValueChange={next => { setValue(next); setCommits(n => n + 1); }} />
      <Text variant="body-sm" data-applied-time>{value ?? "Empty"}</Text>
      <Text variant="body-sm" data-commit-count>{commits}</Text>
    </form>
  </div>;
}
const localeOf = (globals: Record<string, unknown>): "en" | "pt" => String(globals.storyContentProfile).startsWith("pt") ? "pt" : "en";
const meta = {
  title: "Components/Forms/TimePicker", id: "forms-time-picker", component: TimePicker, tags: ["test", "context-matrix"],
  parameters: { layout: "fullscreen", figma: { url: "https://github.com/ivan-nthng/hito-ds/blob/main/docs/figma-and-code.md#figma-file-and-mappings" },
    docs: { description: { component: "Controlled local24-hour HH:mm. Two independent hour/minute lists edit a draft; only Set time commits. Close/Escape/outside dismiss discard. Existing Popover and compact BottomSheet own focus and safe areas. No timezone, interval duration, minute-step policy or server eligibility. Restaurant schedule consumers own those facts." } } },
  args: { value: "12:00", locale: "en", label: "Start time", appearance: "soft", size: "sm", width: "fill", disabled: false, readOnly: false },
  argTypes: { value: { control: "text" }, locale: { control: "inline-radio", options: ["en", "pt"] }, size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    appearance: { control: "inline-radio", options: ["soft", "outlined"] }, width: { control: "inline-radio", options: ["fill", "hug"] }, onValueChange: { control: false } },
} satisfies Meta<TimePickerProps>;
export default meta;
type Story = StoryObj<typeof meta>;
async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard(keys); }
  else await userEvent.keyboard(keys);
}
async function click(element: HTMLElement) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.click(element); }
  else await userEvent.click(element);
}
async function snapshot(label: string) {
  if (import.meta.env.MODE !== "test") return;
  const { page } = await import("vitest/browser");
  await page.screenshot({ path: `__screenshots__/savi438-${label}-${innerWidth}.png` });
}
async function pointerAt(x: number, y: number, wheel = false) {
  const { cdp } = await import("vitest/browser"), session = cdp(), frame = window.frameElement?.getBoundingClientRect(), scale = frame ? frame.width / innerWidth : 1;
  const point = { x: x * scale + (frame?.left ?? 0), y: y * scale + (frame?.top ?? 0) };
  if (wheel) await session.send("Input.dispatchMouseEvent", { type: "mouseWheel", ...point, deltaX: 0, deltaY: 220 });
  else {
    await session.send("Input.dispatchMouseEvent", { type: "mousePressed", ...point, button: "left", clickCount: 1 });
    await session.send("Input.dispatchMouseEvent", { type: "mouseReleased", ...point, button: "left", clickCount: 1 });
  }
}
async function scrollColumn(element: HTMLElement) {
  if (import.meta.env.MODE !== "test") { element.scrollTop += 220; return; }
  const box = element.getBoundingClientRect(); await pointerAt(box.left + box.width / 2, box.top + box.height / 2, true);
}
export const Playground: Story = {
  render: (args, { globals }) => {
    const locale = localeOf(globals) === "pt" ? "pt" : args.locale;
    return <Example key={`${locale}:${args.value}`} {...args} locale={locale} label={locale === "pt" && args.label === "Start time" ? "Horário inicial" : args.label} />;
  },
  play: async ({ canvasElement, globals }) => {
    const c = within(canvasElement), pt = localeOf(globals) === "pt", trigger = c.getByRole("combobox", { name: pt ? "Horário inicial" : "Start time" });
    await click(trigger);
    const hour = await c.findByRole("listbox", { name: pt ? "Horas" : "Hours" }), minute = c.getByRole("listbox", { name: pt ? "Minutos" : "Minutes" });
    expect(within(hour).getAllByRole("option")).toHaveLength(24); expect(within(minute).getAllByRole("option")).toHaveLength(60);
    await waitFor(() => expect(hour).toHaveFocus());
    const panel = c.getByRole("dialog"), button = c.getByRole("button", { name: pt ? "Definir horário" : "Set time" });
    if (innerWidth < 640 && matchMedia("(prefers-reduced-motion: reduce)").matches) expect(panel.getAnimations()).toHaveLength(0);
    await waitFor(() => expect(panel.getAnimations().filter(animation => animation.playState === "running")).toHaveLength(0));
    expect(Math.abs(panel.getBoundingClientRect().right - button.getBoundingClientRect().right - (innerWidth < 640 ? 12 : 13))).toBeLessThanOrEqual(1);
    expect(Math.abs(panel.getBoundingClientRect().bottom - button.getBoundingClientRect().bottom - (innerWidth < 640 ? 12 : 13))).toBeLessThanOrEqual(1);
    expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(305);
    expect(button.getBoundingClientRect().height).toBe(36);
    for (const icon of panel.querySelectorAll<HTMLElement>("[data-icon-name]")) {
      expect(getComputedStyle(icon).maskImage).not.toBe("none"); expect(icon.getBoundingClientRect().width).toBe(16);
    }
    await snapshot("open");
    await click(within(hour).getByRole("option", { name: /^13$/ }));
    await click(within(minute).getByRole("option", { name: /^37$/ }));
    expect(minute).toHaveFocus(); expect(within(minute).getByRole("option", { name: /^37$/ })).toHaveAttribute("data-active", "true");
    expect(new FormData(c.getByRole("form") as HTMLFormElement).get("time")).toBe("12:00");
    await click(button); await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveTextContent("13:37"); expect(canvasElement.querySelector("[data-commit-count]")).toHaveTextContent("1");
    await click(trigger); await click(within(await c.findByRole("listbox", { name: pt ? "Horas" : "Hours" })).getByRole("option", { name: /^23$/ }));
    await keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus()); expect(trigger).toHaveTextContent("13:37");
  },
};
export const KeyboardAndScroll: Story = {
  render: (_args, { globals }) => <Example locale={localeOf(globals)} />,
  play: async ({ canvasElement, globals }) => {
    const c = within(canvasElement), pt = localeOf(globals) === "pt", trigger = c.getByRole("combobox", { name: pt ? "Horário inicial" : "Start time" });
    trigger.focus(); await keyboard("{ArrowDown}");
    const hour = await c.findByRole("listbox", { name: pt ? "Horas" : "Hours" }), minute = c.getByRole("listbox", { name: pt ? "Minutos" : "Minutes" });
    await waitFor(() => expect(hour).toHaveFocus());
    const hourScroll = hour.parentElement!, minuteScroll = minute.parentElement!;
    if (innerWidth < 640) await waitFor(() => expect(c.getByRole("dialog").getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight));
    const hourTop = hourScroll.scrollTop; await scrollColumn(minuteScroll);
    await waitFor(() => expect(minuteScroll.scrollTop).toBeGreaterThan(0)); expect(hourScroll.scrollTop).toBe(hourTop);
    const minuteTop = minuteScroll.scrollTop; await scrollColumn(hourScroll);
    await waitFor(() => expect(hourScroll.scrollTop).toBeGreaterThan(hourTop)); expect(minuteScroll.scrollTop).toBe(minuteTop);
    await keyboard("{End}{Enter}{Tab}"); expect(minute).toHaveFocus();
    await keyboard("{End}{Enter}{Tab}"); expect(c.getByRole("button", { name: pt ? "Definir horário" : "Set time" })).toHaveFocus();
    expect(new FormData(c.getByRole("form") as HTMLFormElement).get("time")).toBe("12:00");
    await keyboard("{Enter}"); await waitFor(() => expect(trigger).toHaveFocus()); expect(trigger).toHaveTextContent("23:59");
    await click(trigger); const hours = await c.findByRole("listbox", { name: pt ? "Horas" : "Hours" });
    expect(within(hours).getByRole("option", { name: /^23$/ })).toHaveAttribute("aria-selected", "true");
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  },
};
export const Dismissal: Story = {
  render: (_args, { globals }) => <Example locale={localeOf(globals)} />,
  play: async ({ canvasElement, globals }) => {
    const c = within(canvasElement), pt = localeOf(globals) === "pt", trigger = c.getByRole("combobox", { name: pt ? "Horário inicial" : "Start time" });
    await click(trigger);
    await click(within(await c.findByRole("listbox", { name: pt ? "Horas" : "Hours" })).getByRole("option", { name: /^14$/ }));
    if (innerWidth < 640) {
      await click(c.getByRole("button", { name: pt ? "Fechar seletor de horário" : "Close time picker" }));
      await waitFor(() => expect(trigger).toHaveFocus()); expect(trigger).toHaveTextContent("12:00");
      await click(trigger); await c.findByRole("listbox", { name: pt ? "Horas" : "Hours" });
      await waitFor(() => expect(c.getByRole("dialog").getBoundingClientRect().bottom).toBeLessThanOrEqual(innerHeight));
      if (import.meta.env.MODE === "test") await pointerAt(8, 8); else await keyboard("{Escape}");
      await waitFor(() => expect(trigger).toHaveFocus());
    } else await click(c.getByRole("heading", { level: 1, name: "TimePicker" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false")); expect(trigger).toHaveTextContent("12:00");
    expect(canvasElement.querySelector("[data-commit-count]")).toHaveTextContent("0");
  },
};
export const EmptyAndStates: Story = {
  render: (_args, { globals }) => <main className={styles.page}><Text as="h1" variant="heading-sm">TimePicker states</Text><div className={styles.grid}>
    <Example locale={localeOf(globals)} value={null} required />
    <TimePicker locale="en" label="End time" value="11:00" error="End time must be later than start time." />
    <TimePicker locale="en" label="Disabled time" value="12:00" disabled />
    <TimePicker locale="en" label="Read-only time" value="12:00" readOnly />
  </div></main>,
  play: async ({ canvasElement, globals }) => {
    const c = within(canvasElement), pt = localeOf(globals) === "pt", trigger = c.getByRole("combobox", { name: pt ? "Horário inicial" : "Start time" });
    expect(c.getByRole("combobox", { name: "Disabled time" })).toBeDisabled(); expect(c.getByRole("combobox", { name: "End time" })).toHaveAttribute("aria-invalid", "true");
    expect(c.getByRole("combobox", { name: "Read-only time" })).toHaveAttribute("aria-expanded", "false");
    await click(trigger); const button = c.getByRole("button", { name: pt ? "Definir horário" : "Set time" }); expect(button).toBeDisabled();
    await keyboard("{Enter}{Tab}{Enter}"); expect(button).toBeEnabled(); expect(trigger).toHaveTextContent("--:--");
    await click(button); expect(trigger).toHaveTextContent("00:00");
    await snapshot("states");
  },
};
