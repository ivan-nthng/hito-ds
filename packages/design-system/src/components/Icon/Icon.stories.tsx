import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text } from "../Text/Text";
import { Icon, type IconProps } from "./Icon";
import {
  arrowsIconNames,
  controlsIconNames,
  generalIconNames,
  deliveryIconNames,
  mapIconNames,
  financeIconNames,
  documentsIconNames,
  communicationIconNames,
  techIconNames,
  keyboardIconNames,
  socialIconNames,
  iconNames,
  iconCatalog,
  type IconName,
} from "./icon-catalog";
import styles from "./Icon.stories.module.css";

function IconGrid({
  getLabel = (name) => name.replace(/^[^/]+\//u, ""),
  labelIcons = false,
  names,
  ...props
}: Omit<IconProps, "name"> & {
  getLabel?: (name: IconName) => string;
  labelIcons?: boolean;
  names: readonly IconName[];
}) {
  return (
    <div className={styles.grid}>
      {names.map((name) => (
        <div className={styles.item} data-catalog-icon={name} key={name}>
          <Icon {...props} name={name} label={labelIcons ? getLabel(name) : undefined} />
          <Text className={styles.itemLabel} variant="technical-sm">
            {getLabel(name)}
          </Text>
        </div>
      ))}
    </div>
  );
}

function CatalogStory({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          {title}
        </Text>
        <Text className={styles.secondary} variant="body-base">
          {description}
        </Text>
      </header>
      {children}
    </main>
  );
}

const arrowSections = [
  {
    label: "Chevrons",
    names: arrowsIconNames.filter((name) => name.startsWith("arrows/basic/")),
  },
  {
    label: "Carets",
    names: arrowsIconNames.filter((name) => name.startsWith("arrows/compact/")),
  },
  {
    label: "Arrows",
    names: arrowsIconNames.filter((name) => name.startsWith("arrows/complex/")),
  },
  {
    label: "Boxed arrows",
    names: arrowsIconNames.filter((name) => name.startsWith("arrows/stroke/")),
  },
  {
    label: "Sorting",
    names: arrowsIconNames.filter((name) => name === "arrows/sorting"),
  },
] as const;

const boardSelectedIconNames = iconNames.filter((name) =>
  iconCatalog[name].figmaNodeId.startsWith("9045:"),
);

const expandedOperationsIconNames = [
  "delivery/scooter", "delivery/walking", "delivery/driver", "delivery/express",
  "delivery/orders", "delivery/order-search", "delivery/finish", "delivery/door",
  "map/route", "map/navigation", "map/current-location", "map/layers", "map/area",
  "map/store", "map/parking", "map/add-address", "map/roadworks",
  "finance/business-account", "finance/bank", "finance/commission", "finance/gift",
  "finance/voucher", "finance/tips", "finance/payment",
  "documents/license", "documents/license-invalid", "documents/policy",
  "documents/medical-book", "documents/vehicle-document", "documents/confidentiality",
  "general/lightning", "general/camera", "controls/scan", "general/return",
  "general/shield", "communication/end-call", "communication/microphone",
  "communication/microphone-off",
] as const satisfies readonly IconName[];

function getArrowLabel(name: IconName) {
  return name
    .replace(/^arrows\/(?:basic|compact|complex|stroke)\//u, "")
    .replace(/^arrows\//u, "");
}

const meta = {
  id: "foundations-icon",
  title: "Foundations/Iconography",
  component: Icon,
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
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Arrows: Story = {
  render: (args) => (
    <CatalogStory
      description="23 exact Figma arrow assets. Size and semantic color are adapters, not duplicated SVGs."
      title="Arrows"
    >
      <div className={styles.sections}>
        {arrowSections.map((section) => (
          <section
            className={styles.section}
            data-icon-section={section.label}
            key={section.label}
          >
            <Text as="h2" variant="label-base">
              {section.label}
            </Text>
            <IconGrid
              {...args}
              getLabel={getArrowLabel}
              names={section.names}
            />
          </section>
        ))}
      </div>
    </CatalogStory>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-icon-section]"),
    ).toHaveLength(5);
    await expect(
      canvasElement.querySelectorAll("[data-catalog-icon]"),
    ).toHaveLength(23);
  },
};

export const General: Story = {
  tags: ["context-matrix"],
  render: (args) => (
    <CatalogStory
      description="50 registered general-purpose assets, including the simple semicircle beside the outlined progress family."
      title="General"
    >
      <IconGrid {...args} names={generalIconNames} />
    </CatalogStory>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-catalog-icon]"),
    ).toHaveLength(50);
    const half = canvasElement.querySelector<HTMLElement>('[data-catalog-icon="general/status-half-circle"] [data-icon-name]');
    await expect(half).toBeVisible();
    await expect(half).toHaveAttribute("aria-hidden", "true");
    await expect(getComputedStyle(half!).maskImage).not.toBe("none");
  },
};

