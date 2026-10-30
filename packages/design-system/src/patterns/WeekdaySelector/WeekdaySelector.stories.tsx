import { useId, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Text } from "../../components/Text/Text";
import { WeekdaySelector, type WeekdaySelectorDay, type WeekdaySelectorOption } from "./WeekdaySelector";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const copy = {
  en: { label: "Operating days", unanswered: "Days have not been supplied.", empty: "No days selected.",
    short: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], full: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
  pt: { label: "Dias de funcionamento", unanswered: "Os dias de funcionamento ainda não foram informados.", empty: "Nenhum dia selecionado.",
    short: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"], full: ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"] },
};
type Args = { state: "unanswered" | "none" | "some" | "all"; size: "md" | "lg"; disabled: boolean };
function Example({ state, size, disabled, portuguese }: Args & { portuguese: boolean }) {
  const m = copy[portuguese ? "pt" : "en"], id = useId();
  const [value, setValue] = useState<WeekdaySelectorDay[] | null>(() => state === "unanswered" ? null : state === "all" ? [...days] : state === "some" ? ["mon", "wed", "fri"] : []);
  const options: WeekdaySelectorOption[] = days.map((value, index) => ({ value, label: m.short[index], accessibleLabel: m.full[index] }));
  const first = useRef<HTMLButtonElement>(null), hint = value === null ? m.unanswered : !value.length ? m.empty : null;
  return <div style={{ display: "grid", gap: "var(--layout-space-fixed-md)", maxInlineSize: "40rem" }}>
    <WeekdaySelector label={m.label} options={options} value={value ?? []} onValueChange={setValue} size={size} disabled={disabled}
      firstButtonRef={first} aria-describedby={hint ? id : undefined} />
    {hint ? <Text id={id} variant="body-sm">{hint}</Text> : null}
    <Text role="status" variant="body-sm">{value === null ? "unknown" : JSON.stringify(value)}</Text>
  </div>;
}
const meta = {
  title: "Patterns/Forms & Validation/WeekdaySelector", id: "patterns-weekday-selector", tags: ["test", "context-matrix"],
  args: { state: "some", size: "md", disabled: false },
  argTypes: { state: { control: "inline-radio", options: ["unanswered", "none", "some", "all"] }, size: { control: "inline-radio", options: ["md", "lg"] } },
  parameters: { layout: "fullscreen", controls: { include: ["state", "size", "disabled"] },
    docs: { description: { component: "Controlled independent native Button composition. Caller supplies display order, short/full labels and selection; unanswered/closed meaning, hints, validation, scheduling and persistence stay outside the pattern. Existing MD/LG controls wrap without a custom keyboard model or control restyling. [Figma component](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9475-3) · [Native examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9477-23)." } } },
  render: (args, { globals }) => <FoundationStoryPage title="WeekdaySelector" description="Seven independent toggle buttons with caller-owned content and state." width="wide">
    <Example key={`${args.state}:${args.size}:${args.disabled}:${globals.storyContentProfile}`} {...args} portuguese={String(globals.storyContentProfile).startsWith("pt")} />
  </FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

async function checkLayout(canvasElement: HTMLElement, size: Args["size"]) {
  const group = within(canvasElement).getByRole("group"), buttons = within(group).getAllByRole("button");
  await expect(buttons).toHaveLength(7);
  await expect(group.querySelector("[data-icon-name]")).toBeNull();
  for (const button of buttons) {
    await expect(button).toHaveAttribute("type", "button");
    await expect(button).toHaveAccessibleName();
    await expect(button.getBoundingClientRect().height).toBe(size === "lg" ? 44 : 36);
    await expect(button.getBoundingClientRect().width).toBeGreaterThanOrEqual(size === "lg" ? 44 : 36);
  }
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  if (window.innerWidth <= 320) await expect(new Set(buttons.map(button => button.getBoundingClientRect().top)).size).toBeGreaterThan(1);
}
export const Unanswered: Story = { args: { state: "unanswered" }, play: async ({ canvasElement, globals }) => {
  const canvas = within(canvasElement), m = copy[String(globals.storyContentProfile).startsWith("pt") ? "pt" : "en"];
  await expect(canvas.getByRole("group")).toHaveAccessibleDescription(m.unanswered);
  await expect(canvas.getByRole("status")).toHaveTextContent("unknown");
  await userEvent.click(canvas.getByRole("button", { name: m.full[0] }));
  await expect(canvas.getByRole("status")).toHaveTextContent('["mon"]');
  await checkLayout(canvasElement, "md");
} };
export const NoSelectedDays: Story = { args: { state: "none" }, play: async ({ canvasElement, globals }) => {
  const canvas = within(canvasElement), m = copy[String(globals.storyContentProfile).startsWith("pt") ? "pt" : "en"];
  await expect(canvas.getByRole("group")).toHaveAccessibleDescription(m.empty);
  await expect(canvas.getByRole("status")).toHaveTextContent("[]");
  await checkLayout(canvasElement, "md");
} };
export const SomeSelectedDays: Story = { play: async ({ canvasElement }) => {
  const buttons = within(within(canvasElement).getByRole("group")).getAllByRole("button");
  for (const [index, button] of buttons.entries()) {
    const selected = [0, 2, 4].includes(index);
    await expect(button).toHaveAttribute("aria-pressed", String(selected));
    await expect(button).toHaveAttribute("data-variant", selected ? "primary" : "secondary");
    await expect(button).toHaveAttribute("data-intent", selected ? "accent" : "neutral");
  }
  await checkLayout(canvasElement, "md");
} };
export const AllSelectedDays: Story = { args: { state: "all" }, play: async ({ canvasElement }) => {
  for (const button of within(within(canvasElement).getByRole("group")).getAllByRole("button")) await expect(button).toHaveAttribute("aria-pressed", "true");
  await checkLayout(canvasElement, "md");
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement }) => {
  for (const button of within(within(canvasElement).getByRole("group")).getAllByRole("button")) await expect(button).toBeDisabled();
  await expect(within(canvasElement).getByRole("status")).toHaveTextContent('["mon","wed","fri"]');
  await checkLayout(canvasElement, "md");
} };
export const LargeTargets: Story = { args: { size: "lg" }, play: async ({ canvasElement }) => checkLayout(canvasElement, "lg") };
export const NativeKeyboard: Story = { play: async ({ canvasElement, globals }) => {
  const canvas = within(canvasElement), m = copy[String(globals.storyContentProfile).startsWith("pt") ? "pt" : "en"];
  const monday = canvas.getByRole("button", { name: m.full[0] }), tuesday = canvas.getByRole("button", { name: m.full[1] });
  monday.focus(); await userEvent.keyboard(" ");
  await expect(monday).toHaveFocus(); await expect(monday).toHaveAttribute("aria-pressed", "false");
  await userEvent.keyboard("{Tab}{Enter}");
  await expect(tuesday).toHaveFocus(); await expect(tuesday).toHaveAttribute("aria-pressed", "true");
  await expect(canvas.getByRole("button", { name: m.full[2] })).toHaveAttribute("aria-pressed", "true");
  await expect(canvas.getByRole("status")).toHaveTextContent('["tue","wed","fri"]');
  await checkLayout(canvasElement, "md");
} };
