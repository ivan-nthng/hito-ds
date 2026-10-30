import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text, textVariants, type TextEmphasis } from "./Text";

const emphases: readonly TextEmphasis[] = [
  "regular",
  "medium",
  "strong",
  "bold",
];

const meta = {
  id: "components-primitives-text",
  title: "Components/Primitives/Text",
  component: Text,
  tags: ["test"],
  args: {
    children: "Text remains clear at every level of the hierarchy.",
    variant: "body-base",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["span", "p", "h1", "h2", "h3", "strong", "small", "div"],
    },
    emphasis: { control: "inline-radio", options: [undefined, ...emphases] },
    variant: { control: "select", options: textVariants },
  },
  parameters: {
    figma: {
      label: "Text styles in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8213-23",
    },
    docs: {
      description: {
        component:
          "Polymorphic text primitive. Typography roles live under Foundations/Typography and semantic colors under Foundations/Color/Text.",
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText("Text remains clear at every level of the hierarchy."),
    ).toBeVisible();
  },
};
