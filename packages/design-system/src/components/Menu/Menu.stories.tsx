import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Select } from "../Select/Select";
import { Button } from "../Button/Button";
import { Menu } from "./Menu";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { MenuExample, menuCopy, type MenuStoryArgs } from "./Menu.example.story";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";

const meta = {
  id: "overlays-menu", title: "Components/Overlays/Menu", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["scenario", "anchor", "size"] } },
  args: { scenario: "commands", anchor: "start", size: "sm" },
  argTypes: {
    scenario: { control: "select", options: ["commands", "all-disabled", "long-menu", "submenus", "artwork"] },
    anchor: { control: "inline-radio", options: ["start", "end"] },
    size: { control: "inline-radio", options: ["sm", "md"], description: "Strict panel radius with shared inset and ListItem rows. SM is the default." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Menu" description="Contextual commands using shared ListItem rows and inset, with the shared strict-sum outer radius."><MenuExample key={`${args.scenario}-${String(globals.storyContentProfile)}`} {...args} profile={globals.storyContentProfile} /></FoundationStoryPage>,
} satisfies Meta<MenuStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];
async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard(keys); }
  else await userEvent.keyboard(keys);
}
async function tab(shift = false) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.tab({ shift }); }
  else await userEvent.tab({ shift });
}
function geometry(menu: HTMLElement) {
  const panel = menu.parentElement!; const box = panel.getBoundingClientRect();
  const md = panel.dataset.size === "md";
  expect(getComputedStyle(panel).paddingTop).toBe(md ? "6px" : "4px");
  expect(getComputedStyle(panel).borderTopLeftRadius).toBe(md ? "12px" : "8px");
  expect(box.left).toBeGreaterThanOrEqual(11); expect(box.right).toBeLessThanOrEqual(innerWidth - 11);
  expect(box.top).toBeGreaterThanOrEqual(11); expect(box.bottom).toBeLessThanOrEqual(innerHeight - 11);
  expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
  for (const row of menu.querySelectorAll<HTMLElement>(':scope > [role="menuitem"], :scope > [role="menuitemradio"]')) {
    const css = getComputedStyle(row);
    expect(row).toHaveAttribute("data-size", md ? "md" : "sm");
    expect(css.paddingBlockStart).toBe(md ? "8px" : "6px"); expect(css.paddingInlineStart).toBe(md ? "12px" : "10px"); expect(css.borderTopLeftRadius).toBe(md ? "6px" : "4px");
    expect(parseFloat(getComputedStyle(panel).borderTopLeftRadius)).toBe(parseFloat(css.borderTopLeftRadius) + parseFloat(getComputedStyle(panel).paddingTop));
  }
  const divider = within(menu).queryByRole("separator")?.getBoundingClientRect();
  if (divider) { expect(divider.left).toBeCloseTo(box.left, 1); expect(divider.right).toBeCloseTo(box.right, 1); }
}
export const Playground: Story = {
  parameters: {
    figma: {
      label: "Menu in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8553-174",
    },
  },
  tags: ["context-matrix"],
};
export const NestedPreferences: Story = {
  tags: ["context-matrix"],
  args: { scenario: "submenus", anchor: "end" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement), copy = menuCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.more });
    await userEvent.click(trigger);
    geometry(canvas.getByRole("menu", { name: copy.more }));
    const language = canvas.getByRole("menuitem", { name: copy.language });
    await userEvent.click(language);
    geometry(canvas.getByRole("menu", { name: copy.language }));
    const english = canvas.getByRole("menuitemradio", { name: "English" });
    await expect(english).toHaveAttribute("aria-checked", "true");
    await userEvent.hover(english);
    const openPaint = resolvedBackground(language, "--color-surface-neutral-subtle-pressed");
    await waitFor(() => expect(getComputedStyle(language).backgroundColor).toBe(openPaint));
    await keyboard("{Escape}");
    await waitFor(() => expect(getComputedStyle(language).backgroundColor).not.toBe(openPaint));
    await expect(canvas.getByRole("menuitem", { name: copy.language })).toHaveFocus();
    await keyboard("{ArrowRight}{ArrowDown}{Enter}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("menuitem", { name: copy.language }));
    await expect(canvas.getByRole("menuitemradio", { name: "Português" })).toHaveAttribute("aria-checked", "true");
    await keyboard("{Escape}{Escape}");
  },
};
export const KeyboardAndGeometry: Story = {
  tags: internal,
  play: async ({ canvasElement, globals, args }) => {
    const canvas = within(canvasElement); const copy = menuCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.more }); trigger.focus(); await keyboard("{ArrowDown}");
    const menu = canvas.getByRole("menu", { name: copy.more }); const items = within(menu).getAllByRole("menuitem");
    expect(trigger.getAttribute("aria-controls")).toBe(menu.id); await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(items[0]).toHaveFocus(); geometry(menu);
    expect(items[1].getBoundingClientRect().height).toBe(args.size === "md" ? 36 : 28); expect(items[1].querySelector("[data-icon-name]")!.getBoundingClientRect().width).toBe(args.size === "md" ? 20 : 16);
    expect(menu.querySelectorAll('[tabindex="0"]').length).toBe(1);
    await keyboard("{ArrowDown}{ArrowDown}"); await expect(items[2]).toHaveFocus();
    await expect(items[2]).toHaveAttribute("aria-disabled", "true"); await keyboard("{Enter} ");
    await expect(menu).toBeVisible(); expect(canvas.getByRole("status")).toBeEmptyDOMElement();
    await keyboard("{End}{ArrowDown}"); await expect(items[0]).toHaveFocus();
    await keyboard("{ArrowUp}"); await expect(items[3]).toHaveFocus();
    await keyboard("{Home}ee"); await expect(items[0]).toHaveFocus();
    await keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus());
    await keyboard("{ArrowUp}"); await expect(items[3]).toHaveFocus();
    await keyboard("{Home}du"); await expect(items[1]).toHaveFocus();
    await keyboard("{Enter}"); await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByRole("status")).toHaveTextContent(`${copy.performed} ${copy.duplicate}`);
  },
};
export const FocusExitAndCommandGuard: Story = {
  tags: internal, render: (args, { globals }) => <MenuExample {...args} hold delayTabClose profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = menuCopy(globals.storyContentProfile); const trigger = canvas.getByRole("button", { name: copy.more });
    await userEvent.click(trigger); const menu = canvas.getByRole("menu"); const items = within(menu).getAllByRole("menuitem");
    fireEvent.click(items[1]); fireEvent.click(items[1]); expect(canvas.getByLabelText("Command count")).toHaveTextContent("1");
    await keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger); await userEvent.click(items[1]); expect(canvas.getByLabelText("Command count")).toHaveTextContent("2");
    await tab(); await expect(canvas.getByRole("button", { name: copy.next })).toHaveFocus();
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await expect(canvas.getByRole("button", { name: copy.next })).toHaveFocus();
    await userEvent.click(trigger); await tab(true); await expect(canvas.getByRole("button", { name: copy.previous })).toHaveFocus();
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await expect(canvas.getByRole("button", { name: copy.previous })).toHaveFocus();
    await userEvent.click(trigger); await userEvent.click(canvas.getByRole("button", { name: copy.previous }));
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("button", { name: copy.previous })).toHaveFocus();
    await userEvent.click(trigger); await userEvent.click(trigger); await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
