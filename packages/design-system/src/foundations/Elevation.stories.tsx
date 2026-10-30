import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  elevationOpacityAliases,
  elevationPolicy,
  elevationRoles,
  elevationTints,
  elevationUsageByRoleId,
} from "@hito-ds/react/tokens/elevation";
import type { CSSProperties } from "react";
import { expect } from "storybook/test";
import { Text } from "../components/Text/Text";
import {
  FoundationStoryGroup,
  FoundationSpecimen,
  FoundationSpecimenGrid,
  FoundationStoryCopy,
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./Elevation.stories.module.css";

type ElevationVariables = CSSProperties & {
  "--demo-elevation"?: string;
  "--elevation-ambient-tint"?: string;
};

const intentLabels = {
  neutral: "Neutral",
  accent: "Accent",
  info: "Info",
  success: "Success",
  warning: "Warning",
  destructive: "Destructive",
} as const;

function nameFromId(id: string) {
  return id.split("/").at(-1) ?? id;
}

function geometryLabel(layer: {
  blurId: string;
  offsetXId: string;
  offsetYId: string;
  spreadId: string;
}) {
  return [
    nameFromId(layer.offsetXId),
    nameFromId(layer.offsetYId),
    nameFromId(layer.blurId),
    nameFromId(layer.spreadId),
  ].join(" / ");
}

const meta = {
  id: "foundations-elevation",
  title: "Foundations/Elevation",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Roles: Story = {
  name: "Roles",
  render: () => (
    <FoundationStoryPage
      description="Which semantic depth relationship should a component contract select?"
      title="Elevation roles"
      width="wide"
    >
      <FoundationStorySection
        description="Choose by the relationship to surrounding content, never by the desired amount of blur."
        title="Depth scale"
      >
        <FoundationSpecimenGrid minItemWidth="compact">
          {elevationRoles.map((role) => {
            const name = nameFromId(role.id);
            const usage =
              elevationUsageByRoleId[
                role.id as keyof typeof elevationUsageByRoleId
              ];

            if (!usage) {
              throw new Error(`Missing Elevation usage contract: ${role.id}`);
            }

            return (
              <FoundationSpecimen
                className={styles.roleSample}
                data-elevation-role={name}
                data-hito-elevation-intent="neutral"
                details={
                  <>
                    <FoundationStoryCopy variant="technical-sm">
                      {usage.placement} · {usage.modality} · scrim {usage.scrim}
                    </FoundationStoryCopy>
                    {role.layers.length ? (
                      role.layers.map((layer) => (
                        <FoundationStoryCopy key={layer.kind} variant="technical-sm">
                          {layer.kind} · {geometryLabel(layer)}
                        </FoundationStoryCopy>
                      ))
                    ) : (
                      <FoundationStoryCopy variant="technical-sm">
                        no shadow contribution
                      </FoundationStoryCopy>
                    )}
                  </>
                }
                guidance={usage.guidance}
                key={role.id}
                label={name[0]?.toUpperCase() + name.slice(1)}
                style={
                  {
                    "--demo-elevation": "var(" + role.cssVariable + ")",
                  } as ElevationVariables
                }
                token={role.id}
              />
            );
          })}
        </FoundationSpecimenGrid>
      </FoundationStorySection>

      <FoundationStorySection
        description="The Design System supplies the roles and selection criteria. An admitted component or composition contract selects the weakest role that preserves the required relationship; runtime heuristics never guess it from color, status, component name or viewport."
        title="Selection rule"
      >
        <FoundationStoryGroup title="Explicit ownership">
          <Text variant="technical-sm">
            default · {elevationPolicy.defaultRoleId}
          </Text>
          <Text variant="technical-sm">
            owner · {elevationPolicy.selectionOwner}
          </Text>
        </FoundationStoryGroup>
      </FoundationStorySection>

      <FoundationStorySection
        description="Key remains neutral. Intent may tint only Ambient and must be explicitly selected by a future component contract."
        title="Ambient intent"
      >
        <FoundationSpecimenGrid minItemWidth="compact">
          {elevationTints
            .filter((tint) => tint.kind === "ambient")
            .map((tint) => (
              <FoundationSpecimen
                className={styles.intentSample}
                data-elevation-intent={tint.intent}
                data-hito-elevation-intent={tint.intent}
                key={tint.id}
                label={intentLabels[tint.intent as keyof typeof intentLabels]}
                style={
                  {
                    "--elevation-ambient-tint": "var(" + tint.cssVariable + ")",
                  } as ElevationVariables
                }
                token={tint.id}
              />
            ))}
        </FoundationSpecimenGrid>
      </FoundationStorySection>

      <FoundationStorySection
        description="Default and neutral compositions use Key/Ambient 16%/8% in light and 32%/24% in dark. Explicit chromatic intents retain the generic aliases below: 16%/8% in light and 24%/8% in dark."
        title="Opacity by theme"
      >
        <FoundationSpecimenGrid minItemWidth="wide">
          {elevationOpacityAliases.map((opacity) => (
            <FoundationStoryGroup
              key={opacity.id}
              title={nameFromId(opacity.id)}
            >
              <Text variant="technical-sm">
                Light · {nameFromId(opacity.modes.light.referenceId)}
              </Text>
              <Text variant="technical-sm">
                Dark · {nameFromId(opacity.modes.dark.referenceId)}
              </Text>
            </FoundationStoryGroup>
          ))}
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-elevation-role]"),
    ).toHaveLength(4);
    await expect(
      canvasElement.querySelectorAll("[data-elevation-intent]"),
    ).toHaveLength(6);
    const intentShadows = [
      ...canvasElement.querySelectorAll("[data-elevation-intent]"),
    ].map((sample) => getComputedStyle(sample).boxShadow);
    await expect(new Set(intentShadows)).toHaveLength(6);
  },
};

