import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Link } from "../../../packages/design-system/src/components/Link/Link";
import { Text } from "../../../packages/design-system/src/components/Text/Text";
import { FoundationStoryPage, FoundationStorySection } from "../../../packages/design-system/src/foundations/FoundationStoryLayout";
import { expect } from "storybook/test";

const meta = {
  title: "Start here/Welcome", id: "hito-welcome", tags: ["test", "context-matrix"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {
  render: () => <FoundationStoryPage title="Hito design system" description="Explore the React components, semantic tokens and working examples.">
    <FoundationStorySection title="Explore">
      <Text as="p"><Link href="/" target="_top">Hito home</Link></Text>
      <Text as="p"><Link href="./?path=/story/actions-button--default" target="_top">Components</Link></Text>
      <Text as="p"><Link href="./?path=/story/foundations-color-primitives-palettes--neutral" target="_top">Foundations</Link></Text>
      <Text as="p"><Link href="https://github.com/ivan-nthng/hito-runner" external target="_blank">Source &amp; contributions</Link></Text>
    </FoundationStorySection>
  </FoundationStoryPage>,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1, name: "Hito design system" })).toBeVisible();
    await expect(canvas.getByRole("link", { name: "Hito home" })).toHaveAttribute("href", "/");
  },
};