export const AllDisabled: Story = {
  tags: internal, args: { scenario: "all-disabled" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = menuCopy(globals.storyContentProfile); const trigger = canvas.getByRole("button", { name: copy.more });
    await userEvent.click(trigger); const menu = canvas.getByRole("menu"); await expect(menu).toHaveFocus();
    await keyboard("{ArrowDown}{Enter}"); const rows = within(menu).getAllByRole("menuitem"); await expect(rows[0]).toHaveFocus();
    await userEvent.click(rows[1]); expect(canvas.getByRole("status")).toBeEmptyDOMElement(); await expect(menu).toBeVisible();
    await keyboard("{Escape}"); await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const CommandSuccessor: Story = {
  tags: internal, render: (args, { globals }) => <MenuExample {...args} removeOnAction profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = menuCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: copy.more }));
    await userEvent.click(canvas.getByRole("menuitem", { name: copy.remove }));
    await waitFor(() => expect(canvas.getByRole("button", { name: copy.next })).toHaveFocus());
    expect(canvas.queryByRole("menu")).toBeNull();
  },
};
export const LongMenuAndViewport: Story = {
  tags: internal, args: { scenario: "long-menu", anchor: "end" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const trigger = canvas.getByRole("button", { name: menuCopy(globals.storyContentProfile).more });
    Object.assign(trigger.style, { position: "fixed", bottom: "12px", right: "0px" });
    try {
      await userEvent.click(trigger); const menu = canvas.getByRole("menu"); const panel = menu.parentElement!;
      await expect(panel).toHaveAttribute("data-side", "top"); geometry(menu);
      expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight); await keyboard("{End}");
      const last = within(menu).getAllByRole("menuitem").at(-1)!;
      await expect(last).toHaveFocus(); expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(panel.getBoundingClientRect().bottom);
      await keyboard("{Escape}");
    } finally { trigger.removeAttribute("style"); }
  },
};
export const CoarsePointerAndForcedColors: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const original = [
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
    ];
    const tap = async (element: HTMLElement) => {
      const box = element.getBoundingClientRect(); const frame = window.frameElement?.getBoundingClientRect(); const scale = frame ? frame.width / innerWidth : 1;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: (box.left + box.width / 2) * scale + (frame?.left ?? 0), y: (box.top + box.height / 2) * scale + (frame?.top ?? 0) }] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    try {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      const canvas = within(canvasElement); const copy = menuCopy(globals.storyContentProfile); const trigger = canvas.getByRole("button", { name: copy.more });
      await tap(trigger); let menu = await canvas.findByRole("menu"); geometry(menu);
      await tap(trigger); await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
      await tap(trigger); menu = await canvas.findByRole("menu");
      await tap(within(menu).getByRole("menuitem", { name: copy.duplicate }));
      await waitFor(() => expect(canvas.getByRole("status")).toHaveTextContent(copy.duplicate));
      await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature.name === "prefers-reduced-motion" ? { ...feature, value: "reduce" } : feature) });
      await userEvent.click(trigger); menu = canvas.getByRole("menu");
      expect(getComputedStyle(menu.parentElement!).borderTopWidth).toBe("1px"); expect(getComputedStyle(menu.parentElement!).animationName).toBe("none");
      await keyboard("{Escape}");
    } finally {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: false });
      await session.send("Emulation.setEmulatedMedia", { features: original });
    }
  },
};

