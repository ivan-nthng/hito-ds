import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FoundationSpecimenGrid, FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { KeyboardShortcut } from "./KeyboardShortcut";

const meta = {
  id: "data-keyboard-shortcut",
  title: "Components/Primitives/KeyboardShortcut",
  component: KeyboardShortcut,
  tags: ["test"],
  parameters: { layout: "fullscreen" },
  args: { keys: ["command", "shift", { text: "K" }] },
  argTypes: {
    keys: { control: "object" },
    children: { control: false },
  },
} satisfies Meta<typeof KeyboardShortcut>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "KeyboardShortcut in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8849-551",
    },
  },
  render: (args) => (
    <FoundationStoryPage
      title="KeyboardShortcut"
      description="A fixed chip for existing key commands. Choose shared keyboard icons and editable key text."
    >
      <KeyboardShortcut {...args} />
    </FoundationStoryPage>
  ),
  play: async ({ canvas }) => {
    const shortcut = canvas.getByText("K").closest("kbd")!;
    await expect(shortcut).toHaveTextContent("Command Shift K");
    await expect(shortcut).not.toHaveAttribute("tabindex");
  },
};

export const Combinations: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => (
    <FoundationStoryPage
      title="KeyboardShortcut combinations"
      description="One fixed size, with different combinations of shared keyboard icons and key text."
    >
      <FoundationSpecimenGrid>
        <KeyboardShortcut keys={["command", "shift"]} />
        <KeyboardShortcut keys={["option", { text: "K" }]} />
        <KeyboardShortcut keys={["control", "return", { text: "M" }]} />
        <KeyboardShortcut keys={["command", { text: "Esc" }]} />
      </FoundationSpecimenGrid>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const shortcuts = canvasElement.querySelectorAll<HTMLElement>("kbd");
    await expect(shortcuts).toHaveLength(4);
    for (const shortcut of shortcuts) {
      const css = getComputedStyle(shortcut);
      await expect(shortcut.getBoundingClientRect().height).toBe(16);
      await expect(css.borderTopLeftRadius).toBe("4px");
      await expect(css.borderTopWidth).toBe("0px");
      await expect(css.borderRightWidth).toBe("0px");
      await expect(css.borderBottomWidth).toBe("0px");
      await expect(css.borderLeftWidth).toBe("0px");
      await expect(css.paddingInlineStart).toBe("2px");
      await expect(css.paddingInlineEnd).toBe("2px");
      await expect(css.paddingBlockStart).toBe("2px");
      await expect(css.paddingBlockEnd).toBe("2px");
      await expect(css.columnGap).toBe("2px");
      await expect(css.fontSize).toBe("12px");
      await expect(css.lineHeight).toBe("12px");
      await expect(shortcut).not.toHaveAttribute("tabindex");
      for (const keyText of shortcut.querySelectorAll<HTMLElement>('[aria-hidden="true"]:not([data-icon-name])')) {
        const box = keyText.getBoundingClientRect();
        await expect(box.width).toBeGreaterThanOrEqual(12);
        await expect(box.height).toBe(12);
        await expect(keyText.scrollWidth).toBeLessThanOrEqual(keyText.clientWidth);
        await expect(getComputedStyle(keyText).justifyContent).toBe("center");
      }
      for (const icon of shortcut.querySelectorAll<HTMLElement>('[data-icon-name^="keyboard/"]')) {
        const image = getComputedStyle(icon).maskImage;
        await expect(icon.getBoundingClientRect().width).toBe(12);
        await expect(icon.getBoundingClientRect().height).toBe(12);
        await expect(icon).toHaveAttribute("aria-hidden", "true");
        await expect(image).not.toBe("none");
        const source = image.match(/^url\(["']?(.*?)["']?\)$/u)?.[1];
        await expect(source).toBeTruthy();
        const asset = new Image();
        asset.src = source!;
        await asset.decode();
        await expect(asset.naturalWidth).toBeGreaterThan(0);
      }
    }
    await expect(shortcuts[0]).toHaveTextContent("Command Shift");
    await expect(shortcuts[1]).toHaveTextContent("Option K");
    await expect(shortcuts[2]).toHaveTextContent("Control Return M");
    const singleKey = shortcuts[1].querySelector<HTMLElement>('[aria-hidden="true"]:not([data-icon-name])')!;
    await expect(singleKey.getBoundingClientRect().width).toBe(12);
    await expect(singleKey.getBoundingClientRect().height).toBe(12);
    await expect(shortcuts[0].querySelector('[aria-hidden="true"]:not([data-icon-name])')).toBeNull();
    const longKey = shortcuts[3].querySelector<HTMLElement>('[aria-hidden="true"]:not([data-icon-name])')!;
    await expect(longKey.getBoundingClientRect().width).toBeGreaterThan(12);
    await expect(shortcuts[3].getBoundingClientRect().height).toBe(16);
  },
};
