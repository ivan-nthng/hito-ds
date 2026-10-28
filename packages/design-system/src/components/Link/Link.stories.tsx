import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { iconCatalog } from "../Icon/icon-catalog";
import { Text } from "../Text/Text";
import { Link, type LinkSize, type LinkTone } from "./Link";
import styles from "./Link.stories.module.css";

const tones: LinkTone[] = ["neutral", "accent"];
const sizes: LinkSize[] = ["sm", "md", "lg", "xl"];
const iconNames = Object.keys(iconCatalog);

const meta = {
  id: "actions-link",
  title: "Components/Actions/Link",
  component: Link,
  tags: ["test"],
  args: { children: "Open order queue", href: "#queue", tone: "neutral" },
  argTypes: {
    external: { control: "boolean" },
    icon: { control: "select", options: iconNames },
    leadingIcon: { control: "select", options: iconNames },
    size: { control: "inline-radio", options: sizes },
    tone: { control: "inline-radio", options: tones },
    trailingIcon: { control: "select", options: iconNames },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Text Link",
  parameters: {
    figma: {
      label: "Link in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8360-6",
    },
  },
  argTypes: {
    icon: { control: false, table: { disable: true } },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Open order queue" });
    await userEvent.tab();
    await expect(link).toHaveFocus();
  },
};

export const IconOnly: Story = {
  name: "Icon Link",
  parameters: {
    figma: {
      label: "Icon Link in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8360-15",
    },
  },
  args: {
    "aria-label": "Open external resource",
    children: undefined,
    href: "https://example.com",
    icon: "arrows/complex/up-right",
    tone: "accent",
  },
  argTypes: {
    children: { control: false, table: { disable: true } },
    external: { control: false, table: { disable: true } },
    leadingIcon: { control: false, table: { disable: true } },
    trailingIcon: { control: false, table: { disable: true } },
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole("link", { name: "Open external resource" });
    const icon = link.querySelector<HTMLElement>("[data-icon-name]");

    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(link.getAttribute("data-icon-position")).toBe("only");
    await expect(link.getBoundingClientRect().width).toBe(
      icon!.getBoundingClientRect().width,
    );
    await expect(link.getBoundingClientRect().height).toBe(
      icon!.getBoundingClientRect().height,
    );
  },
};

export const Overview: Story = {
  name: "Variants & icons",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Link
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Navigation stays an anchor, with theme-aware neutral or accent color.
        </Text>
      </header>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Tones
        </Text>
        <div className={styles.row}>
          {tones.map((tone) => (
            <Link href={`#${tone}`} key={tone} tone={tone}>
              {tone}
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Icon composition
        </Text>
        <div className={styles.row}>
          <Link href="#previous" leadingIcon="arrows/basic/left">
            Previous
          </Link>
          <Link href="#details" trailingIcon="arrows/basic/right">
            Details
          </Link>
          <Link
            href="#transfer"
            leadingIcon="general/link"
            trailingIcon="arrows/basic/right"
            tone="accent"
          >
            Transfer
          </Link>
          <Link external href="https://example.com" tone="accent">
            External resource
          </Link>
          <Link
            aria-label="Open external resource"
            href="https://example.com"
            icon="arrows/complex/up-right"
            tone="accent"
          />
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Sizes
        </Text>
        <div className={styles.row}>
          {sizes.map((size) => (
            <Link href={`#${size}`} key={size} size={size} tone="accent">
              {size.toUpperCase()}
            </Link>
          ))}
        </div>
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    const links = canvas.getAllByRole("link");
    const transfer = canvas.getByRole("link", { name: "Transfer" });
    const transferIcon = transfer.querySelector<HTMLElement>("[data-icon-name]");

    await expect(links).toHaveLength(11);
    await expect(transferIcon).not.toBeNull();
    await expect(getComputedStyle(transferIcon!).color).toBe(
      getComputedStyle(transfer).color,
    );
    await expect(parseFloat(getComputedStyle(transfer).lineHeight)).toBe(
      transferIcon!.getBoundingClientRect().height,
    );
    await userEvent.hover(transfer);
    await expect(getComputedStyle(transferIcon!).color).toBe(
      getComputedStyle(transfer).color,
    );
  },
};