export const Controls: Story = {
  render: (args) => (
    <CatalogStory
      description="39 control assets. Plus S is the compact control glyph; its downstream Figma mapping remains pending."
      title="Controls"
    >
      <IconGrid {...args} names={controlsIconNames} />
    </CatalogStory>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-catalog-icon]"),
    ).toHaveLength(39);
  },
};

export const Delivery: Story = {
  render: (args) => <CatalogStory title="Delivery" description="Thirteen Hito DS delivery glyphs from the shared Figma library."><IconGrid {...args} names={deliveryIconNames} /></CatalogStory>,
  play: async ({ canvasElement }) => { await expect(canvasElement.querySelectorAll("[data-catalog-icon]")).toHaveLength(13); },
};

export const Map: Story = {
  render: (args) => <CatalogStory title="Map" description="Nine route, location and map glyphs from the shared Figma library."><IconGrid {...args} names={mapIconNames} /></CatalogStory>,
  play: async ({ canvasElement }) => { await expect(canvasElement.querySelectorAll("[data-catalog-icon]")).toHaveLength(9); },
};

export const Finance: Story = {
  render: (args) => <CatalogStory title="Finance" description="Thirteen payment and transaction glyphs from the shared Figma library."><IconGrid {...args} names={financeIconNames} /></CatalogStory>,
  play: async ({ canvasElement }) => { await expect(canvasElement.querySelectorAll("[data-catalog-icon]")).toHaveLength(13); },
};

export const Documents: Story = {
  render: (args) => <CatalogStory title="Documents" description="Six courier and operational document glyphs from the shared Figma library."><IconGrid {...args} names={documentsIconNames} /></CatalogStory>,
  play: async ({ canvasElement }) => { await expect(canvasElement.querySelectorAll("[data-catalog-icon]")).toHaveLength(6); },
};

export const Communication: Story = {
  render: (args) => <CatalogStory title="Communication" description="Six contact, voice and support glyphs from the shared Figma library."><IconGrid {...args} names={communicationIconNames} /></CatalogStory>,
  play: async ({ canvasElement }) => { await expect(canvasElement.querySelectorAll("[data-catalog-icon]")).toHaveLength(6); },
};

