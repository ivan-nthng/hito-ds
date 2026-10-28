import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { AccountExample, accountCopy, type AccountStoryArgs } from "./AccountTrigger.example.story";
import { AccountTrigger } from "./AccountTrigger";
import { Button } from "../Button/Button";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";

const meta = {
  id: "navigation-account-trigger", title: "Components/Navigation/AccountTrigger", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["identity", "openOnHover"] } },
  args: { identity: "initials", openOnHover: true },
  argTypes: {
    identity: { control: "select", options: ["photo", "initials", "fallback"] },
    openOnHover: { control: "boolean", description: "Fine-pointer preview; click, tap and keyboard always remain available." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="AccountTrigger" description="The signed-in Hub menu with compact commands. Language and appearance open one-level preference menus.">
    <AccountExample key={String(globals.storyContentProfile)} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<AccountStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];
async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard(keys); }
  else await userEvent.keyboard(keys);
}
export const Playground: Story = { tags: ["context-matrix"] };
export const KeyboardAndSettings: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = accountCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.label });
    expect(trigger.querySelectorAll("button, a, input")).toHaveLength(0);
    expect(trigger.querySelector('[data-avatar][aria-hidden="true"]')).not.toBeNull();
    expect(trigger.getBoundingClientRect().height).toBe(44);
    trigger.focus(); await keyboard("{ArrowUp}");
    const menu = canvas.getByRole("menu", { name: copy.menu }); const rows = within(menu).getAllByRole("menuitem");
    await expect(within(menu).getByRole("menuitem", { name: copy.signout })).toHaveFocus(); expect(rows[0].getBoundingClientRect().height).toBe(28);
    expect(getComputedStyle(rows[0]).borderTopLeftRadius).toBe("4px");
    expect(menu.querySelector("input, button, h2")).toBeNull();
    await keyboard("{Escape}"); await expect(trigger).toHaveFocus();
    await keyboard("{Enter}"); await expect(rows[2]).toHaveFocus(); await keyboard("{Enter}");
    await expect(canvas.getByRole("menuitemradio", { name: "English" })).toHaveAttribute("aria-checked", copy.locale === "en" ? "true" : "false");
    await userEvent.click(canvas.getByRole("menuitemradio", { name: "English" }));
    await waitFor(() => expect(trigger).toHaveFocus());
    const english = accountCopy("en-short"); await expect(trigger).toHaveAccessibleName(english.label);
    await keyboard(" "); await userEvent.click(canvas.getByRole("menuitem", { name: english.theme }));
    await expect(canvas.getByRole("menuitemradio", { name: english.system })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(canvas.getByRole("menuitemradio", { name: english.dark }));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(canvasElement.querySelector("[data-account-example]")).toHaveAttribute("data-hito-color-scheme", "dark");
    await userEvent.click(trigger); await userEvent.click(canvas.getByRole("menuitem", { name: english.theme }));
    await expect(canvas.getByRole("menuitemradio", { name: english.dark })).toHaveAttribute("aria-checked", "true");
    await keyboard("{Escape}"); await expect(canvas.getByRole("menuitem", { name: english.theme })).toHaveFocus();
    await keyboard("{Escape}"); await expect(trigger).toHaveFocus();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  },
};
export const HoverPreview: Story = {
  tags: internal,
  render: (args, { globals }) => <AccountExample {...args} profile={globals.storyContentProfile} focusFixture />,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { userEvent: pointer } = await import("vitest/browser");
    const canvas = within(canvasElement); const copy = accountCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.label }); const outside = canvas.getByRole("textbox", { name: copy.outside });
    const next = canvas.getByRole("button", { name: copy.next });
    const restPaint = getComputedStyle(trigger).backgroundColor;
    const openPaint = resolvedBackground(trigger, "--color-surface-neutral-subtle-pressed");
    outside.focus(); await pointer.hover(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true")); await expect(outside).toHaveFocus();
    await pointer.hover(canvas.getByRole("menuitem", { name: copy.language }));
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(openPaint));
    await expect(outside).toHaveFocus(); await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await pointer.hover(next); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(restPaint));
    await expect(outside).toHaveFocus();
    await pointer.hover(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    await keyboard("{Escape}"); await expect(outside).toHaveFocus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    // A fresh entry is required after Escape; clicking an existing preview promotes it.
    await pointer.hover(next); await pointer.hover(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    await pointer.click(trigger); await expect(canvas.getByRole("menuitem", { name: copy.language })).toHaveFocus();
    await pointer.hover(next); await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await pointer.click(next); await expect(next).toHaveFocus(); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await pointer.hover(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    trigger.focus(); await keyboard("{ArrowUp}"); await expect(canvas.getByRole("menuitem", { name: copy.signout })).toHaveFocus();
    await keyboard("{Escape}"); await expect(trigger).toHaveFocus(); await pointer.hover(next);
    // Repeated submenu selections still close the preview and return focus to the trigger.
    for (let count = 0; count < 2; count++) {
      await pointer.hover(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
      await pointer.click(canvas.getByRole("menuitem", { name: copy.language }));
      await pointer.click(canvas.getByRole("menuitemradio", { name: copy.locale === "pt" ? "Português" : "English" }));
      await waitFor(() => expect(trigger).toHaveFocus());
      await pointer.hover(next);
    }
  },
};
export const TouchActivation: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const canvas = within(canvasElement); const copy = accountCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.label });
    const tap = async (element: HTMLElement) => {
      const rect = element.getBoundingClientRect(); const frame = window.frameElement?.getBoundingClientRect(); const scale = frame ? frame.width / innerWidth : 1;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: (rect.left + rect.width / 2) * scale + (frame?.left ?? 0), y: (rect.top + rect.height / 2) * scale + (frame?.top ?? 0) }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    try {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      fireEvent.pointerEnter(trigger, { pointerType: "touch" }); await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await tap(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
      await tap(canvas.getByRole("menuitem", { name: copy.theme }));
      await tap(await canvas.findByRole("menuitemradio", { name: copy.system }));
      await waitFor(() => expect(trigger).toHaveFocus());
      await tap(trigger); await tap(trigger); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    } finally { await session.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
  },
};

