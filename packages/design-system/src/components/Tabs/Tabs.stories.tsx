import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Tabs, tabsSizes, tabsAppearances, type TabsAppearance, type TabsItem, type TabsSize } from "./Tabs";
import { TabsExample } from "./Tabs.example.story";
import { tabsCopy } from "./Tabs.content.story";

type Args = { appearance: TabsAppearance; size: TabsSize; icons: boolean; counts: boolean };
const meta = {
  id: "internal-tabs-preview",
  title: "Components/Navigation/Tabs",
  tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["appearance", "size", "icons", "counts"] } },
  args: { appearance: "underline", size: "md", icons: true, counts: true },
  argTypes: {
    appearance: { control: "inline-radio", options: tabsAppearances, description: "Two visual treatments for the same related panels." },
    size: { control: "inline-radio", options: tabsSizes, description: "MD is the default. SM is for dense pointer-led layouts; the viewport never changes size." },
    icons: { control: "boolean", description: "Show existing Design System icons beside labels." },
    counts: { control: "boolean", description: "Show known zero and a large localized count." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Tabs" description="Related sections in one place. Try the tabs, or change appearance, size, icons and counts in Controls.">
    <TabsExample key={String(globals.storyContentProfile)} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

function checkAssociations(canvasElement: HTMLElement) {
  const tabs = canvasElement.querySelectorAll('[role="tab"]');
  const ids = Array.from(canvasElement.querySelectorAll("[id]"), node => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  tabs.forEach(tab => {
    const panel = canvasElement.ownerDocument.getElementById(tab.getAttribute("aria-controls")!);
    expect(panel).toHaveAttribute("role", "tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });
  expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
}

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Tabs in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8535-33",
    },
  },
  tags: ["context-matrix"],
  play: async ({ canvasElement, args, globals }) => {
    const canvas = within(canvasElement);
    const copy = tabsCopy(globals.storyContentProfile);
    const tabs = canvas.getAllByRole("tab");
    await expect(canvas.getByRole("tablist")).toHaveAccessibleName(copy.tablist);
    await expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    await expect(tabs[3]).toBeDisabled();
    await expect(canvas.getAllByRole("tabpanel")).toHaveLength(1);
    for (const tab of tabs) await expect(tab).toHaveAttribute("data-size", args.size);
    await expect(tabs[1].querySelectorAll("[data-icon-name]")).toHaveLength(args.icons ? 1 : 0);
    if (args.counts) {
      await expect(tabs[1]).toHaveTextContent(new Intl.NumberFormat(copy.locale).format(1248));
      await expect(tabs[2]).toHaveTextContent("0");
    }
    if (args.appearance === "underline") {
      const button = getComputedStyle(tabs[0]);
      const underline = getComputedStyle(tabs[0], "::after");
      const clearance = -parseFloat(underline.bottom) - parseFloat(underline.height) - parseFloat(button.borderBottomWidth);
      await expect(clearance).toBe(args.size === "sm" ? 6 : 12);
      const rail = tabs[0].parentElement!;
      await expect(rail.getBoundingClientRect().bottom - tabs[0].getBoundingClientRect().bottom).toBeGreaterThanOrEqual(clearance + parseFloat(underline.height));
    }
    checkAssociations(canvasElement);
  },
};

export const KeyboardAndPersistence: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = tabsCopy(globals.storyContentProfile);
    const tabs = canvas.getAllByRole("tab");
    const selected = (index: number) => {
      expect(tabs[index]).toHaveAttribute("aria-selected", "true");
      expect(tabs[index]).toHaveFocus();
      expect(tabs.filter(tab => tab.tabIndex === 0)).toHaveLength(1);
      expect(canvas.getAllByRole("tabpanel")).toHaveLength(1);
    };
    await userEvent.click(canvas.getByRole("heading", { name: copy.title }));
    await userEvent.tab();
    selected(0);
    await userEvent.keyboard("{ArrowRight}");
    selected(1);
    await userEvent.keyboard("{End}");
    selected(2);
    await userEvent.keyboard("{ArrowRight}");
    selected(0); // Skips the disabled final tab and wraps.
    await userEvent.keyboard("{ArrowLeft}");
    selected(2);
    await userEvent.keyboard("{Home}");
    selected(0);
    await userEvent.tab();
    await expect(canvas.getByRole("tabpanel")).toHaveFocus();
    await userEvent.tab();
    const input = canvas.getByRole("textbox", { name: copy.draftLabel });
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, "Saved local draft");
    await userEvent.click(tabs[1]);
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await userEvent.click(tabs[0]);
    await expect(canvas.getByRole("textbox", { name: copy.draftLabel })).toHaveValue("Saved local draft");
    await userEvent.keyboard(" ");
    selected(0);
    await userEvent.keyboard("{Enter}");
    selected(0);
    const strip = canvas.getByRole("tablist");
    const y = window.scrollY;
    await userEvent.keyboard("{End}");
    await waitFor(() => {
      const bounds = strip.getBoundingClientRect();
      const tab = tabs[2].getBoundingClientRect();
      expect(tab.right).toBeGreaterThan(bounds.left);
      expect(tab.left).toBeLessThan(bounds.right);
      expect(window.scrollY).toBe(y);
    });
    await expect(getComputedStyle(strip).overflowX).toBe("auto");
    await expect(getComputedStyle(tabs[2]).whiteSpace).toBe("nowrap");
    checkAssociations(canvasElement);
  },
};

