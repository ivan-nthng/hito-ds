import { StrictMode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { PopoverExample, type PopoverStoryArgs } from "./Popover.example.story";
import { popoverCopy } from "./Popover.content.story";
import { PopoverLifecycleExample } from "./Popover.lifecycle.story";
import { Popover } from "./Popover";
import { Button } from "../Button/Button";

const meta = {
  id: "overlays-popover", title: "Components/Overlays/Popover", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["scenario", "anchor"] } },
  args: { scenario: "form", anchor: "start" },
  argTypes: {
    scenario: { control: "select", options: ["form", "reading", "touch"], description: "A safe-to-discard draft, long reading content, or explicit large controls for touch." },
    anchor: { control: "inline-radio", options: ["start", "end"], description: "The example trigger position. Popover handles collision positioning." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Popover" description="Contextual content anchored to a button. The page remains interactive; drafts and actions belong to the caller.">
    <PopoverExample key={`${args.scenario}-${String(globals.storyContentProfile)}`} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<PopoverStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];

async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") {
    const { userEvent: browserInput } = await import("vitest/browser");
    await browserInput.keyboard(keys);
  } else await userEvent.keyboard(keys);
}
async function tab(shift = false) {
  if (import.meta.env.MODE === "test") {
    const { userEvent: browserInput } = await import("vitest/browser");
    await browserInput.tab({ shift });
  } else await userEvent.tab({ shift });
}
function bounds(panel: HTMLElement) {
  const rect = panel.getBoundingClientRect();
  expect(rect.left).toBeGreaterThanOrEqual(11);
  expect(rect.right).toBeLessThanOrEqual(innerWidth - 11);
  expect(rect.top).toBeGreaterThanOrEqual(11);
  expect(rect.bottom).toBeLessThanOrEqual(innerHeight - 11);
  expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
  const close = panel.querySelector<HTMLButtonElement>("header button");
  if (close) {
    expect(close).toHaveAttribute("data-size", "sm");
    expect(close.getBoundingClientRect().height).toBe(28);
    const icon = close.querySelector("[data-icon-name]")!;
    expect(icon).toHaveAttribute("data-icon-name", "controls/close-s");
    const iconBox = icon.getBoundingClientRect(), title = panel.querySelector("h2")!;
    expect(iconBox.width).toBe(16);
    expect(iconBox.top + iconBox.height / 2).toBeCloseTo(title.getBoundingClientRect().top + parseFloat(getComputedStyle(title).lineHeight) / 2, 1);
    const ring = parseFloat(getComputedStyle(close).outlineWidth) + parseFloat(getComputedStyle(close).outlineOffset);
    expect(close.getBoundingClientRect().right + ring).toBeLessThanOrEqual(rect.right);
    expect(close.getBoundingClientRect().top - ring).toBeGreaterThanOrEqual(rect.top);
  }
}

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Popover in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8574-3",
    },
  },
  tags: ["context-matrix"],
};
export const ThemeContour: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: popoverCopy(globals.storyContentProfile).open }));
    const panel = canvas.getByRole("dialog");
    const originalTheme = panel.getAttribute("data-hito-color-scheme");
    const originalStyle = panel.getAttribute("style");
    const bounds = panel.getBoundingClientRect().toJSON();
    const focused = document.activeElement;
    try {
      for (const theme of ["dark", "light"] as const) {
        panel.dataset.hitoColorScheme = theme;
        const shadow = getComputedStyle(panel).boxShadow;
        panel.style.boxShadow = "var(--elevation-floating)";
        const elevation = getComputedStyle(panel).boxShadow;
        panel.style.removeProperty("box-shadow");
        expect(shadow).toBe(`${theme === "dark" ? "color(srgb 0 0 0 / 0.24)" : "rgba(0, 0, 0, 0)"} 0px 0px 0px 1px inset, ${elevation}`);
        expect(getComputedStyle(panel).borderTopWidth).toBe("0px");
        expect(panel.getBoundingClientRect().toJSON()).toEqual(bounds);
        expect(document.activeElement).toBe(focused);
      }
    } finally {
      if (originalTheme === null) panel.removeAttribute("data-hito-color-scheme"); else panel.setAttribute("data-hito-color-scheme", originalTheme);
      if (originalStyle === null) panel.removeAttribute("style"); else panel.setAttribute("style", originalStyle);
    }
  },
};