function HeldCommandExample({ profile, label }: { profile: unknown; label?: string }) {
  const copy = accountCopy(profile); const [open, setOpen] = useState(false); const [count, setCount] = useState(0);
  return <>
    <Button variant="ghost" intent="neutral" size="md">{copy.next}</Button>
    <AccountTrigger label={label ?? copy.label} menuLabel={copy.menu} open={open}
      onOpenChange={(next, reason) => { if (reason !== "action") setOpen(next); }}
      items={[{ id: "theme", label: copy.theme }]} onAction={() => setCount(value => value + 1)} />
    <output aria-label="Command count">{count}</output>
  </>;
}
export const ControlledActionGuard: Story = {
  tags: internal, render: (_, { globals }) => <HeldCommandExample profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { userEvent: pointer } = await import("vitest/browser");
    const canvas = within(canvasElement); const copy = accountCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.label }); const next = canvas.getByRole("button", { name: copy.next });
    for (const count of [1, 2]) {
      await pointer.hover(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
      const item = canvas.getByRole("menuitem", { name: copy.theme });
      await pointer.click(item); await pointer.click(item);
      expect(canvas.getByLabelText("Command count")).toHaveTextContent(String(count));
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await pointer.click(next); await expect(next).toHaveFocus(); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  },
};

const longAccountLabel = "Alexandre da Silva Oliveira de Albuquerque e Vasconcelos";
export const LongAccountLabel: Story = {
  tags: internal, render: (_, { globals }) => <HeldCommandExample profile={globals.storyContentProfile} label={longAccountLabel} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: longAccountLabel });
    expect(trigger.getBoundingClientRect().right).toBeLessThanOrEqual(innerWidth);
    expect(trigger.getBoundingClientRect().height).toBe(44);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
    const label = [...trigger.querySelectorAll("span")].find(element => element.textContent === longAccountLabel && !element.children.length)!;
    if (innerWidth <= 320) expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(trigger).toHaveAccessibleName(longAccountLabel);
  },
};
