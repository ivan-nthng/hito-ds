import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  responsiveLayoutModes,
  responsiveLayoutSpacing,
} from "@hito-ds/react/tokens/responsive-layout-spacing";
import { responsiveLayoutOuterRadius } from "@hito-ds/react/tokens/semantic-radii";
import { expect } from "storybook/test";
import { Text } from "../components/Text/Text";
import {
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./ResponsiveLayout.stories.module.css";

type ValueStyle = CSSProperties & {
  "--responsive-value": string;
};

const meta = {
  id: "foundations-responsive-layout",
  title: "Foundations/Responsive Layout",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function modeBoundary(mode: (typeof responsiveLayoutModes)[number]) {
  return mode.minWidthSourcePx === 0
    ? "Default"
    : `≥ ${mode.minWidthWebValue} · ${mode.minWidthSourcePx}px`;
}

export const ModesAndValues: Story = {
  name: "Modes & Values",
  render: () => (
    <FoundationStoryPage
      description="One existing mobile-first mode set drives responsive layout spacing and the opt-in outer radius. Fixed UI spacing and component sizing do not change at these boundaries."
      title="Responsive layout"
      width="wide"
    >
      <FoundationStorySection
        description="SM is the default. MD, LG and XL begin at the existing shared boundaries; no additional breakpoint is introduced here."
        title="Viewport modes"
        token="registryModeSets.viewport"
      >
        <div className={styles.modeGrid}>
          {responsiveLayoutModes.map((mode) => (
            <article
              className={styles.mode}
              data-layout-mode={mode.id}
              key={mode.id}
            >
              <Text variant="heading-sm">{mode.id.toUpperCase()}</Text>
              <Text className={styles.secondary} variant="technical-sm">
                {modeBoundary(mode)}
              </Text>
            </article>
          ))}
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="Every role resolves to an existing reference spacing token in each viewport mode. The highlighted column is the current Storybook viewport."
        title="Responsive spacing"
        token="layout/space/responsive/*"
      >
        <div className={styles.valueTable}>
          <div aria-hidden="true" className={styles.valueHeader}>
            <span />
            {responsiveLayoutModes.map((mode) => (
              <Text key={mode.id} variant="label-sm">
                {mode.id.toUpperCase()}
              </Text>
            ))}
          </div>
          {responsiveLayoutSpacing.map((role) => (
            <article
              className={styles.valueRow}
              data-responsive-spacing={role.id}
              key={role.id}
            >
              <Text variant="technical-sm">{role.id}</Text>
              {responsiveLayoutModes.map((mode) => {
                const value = role.modes[mode.id];
                const style = {
                  "--responsive-value": value.resolvedWebValue,
                } as ValueStyle;

                return (
                  <div
                    className={styles.valueCell}
                    data-layout-mode={mode.id}
                    data-responsive-value={value.referenceId}
                    key={mode.id}
                  >
                    <span aria-hidden="true" style={style} />
                    <Text className={styles.secondary} variant="data-sm">
                      {value.resolvedSourcePx}px
                    </Text>
                  </div>
                );
              })}
            </article>
          ))}
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="This radius changes only when a container explicitly opts into the responsive layout role. Ordinary cards and controls keep their selected fixed radius."
        title="Responsive outer radius"
        token={responsiveLayoutOuterRadius.id}
      >
        <div className={styles.radiusGrid}>
          {responsiveLayoutModes.map((mode) => {
            const value = responsiveLayoutOuterRadius.modes[mode.id];
            const style = {
              "--responsive-value": value.resolvedWebValue,
            } as ValueStyle;

            return (
              <article
                className={styles.radiusExample}
                data-responsive-radius={mode.id}
                key={mode.id}
              >
                <div aria-hidden="true" style={style} />
                <Text variant="label-sm">{mode.id.toUpperCase()}</Text>
                <Text className={styles.secondary} variant="technical-sm">
                  {value.resolvedSourcePx}px · {value.referenceId}
                </Text>
              </article>
            );
          })}
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-responsive-spacing]"),
    ).toHaveLength(6);
    await expect(
      canvasElement.querySelectorAll("[data-responsive-value]"),
    ).toHaveLength(24);
    await expect(
      canvasElement.querySelectorAll("[data-responsive-radius]"),
    ).toHaveLength(4);
  },
};