export const MediumKeyboardAndGeometry: Story = {
  tags: internal,
  args: { size: "md" },
  play: KeyboardAndGeometry.play,
};

export const MediumNestedPreferences: Story = {
  tags: internal,
  args: { scenario: "submenus", anchor: "end", size: "md" },
  play: NestedPreferences.play,
};

// Compare actual consumers: Menu and Select share strict row-plus-inset outer geometry.
export const SelectionGeometry: Story = {
  tags: internal,
  render: (args, { globals }) => {
    const copy = menuCopy(globals.storyContentProfile);
    return <>
      <MenuExample {...args} profile={globals.storyContentProfile} />
      <Select size={args.size} label={copy.language} closeLabel={copy.previous} defaultValue="en"
        options={[{ value: "en", label: "English" }, { value: "pt", label: "Português" }]} />
    </>;
  },
  play: async ({ canvasElement, globals, args }) => {
    const canvas = within(canvasElement), copy = menuCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: copy.more }));
    const menu = canvas.getByRole("menu");
    geometry(menu);
    const panel = getComputedStyle(menu.parentElement!);
    const row = getComputedStyle(within(menu).getAllByRole("menuitem")[0]);
    const menuGeometry = [panel.paddingTop, row.paddingBlockStart, row.paddingInlineStart, row.borderTopLeftRadius, row.minBlockSize];
    await keyboard("{Escape}");
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    const listbox = canvas.getByRole("listbox");
    const selectPanel = getComputedStyle(listbox.closest<HTMLElement>("[data-presentation]")!);
    const option = getComputedStyle(within(listbox).getAllByRole("option")[0]);
    expect([selectPanel.paddingTop, option.paddingBlockStart, option.paddingInlineStart, option.borderTopLeftRadius, option.minBlockSize]).toEqual(menuGeometry);
    expect(parseFloat(panel.borderTopLeftRadius)).toBe(args.size === "md" ? 12 : 8);
    expect(parseFloat(selectPanel.borderTopLeftRadius)).toBe(args.size === "md" ? 12 : 8);
    await userEvent.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("Português");
    await expect(trigger).toHaveFocus();
    await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
  },
};

export const MediumSelectionGeometry: Story = {
  ...SelectionGeometry,
  args: { size: "md" },
};

