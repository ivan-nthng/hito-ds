import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Separator } from "../Separator/Separator";
import { Text } from "../Text/Text";
import { Surface } from "./Surface";
import styles from "./Surface.stories.module.css";

const meta = {
  id: "foundations-structure-surface",
  title: "Components/Primitives/Surface",
  component: Surface,
  tags: ["test"],
  parameters: {
    layout: "centered",
    figma: {
      label: "Surface in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8228-3",
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Surface
      as="section"
      aria-labelledby="surface-title"
      className={styles.surface}
    >
      <Text as="h2" id="surface-title" variant="heading-sm">
        Operational summary
      </Text>
      <Separator decorative />
      <Text variant="body-base">
        A neutral surface groups related content without owning product meaning.
      </Text>
    </Surface>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("region")).toBeVisible();
    await expect(canvas.getByRole("heading", { level: 2 })).toBeVisible();
  },
};
