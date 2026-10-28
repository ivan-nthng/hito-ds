import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";
import { ServiceSwitcher } from "./ServiceSwitcher";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";
import admin from "../../../assets/hub-soft-3d/png-64/hub-admin.png";
import hub from "../../../assets/hub-soft-3d/png-64/hub-navigation.png";
import kitchen from "../../../assets/hub-soft-3d/png-64/hub-kitchen.png";
import styles from "./ServiceSwitcher.story.module.css";

type Args = { compact: boolean; disabled: boolean; long: boolean; openOnHover: boolean };
const src = (asset: string | { src: string }) => typeof asset === "string" ? asset : asset.src;
const copy = (profile: unknown) => profile === "pt-long" ? { label: "Administração", menu: "Trocar serviço", kitchen: "Cozinha", next: "Próximo controle", long: "Administração da plataforma Hito DS" }
  : { label: "Platform Admin", menu: "Switch service", kitchen: "Kitchen", next: "Next control", long: "Hito DS platform administration" };

function Example({ profile, compact, disabled, long, openOnHover }: Args & { profile: unknown }) {
  const [open, setOpen] = useState(false), [action, setAction] = useState(""); const m = copy(profile);
  return <div className={styles.example}>
    <TextInput aria-label="Outside focus" />
    <div className={long ? styles.long : styles.expanded}>
      <ServiceSwitcher label={long ? m.long : m.label} menuLabel={m.menu} artwork={{ src: src(admin) }} compact={compact} disabled={disabled}
        open={open} onOpenChange={setOpen} onAction={setAction} openOnHover={openOnHover} items={[{ id: "hub", label: "Hub", artwork: { src: src(hub) } }, { id: "kitchen", label: m.kitchen, artwork: { src: src(kitchen) } }]} />
    </div>
    <Button variant="ghost" intent="neutral">{m.next}</Button><output aria-label="Chosen service">{action}</output>
  </div>;
}
const meta = { id: "navigation-service-switcher", title: "Components/Navigation/ServiceSwitcher", tags: ["test", "context-matrix"],
  args: { compact: false, disabled: false, long: false, openOnHover: true }, parameters: { layout: "fullscreen", figma: { label: "ServiceSwitcher in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9547-17" } },
  render: (args, { globals }) => <FoundationStoryPage title="ServiceSwitcher" description="One service button with native Menu behavior. The application supplies permitted destinations; collapse is a separate control."><Example key={String(globals.storyContentProfile)} {...args} profile={globals.storyContentProfile} /></FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard(keys); }
  else await userEvent.keyboard(keys);
}
export const Playground: Story = {};
export const Compact: Story = { args: { compact: true } };
export const LongLabel: Story = { args: { long: true }, play: async ({ canvasElement, globals }) => {
  const trigger = within(canvasElement).getByRole("button", { name: copy(globals.storyContentProfile).long });
  await document.fonts.ready;
  const text = trigger.querySelector("img")!.nextElementSibling!;
  expect(getComputedStyle(text).textOverflow).toBe("ellipsis"); expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
} };
export const Disabled: Story = { args: { disabled: true }, play: async ({ canvasElement, globals }) => {
  const trigger = within(canvasElement).getByRole("button", { name: copy(globals.storyContentProfile).label });
  await expect(trigger).toBeDisabled();
  expect(getComputedStyle(trigger).backgroundColor).toBe(resolvedBackground(trigger, "--color-surface-neutral-subtle-pressed"));
  expect(trigger).toHaveAttribute("aria-expanded", "false");
} };
export const KeyboardAndGeometry: Story = {
  play: async ({ canvasElement, globals, args }) => {
    const c = within(canvasElement), m = copy(globals.storyContentProfile), trigger = c.getByRole("button", { name: args.long ? m.long : m.label });
    expect(trigger.querySelector("button,a,input")).toBeNull();
    expect(trigger.getBoundingClientRect().height).toBe(36);
    const image = trigger.querySelector("img")!; await waitFor(() => expect(image.complete && image.naturalWidth > 0).toBe(true));
    expect(image.getBoundingClientRect().width).toBe(20); expect(image.getBoundingClientRect().height).toBe(20);
    expect(trigger.closest("[data-service-switcher]")!.getBoundingClientRect().height).toBe(44);
    if (!args.compact) { const text = trigger.querySelector("img")!.nextElementSibling!; expect(getComputedStyle(text).fontSize).toBe("20px"); expect(getComputedStyle(text).lineHeight).toBe("24px"); }
    trigger.focus(); await keyboard("{ArrowDown}"); const menu = c.getByRole("menu", { name: m.menu });
    await expect(within(menu).getByRole("menuitem", { name: "Hub" })).toHaveFocus();
    await keyboard("{End}{Enter}"); await expect(c.getByLabelText("Chosen service")).toHaveTextContent("kitchen");
    await waitFor(() => expect(trigger).toHaveFocus()); await keyboard("{ArrowUp}");
    await expect(c.getByRole("menuitem", { name: m.kitchen })).toHaveFocus();
    await keyboard("{Escape}"); await expect(trigger).toHaveFocus();
    await keyboard("{Tab}"); await expect(c.getByRole("button", { name: m.next })).toHaveFocus();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  },
};
export const CompactKeyboard: Story = { ...KeyboardAndGeometry, args: { compact: true } };
export const HoverAndOpenPaint: Story = {
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { userEvent: pointer } = await import("vitest/browser"); const c = within(canvasElement), m = copy(globals.storyContentProfile);
    const trigger = c.getByRole("button", { name: m.label }), outside = c.getByRole("textbox", { name: "Outside focus" });
    outside.focus(); await pointer.hover(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    await expect(outside).toHaveFocus(); await pointer.hover(c.getByRole("menuitem", { name: "Hub" }));
    const openPaint = resolvedBackground(trigger, "--color-surface-neutral-subtle-pressed");
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(openPaint));
    await expect(outside).toHaveFocus(); await pointer.hover(outside);
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  },
};
export const TouchActivation: Story = {
  args: { compact: true },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const c = within(canvasElement), m = copy(globals.storyContentProfile), trigger = c.getByRole("button", { name: m.label });
    const tap = async (element: HTMLElement) => {
      const rect = element.getBoundingClientRect(), frame = window.frameElement?.getBoundingClientRect(), scale = frame ? frame.width / innerWidth : 1;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: (rect.left + rect.width / 2) * scale + (frame?.left ?? 0), y: (rect.top + rect.height / 2) * scale + (frame?.top ?? 0) }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    try {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      fireEvent.pointerEnter(trigger, { pointerType: "touch" }); await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await tap(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
      await tap(c.getByRole("menuitem", { name: "Hub" })); await expect(c.getByLabelText("Chosen service")).toHaveTextContent("hub");
      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
      await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe("rgba(0, 0, 0, 0)"));
    } finally { await session.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
  },
};

