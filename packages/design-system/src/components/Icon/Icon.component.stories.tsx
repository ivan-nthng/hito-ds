import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text } from "../Text/Text";
import { Icon, type IconSize } from "./Icon";
import { iconCatalog } from "./icon-catalog";
import styles from "./Icon.stories.module.css";

const sizes: ReadonlyArray<{ label: string; size: IconSize }> = [
  { label: "SM · 16", size: "sm" },
  { label: "MD · 20", size: "md" },
  { label: "LG · 24", size: "lg" },
  { label: "XL · 28", size: "xl" },
];

const meta = {
  id: "components-primitives-icon",
  title: "Components/Primitives/Icon",
  component: Icon,
  tags: ["test"],
  parameters: {
    figma: {
      label: "Icon in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8221-2",
    },
  },
  args: {
    name: "general/check",
    size: "md",
    state: "default",
    tone: "default",
  },
  argTypes: {
    name: { control: "select", options: Object.keys(iconCatalog) },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    state: {
      control: "inline-radio",
      options: ["default", "hover", "disabled"],
    },
    tone: {
      control: "select",
      options: [
        "default",
        "secondary",
        "muted",
        "accent",
        "info",
        "success",
        "warning",
        "destructive",
      ],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-icon-name="general/check"]'),
    ).toBeVisible();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Icon sizes
        </Text>
        <Text className={styles.secondary} variant="body-base">
          One source asset scales through the accepted fixed UI icon-size roles.
        </Text>
      </header>
      <div className={styles.sizes}>
        {sizes.map((item) => (
          <div
            className={styles.size}
            data-icon-size={item.size}
            key={item.size}
          >
            <Icon {...args} size={item.size} />
            <Text variant="technical-sm">{item.label}</Text>
          </div>
        ))}
      </div>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-icon-size]"),
    ).toHaveLength(4);
  },
};