export const RasterArtwork: Story = {
  tags: ["context-matrix"],
  args: { scenario: "artwork", size: "md" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement), copy = menuCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.more });
    trigger.focus(); await keyboard("{ArrowDown}");
    const menu = canvas.getByRole("menu", { name: copy.more }); geometry(menu);
    const rows = within(menu).getAllByRole("menuitem");
    for (const image of menu.querySelectorAll<HTMLImageElement>("img")) {
      await waitFor(() => expect(image.complete && image.naturalWidth === 64).toBe(true));
      expect(image.alt).toBe(""); expect(image.getBoundingClientRect().width).toBe(20);
      expect(image.getBoundingClientRect().height).toBe(20);
      expect(image.closest("li")!.getBoundingClientRect().height).toBe(36);
      expect(image.parentElement).toHaveAttribute("aria-hidden", "true");
    }
    expect(within(menu).queryByRole("img")).toBeNull();
    await expect(rows[0]).toHaveFocus();
    await keyboard("{ArrowDown}");
    const hoverPaint = resolvedBackground(rows[0], "--color-surface-neutral-subtle-hover");
    if (import.meta.env.MODE === "test") {
      const { userEvent: input } = await import("vitest/browser"); await input.hover(rows[0]);
      await waitFor(() => expect(getComputedStyle(rows[0]).backgroundColor).toBe(hoverPaint));
    } else await userEvent.hover(rows[0]);
    await keyboard("{Enter}");
    await expect(rows[1]).toHaveAttribute("aria-disabled", "true");
    await expect(menu).toBeVisible(); expect(canvas.getByRole("status")).toBeEmptyDOMElement();
    await keyboard("{ArrowDown}{ArrowRight}");
    const child = canvas.getByRole("menu", { name: copy.language }); geometry(child);
    const image = child.querySelector<HTMLImageElement>("img")!;
    await waitFor(() => expect(image.complete && image.naturalWidth === 64).toBe(true));
    expect(image.getBoundingClientRect().width).toBe(20);
    const plain = within(child).getByRole("menuitem", { name: copy.duplicate });
    expect(plain.querySelector('[aria-hidden="true"]')!.getBoundingClientRect().width).toBe(20);
    await keyboard("{Escape}{Escape}"); await expect(trigger).toHaveFocus();
    await userEvent.click(trigger); await userEvent.click(canvas.getByRole("menuitem", { name: "Hub" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Hub");
  },
};
import { useRef, useState } from "react";

function StatusSheetSpecimen() {
  const [open, setOpen] = useState(false), [performed, setPerformed] = useState("");
  const successor = useRef<HTMLButtonElement>(null);
  return <><Menu open={open} onOpenChange={setOpen} label="Statuses" presentation="sheet" closeLabel="Close"
    returnFocusRef={successor} trigger={<StatusBadge as="button" label="Not started" icon="general/status-dashed-circle" size="sm" />}
    items={[{ id: "inspect", label: "Inspect" }, { id: "more", label: "More statuses", submenu: { label: "Additional statuses", items: [{ id: "review", label: "In review", statusBadge: { intent: "info", icon: "general/status-progress-three-quarter" } }] } },
      { id: "disabled", label: "Unavailable", disabled: true, statusBadge: { intent: "warning", icon: "general/status-exclamation-circle" } },
      { id: "ready", label: "Ready", statusBadge: { intent: "success", icon: "general/status-check-circle" } }]}
    onAction={setPerformed} />
    <Button ref={successor} variant="soft" intent="neutral">Open details</Button><output aria-label="Performed command">{performed}</output></>;
}
export const CompactStatusSheet: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <StatusSheetSpecimen />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), body = within(document.body), trigger = c.getByRole("button", { name: "Not started" });
    trigger.focus(); await keyboard("{ArrowDown}");
    const dialog = body.getByRole("dialog", { name: "Statuses" });
    expect(dialog).toHaveAttribute("data-header-variant", "compact");
    expect(document.querySelectorAll(":popover-open")).toHaveLength(0);
    expect(getComputedStyle(within(dialog).getByRole("heading")).fontSize).toBe("14px");
    await keyboard("{ArrowDown}{ArrowRight}");
    await expect(body.getByRole("menuitem", { name: "In review" })).toHaveFocus();
    expect(document.querySelectorAll("dialog:modal")).toHaveLength(1);
    await keyboard("{Escape}");
    await expect(body.getByRole("menuitem", { name: "More statuses" })).toHaveFocus();
    await keyboard("{ArrowRight}");
    await userEvent.click(body.getByRole("button", { name: /^Statuses$/ }));
    await expect(body.getByRole("menuitem", { name: "More statuses" })).toHaveFocus();
    await keyboard("{ArrowDown}{Enter}");
    const unavailable = body.getByRole("menuitem", { name: "Unavailable" });
    await expect(unavailable).toHaveAttribute("aria-disabled", "true");
    const badge = unavailable.querySelector<HTMLElement>("[data-status-badge]")!;
    expect(getComputedStyle(badge).color).toBe(resolvedBackground(unavailable, "--color-text-disabled"));
    expect(getComputedStyle(badge.querySelector("[data-icon-name]")!).color).toBe(getComputedStyle(badge).color);
    expect(c.getByLabelText("Performed command")).toBeEmptyDOMElement();
    await keyboard("r");
    const row = body.getByRole("menuitem", { name: "Ready" }); await expect(row).toHaveFocus();
    expect(row.querySelector("button,a,[tabindex]")).toBeNull();
    expect(row.querySelector('[data-intent="success"]')).not.toBeNull();
    await keyboard("{Enter}");
    await waitFor(() => expect(c.getByRole("button", { name: "Open details" })).toHaveFocus());
    expect(c.getByLabelText("Performed command")).toHaveTextContent("ready");
    expect(body.queryByRole("dialog")).toBeNull();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  },
};
