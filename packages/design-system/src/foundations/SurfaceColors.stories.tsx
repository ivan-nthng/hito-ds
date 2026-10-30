import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { Icon, type IconTone } from "../components/Icon/Icon";
import type { IconName } from "../components/Icon/icon-catalog";
import { Text } from "../components/Text/Text";
import {
  FoundationStoryGroup,
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./SurfaceColors.stories.module.css";

const states = ["default", "hover", "pressed"] as const;

type DemoVariables = CSSProperties & Record<`--demo-${string}`, string>;

function getIntentVariables(intent: string): DemoVariables {
  const borderPrefix =
    intent === "neutral" ? "--color-border" : `--color-border-${intent}`;

  return {
    "--demo-border-default": `var(${borderPrefix}-default)`,
    "--demo-border-hover": `var(${borderPrefix}-${intent === "neutral" ? "strong" : "hover"})`,
    "--demo-border-subtle": `var(${borderPrefix}-subtle)`,
    "--demo-on-strong": `var(--color-foreground-on-${intent}-strong)`,
    "--demo-strong-default": `var(--color-surface-${intent}-strong-default)`,
    "--demo-strong-hover": `var(--color-surface-${intent}-strong-hover)`,
    "--demo-strong-pressed": `var(--color-surface-${intent}-strong-pressed)`,
    "--demo-subtle-default": `var(--color-surface-${intent}-subtle-default)`,
    "--demo-subtle-hover": `var(--color-surface-${intent}-subtle-hover)`,
    "--demo-subtle-pressed": `var(--color-surface-${intent}-subtle-pressed)`,
  };
}

const intents = [
  {
    id: "neutral",
    icon: "general/check",
    iconTone: "default",
    label: "Neutral",
  },
  {
    id: "accent",
    icon: "general/star",
    iconTone: "accent",
    label: "Accent",
  },
  {
    id: "info",
    icon: "general/info-filled",
    iconTone: "info",
    label: "Info",
  },
  {
    id: "success",
    icon: "general/check-filled",
    iconTone: "success",
    label: "Success",
  },
  {
    id: "warning",
    icon: "general/report",
    iconTone: "warning",
    label: "Warning",
  },
  {
    id: "destructive",
    icon: "controls/delete",
    iconTone: "destructive",
    label: "Destructive",
  },
] as const satisfies readonly {
  icon: IconName;
  iconTone: IconTone;
  id: string;
  label: string;
}[];

const layers = [
  {
    className: "layerCanvas",
    description: "Root background for a page or application surface.",
    id: "canvas",
    label: "Canvas",
  },
  {
    className: "layerBase",
    description: "Ordinary content surface placed on Canvas.",
    id: "base",
    label: "Base",
  },
  {
    className: "layerRaised",
    description: "Elevated content placed on Canvas or inside Base.",
    id: "raised",
    label: "Raised",
  },
  {
    className: "layerOverlay",
    description: "Foreground floating content such as a popover or dialog.",
    id: "overlay",
    label: "Overlay",
  },
  {
    className: "layerSubtle",
    description: "Contextual tint derived from its paired foreground color.",
    id: "subtle",
    label: "Subtle",
  },
] as const;

const meta = {
  id: "foundations-color-surface",
  title: "Foundations/Color/Surface",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Layers: Story = {
  render: () => (
    <FoundationStoryPage
      description="Depth and context are separate. Canvas is the root; Base, Raised and Overlay describe depth; Subtle describes contextual tint."
      title="Surface layers"
      width="wide"
    >
      <FoundationStorySection
        description="These samples show each role on its own. Usage examples show which layers may be combined."
        title="Layer catalog"
      >
        <div className={styles.layerCatalog}>
          {layers.map((layer) => (
            <article
              className={`${styles.layerSample} ${styles[layer.className]}`}
              data-surface-layer={layer.id}
              key={layer.id}
            >
              <Text as="h3" variant="heading-sm">
                {layer.label}
              </Text>
              <Text variant="technical-sm">surface/{layer.id}</Text>
              <Text className={styles.secondary} variant="body-sm">
                {layer.description}
              </Text>
            </article>
          ))}
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="Scrim is not a content surface. It sits between the current page stack and a modal Overlay."
        title="Modal separator"
        token="surface/scrim"
      >
        <Text className={styles.secondary} variant="body-sm">
          See Overlay &amp; Scrim for the complete modal composition.
        </Text>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-surface-layer]"),
    ).toHaveLength(5);
  },
};

export const Intent: Story = {
  render: () => (
    <FoundationStoryPage
      description="Every meaning has a translucent Subtle surface and an opaque Strong surface. Hover and Pressed are used only when that surface is interactive."
      title="Surface intent"
      width="wide"
    >
      <div className={styles.intentSections}>
        {intents.map((intent) => (
          <FoundationStorySection
            key={intent.id}
            title={intent.label}
            token={`surface/${intent.id}`}
          >
            <div
              className={styles.intentGroups}
              data-intent={intent.id}
              style={getIntentVariables(intent.id)}
            >
              <FoundationStoryGroup title="Subtle">
                <div className={styles.stateGrid}>
                  {states.map((state) => (
                    <div
                      className={styles.subtleSample}
                      data-state={state}
                      data-surface-sample={`${intent.id}/subtle/${state}`}
                      key={state}
                    >
                      <Icon
                        name={intent.icon}
                        size="sm"
                        state={state === "hover" ? "hover" : "default"}
                        tone={intent.iconTone}
                      />
                      <Text variant="ui-md">{state}</Text>
                    </div>
                  ))}
                </div>
              </FoundationStoryGroup>

              <FoundationStoryGroup
                note={`foreground/on-${intent.id}-strong`}
                title="Strong"
              >
                <div className={styles.stateGrid}>
                  {states.map((state) => (
                    <div
                      className={styles.strongSample}
                      data-foreground-pair={intent.id}
                      data-state={state}
                      data-surface-sample={`${intent.id}/strong/${state}`}
                      key={state}
                    >
                      <Icon name={intent.icon} size="sm" />
                      <Text variant="ui-md">{state}</Text>
                    </div>
                  ))}
                </div>
              </FoundationStoryGroup>
            </div>
          </FoundationStorySection>
        ))}
      </div>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-intent]")).toHaveLength(
      6,
    );
    await expect(
      canvasElement.querySelectorAll("[data-surface-sample]"),
    ).toHaveLength(36);
    await expect(
      canvasElement.querySelectorAll("[data-foreground-pair]"),
    ).toHaveLength(18);
  },
};