export const WrappedTitleClose: Story = {
  tags: internal,
  render: (_, { globals }) => {
    const copy = popoverCopy(globals.storyContentProfile);
    return <Popover open title={`${copy.title}: ${copy.description}`} description={copy.description} closeLabel={copy.close} onOpenChange={() => {}}
      style={{ inlineSize: "calc(var(--layout-space-fixed-2xl) * 14)" }} trigger={<Button size="sm" variant="secondary" intent="neutral">{copy.open}</Button>}>
      {copy.initial}
    </Popover>;
  },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { page } = await import("vitest/browser");
    const original = { width: innerWidth, height: innerHeight };
    const panel = within(canvasElement).getByRole("dialog");
    try {
      for (const width of [320, 1024]) {
        await page.viewport(width, 720);
        const title = panel.querySelector("h2")!;
        expect(title.getBoundingClientRect().height).toBeGreaterThan(parseFloat(getComputedStyle(title).lineHeight));
        const close = within(panel).getByRole("button", { name: popoverCopy(globals.storyContentProfile).close });
        close.focus(); await expect(close).toHaveFocus();
        await waitFor(() => bounds(panel));
      }
    } finally { await page.viewport(original.width, original.height); }
  },
};
export const ActivationAndForm: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = popoverCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    const overflow = document.documentElement.style.overflow;
    trigger.focus(); await keyboard("{Enter}");
    const panel = canvas.getByRole("dialog", { name: copy.title }); const content = within(panel);
    const input = content.getByRole("textbox", { name: copy.field });
    await expect(input).toHaveFocus();
    await expect(panel).toHaveAccessibleDescription(copy.description);
    await expect(panel).not.toHaveAttribute("aria-modal");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(trigger.closest("[inert]")).toBeNull();
    expect(document.documentElement.style.overflow).toBe(overflow);
    expect(getComputedStyle(panel).paddingTop).toBe("12px");
    expect(getComputedStyle(panel).borderTopLeftRadius).toBe("12px");
    for (const button of panel.querySelectorAll("button")) {
      expect(button.getBoundingClientRect().height).toBe(28);
      expect(getComputedStyle(button).borderTopLeftRadius).toBe("4px");
    }
    bounds(panel);
    await userEvent.clear(input); await userEvent.click(content.getByRole("button", { name: copy.save }));
    await expect(input).toHaveFocus(); await expect(input).toHaveAttribute("aria-invalid", "true");
    await userEvent.type(input, "Updated draft"); await userEvent.click(content.getByRole("button", { name: copy.save }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.saved);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await keyboard(" "); await expect(input).toHaveFocus();
    await userEvent.click(content.getByRole("button", { name: copy.close }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger); await keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const NaturalFocusAndOutsidePointer: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = popoverCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    const next = canvas.getByRole("button", { name: copy.next });
    await userEvent.click(trigger);
    const panel = canvas.getByRole("dialog"); const content = within(panel);
    content.getByRole("button", { name: copy.save }).focus(); await tab();
    await expect(next).toHaveFocus(); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger); content.getByRole("button", { name: copy.close }).focus(); await tab(true);
    await expect(trigger).toHaveFocus(); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger); await userEvent.click(next);
    await expect(next).toHaveFocus(); await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger); await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false"); await expect(trigger).toHaveFocus();
  },
};
export const ControlledRequestsAndRerender: Story = {
  tags: internal, render: () => <StrictMode><PopoverLifecycleExample mode="hold" /></StrictMode>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: "Open fixture" });
    await userEvent.click(trigger);
    const panel = canvas.getByRole("dialog"); const content = within(panel);
    await keyboard("{Escape}{Escape}");
    expect(canvas.getByLabelText("Requests")).toHaveTextContent("escape,escape");
    await expect(panel).toBeVisible(); await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const update = content.getByRole("button", { name: "Update content 0" });
    await userEvent.click(update); await expect(update).toHaveFocus();
    expect(canvas.getByLabelText("Updates")).toHaveTextContent("1");
    await userEvent.click(canvas.getByRole("button", { name: "Next action" }));
    await expect(panel).toBeVisible();
    await userEvent.click(content.getByRole("textbox"));
    await userEvent.click(content.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(content.getByRole("button", { name: "Allow close" }));
    await keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger); await userEvent.click(trigger);
    expect(canvas.getByLabelText("Requests").textContent).toBe("escape,escape,outside-pointer,escape,trigger");
  },
};
export const ReadingAndVisibleDeepFocus: Story = {
  tags: internal, args: { scenario: "reading", anchor: "end" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = popoverCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: copy.open }));
    const panel = canvas.getByRole("dialog"); const content = within(panel);
    await expect(content.getByRole("heading", { name: copy.title })).toHaveFocus();
    bounds(panel); expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight);
    const input = content.getByRole("textbox"); input.focus();
    await expect(input).toHaveFocus();
    const target = input.getBoundingClientRect(); const shell = panel.getBoundingClientRect();
    expect(target.top).toBeGreaterThanOrEqual(shell.top);
    expect(target.bottom).toBeLessThanOrEqual(shell.bottom);
    await keyboard("{Escape}");
  },
};
async function unavailable(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Open fixture" }));
  await userEvent.click(canvas.getByRole("button", { name: "Make trigger unavailable" }));
  await waitFor(() => expect(canvas.getByLabelText("Requests")).toHaveTextContent("anchor-hidden"));
  await waitFor(() => expect(canvas.getByRole("button", { name: "Next action" })).toHaveFocus());
  expect(canvasElement.querySelector('[aria-haspopup="dialog"]')).toHaveAttribute("aria-expanded", "false");
}
export const RemovedAnchor: Story = { tags: internal, render: () => <PopoverLifecycleExample mode="remove" />, play: async ({ canvasElement }) => unavailable(canvasElement) };
export const HiddenAnchor: Story = { tags: internal, render: () => <PopoverLifecycleExample mode="hidden" />, play: async ({ canvasElement }) => unavailable(canvasElement) };
export const ScrolledAnchor: Story = {
  tags: internal, render: () => <PopoverLifecycleExample mode="scroll" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: "Open fixture" }));
    const scroll = canvasElement.querySelector<HTMLElement>("[data-scroll-container]")!;
    scroll.scrollTop = 400;
    await waitFor(() => expect(canvas.getByLabelText("Requests")).toHaveTextContent("anchor-hidden"));
    await waitFor(() => expect(canvas.getByRole("button", { name: "Next action" })).toHaveFocus());
    expect(scroll.scrollTop).toBe(400);
  },
};
export const CollisionAndReflow: Story = {
  tags: internal, render: () => <PopoverLifecycleExample mode="position" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: "Open fixture" }));
    const panel = canvas.getByRole("dialog");
    await expect(panel).toHaveAttribute("data-side", "top"); bounds(panel);
    await userEvent.click(within(panel).getByRole("button", { name: "More content" }));
    await waitFor(() => { bounds(panel); expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight); });
    if (import.meta.env.MODE === "test") {
      const { page } = await import("vitest/browser");
      const original = { width: innerWidth, height: innerHeight };
      try { await page.viewport(360, 640); await waitFor(() => bounds(panel)); }
      finally { await page.viewport(original.width, original.height); }
    }
    await keyboard("{Escape}");
  },
};
export const DelayedClosePreservesDestination: Story = {
  tags: internal, render: () => <PopoverLifecycleExample mode="delayed" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: "Open fixture" });
    await userEvent.click(trigger); await userEvent.click(canvas.getByRole("button", { name: "Close later" }));
    const next = canvas.getByRole("button", { name: "Next action" });
    next.focus();
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await expect(next).toHaveFocus();
  },
};

