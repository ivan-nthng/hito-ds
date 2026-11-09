import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { TextInput } from "../TextInput/TextInput";
import { Disclosure } from "./Disclosure";
import { DisclosureExample, disclosureCopy, type DisclosureStoryArgs } from "./Disclosure.example.story";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";

const meta = {
  id: "overlays-disclosure", title: "Components/Overlays/Disclosure", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["open", "disabled", "content", "variant"] } },
  args: { open: false, disabled: false, content: "text", variant: "ghost" },
  argTypes: {
    open: { control: "boolean", description: "Show or hide this section. Toggling the trigger updates this control." },
    disabled: { control: "boolean", description: "Prevent toggling while keeping the title reachable by keyboard." },
    content: { control: "inline-radio", options: ["text", "form"] },
    variant: { control: "inline-radio", options: ["ghost", "soft"], description: "Use soft for content controls inside cards." },
  },
  render: function Render(args, { globals }) {
    const [, updateArgs] = useArgs<DisclosureStoryArgs>();
    return <FoundationStoryPage title="Disclosure" description="Show or hide one section. The content stays in place, so closing it preserves your draft.">
      <DisclosureExample key={String(globals.storyContentProfile)} {...args} profile={globals.storyContentProfile} onOpenChange={open => updateArgs({ open })} />
    </FoundationStoryPage>;
  },
} satisfies Meta<DisclosureStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];

function panelFor(trigger: HTMLElement) {
  return trigger.ownerDocument.getElementById(trigger.getAttribute("aria-controls")!)!;
}
function geometry(trigger: HTMLElement) {
  const css = getComputedStyle(trigger);
  expect(trigger).toHaveAttribute("data-size", "md");
  expect(trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  const radiusProbe = document.createElement("span");
  radiusProbe.style.cssText = "position:absolute;border-radius:var(--radius-ui-md)";
  trigger.append(radiusProbe);
  const radius = getComputedStyle(radiusProbe).borderTopLeftRadius;
  radiusProbe.remove();
  expect(css.borderTopLeftRadius).toBe(radius);
  expect(trigger.querySelector("[data-icon-name]")).toHaveAttribute("data-icon-name", "arrows/basic/down");
  const panel = panelFor(trigger);
  if (!panel.hidden) {
    const title = trigger.firstElementChild!.getBoundingClientRect();
    const body = panel.firstElementChild!.getBoundingClientRect();
    const edge = css.direction === "rtl" ? "right" : "left";
    expect(Math.abs(title[edge] - body[edge])).toBeLessThan(1);
  }
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
}

// The fixture owns real controlled state; Storybook's Controls use updateArgs above.
function InteractiveExample({ profile, inCard = false, ...args }: DisclosureStoryArgs & { profile: unknown; inCard?: boolean }) {
  const [open, setOpen] = useState(args.open);
  const example = <DisclosureExample {...args} open={open} onOpenChange={setOpen} profile={profile} />;
  return <FoundationStoryPage title="Disclosure" description="Show or hide one section while preserving its content.">
    {inCard ? <Card>{example}</Card> : example}
  </FoundationStoryPage>;
}

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Disclosure in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8801-87",
    },
  },
  play: async ({ canvasElement, globals, args }) => {
    const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: disclosureCopy(globals.storyContentProfile).title });
    geometry(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", String(args.open));
    expect(panelFor(trigger).hidden).toBe(!args.open);
    expect(canvas.queryByRole("region")).toBeNull();
  },
};

export const KeyboardAndDraft: Story = {
  tags: internal, args: { content: "form" },
  render: (args, { globals }) => <InteractiveExample {...args} profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = disclosureCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.title });
    const restPaint = getComputedStyle(trigger).backgroundColor;
    const openPaint = resolvedBackground(trigger, "--color-surface-neutral-subtle-pressed");
    trigger.focus(); await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    await expect(trigger).toHaveFocus(); geometry(trigger);
    await userEvent.tab(); const input = canvas.getByRole("textbox", { name: copy.label });
    await expect(input).toHaveFocus(); await userEvent.clear(input); await userEvent.type(input, "Keep this draft");
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(openPaint));
    await userEvent.keyboard("{Escape}"); await expect(input).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.tab({ shift: true }); await expect(trigger).toHaveFocus();
    await userEvent.keyboard(" "); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(restPaint));
    expect(canvas.queryByRole("textbox")).toBeNull(); expect(input.isConnected).toBe(true);
    await userEvent.keyboard(" "); await waitFor(() => expect(canvas.getByRole("textbox")).toHaveValue("Keep this draft"));
  },
};

