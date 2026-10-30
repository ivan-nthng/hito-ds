import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { TooltipExample, tooltipCopy, type TooltipStoryArgs } from "./Tooltip.example.story";

const meta = {
  id: "overlays-tooltip", title: "Components/Overlays/Tooltip", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["copy", "anchor"] } },
  args: { copy: "short", anchor: "start" },
  argTypes: {
    copy: { control: "inline-radio", options: ["short", "long"] },
    anchor: { control: "inline-radio", options: ["start", "end"] },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Tooltip" description="Supplementary help on hover or keyboard focus. On touch screens, the same information stays visible below."><TooltipExample key={String(globals.storyContentProfile)} {...args} profile={globals.storyContentProfile} /></FoundationStoryPage>,
} satisfies Meta<TooltipStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard(keys); }
  else await userEvent.keyboard(keys);
}
function elements(canvasElement: HTMLElement, profile: unknown) {
  const canvas = within(canvasElement); const copy = tooltipCopy(profile);
  const trigger = canvas.getByRole("button", { name: copy.help });
  const panel = canvasElement.querySelector<HTMLElement>('[role="tooltip"]')!;
  const next = canvas.getByRole("button", { name: copy.next });
  return { trigger, panel, next };
}
const shown = async (panel: HTMLElement) => waitFor(() => expect(panel.matches(":popover-open")).toBe(true));
const hidden = async (panel: HTMLElement) => waitFor(() => expect(panel.matches(":popover-open")).toBe(false));
function geometry(panel: HTMLElement) {
  const box = panel.getBoundingClientRect(); const css = getComputedStyle(panel);
  expect(css.paddingBlockStart).toBe("6px"); expect(css.paddingInlineStart).toBe("10px"); expect(css.borderTopLeftRadius).toBe("4px");
  expect(box.width).toBeLessThanOrEqual(256); expect(box.left).toBeGreaterThanOrEqual(11);
  expect(box.right).toBeLessThanOrEqual(innerWidth - 11); expect(box.top).toBeGreaterThanOrEqual(11); expect(box.bottom).toBeLessThanOrEqual(innerHeight - 11);
  expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
}
export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Tooltip in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8798-3",
    },
  },
};
export const FocusAndEscape: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const { trigger, panel, next } = elements(canvasElement, globals.storyContentProfile);
    await keyboard("{Tab}"); trigger.focus(); await shown(panel);
    expect(trigger.getAttribute("aria-describedby")).toBe(panel.id); await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAccessibleDescription(panel.textContent!);
    expect(panel.querySelector('button, a, input, [tabindex]')).toBeNull(); geometry(panel);
    fireEvent.pointerOver(trigger, { pointerType: "mouse" }); fireEvent.pointerOut(trigger, { pointerType: "mouse" });
    await pause(400); await expect(panel).toBeVisible();
    await keyboard("{Escape}"); await hidden(panel); await expect(trigger).toHaveFocus();
    await pause(350); await hidden(panel);
    next.focus(); trigger.focus(); await shown(panel);
    if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.tab(); }
    else await userEvent.tab();
    await expect(next).toHaveFocus(); await hidden(panel);
    expect(trigger.getAttribute("aria-describedby")).toBe(panel.id);
  },
};
export const HoverTransferAndSuppression: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const { trigger, panel } = elements(canvasElement, globals.storyContentProfile);
    fireEvent.pointerOver(trigger, { pointerType: "mouse" });
    expect(panel.matches(":popover-open")).toBe(false); await shown(panel);
    fireEvent.pointerOut(trigger, { pointerType: "mouse" });
    await pause(40); fireEvent.pointerOver(panel, { pointerType: "mouse" });
    await pause(350); await expect(panel).toBeVisible();
    expect(document.activeElement).not.toBe(panel);
    await keyboard("{Escape}"); await hidden(panel);
    fireEvent.pointerOut(panel, { pointerType: "mouse" });
    fireEvent.pointerOver(trigger, { pointerType: "mouse" }); await shown(panel);
    await keyboard("{Escape}"); await hidden(panel);
    fireEvent.pointerOver(trigger, { pointerType: "mouse" }); await pause(350); await hidden(panel);
    fireEvent.pointerOut(trigger, { pointerType: "mouse" });
    fireEvent.pointerOver(trigger, { pointerType: "mouse" }); await shown(panel);
    fireEvent.pointerOut(trigger, { pointerType: "mouse" }); await hidden(panel);
    // A quick pass over the trigger must not leave a delayed opening behind.
    fireEvent.pointerOver(trigger, { pointerType: "mouse" }); fireEvent.pointerOut(trigger, { pointerType: "mouse" });
    await pause(350); await hidden(panel);
  },
};
export const CollisionAndReflow: Story = {
  tags: internal, args: { copy: "long", anchor: "end" },
  play: async ({ canvasElement, globals }) => {
    const { trigger, panel, next } = elements(canvasElement, globals.storyContentProfile);
    const original = { width: innerWidth, height: innerHeight };
    Object.assign(trigger.style, { position: "fixed", right: "0px", bottom: "12px", direction: "rtl" });
    try {
      await keyboard("{Tab}"); trigger.focus(); await shown(panel);
      await expect(panel).toHaveAttribute("data-side", "top"); geometry(panel);
      if (import.meta.env.MODE === "test") {
        const { page } = await import("vitest/browser");
        await page.viewport(240, 600); await waitFor(() => expect(panel.getBoundingClientRect().right).toBeLessThanOrEqual(229)); geometry(panel);
        await page.viewport(1024, 900); await waitFor(() => expect(panel.getBoundingClientRect().width).toBeGreaterThan(216)); geometry(panel);
      }
      trigger.style.top = "12px"; trigger.style.bottom = "auto";
      await waitFor(() => expect(panel).toHaveAttribute("data-side", "bottom")); geometry(panel);
      trigger.style.visibility = "hidden"; await hidden(panel);
    } finally {
      next.focus(); trigger.removeAttribute("style");
      if (import.meta.env.MODE === "test") { const { page } = await import("vitest/browser"); await page.viewport(original.width, original.height); }
    }
  },
};
export const CoarsePointerAndForcedColors: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const { trigger, panel, next } = elements(canvasElement, globals.storyContentProfile);
    const original = [
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
    ];
    try {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      expect(matchMedia("(pointer: coarse)").matches).toBe(true);
      const support = canvasElement.querySelector<HTMLElement>("[data-tooltip-support]")!;
      await expect(support).toBeVisible(); expect(support.textContent).toBe(panel.textContent);
      fireEvent.pointerOver(trigger, { pointerType: "touch" }); await pause(350); await hidden(panel);
      const box = trigger.getBoundingClientRect(); const frame = window.frameElement?.getBoundingClientRect(); const scale = frame ? frame.width / innerWidth : 1;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: (box.left + box.width / 2) * scale + (frame?.left ?? 0), y: (box.top + box.height / 2) * scale + (frame?.top ?? 0) }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await pause(350); await hidden(panel); await expect(support).toBeVisible(); next.focus();
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
      await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature.name === "prefers-reduced-motion" ? { ...feature, value: "reduce" } : feature) });
      await keyboard("{Tab}"); trigger.focus(); await shown(panel);
      const css = getComputedStyle(panel); expect(css.borderTopWidth).toBe("1px"); expect(css.animationName).toBe("none"); expect(css.color).not.toBe(css.backgroundColor);
      await keyboard("{Escape}"); await hidden(panel); await expect(trigger).toHaveFocus();
    } finally {
      next.focus(); await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
      await session.send("Emulation.setEmulatedMedia", { features: original });
    }
  },
};