export const IdleAndStatePaint: Story = {
  args: { openOnHover: false },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { userEvent: pointer, cdp } = await import("vitest/browser"), session = cdp();
    const c = within(canvasElement), m = copy(globals.storyContentProfile), trigger = c.getByRole("button", { name: m.label }), outside = c.getByRole("textbox", { name: "Outside focus" });
    const hoverPaint = resolvedBackground(trigger, "--color-surface-neutral-subtle-hover"), pressedPaint = resolvedBackground(trigger, "--color-surface-neutral-subtle-pressed");
    await pointer.hover(outside); outside.focus();
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe("rgba(0, 0, 0, 0)"));
    await keyboard("{Tab}"); await expect(trigger).toHaveFocus();
    expect(getComputedStyle(trigger).outlineStyle).toBe("solid"); expect(parseFloat(getComputedStyle(trigger).outlineWidth)).toBeGreaterThan(0);
    await pointer.hover(trigger); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(hoverPaint));
    const rect = trigger.getBoundingClientRect(), frame = window.frameElement?.getBoundingClientRect(), scale = frame ? frame.width / innerWidth : 1;
    const point = { x: (rect.left + rect.width / 2) * scale + (frame?.left ?? 0), y: (rect.top + rect.height / 2) * scale + (frame?.top ?? 0), button: "left" as const, clickCount: 1 };
    try {
      await session.send("Input.dispatchMouseEvent", { ...point, type: "mousePressed", buttons: 1 });
      await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(pressedPaint));
    } finally { await session.send("Input.dispatchMouseEvent", { ...point, type: "mouseReleased", buttons: 0 }); }
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
    await pointer.hover(outside); await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe(pressedPaint));
    await keyboard("{Escape}"); await expect(trigger).toHaveFocus();
    await waitFor(() => expect(getComputedStyle(trigger).backgroundColor).toBe("rgba(0, 0, 0, 0)"));
    expect(trigger.getBoundingClientRect().height).toBe(36);
    expect(trigger.closest("[data-service-switcher]")!.getBoundingClientRect().height).toBe(44);
  },
};
export const CompactIdleAndStatePaint: Story = { ...IdleAndStatePaint, args: { compact: true, openOnHover: false } };
