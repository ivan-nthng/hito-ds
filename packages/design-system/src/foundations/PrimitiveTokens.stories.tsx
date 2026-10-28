import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text } from "@hito-ds/react/components";
import { fixedLayoutSpacing } from "@hito-ds/react/tokens/fixed-layout-spacing";
import { fixedUiSpacing } from "@hito-ds/react/tokens/fixed-ui-spacing";
import {
  referenceSpacing,
  referenceSpacingById,
} from "@hito-ds/react/tokens/reference-spacing";
import { expect } from "storybook/test";
import styles from "./PrimitiveTokens.stories.module.css";

type TokenStyle = CSSProperties &
  Readonly<Record<`--primitive-${string}`, string>>;

type SpacingStyle = CSSProperties & {
  "--demo-space": string;
};

function referenceCssVariable(referenceId: string) {
  const token = referenceSpacingById[referenceId];

  if (!token) {
    throw new Error(`Missing spacing reference: ${referenceId}`);
  }

  return token.cssVariable;
}

function getSpacingStyle(referenceId: string) {
  return {
    "--demo-space": `var(${referenceCssVariable(referenceId)})`,
  } as SpacingStyle;
}

function SpacingIdentity({
  id,
  referenceId,
  sourcePx,
}: {
  id: string;
  referenceId: string;
  sourcePx: number;
}) {
  return (
    <div className={styles.spacingIdentity}>
      <Text variant="technical-sm">{id}</Text>
      <Text className={styles.secondary} variant="data-sm">
        {sourcePx}px · {referenceId}
      </Text>
    </div>
  );
}

function SpacingStoryPage({
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
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      {children}
    </main>
  );
}

async function expectElementCount(
  canvasElement: HTMLElement,
  selector: string,
  count: number,
) {
  await expect(canvasElement.querySelectorAll(selector)).toHaveLength(count);
}

