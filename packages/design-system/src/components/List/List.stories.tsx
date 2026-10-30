import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { ListItem } from "../ListItem/ListItem";
import { Surface } from "../Surface/Surface";
import { Text } from "../Text/Text";
import { List } from "./List";
import styles from "./List.stories.module.css";

const content = [
  ["Order 1048", "Ready for kitchen review"],
  ["Order 1049", "Waiting for confirmation from the customer"],
  ["Order 1050", "Preparation is in progress"],
] as const;

const meta = {
  id: "data-list",
  title: "Components/Collections/List",
  component: List,
  tags: ["test"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OperationalQueue: Story = {
  parameters: {
    figma: {
      label: "List in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8832-3",
    },
  },
  render: () => (
    <Surface as="section" aria-label="Order queue" className={styles.surface}>
      <List>
        {content.map(([title, description]) => (
          <ListItem key={title}>
            <Text as="span" variant="label-base">
              {title}
            </Text>
            <Text variant="body-sm">{description}</Text>
          </ListItem>
        ))}
      </List>
    </Surface>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("list")).toBeVisible();
    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
  },
};

export const Narrow: Story = {
  ...OperationalQueue,
  parameters: {
    viewport: { defaultViewport: "narrow" },
  },
};

export const Wide: Story = {
  ...OperationalQueue,
  parameters: {
    viewport: { defaultViewport: "boundaryXl" },
  },
};
