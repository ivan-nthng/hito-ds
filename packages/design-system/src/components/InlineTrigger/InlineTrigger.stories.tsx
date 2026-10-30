import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import {
  getStoryContent,
  resolveStoryContentProfile,
} from "../../storybook/story-content";
import { Menu, type MenuEntry } from "../Menu/Menu";
import { Text } from "../Text/Text";
import {
  InlineTrigger,
  inlineTriggerHeadingSizes,
  inlineTriggerWidths,
  type InlineTriggerProps,
} from "./InlineTrigger";
import styles from "./InlineTrigger.stories.module.css";

type StoryArgs = Pick<
  InlineTriggerProps,
  "disabled" | "headingSize" | "width"
>;

function copyFor(profile: unknown, forceLong = false) {
  const resolved = resolveStoryContentProfile(profile);
  const pt = getStoryContent(resolved).lang === "pt-BR";
  const long = forceLong || resolved.endsWith("-long");
  return pt
    ? {
        label: long ? "Produção e capacidade da cozinha" : "Cozinha",
        menu: "Escolha um serviço",
        selected: "Serviço selecionado",
        options: ["Hub", "Cozinha", "Administração"],
      }
    : {
        label: long ? "Kitchen production and capacity" : "Kitchen",
        menu: "Choose a service",
        selected: "Selected service",
        options: ["Hub", "Kitchen", "Administration"],
      };
}

function Example({ profile, long = false, ...args }: StoryArgs & { profile: unknown; long?: boolean }) {
  const copy = copyFor(profile, long);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(copy.options[1]);
  const items: MenuEntry[] = copy.options.map((label) => ({
    id: label.toLowerCase(),
    label,
    checked: label === selected,
  }));

  return (
    <div className={styles.fixture}>
      <Menu
        items={items}
        label={copy.menu}
        onAction={(id) => {
          const next = copy.options.find((option) => option.toLowerCase() === id);
          if (next) setSelected(next);
        }}
        onOpenChange={setOpen}
        open={open}
        trigger={<InlineTrigger {...args} label={copy.label} />}
      />
      <Text aria-live="polite" variant="body-sm">
        {copy.selected}: {selected}
      </Text>
    </div>
  );
}

const meta = {
  id: "actions-inline-trigger",
  title: "Components/Actions/InlineTrigger",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["headingSize", "width", "disabled"] },
  },
  args: { disabled: false, headingSize: "sm", width: "hug" },
  argTypes: {
    disabled: { control: "boolean" },
    headingSize: { control: "inline-radio", options: inlineTriggerHeadingSizes },
    width: { control: "inline-radio", options: inlineTriggerWidths },
  },
  render: (args, { globals }) => (
    <FoundationStoryPage
      description="A quiet heading action that delegates controlled disclosure to Menu."
      title="InlineTrigger"
    >
      <Example key={String(globals.storyContentProfile)} {...args} profile={globals.storyContentProfile} />
    </FoundationStoryPage>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];

export const Playground: Story = {
  tags: ["context-matrix"],
  play: async ({ canvasElement, globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: copy.label });
    const label = trigger.querySelector("span:not([data-icon-name])")!;
    const icon = trigger.querySelector('[data-icon-name="arrows/compact/down"]')!;
    const resting = label.getBoundingClientRect();

    expect(trigger.getBoundingClientRect().height).toBe(44);
    expect(getComputedStyle(trigger).gap).toBe("8px");
    expect(getComputedStyle(label).fontSize).toBe("24px");
    expect(parseFloat(getComputedStyle(label).lineHeight)).toBeCloseTo(32, 2);
    expect(icon.getBoundingClientRect().width).toBe(24);
    expect(label.getBoundingClientRect().x).toBe(trigger.getBoundingClientRect().x);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    const expanded = label.getBoundingClientRect();
    expect(expanded.x).toBe(resting.x);
    expect(expanded.y).toBe(resting.y);
    await expect(canvas.getAllByRole("menuitemradio")[0]).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

export const TypographyAndWidths: Story = {
  tags: internal,
  render: (_, { globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    return (
      <FoundationStoryPage
        description="Heading typography keeps fixed control geometry while width changes only the assigned container."
        title="InlineTrigger typography and widths"
      >
        <div className={styles.comparison}>
          <InlineTrigger label={copy.label} headingSize="sm" width="hug" />
          <InlineTrigger label={copy.label} headingSize="lg" width="hug" />
          <div className={styles.narrow}>
            <InlineTrigger label={copy.label} headingSize="sm" width="fill" />
          </div>
        </div>
      </FoundationStoryPage>
    );
  },
};

export const NarrowReducedMotion: Story = {
  tags: internal,
  parameters: { viewport: { defaultViewport: "narrow" } },
  render: (args, { globals }) => (
    <FoundationStoryPage
      description="Long labels stay on one line, truncate visually, and retain their full accessible name."
      title="InlineTrigger narrow layout"
    >
      <div className={styles.narrow}>
        <Example key={String(globals.storyContentProfile)} {...args} long profile={globals.storyContentProfile} width="fill" />
      </div>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement, globals }) => {
    const copy = copyFor(globals.storyContentProfile, true);
    const trigger = within(canvasElement).getByRole("button", { name: copy.label });
    const label = trigger.querySelector("span:not([data-icon-name])")!;
    expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
    await expect(trigger).toHaveAccessibleName(copy.label);

    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser");
    const session = cdp();
    try {
      await session.send("Emulation.setEmulatedMedia", {
        features: [{ name: "prefers-reduced-motion", value: "reduce" }],
      });
      expect(getComputedStyle(trigger, "::before").transitionDuration).toBe("0s");
    } finally {
      await session.send("Emulation.setEmulatedMedia", { features: [] });
    }
  },
};