const meta = {
  id: "foundations-spacing-reference",
  title: "Foundations/Spacing",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  name: "Reference Scale",
  render: () => (
    <SpacingStoryPage
      description="All 35 source values. Web uses rem except zero and the 1px hairline."
      title="Reference spacing"
    >
      <ol className={styles.spacingList}>
        {referenceSpacing.map((token) => {
          const style = {
            "--primitive-space": `var(${token.cssVariable})`,
          } as TokenStyle;

          return (
            <li
              className={styles.spacingRow}
              data-reference-spacing={token.id}
              key={token.id}
            >
              <div className={styles.spacingIdentity}>
                <Text variant="technical-sm">{token.id}</Text>
                <Text className={styles.secondary} variant="data-sm">
                  {token.sourcePx}px · {token.webValue}
                  {token.kind === "hairline" ? " · hairline only" : ""}
                </Text>
              </div>
              <div
                className={styles.spacingTrack}
                title={`${token.id}: ${token.sourcePx}px`}
              >
                {token.sourcePx === 0 ? (
                  <div aria-hidden="true" className={styles.zeroMarker} />
                ) : (
                  <div className={styles.spacingBar} style={style} />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </SpacingStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expectElementCount(canvasElement, "[data-reference-spacing]", 35);
  },
};

export const FixedUI: Story = {
  name: "Fixed UI",
  render: () => (
    <SpacingStoryPage
      description="Stable internal gaps and padding for controls. A selected component size does not change when the viewport changes."
      title="Fixed UI spacing"
    >
      <div className={styles.semanticList}>
        {fixedUiSpacing.map((role) => (
          <article
            className={styles.semanticRow}
            data-fixed-ui-spacing={role.id}
            key={role.id}
          >
            <SpacingIdentity
              id={role.id}
              referenceId={role.referenceId}
              sourcePx={role.resolvedSourcePx}
            />
            <div
              className={styles.uiExamples}
              style={getSpacingStyle(role.referenceId)}
            >
              <div className={styles.uiExample}>
                <Text className={styles.secondary} variant="technical-sm">
                  Gap
                </Text>
                <div aria-hidden="true" className={styles.uiGapSample}>
                  <span />
                  <span />
                </div>
              </div>
              <div className={styles.uiExample}>
                <Text className={styles.secondary} variant="technical-sm">
                  Padding
                </Text>
                <div aria-hidden="true" className={styles.uiPaddingSample}>
                  <span />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SpacingStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expectElementCount(canvasElement, "[data-fixed-ui-spacing]", 11);
  },
};

export const FixedLayout: Story = {
  name: "Fixed Layout",
  render: () => (
    <SpacingStoryPage
      description="Stable distance between related regions inside a composition. It is layout-owned, but deliberately independent of viewport width."
      title="Fixed layout spacing"
    >
      <div className={styles.semanticList}>
        {fixedLayoutSpacing.map((role) => (
          <article
            className={styles.semanticRow}
            data-fixed-layout-spacing={role.id}
            key={role.id}
          >
            <SpacingIdentity
              id={role.id}
              referenceId={role.referenceId}
              sourcePx={role.resolvedSourcePx}
            />
            <div
              aria-hidden="true"
              className={styles.layoutGapSample}
              style={getSpacingStyle(role.referenceId)}
            >
              <span />
              <span />
            </div>
          </article>
        ))}
      </div>

      <section className={styles.fixedContextSection}>
        <div className={styles.fixedContextHeading}>
          <Text as="h2" variant="heading-sm">
            Same 16px relationship
          </Text>
          <Text className={styles.secondary} variant="body-sm">
            Fixed Layout/LG remains unchanged when the containing layout grows.
          </Text>
        </div>
        <div className={styles.fixedContextComparison}>
          <div
            className={`${styles.fixedContext} ${styles.fixedContextNarrow}`}
          >
            <span />
            <span />
          </div>
          <div className={`${styles.fixedContext} ${styles.fixedContextWide}`}>
            <span />
            <span />
          </div>
        </div>
      </section>
    </SpacingStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expectElementCount(canvasElement, "[data-fixed-layout-spacing]", 6);
  },
};

const usageRules = [
  {
    title: "Inside a component",
    token: "ui/space/*",
    description:
      "The component owns its padding and gaps. The selected size remains fixed across viewport changes.",
  },
  {
    title: "Between fixed regions",
    token: "layout/space/fixed/*",
    description:
      "The composition owns stable space between related sections, groups or surfaces.",
  },
  {
    title: "Viewport-dependent layout",
    token: "layout/space/responsive/*",
    description:
      "Use only when the layout is explicitly meant to breathe more as the available viewport grows.",
  },
  {
    title: "External composition",
    token: "parent ownership",
    description:
      "A component does not choose its external margin. The nearest layout-owning parent uses gap, grid or stack composition.",
  },
  {
    title: "Reference coordinates",
    token: "space/*",
    description:
      "Registry coordinates and documentation only. Components never consume these values directly.",
  },
  {
    title: "Equal value, different meaning",
    token: "semantic identity",
    description:
      "Two roles may resolve to the same reference while retaining different ownership and future change boundaries.",
  },
] as const;

export const UsageRules: Story = {
  name: "Usage Rules",
  render: () => (
    <SpacingStoryPage
      description="Ownership decides the lane. A token name describes why spacing exists, not the CSS property where it happens to be applied."
      title="Spacing usage rules"
    >
      <ol className={styles.ruleList}>
        {usageRules.map((rule) => (
          <li data-spacing-rule={rule.token} key={rule.token}>
            <Text as="h2" variant="heading-sm">
              {rule.title}
            </Text>
            <Text className={styles.ruleToken} variant="technical-sm">
              {rule.token}
            </Text>
            <Text className={styles.secondary} variant="body-sm">
              {rule.description}
            </Text>
          </li>
        ))}
      </ol>

      <section className={styles.boundarySection}>
        <Text as="h2" variant="heading-sm">
          Boundaries
        </Text>
        <div className={styles.boundaryList}>
          <Text variant="body-sm">
            Parent composition owns external spacing.
          </Text>
          <Text variant="body-sm">Component owns its internal spacing.</Text>
          <Text variant="body-sm">
            Responsive aliases are opt-in and never inherited by fixed controls.
          </Text>
          <Text variant="body-sm">
            PT/EN content may wrap or grow; language never becomes a spacing
            mode.
          </Text>
          <Text variant="body-sm">
            Spacing does not define the minimum interaction target from Sizing.
          </Text>
          <Text variant="body-sm">
            Use logical inline/block properties; do not create negative or
            arbitrary spacing aliases without repeated evidence.
          </Text>
          <Text variant="body-sm">
            Density, safe-area inputs and zoom do not silently rewrite the
            scale.
          </Text>
        </div>
      </section>
    </SpacingStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expectElementCount(canvasElement, "[data-spacing-rule]", 6);
  },
};