export const Usage: Story = {
  render: () => (
    <FoundationStoryPage
      description="Surface roles are composable meanings, not a mandatory ladder. These are the admitted direct and nested relationships."
      title="Surface usage"
      width="wide"
    >
      <div className={styles.usageSections}>
        <FoundationStorySection
          description="Raised may sit directly on Canvas or inside Base. A nested radius follows the accepted outer radius, inset and border calculation."
          title="Content and elevation"
        >
          <div className={styles.usageGrid}>
            <article
              className={`${styles.usageCase} ${styles.canvasScene}`}
              data-surface-composition="canvas-base"
            >
              <Text variant="label-base">Canvas → Base</Text>
              <div className={styles.basePanel}>
                <Text variant="technical-sm">surface/base</Text>
              </div>
            </article>

            <article
              className={`${styles.usageCase} ${styles.canvasScene}`}
              data-surface-composition="canvas-raised"
            >
              <Text variant="label-base">Canvas → Raised</Text>
              <div className={styles.raisedPanel}>
                <Text variant="technical-sm">surface/raised</Text>
              </div>
            </article>

            <article
              className={styles.usageCase}
              data-surface-composition="base-raised"
            >
              <Text variant="label-base">Base → Raised</Text>
              <div className={styles.baseOuter} data-concentric-pair="24/16/10">
                <div className={styles.raisedInner}>
                  <Text variant="technical-sm">surface/raised · radius 10</Text>
                </div>
              </div>
            </article>
          </div>
        </FoundationStorySection>

        <FoundationStorySection
          description="A non-modal floating surface can appear above Base without Scrim. A modal Overlay requires Scrim between it and the page."
          title="Foreground content"
        >
          <div className={styles.usageGrid}>
            <article
              className={`${styles.usageCase} ${styles.popoverScene}`}
              data-surface-composition="base-overlay"
            >
              <Text variant="label-base">Base → Overlay</Text>
              <div className={styles.baseAnchor}>
                <Text variant="body-sm">Page content</Text>
              </div>
              <div className={styles.floatingOverlay}>
                <Text variant="technical-sm">Popover · no scrim</Text>
              </div>
            </article>

            <article
              className={`${styles.usageCase} ${styles.modalScene}`}
              data-surface-composition="canvas-overlay"
            >
              <Text variant="label-base">Canvas + Scrim → Overlay</Text>
              <div className={styles.modalScrim} />
              <div className={styles.modalOverlay}>
                <Text variant="technical-sm">Modal overlay</Text>
              </div>
            </article>
          </div>
        </FoundationStorySection>

        <FoundationStorySection
          description="Subtle is contextual tint rather than depth. The same token derives from the paired foreground and can adapt to different parents."
          title="Contextual tint"
          token="surface/subtle"
        >
          <article
            className={styles.subtleContexts}
            data-surface-composition="surface-subtle"
          >
            <div className={styles.subtleOnBase}>
              <Icon name="general/info-filled" size="sm" tone="info" />
              <Text variant="ui-md">Subtle on Base</Text>
            </div>
            <div className={styles.subtleOnAccent}>
              <div
                className={styles.subtleOnAccentSample}
                data-concentric-pair="24/16/10"
              >
                <Icon name="general/star" size="sm" />
                <Text variant="ui-md">Subtle on Strong Accent</Text>
              </div>
            </div>
          </article>
        </FoundationStorySection>
      </div>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-surface-composition]"),
    ).toHaveLength(6);
    await expect(
      canvasElement.querySelector("[data-concentric-pair='24/16/10']"),
    ).toBeVisible();
  },
};

export const OverlayAndScrim: Story = {
  name: "Overlay & Scrim",
  render: () => (
    <FoundationStoryPage
      description="Scrim obscures page content; Overlay holds the foreground dialog or other modal content."
      title="Overlay and scrim"
    >
      <FoundationStorySection
        description="The page remains behind Scrim; the modal Overlay is the only foreground surface."
        title="Modal composition"
      >
        <div className={styles.scrimScene} data-surface-layer="scrim-scene">
          <div className={styles.sceneContent} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.scrim} data-surface-layer="scrim" />
          <section className={styles.overlayCard} data-surface-layer="overlay">
            <Text as="h2" variant="heading-base">
              surface/overlay
            </Text>
            <Text className={styles.secondary} variant="body-sm">
              Above surface/scrim
            </Text>
          </section>
        </div>
      </FoundationStorySection>
      <FoundationStorySection title="Content over media" token="color/foreground/on-scrim">
        <div className={styles.mediaScrim}>
          <Text as="span" variant="ui-md">Edit</Text>
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText("surface/overlay")).toBeVisible();
    await expect(canvas.getByText("Above surface/scrim")).toBeVisible();
  },
};
