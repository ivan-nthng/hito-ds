import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Separator } from "./Separator";
import styles from "./Separator.stories.module.css";

const meta = {
  id: "foundations-structure-separator",
  title: "Components/Primitives/Separator",
  component: Separator,
  tags: ["test"],
  parameters: {
    figma: {
      label: "Separator in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8235-2",
    },
  },
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Semantic: Story = {
  name: "Default",
  render: (args) => (
    <div
      className={args.orientation === "vertical" ? styles.row : styles.column}
    >
      <span>Before</span>
      <Separator {...args} />
      <span>After</span>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("separator")).toBeVisible();
  },
};
