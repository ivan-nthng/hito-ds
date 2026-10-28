import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { referenceSpacingById } from "@hito-ds/react/tokens/reference-spacing";
import { fixedUiRadii } from "@hito-ds/react/tokens/semantic-radii";
import { FoundationStoryPage, FoundationStorySection } from "../../foundations/FoundationStoryLayout";
import { getStoryContent } from "../../storybook/story-content";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Menu, type MenuEntry } from "./Menu";
import styles from "./MenuRadiusPreview.stories.module.css";

type Args = { size: "sm" | "md" };

function geometry(size: Args["size"]) {
  const row = fixedUiRadii.find(role => role.id === `radius/ui/${size}`);
  if (!row) throw new Error(`Missing UI radius for ${size}`);
  const insetId = size === "sm" ? "space/1" : "space/1.5";
  return {
    row: row.resolvedSourcePx,
    inset: referenceSpacingById[insetId].sourcePx,
    outer: row.resolvedSourcePx + referenceSpacingById[insetId].sourcePx,
  };
}

function Example({ size, profile }: Args & { profile: unknown }) {
  const [open, setOpen] = useState(false);
  const pt = getStoryContent(profile).lang === "pt-BR";
  const copy = pt
    ? { trigger: "Dados: Modificado", label: "Dados locais", empty: "Vazio", demo: "Demo", status: "Ver status Local…" }
    : { trigger: "Data: Modified", label: "Local data", empty: "Empty", demo: "Demo", status: "View Local status…" };
  const calculated = geometry(size);
  const items: MenuEntry[] = [
    { id: "empty", label: copy.empty, checked: false },
    { id: "demo", label: copy.demo, checked: false },
    { id: "status", label: copy.status },
  ];
  return <FoundationStoryPage title="Menu radius nesting"
    description="Menu uses its ListItem radius plus panel inset, without an extra radius step.">
    <FoundationStorySection title={size.toUpperCase()}>
      <Text variant="technical-sm">{calculated.row}px row + {calculated.inset}px inset = {calculated.outer}px outer radius</Text>
      <div className={styles.stage}>
        <Menu size={size} open={open} onOpenChange={setOpen} label={copy.label} items={items}
          trigger={<Button size={size} variant="ghost" intent="neutral" trailingIcon="arrows/compact/down">{copy.trigger}</Button>}
          onAction={() => {}} />
      </div>
    </FoundationStorySection>
  </FoundationStoryPage>;
}

const meta = {
  id: "internal-menu-radius-preview",
  title: "Internal/Test Harnesses/Menu Radius",
  tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["size"] } },
  args: { size: "sm" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
  render: (args, { globals }) => <Example key={`${args.size}-${String(globals.storyContentProfile)}`} {...args} profile={globals.storyContentProfile} />,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ args, canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const pt = getStoryContent(globals.storyContentProfile).lang === "pt-BR";
    await userEvent.click(canvas.getByRole("button", { name: pt ? "Dados: Modificado" : "Data: Modified" }));
    const item = canvas.getByRole("menuitemradio", { name: pt ? "Vazio" : "Empty" });
    await userEvent.hover(item);
    item.blur();
    const panel = canvas.getByRole("menu").parentElement;
    await expect(panel).not.toBeNull();
    const computed = getComputedStyle(panel!);
    const row = getComputedStyle(item);
    await expect(parseFloat(computed.borderTopLeftRadius)).toBe(geometry(args.size).outer);
    await expect(parseFloat(computed.paddingTop)).toBe(geometry(args.size).inset);
    await expect(parseFloat(row.borderTopLeftRadius)).toBe(geometry(args.size).row);
  },
};