// Computed output proof uses the accepted reference tints and numeric geometry,
// independent of the adapter's composition expressions.
export const ThemeAndIntentScopes: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <Text>Neutral and chromatic elevation theme scope proof.</Text>,
  play: async () => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser");
    const session = cdp();
    const original = [
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
    ];
    type Theme = "light" | "dark";
    const ambientRefs = {
      neutral: ["neutral-950", "basic-black"],
      accent: ["brand-800", "brand-400"],
      info: ["blue-700", "blue-400"],
      success: ["green-700", "green-300"],
      warning: ["orange-700", "orange-300"],
      destructive: ["red-700", "red-300"],
    } as const;
    type Intent = keyof typeof ambientRefs;
    const fixture = document.createElement("div");
    // Outside the Storybook decorator so an unthemed scope really uses the OS.
    document.body.append(fixture);
    const scope = (parent: HTMLElement, theme?: Theme, intent?: Intent) => {
      const node = document.createElement("div");
      if (theme) node.dataset.hitoColorScheme = theme;
      if (intent) node.dataset.hitoElevationIntent = intent;
      parent.append(node);
      return node;
    };
    const colorProbe = document.createElement("span");
    fixture.append(colorProbe);
    const color = (reference: string, alpha: number) => {
      colorProbe.style.color = `rgb(from var(--ref-color-${reference}) r g b / ${alpha})`;
      return getComputedStyle(colorProbe).color;
    };
    const verify = (host: HTMLElement, theme: Theme, intent: Intent = "neutral") => {
      const dark = theme === "dark";
      const key = color(dark ? "basic-black" : "neutral-950", dark ? (intent === "neutral" ? 0.32 : 0.24) : 0.16);
      const ambient = color(ambientRefs[intent][dark ? 1 : 0], dark && intent === "neutral" ? 0.24 : 0.08);
      const geometry = { raised: "1px 1px 4px 0px", floating: "2px 4px 16px 0px", overlay: "4px 8px 48px 0px" };
      for (const [role, ambientGeometry] of Object.entries(geometry)) {
        host.style.boxShadow = `var(--elevation-${role})`;
        expect(getComputedStyle(host).boxShadow, `${theme}/${intent}/${role}`).toBe(`${key} 0px 0px 2px 0px, ${ambient} ${ambientGeometry}`);
      }
      host.style.boxShadow = "var(--elevation-none)";
      expect(getComputedStyle(host).boxShadow).toBe("none");
    };
    try {
      for (const system of ["light", "dark"] as const) {
        await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "prefers-color-scheme" ? { ...feature, value: system } : feature) });
        verify(scope(fixture), system);
        for (const intent of Object.keys(ambientRefs) as Intent[]) {
          const inherited = scope(fixture, undefined, intent);
          verify(inherited, system, intent);
          verify(scope(inherited), system, intent);
          verify(scope(inherited, undefined, "neutral"), system);
          for (const theme of ["light", "dark"] as const) {
            const outer = scope(fixture, theme === "light" ? "dark" : "light", intent);
            // A new theme resets intent; the same-node explicit intent wins.
            const themed = scope(outer, theme);
            verify(themed, theme);
            verify(scope(themed, undefined, intent), theme, intent);
            const combined = scope(outer, theme, intent);
            verify(combined, theme, intent);
            verify(scope(combined), theme, intent);
          }
        }
      }
    } finally {
      fixture.remove();
      await session.send("Emulation.setEmulatedMedia", { features: original });
    }
  },
};