export const SoftInCard: Story = {
  tags: ["context-matrix"], args: { variant: "soft", content: "form" },
  parameters: { controls: { disable: true }, figma: { label: "Nutrition Disclosure in Figma", url: "https://github.com/ivan-nthng/hito-ds/blob/main/docs/figma-and-code.md#figma-file-and-mappings" } },
  render: (args, { globals }) => <InteractiveExample {...args} profile={globals.storyContentProfile} inCard />,
  play: async context => {
    const trigger = within(context.canvasElement).getByRole("button", { name: disclosureCopy(context.globals.storyContentProfile).title });
    expect(trigger).toHaveAttribute("data-variant", "soft");
    const restPaint = resolvedBackground(trigger, "--color-surface-neutral-subtle-default");
    expect(getComputedStyle(trigger).backgroundColor).toBe(restPaint);
    await KeyboardAndDraft.play!(context);
  },
};

export const Disabled: Story = {
  tags: internal, args: { disabled: true, open: true },
  play: async ({ canvasElement, globals }) => {
    const trigger = within(canvasElement).getByRole("button", { name: disclosureCopy(globals.storyContentProfile).title });
    expect(trigger).toHaveAttribute("aria-disabled", "true"); geometry(trigger);
    await userEvent.click(trigger); await userEvent.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true"); expect(panelFor(trigger).hidden).toBe(false);
  },
};

function OwnerExample() {
  const [open, setOpen] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return <FoundationStoryPage title="Disclosure ownership" description="An external change returns focus only when it would hide the current control.">
    <Button intent="neutral" variant="secondary" onClick={() => setOpen(true)}>Open from owner</Button>
    <Button intent="neutral" variant="secondary" onClick={() => setOpen(false)}>Close from owner</Button>
    <Button intent="neutral" variant="secondary" onClick={() => { clearTimeout(timer.current); timer.current = setTimeout(() => { setDisabled(true); setOpen(false); }, 100); }}>Schedule close and disable</Button>
    <Disclosure title="Editable details" open={open} onOpenChange={setOpen} disabled={disabled}><TextInput aria-label="Draft" defaultValue="Keep me" size="md" appearance="soft" /></Disclosure>
    <Disclosure title="Independent details" defaultOpen>Independent content</Disclosure>
  </FoundationStoryPage>;
}
export const ExternalCollapse: Story = {
  tags: internal, parameters: { controls: { disable: true } }, render: () => <OwnerExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: "Editable details" });
    const close = canvas.getByRole("button", { name: "Close from owner" });
    await userEvent.click(close); expect(close).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Open from owner" }));
    await userEvent.click(canvas.getByRole("button", { name: "Schedule close and disable" }));
    canvas.getByRole("textbox", { name: "Draft" }).focus();
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    expect(trigger).toHaveFocus(); expect(trigger).toHaveAttribute("aria-disabled", "true");
    expect(canvas.getByRole("button", { name: "Independent details" })).toHaveAttribute("aria-expanded", "true");
    const ids = Array.from(canvasElement.querySelectorAll("[id]"), node => node.id); expect(new Set(ids).size).toBe(ids.length);
  },
};

export const ForcedColorsAndDirection: Story = {
  tags: internal,
  render: (args, { globals }) => <InteractiveExample {...args} profile={globals.storyContentProfile} />,
  play: async ({ canvasElement }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const original = ["forced-colors", "prefers-reduced-motion", "prefers-color-scheme"].map(name => ({ name, value: name === "forced-colors" ? "none" : name === "prefers-reduced-motion" ? (matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference") : (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") }));
    const trigger = within(canvasElement).getByRole("button");
    try {
      await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature) });
      canvasElement.dir = "rtl"; geometry(trigger);
      expect(getComputedStyle(trigger).borderStyle).toBe("solid");
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) expect(parseFloat(getComputedStyle(trigger.querySelector("[data-icon-name]")!).transitionDuration)).toBe(0);
      await userEvent.click(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
      expect(panelFor(trigger).hidden).toBe(false);
    } finally { canvasElement.removeAttribute("dir"); await session.send("Emulation.setEmulatedMedia", { features: original }); }
  },
};