/** Item mutations belong to the consumer and are exercised only in a regression fixture. */
function ChangedItems({ profile }: { profile: unknown }) {
  const copy = tabsCopy(profile);
  const initial: TabsItem[] = [
    { id: "first", label: "First", content: "First panel" },
    { id: "middle", label: "Middle", content: "Middle panel" },
    { id: "last", label: "Last", content: "Last panel" },
  ];
  const [model, setModel] = useState({ items: initial, value: "middle" as string | null });
  const pendingMutation = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(pendingMutation.current), []);
  const remove = () => setModel(current => {
    const index = current.items.findIndex(item => item.id === current.value);
    const items = current.items.filter(item => item.id !== current.value);
    const next = items.slice(index).find(item => !item.disabled) ?? items.slice(0, index).reverse().find(item => !item.disabled);
    return { items, value: next?.id ?? null };
  });
  const disableSelected = () => setModel(current => {
    const index = current.items.findIndex(item => item.id === current.value);
    const items = current.items.map(item => item.id === current.value ? { ...item, disabled: true } : item);
    const next = items.slice(index + 1).find(item => !item.disabled) ?? items.slice(0, index).reverse().find(item => !item.disabled);
    return { items, value: next?.id ?? null };
  });
  // Reproduce an owner update while focus stays inside Tabs; no deletion UI is admitted.
  const schedule = (action: () => void) => {
    clearTimeout(pendingMutation.current);
    pendingMutation.current = setTimeout(action, 250);
  };
  return <FoundationStoryPage title="Tabs ownership" description="Coherent consumer changes preserve selection and external focus.">
    <Button intent="neutral" variant="secondary" onClick={remove}>Remove selected item</Button>
    <Button intent="neutral" variant="secondary" onClick={() => setModel(current => ({ items: current.items.map(item => ({ ...item, disabled: true })), value: null }))}>Disable all items</Button>
    <Button intent="neutral" variant="secondary" onClick={() => setModel({ items: [], value: null })}>Clear all items</Button>
    <Button intent="neutral" variant="secondary" onClick={() => schedule(remove)}>Schedule removal</Button>
    <Button intent="neutral" variant="secondary" onClick={() => schedule(disableSelected)}>Schedule disable</Button>
    <Tabs items={model.items} value={model.value} onValueChange={value => setModel(current => ({ ...current, value }))} label="Mutable sections" />
    {!model.value ? <Text>{copy.empty}</Text> : null}
    <Tabs items={initial} value="first" onValueChange={() => {}} label="Independent sections" />
  </FoundationStoryPage>;
}

export const OwnerChanges: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => <ChangedItems profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const mutable = within(canvas.getByRole("tablist", { name: "Mutable sections" }));
    const remove = canvas.getByRole("button", { name: "Remove selected item" });
    await userEvent.click(remove);
    await expect(mutable.getByRole("tab", { name: "Last" })).toHaveAttribute("aria-selected", "true");
    await expect(remove).toHaveFocus();
    await userEvent.click(remove);
    await expect(mutable.getByRole("tab", { name: "First" })).toHaveAttribute("aria-selected", "true");
    await expect(remove).toHaveFocus();
    const disable = canvas.getByRole("button", { name: "Disable all items" });
    await userEvent.click(disable);
    await expect(mutable.getByRole("tab", { name: "First" })).toBeDisabled();
    await expect(disable).toHaveFocus();
    await expect(canvas.getByText(tabsCopy(globals.storyContentProfile).empty)).toBeVisible();
    await expect(canvas.getAllByRole("tabpanel")).toHaveLength(1); // Independent instance only.
    await userEvent.click(canvas.getByRole("button", { name: "Clear all items" }));
    await expect(canvas.queryByRole("tablist", { name: "Mutable sections" })).toBeNull();
    await expect(canvas.getByRole("button", { name: "Clear all items" })).toHaveFocus();
    checkAssociations(canvasElement);
  },
};