export const ForcedColorsAndReducedMotion: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const original = [
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
    ];
    try {
      await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature.name === "prefers-reduced-motion" ? { ...feature, value: "reduce" } : feature) });
      const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: popoverCopy(globals.storyContentProfile).open }));
      const panel = canvas.getByRole("dialog"); const css = getComputedStyle(panel);
      expect(css.borderTopWidth).toBe("1px"); expect(css.boxShadow).toBe("none"); expect(css.animationName).toBe("none");
      bounds(panel); await keyboard("{Escape}");
    } finally { await session.send("Emulation.setEmulatedMedia", { features: original }); }
  },
};

export const CoarsePointer: Story = {
  tags: internal, args: { scenario: "touch" },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const copy = popoverCopy(globals.storyContentProfile); const canvas = within(canvasElement);
    const tap = async (element: HTMLElement) => {
      element.scrollIntoView({ block: "nearest" });
      const rect = element.getBoundingClientRect(); const frame = window.frameElement?.getBoundingClientRect();
      // Vitest fits its desktop iframe to the runner viewport using a CSS scale.
      const scale = frame ? frame.width / innerWidth : 1;
      const x = (rect.left + rect.width / 2) * scale + (frame?.left ?? 0);
      const y = (rect.top + rect.height / 2) * scale + (frame?.top ?? 0);
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    try {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      expect(matchMedia("(pointer: coarse)").matches).toBe(true);
      const trigger = canvas.getByRole("button", { name: copy.open });
      expect(trigger.getBoundingClientRect().height).toBe(44);
      await tap(trigger);
      const panel = await canvas.findByRole("dialog"); const content = within(panel);
      expect(content.queryByRole("button", { name: copy.close })).toBeNull();
      for (const button of panel.querySelectorAll("button")) expect(button.getBoundingClientRect().height).toBe(44);
      bounds(panel);
      await tap(trigger);
      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
      await tap(trigger);
      await tap(content.getByRole("button", { name: copy.cancel }));
      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
      await tap(trigger); await tap(canvas.getByRole("button", { name: copy.previous }));
      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    } finally { await session.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
  },
};
