import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Icon, type IconTone } from "../components/Icon/Icon";
import { Text } from "../components/Text/Text";
import styles from "./IconColors.stories.module.css";

const neutralRoles = ["default", "secondary", "muted", "disabled"] as const;
const intentRoles: IconTone[] = [
  "accent",
  "info",
  "success",
  "warning",
  "destructive",
];

const meta = {
  id: "foundations-color-icon",
  title: "Foundations/Color/Icon",
  tags: ["test"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hierarchy: Story = {
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Icon hierarchy
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Default, secondary, muted and disabled icon colors in the active
          theme.
        </Text>
      </header>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Neutral hierarchy
        </Text>
        <div className={styles.rows}>
          {neutralRoles.map((role) => (
            <div className={styles.row} data-icon-color={role} key={role}>
              <Text variant="technical-sm">icon/{role}</Text>
              <span className={styles.iconSample}>
                <Icon
                  name="general/check"
                  size="lg"
                  state={role === "disabled" ? "disabled" : "default"}
                  tone={role === "disabled" ? "default" : role}
                />
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-icon-color]"),
    ).toHaveLength(4);
  },
};

export const Intent: Story = {
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Icon intent
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Accent, information, success, warning and destructive icon colors in
          the active theme.
        </Text>
      </header>
      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Intent states
        </Text>
        <div className={styles.rows}>
          <div aria-hidden="true" className={styles.intentHeader}>
            <Text variant="technical-sm">Intent</Text>
            <Text variant="technical-sm">Default</Text>
            <Text variant="technical-sm">Hover</Text>
          </div>
          {intentRoles.map((tone) => (
            <div
              className={styles.intentRow}
              data-icon-intent={tone}
              key={tone}
            >
              <Text variant="technical-sm">icon/{tone}</Text>
              <Icon name="general/info-filled" size="lg" tone={tone} />
              <Icon
                name="general/info-filled"
                size="lg"
                state="hover"
                tone={tone}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-icon-intent]"),
    ).toHaveLength(5);
  },
};
