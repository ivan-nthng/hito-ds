import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { getTagChipContent } from "../../storybook/tag-chip.story";
import { Text } from "../Text/Text";
import { Tag, tagSizes, type TagProps } from "./Tag";
import styles from "./Tag.stories.module.css";

const meta = {
  id: "data-tag", title: "Components/Collections/Tag", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["label", "leadingIcon", "size"] } },
  args: { label: "", leadingIcon: undefined, size: "md" },
  argTypes: {
    label: { control: "text", description: "Optional custom label; empty uses the toolbar's localized sample." },
    leadingIcon: { control: "select", options: ["none", "general/star", "general/location"], mapping: { none: undefined } },
    size: { control: "inline-radio", options: tagSizes },
  },
  render: (args, { globals }) => {
    const copy = getTagChipContent(globals.storyContentProfile);
    const label = args.label || copy.category;
    return <FoundationStoryPage title="Tag" description="A passive category with a single-line label. Use Controls for size and icon; the toolbar sets language and theme.">
      <div className={styles.example} lang={copy.lang}><Tag {...args} label={label} />
        {copy.long ? <Text variant="body-sm">{copy.full}: {label}</Text> : null}
      </div>
    </FoundationStoryPage>;
  },
} satisfies Meta<TagProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Tag in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8919-11",
    },
    docs: {
      description: {
        story: "[Tag overview in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8919-12)",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const tag = canvasElement.querySelector<HTMLElement>("[data-tag]")!;
    await expect(tag.querySelector("button, a, [tabindex]")).toBeNull();
    await expect(tag).not.toHaveAttribute("tabindex");
    await expect(tag.getBoundingClientRect().height).toBe(args.size === "sm" ? 28 : 36);
    await expect(getComputedStyle(tag).borderRadius).toBe("9999px");
    await expect(getComputedStyle(tag).boxShadow).toBe("none");
    await expect(getComputedStyle(tag.lastElementChild!).whiteSpace).toBe("nowrap");
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