export const ExpandedOperations: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Expanded operations glyphs in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8221-5",
    },
  },
  render: (args) => <CatalogStory title="Expanded operations glyphs" description="Thirty-eight new local glyphs reuse Icon size and semantic color roles. Each glyph has a visible and accessible name."><IconGrid {...args} labelIcons names={expandedOperationsIconNames} /></CatalogStory>,
  play: async ({ canvasElement, args }) => {
    const icons = canvasElement.querySelectorAll<HTMLElement>("[data-catalog-icon] [data-icon-name]");
    await expect(icons).toHaveLength(38);
    const size = { sm: 16, md: 20, lg: 24, xl: 28 }[args.size ?? "md"];
    for (const icon of icons) {
      const css = getComputedStyle(icon);
      await expect(icon.getBoundingClientRect().width).toBe(size);
      await expect(icon.getBoundingClientRect().height).toBe(size);
      await expect(icon).toHaveAttribute("role", "img");
      await expect(icon).toHaveAccessibleName();
      await expect(css.maskImage).not.toBe("none");
      const source = css.maskImage.match(/^url\(["']?(.*?)["']?\)$/u)?.[1];
      await expect(source).toBeTruthy();
      const asset = new Image();
      asset.src = source!;
      await asset.decode();
      await expect(asset.naturalWidth).toBe(16);
      await expect(asset.naturalHeight).toBe(16);
    }
  },
};

export const BoardAdditions: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "New library glyphs in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8221-5",
    },
  },
  render: (args) => <CatalogStory title="New library glyphs" description="The 29 selected Figma glyphs use the same Icon size and semantic color adapter."><IconGrid {...args} names={boardSelectedIconNames} /></CatalogStory>,
  play: async ({ canvasElement, args }) => {
    const icons = canvasElement.querySelectorAll<HTMLElement>("[data-catalog-icon] [data-icon-name]");
    await expect(icons).toHaveLength(29);
    const size = { sm: 16, md: 20, lg: 24, xl: 28 }[args.size ?? "md"];
    for (const icon of icons) {
      const css = getComputedStyle(icon);
      await expect(icon.getBoundingClientRect().width).toBe(size);
      await expect(icon.getBoundingClientRect().height).toBe(size);
      await expect(css.maskImage).not.toBe("none");
      const source = css.maskImage.match(/^url\(["']?(.*?)["']?\)$/u)?.[1];
      await expect(source).toBeTruthy();
      const asset = new Image();
      asset.src = source!;
      await asset.decode();
      await expect(asset.naturalWidth).toBe(16);
      await expect(asset.naturalHeight).toBe(16);
    }
  },
};

export const Tech: Story = {
  render: args => <CatalogStory title="Tech" description="Exact Hito DS Figma vectors for dimensions, spacing and typography. Axis and corner variants rotate shared sources; physical corner names keep their meaning in RTL."><IconGrid {...args} names={techIconNames} /></CatalogStory>,
  play: async ({ canvasElement }) => { await expect(canvasElement.querySelectorAll("[data-catalog-icon]")).toHaveLength(19); },
};

export const Keyboard: Story = {
  parameters: {
    figma: {
      label: "Keyboard icons in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8221-5",
    },
  },
  tags: ["context-matrix"],
  render: (args) => (
    <CatalogStory title="Keyboard" description="Six Phosphor Regular keyboard glyphs, vendored into the shared Hito DS Icon catalog.">
      <IconGrid {...args} names={keyboardIconNames} />
    </CatalogStory>
  ),
  play: async ({ canvasElement, args }) => {
    const icons = canvasElement.querySelectorAll<HTMLElement>('[data-icon-name^="keyboard/"]');
    await expect(icons).toHaveLength(6);
    for (const icon of icons) {
      const css = getComputedStyle(icon);
      const size = { sm: 16, md: 20, lg: 24, xl: 28 }[args.size ?? "md"];
      await expect(icon.getBoundingClientRect().width).toBe(size);
      await expect(icon.getBoundingClientRect().height).toBe(size);
      await expect(icon).toHaveAttribute("aria-hidden", "true");
      await expect(css.maskImage).not.toBe("none");
      const source = css.maskImage.match(/^url\(["']?(.*?)["']?\)$/u)?.[1];
      await expect(source).toBeTruthy();
      const asset = new Image();
      asset.src = source!;
      await asset.decode();
      await expect(asset.naturalWidth).toBeGreaterThan(0);
    }
  },
};

export const Social: Story = {
  render: (args) => <IconGrid {...args} names={socialIconNames} />,
};
