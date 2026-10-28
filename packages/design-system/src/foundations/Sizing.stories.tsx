import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fixedUiSizingById } from "@hito-ds/react/tokens/fixed-ui-sizing";
import { expect } from "storybook/test";
import { Icon, type IconSize } from "../components/Icon/Icon";
import { Text, type TextVariant } from "../components/Text/Text";
import {
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./Sizing.stories.module.css";

const sizeKeys = ["sm", "md", "lg", "xl"] as const;
type SizeKey = (typeof sizeKeys)[number];
type Kind = "control" | "icon" | "target";

const typographyBySize = {
  sm: "ui-sm",
  md: "ui-md",
  lg: "ui-lg",
  xl: "ui-xl",
} as const satisfies Record<SizeKey, TextVariant>;

function role(id: string) {
  const result = fixedUiSizingById[id];
  if (!result) throw new Error(`Missing fixed UI sizing role: ${id}`);
  return result;
}

const minimumTarget = role("ui/interaction/target/min");
const sizes = sizeKeys.map((size) => {
  const control = role(`ui/control/height/${size}`);
  return {
    control,
    icon: role(`ui/icon/size/${size}`),
    size,
    target:
      control.resolvedSourcePx > minimumTarget.resolvedSourcePx
        ? control
        : minimumTarget,
    typographyId: `typography/ui/${size}`,
    typographyVariant: typographyBySize[size],
  };
});
type Size = (typeof sizes)[number];

function cssVariables(item: Size) {
  return {
    "--demo-control-height": `var(${item.control.cssVariable})`,
    "--demo-target-size": `var(${item.target.cssVariable})`,
  } as CSSProperties;
}

function Control({ item, target = false }: { item: Size; target?: boolean }) {
  const content = (
    <span className={styles.control}>
      <Icon name="general/check" size={item.size as IconSize} />
      <Text as="span" variant={item.typographyVariant}>
        {target ? "Target" : "Control content"}
      </Text>
    </span>
  );

  return target ? (
    <button
      aria-label={`${item.size.toUpperCase()} interaction target`}
      className={styles.target}
      type="button"
    >
      {content}
    </button>
  ) : (
    content
  );
}

const samples = {
  control: (item: Size) => <Control item={item} />,
  icon: (item: Size) => (
    <span className={styles.iconSample}>
      <Icon name="general/check" size={item.size as IconSize} />
    </span>
  ),
  target: (item: Size) => <Control item={item} target />,
} satisfies Record<Kind, (item: Size) => ReactNode>;

function Scale({ kind }: { kind: Kind }) {
  return (
    <div className={styles.specimens}>
      {sizes.map((item) => {
        const token = kind === "icon" ? item.icon : item.control;
        const value =
          kind === "target"
            ? `${item.control.resolvedSourcePx}px visual · ${item.target.resolvedSourcePx}px target`
            : `${token.resolvedSourcePx}px · ${token.resolvedWebValue}`;

        return (
          <article
            className={styles.specimen}
            data-sizing-specimen={kind}
            key={item.size}
            style={cssVariables(item)}
          >
            <div className={styles.identity}>
              <Text variant="label-sm">{item.size.toUpperCase()}</Text>
              <Text variant="technical-sm">
                {kind === "target" ? minimumTarget.id : token.id}
              </Text>
              <Text className={styles.secondary} variant="technical-sm">
                {value}
              </Text>
            </div>
            <div className={styles.stage}>{samples[kind](item)}</div>
          </article>
        );
      })}
    </div>
  );
}

const meta = {
  id: "foundations-sizing",
  title: "Foundations/Sizing",
  tags: ["test"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function scaleStory(
  kind: Kind,
  name: string,
  description: string,
  section: string,
  token?: string,
): Story {
  return {
    name,
    render: () => (
      <FoundationStoryPage description={description} title={name} width="wide">
        <FoundationStorySection title={section} token={token}>
          <Scale kind={kind} />
        </FoundationStorySection>
      </FoundationStoryPage>
    ),
  };
}

export const ControlHeights = scaleStory(
  "control",
  "Control Heights",
  "Fixed visual heights for single-line controls, independent from viewport width.",
  "SM–XL geometry",
);

export const IconSizes = scaleStory(
  "icon",
  "Icon Sizes",
  "Fixed glyph boxes. Icon size and interaction target are independent.",
  "SM–XL optical boxes",
);

export const InteractionTargets: Story = {
  ...scaleStory(
    "target",
    "Interaction Targets",
    "The active area may exceed the visible control and never overlaps its neighbours.",
    "Visible control versus active area",
    minimumTarget.id,
  ),
  play: async ({ canvasElement }) => {
    const targets = canvasElement.querySelectorAll<HTMLButtonElement>(
      '[data-sizing-specimen="target"] button',
    );
    await expect(targets).toHaveLength(4);
    targets.forEach((target, index) => {
      expect(Math.round(target.getBoundingClientRect().height)).toBe(
        sizes[index]?.target.resolvedSourcePx,
      );
    });
  },
};

const rules = [
  ["Object", "Control height is geometry, not padding or layout space."],
  ["Glyph", "Icon artwork is sized independently from its control."],
  [
    "Target",
    "Web interaction stays at least 44×44px; compact visuals sit inside.",
  ],
  [
    "Viewport",
    "A selected component size never changes silently at a breakpoint.",
  ],
  ["Ownership", "Components later own supported sizes and internal spacing."],
] as const;

export const UsageRules: Story = {
  name: "Usage Rules",
  render: () => (
    <FoundationStoryPage
      description="Starting correlations from the registry, not a universal component recipe."
      title="Usage Rules"
      width="wide"
    >
      <FoundationStorySection title="Starting correlation">
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Size</th>
                <th>Control</th>
                <th>UI type</th>
                <th>Icon</th>
                <th>Min target</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((item) => (
                <tr key={item.size}>
                  <th scope="row">{item.size.toUpperCase()}</th>
                  <td>{item.control.resolvedSourcePx}px</td>
                  <td>{item.typographyId}</td>
                  <td>{item.icon.resolvedSourcePx}px</td>
                  <td>{item.target.resolvedSourcePx}px</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FoundationStorySection>
      <FoundationStorySection title="Rules">
        <ul className={styles.rules}>
          {rules.map(([title, description]) => (
            <li key={title}>
              <Text variant="label-sm">{title}</Text>
              <Text className={styles.secondary} variant="body-sm">
                {description}
              </Text>
            </li>
          ))}
        </ul>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
};