export const Compositions: Story = {
  name: "Compositions",
  render: () => (
    <FoundationStoryPage
      description="How do fill, spacing, optional border, shadow and Scrim compose without becoming coupled?"
      title="Elevation compositions"
      width="wide"
    >
      <FoundationStorySection
        description="A borderless element may stay flat or become Raised when fill, overlap and spacing already preserve its shape."
        title="Content hierarchy"
      >
        <div className={styles.contentScene}>
          <Text variant="label-base">surface/base</Text>
          <section
            className={styles.flatContent}
            data-elevation-composition="flat"
          >
            <Text as="h3" variant="heading-sm">
              Same plane
            </Text>
            <FoundationStoryCopy>
              No border and no shadow. Structure comes from content and spacing.
            </FoundationStoryCopy>
          </section>
          <section
            className={styles.raisedContent}
            data-elevation-composition="raised"
          >
            <Text as="h3" variant="heading-sm">
              Persistent raised panel
            </Text>
            <FoundationStoryCopy>
              Raised Surface fill plus neutral two-layer elevation.
            </FoundationStoryCopy>
          </section>
          <aside
            className={styles.floatingContent}
            data-elevation-composition="floating"
          >
            <Text variant="label-base">Anchored floating content</Text>
            <FoundationStoryCopy>
              No Scrim
            </FoundationStoryCopy>
          </aside>
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="Overlay uses the same fill as Base. Scrim and the stronger depth relationship make it modal without an automatic border."
        title="Modal hierarchy"
      >
        <div className={styles.modalScene} data-elevation-composition="modal">
          <div className={styles.pageLines} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.scrim} />
          <article
            className={styles.modalSurface}
            data-elevation-border="optional-absent"
          >
            <Text as="h3" variant="heading-sm">
              Modal Overlay
            </Text>
            <FoundationStoryCopy>
              surface/overlay · elevation/overlay
            </FoundationStoryCopy>
          </article>
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-elevation-composition]"),
    ).toHaveLength(4);
    const borderlessModal = canvasElement.querySelector(
      '[data-elevation-border="optional-absent"]',
    );
    await expect(borderlessModal).not.toBeNull();
    await expect(getComputedStyle(borderlessModal!).borderTopWidth).toBe("0px");
  },
};

export const Safeguards: Story = {
  name: "Safeguards",
  render: () => (
    <FoundationStoryPage
      description="Which boundaries, status, focus and stacking responsibilities must Elevation never own?"
      title="Elevation safeguards"
      width="wide"
    >
      <FoundationStorySection
        description="A neutral foreground remains legible over a colored host. Only its Ambient contribution receives the optional intent tint."
        title="Colored host"
      >
        <div className={styles.intentHost}>
          <Text className={styles.intentHostLabel} variant="label-base">
            Accent host
          </Text>
          <article
            className={styles.intentFloating}
            data-elevation-border="optional-absent"
            data-elevation-safeguard="intent-host"
            data-hito-elevation-intent="accent"
          >
            <Text variant="label-base">Neutral floating surface</Text>
            <FoundationStoryCopy>
              Neutral Key · Accent Ambient
            </FoundationStoryCopy>
          </article>
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="Required edges use Border. In forced-colors, the browser may remove every box-shadow."
        title="Required boundary"
      >
        <article
          className={styles.requiredBoundary}
          data-elevation-border="required-present"
          data-elevation-safeguard="required-boundary"
        >
          <Text as="h3" variant="heading-sm">
            Boundary survives without shadow
          </Text>
          <FoundationStoryCopy>
            Structural border is independent from Elevation.
          </FoundationStoryCopy>
        </article>
      </FoundationStorySection>

      <FoundationStorySection
        description="Do not compress or weaken a shadow to fit an overflow clip. Floating and modal content must escape through the admitted portal or layer."
        title="Clipping"
      >
        <FoundationSpecimenGrid minItemWidth="wide">
          <div className={styles.clippedHost}>
            <article className={styles.clippedFloating}>
              <Text variant="label-sm">Clipped — avoid</Text>
            </article>
          </div>
          <div className={styles.portalHost}>
            <article className={styles.portalFloating}>
              <Text variant="label-sm">Portal/layer — preserve</Text>
            </article>
          </div>
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-elevation-safeguard]"),
    ).toHaveLength(2);
    const optionalBorder = canvasElement.querySelector(
      '[data-elevation-border="optional-absent"]',
    );
    const requiredBorder = canvasElement.querySelector(
      '[data-elevation-border="required-present"]',
    );
    await expect(optionalBorder).not.toBeNull();
    await expect(requiredBorder).not.toBeNull();
    await expect(getComputedStyle(optionalBorder!).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(requiredBorder!).borderTopWidth).not.toBe(
      "0px",
    );
  },
};
