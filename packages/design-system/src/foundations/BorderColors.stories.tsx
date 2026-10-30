import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState } from "react";
import { expect } from "storybook/test";
import { Text } from "../components/Text/Text";
import styles from "./BorderColors.stories.module.css";

const neutralRoles = [
  {
    className: styles.subtle,
    id: "border/subtle",
    note: "Paired foreground + Opacity/12",
  },
  {
    className: styles.default,
    id: "border/default",
    note: "Paired foreground + Opacity/24",
  },
  {
    className: styles.strong,
    id: "border/strong",
    note: "Paired foreground + Opacity/48",
  },
] as const;

const intentRoles = [
  "accent",
  "info",
  "success",
  "warning",
  "destructive",
] as const;

const intentStates = ["subtle", "default", "hover"] as const;

const surfaces = [
  { className: styles.surfaceCanvas, id: "canvas" },
  { className: styles.surfaceBase, id: "base" },
  { className: styles.surfaceSubtle, id: "subtle" },
] as const;

function BorderSample({
  intent,
  state,
  surface,
}: {
  intent: string;
  state: string;
  surface: (typeof surfaces)[number];
}) {
  const sampleRef = useRef<HTMLDivElement>(null);
  const [computedBorderColor, setComputedBorderColor] = useState("");

  useEffect(() => {
    if (sampleRef.current) {
      setComputedBorderColor(getComputedStyle(sampleRef.current).borderColor);
    }
  }, []);

  return (
    <div className={`${styles.surfaceSample} ${surface.className}`}>
      <Text className={styles.surfaceLabel} variant="technical-sm">
        surface/{surface.id}
      </Text>
      <div
        aria-hidden="true"
        className={styles.sample}
        data-border-intent={intent}
        data-border-state={state}
        data-surface={surface.id}
        ref={sampleRef}
        style={{ borderColor: `var(--color-border-${intent}-${state})` }}
      />
      <Text className={styles.colorReadback} variant="technical-sm">
        {computedBorderColor || "resolving…"}
      </Text>
    </div>
  );
}

const meta = {
  id: "foundations-color-border",
  title: "Foundations/Color/Border",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const SurfaceAndSeparator: Story = {
  name: "Surface & Separator",
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Surface &amp; separator borders
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Neutral structure and meaningful intent in one semantic color
          foundation.
        </Text>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <Text as="h2" variant="heading-sm">
            Neutral edges
          </Text>
          <Text className={styles.secondary} variant="body-sm">
            Quiet separation, ordinary surface boundaries and emphasized
            structure.
          </Text>
        </div>
        <div className={styles.rows}>
          {neutralRoles.map((role) => (
            <div
              className={styles.row}
              data-border-color={role.id}
              key={role.id}
            >
              <div className={styles.identity}>
                <Text variant="technical-sm">{role.id}</Text>
                <Text className={styles.muted} variant="technical-sm">
                  {role.note}
                </Text>
              </div>
              <div
                aria-hidden="true"
                className={`${styles.sample} ${role.className}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <Text as="h2" variant="heading-sm">
            Intent edges
          </Text>
          <Text className={styles.secondary} variant="body-sm">
            Accent and status edges across every admitted surface in the active
            theme.
          </Text>
        </div>
        <div className={styles.rows}>
          <div aria-hidden="true" className={styles.intentHeader}>
            <Text variant="technical-sm">Intent</Text>
            <Text variant="technical-sm">Subtle · 24%</Text>
            <Text variant="technical-sm">Default · 64%</Text>
            <Text variant="technical-sm">Hover · 80%</Text>
          </div>
          {intentRoles.map((intent) => (
            <div
              className={styles.intentRow}
              data-intent-row={intent}
              key={intent}
            >
              <Text variant="technical-sm">border/{intent}</Text>
              {intentStates.map((state) => (
                <div className={styles.surfaceStack} key={state}>
                  {surfaces.map((surface) => (
                    <BorderSample
                      intent={intent}
                      key={surface.id}
                      state={state}
                      surface={surface}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.disabledNote}>
          <div
            aria-hidden="true"
            className={`${styles.sample} ${styles.disabled}`}
          />
          <Text className={styles.muted} variant="technical-sm">
            border/disabled · universal 12% · shared by every intent
          </Text>
        </div>
        <Text className={styles.muted} variant="technical-sm">
          Non-neutral contextual surfaces are deferred until the surface
          registry admits them.
        </Text>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionIntro}>
          <Text as="h2" variant="heading-sm">
            Usage and accessibility
          </Text>
          <Text className={styles.secondary} variant="body-sm">
            Border color is one ingredient. Components own the final state
            composition.
          </Text>
        </div>
        <dl className={styles.rules}>
          <div className={styles.rule}>
            <dt>
              <Text as="span" variant="ui-md">
                Surface and separator
              </Text>
            </dt>
            <dd>
              <Text className={styles.secondary} variant="body-sm">
                Cards and surfaces may use neutral edges; Separator consumes
                border/subtle.
              </Text>
            </dd>
          </div>
          <div className={styles.rule}>
            <dt>
              <Text as="span" variant="ui-md">
                Width
              </Text>
            </dt>
            <dd>
              <Text className={styles.secondary} variant="body-sm">
                Border color and border width remain independent semantic
                choices.
              </Text>
            </dd>
          </div>
          <div className={styles.rule}>
            <dt>
              <Text as="span" variant="ui-md">
                Focus
              </Text>
            </dt>
            <dd>
              <Text className={styles.secondary} variant="body-sm">
                Focus uses its separate indicator contract and never replaces
                the structural edge.
              </Text>
            </dd>
          </div>
          <div className={styles.rule}>
            <dt>
              <Text as="span" variant="ui-md">
                Contrast
              </Text>
            </dt>
            <dd>
              <Text className={styles.secondary} variant="body-sm">
                A required control boundary is measured against every allowed
                adjacent surface.
              </Text>
            </dd>
          </div>
          <div className={styles.rule}>
            <dt>
              <Text as="span" variant="ui-md">
                State meaning
              </Text>
            </dt>
            <dd>
              <Text className={styles.secondary} variant="body-sm">
                Intent, invalid, selected and disabled states never rely on
                border color alone.
              </Text>
            </dd>
          </div>
          <div className={styles.rule}>
            <dt>
              <Text as="span" variant="ui-md">
                Decorative edges
              </Text>
            </dt>
            <dd>
              <Text className={styles.secondary} variant="body-sm">
                Gradient, glow and animated edges remain deferred effects, not
                border colors.
              </Text>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-border-color]"),
    ).toHaveLength(3);
    await expect(
      canvasElement.querySelectorAll("[data-intent-row]"),
    ).toHaveLength(5);
    await expect(
      canvasElement.querySelectorAll("[data-border-intent]"),
    ).toHaveLength(45);
    await expect(
      canvasElement.querySelectorAll("[data-surface='canvas']"),
    ).toHaveLength(15);
    await expect(
      canvasElement.querySelectorAll("[data-surface='base']"),
    ).toHaveLength(15);
    await expect(
      canvasElement.querySelectorAll("[data-surface='subtle']"),
    ).toHaveLength(15);

    for (const sample of canvasElement.querySelectorAll<HTMLElement>(
      "[data-border-intent]",
    )) {
      await expect(getComputedStyle(sample).borderColor).not.toBe("");
    }
  },
};