export const FocusedOwnerChanges: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => <ChangedItems profile={globals.storyContentProfile} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mutable = within(canvas.getByRole("tablist", { name: "Mutable sections" }));
    await userEvent.click(canvas.getByRole("button", { name: "Schedule removal" }));
    mutable.getByRole("tab", { name: "Middle" }).focus();
    await waitFor(() => expect(mutable.queryByRole("tab", { name: "Middle" })).toBeNull());
    await expect(mutable.getByRole("tab", { name: "Last" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Schedule disable" }));
    mutable.getByRole("tab", { name: "Last" }).focus();
    await waitFor(() => expect(mutable.getByRole("tab", { name: "Last" })).toBeDisabled());
    await expect(mutable.getByRole("tab", { name: "First" })).toHaveFocus();
    // A panel being hidden needs the same repair as its removed tab.
    await userEvent.click(canvas.getByRole("button", { name: "Schedule disable" }));
    const firstTab = mutable.getByRole("tab", { name: "First" });
    canvasElement.ownerDocument.getElementById(firstTab.getAttribute("aria-controls")!)!.focus();
    await waitFor(() => expect(firstTab).toBeDisabled());
    await expect(canvas.getByRole("tablist", { name: "Mutable sections" })).toHaveFocus();
    await expect(canvas.getAllByRole("tabpanel")).toHaveLength(1);
    checkAssociations(canvasElement);
  },
};

export const SegmentedKeyboard: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { appearance: "segmented" },
  play: KeyboardAndPersistence.play,
};

function GeometryExample({ profile }: { profile: unknown }) {
  const copy = tabsCopy(profile);
  const [size, setSize] = useState<TabsSize>("md");
  const [rtl, setRtl] = useState(false);
  const [long, setLong] = useState(false);
  const [value, setValue] = useState<string | null>("second");
  const [disabled, setDisabled] = useState(false);
  return <FoundationStoryPage title="Tabs geometry" description="Selection follows variable labels and direction without changing control geometry.">
    <Button intent="neutral" variant="secondary" onClick={() => setSize(current => current === "md" ? "sm" : "md")}>Change size</Button>
    <Button intent="neutral" variant="secondary" onClick={() => setRtl(current => !current)}>Change direction</Button>
    <Button intent="neutral" variant="secondary" onClick={() => setLong(current => !current)}>Change preceding label</Button>
    <Button intent="neutral" variant="secondary" onClick={() => { setDisabled(true); setValue(null); }}>Disable every tab</Button>
    <div dir={rtl ? "rtl" : "ltr"}>
      <Tabs appearance="segmented" size={size} label="Geometry sections" value={value} onValueChange={setValue} items={[
        { id: "first", label: long ? "A much longer preceding section" : "One", disabled, content: "One panel" },
        { id: "second", label: "Second section", disabled, content: "Second panel" },
        { id: "third", label: "Three", disabled, content: "Third panel" },
      ]} />
    </div>
    {!value ? <Text>{copy.empty}</Text> : null}
  </FoundationStoryPage>;
}

export const SegmentedGeometry: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => <GeometryExample profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const strip = canvas.getByRole("tablist");
    const backing = canvasElement.querySelector<HTMLElement>("[data-tabs-indicator]")!;
    const aligned = async () => waitFor(() => {
      const tab = within(strip).getByRole("tab", { selected: true });
      expect(backing.offsetParent).toBe(tab.offsetParent);
      const tabRect = tab.getBoundingClientRect();
      const backingRect = backing.getBoundingClientRect();
      for (const edge of ["left", "top", "width", "height"] as const) expect(Math.abs(tabRect[edge] - backingRect[edge])).toBeLessThan(1);
      expect(backing).toBeVisible();
    });
    await aligned();
    await userEvent.click(within(strip).getByRole("tab", { name: "Three" }));
    await aligned();
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) await expect(getComputedStyle(backing).transitionDuration.split(",").every(duration => parseFloat(duration) === 0)).toBe(true);
    await userEvent.click(canvas.getByRole("button", { name: "Change preceding label" }));
    await aligned();
    await userEvent.click(canvas.getByRole("button", { name: "Change size" }));
    await aligned();
    const tab = within(strip).getByRole("tab", { selected: true });
    await expect(tab).toHaveAttribute("data-size", "sm");
    const rail = tab.parentElement!;
    const totalInset = parseFloat(getComputedStyle(rail).paddingLeft) + parseFloat(getComputedStyle(rail).borderLeftWidth);
    await expect(parseFloat(getComputedStyle(rail).borderTopLeftRadius)).toBe(10);
    await expect(parseFloat(getComputedStyle(rail).borderTopLeftRadius)).toBeGreaterThan(parseFloat(getComputedStyle(tab).borderTopLeftRadius) + totalInset);
    await userEvent.click(canvas.getByRole("button", { name: "Change direction" }));
    await aligned();
    await userEvent.click(within(strip).getByRole("tab", { name: "Second section" }));
    await userEvent.keyboard("{ArrowRight}");
    await expect(within(strip).getByRole("tab", { name: "A much longer preceding section" })).toHaveFocus();
    await aligned();
    await userEvent.click(canvas.getByRole("button", { name: "Disable every tab" }));
    await expect(backing).not.toBeVisible();
    await expect(canvas.queryByRole("tabpanel")).toBeNull();
    await expect(canvas.getByText(tabsCopy(globals.storyContentProfile).empty)).toBeVisible();
    checkAssociations(canvasElement);
  },
};

export const SmallUnderline: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { size: "sm" },
  play: Playground.play,
};
