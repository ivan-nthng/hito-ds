import { Button } from "../components/Button/Button";
import { Card } from "../components/Card/Card";
import { SearchField } from "../components/SearchField/SearchField";
import { Select } from "../components/Select/Select";
import { StatusBadge } from "../components/StatusBadge/StatusBadge";
import { Surface } from "../components/Surface/Surface";
import { TextInput } from "../components/TextInput/TextInput";
import { controlSizes } from "../components/control-size";
import { useLayoutEffect, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { assertRadiusScale, fullRadius, getRadiusWebValue, radiusCandidateSpaceIds, radiusScale } from "@hito-ds/react/tokens/radius-geometry";
import { referenceSpacingById } from "@hito-ds/react/tokens/reference-spacing";
import {
  fixedLayoutRadii,
  fixedUiRadii,
  intrinsicRoundRadius,
  responsiveLayoutOuterRadius,
  resolveConcentricInnerRadius,
  resolveConcentricOuterRadius,
} from "@hito-ds/react/tokens/semantic-radii";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { Text } from "../components/Text/Text";
import {
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./Radius.stories.module.css";

type RadiusStyle = CSSProperties & {
  "--demo-radius": string;
};

const uiExamples = {
  xs: "Technical tag",
  sm: "Compact control",
  md: "Default control",
  lg: "Large control",
  xl: "Prominent control",
} as const;

type ConcentricNestingExample = {
  className: "cornerPairSmall" | "cornerPairMedium" | "cornerPairLarge";
  formula: string;
  id: string;
  kind: "concentric";
  label: string;
  opticalRadius: number;
  strictRadius: number;
};

type IndependentNestingExample = {
  className: "cornerPairExtraLarge";
  formula: string;
  id: string;
  independentRadius: number;
  kind: "independent";
  label: string;
};

const cornerSofteningExamples = [
  {
    className: "cornerPairSmall",
    formula: "padding 12 · 16 − 12 = 4",
    id: "small",
    kind: "concentric",
    label: "Small",
    opticalRadius: 6,
    strictRadius: 4,
  },
  {
    className: "cornerPairMedium",
    formula: "padding 16 · 24 − 16 = 8",
    id: "medium",
    kind: "concentric",
    label: "Medium",
    opticalRadius: 10,
    strictRadius: 8,
  },
  {
    className: "cornerPairLarge",
    formula: "padding 24 · 32 − 24 = 8",
    id: "large",
    kind: "concentric",
    label: "Large",
    opticalRadius: 10,
    strictRadius: 8,
  },
  {
    className: "cornerPairExtraLarge",
    formula: "padding 32 ≥ outer radius 32",
    id: "extra-large",
    independentRadius: 12,
    kind: "independent",
    label: "Extra Large",
  },
] as const satisfies readonly (ConcentricNestingExample | IndependentNestingExample)[];

function getRadiusStyle(cssVariable: string) {
  return { "--demo-radius": `var(${cssVariable})` } as RadiusStyle;
}

const meta = {
  id: "foundations-radius",
  title: "Foundations/Radius",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Reference: Story = {
  render: () => (
    <FoundationStoryPage
      description="Radius roles use shared space coordinates. This admitted subset also governs optical correction; product components consume semantic radius roles."
      title="Radius coordinates"
      width="wide"
    >
      <FoundationStorySection
        description="Web adapters use rem for numeric values. Full means platform-adapted complete rounding rather than a numeric design size."
        title="Shared space coordinates"
      >
        <div className={styles.referenceGrid}>
          {[...radiusCandidateSpaceIds.map(id => ({ ...referenceSpacingById[id], webValue: getRadiusWebValue(id) })), fullRadius].map((token) => (
            <article
              className={styles.radiusItem}
              data-radius-reference={token.id}
              key={token.id}
            >
              <div
                className={styles.referenceSample}
                style={{ "--demo-radius": token.webValue } as RadiusStyle}
              />
              <div className={styles.radiusIdentity}>
                <Text variant="technical-sm">{token.id}</Text>
                <Text className={styles.secondary} variant="body-sm">
                  {token.sourcePx === null ? "Full" : `${token.sourcePx}px`}
                </Text>
              </div>
            </article>
          ))}
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-radius-reference]"),
    ).toHaveLength(12);
  },
};

export const UI: Story = {
  render: () => (
    <FoundationStoryPage
      description="Fixed radius roles for controls. A component size selects its UI radius; the viewport does not change it."
      title="UI radius"
      width="wide"
    >
      <FoundationStorySection
        description="Controls share the XS–XL semantic radius scale: 4, 4, 6, 8 and 12. Radius changes do not change control height or typography."
        title="Fixed XS–XL roles"
      >
        <div className={styles.uiGrid}>
          {fixedUiRadii.map((role) => {
            const size = role.id.split("/").at(-1) as keyof typeof uiExamples;

            return (
              <article
                className={styles.radiusItem}
                data-radius-ui={role.id}
                key={role.id}
              >
                <div
                  className={styles.uiSample}
                  style={getRadiusStyle(role.cssVariable)}
                >
                  <Text variant="ui-md">{uiExamples[size]}</Text>
                </div>
                <div className={styles.radiusIdentity}>
                  <Text variant="technical-sm">{role.id}</Text>
                  <Text className={styles.secondary} variant="body-sm">
                    {role.resolvedSourcePx}px · {role.referenceId}
                  </Text>
                </div>
              </article>
            );
          })}
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[data-radius-ui]")).toHaveLength(
      5,
    );
  },
};

/** Verify shared control aliases using real components, including the former XL outlier. */
export const UiControlGeometry: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => <FoundationStoryPage title="Buttons and inputs" description="Shared UI radius roles; control heights and typography stay unchanged.">
    <div className={styles.scaleContent}>
      {controlSizes.map(size => <section className={styles.scaleContent} data-control-radius={size} key={size}>
        <Text variant="label-sm">{size.toUpperCase()}</Text>
        <div><Button size={size} intent="accent" variant="primary">Continue</Button></div>
        <TextInput size={size} aria-label={`${size} value`} defaultValue="Sample value" />
      </section>)}
    </div>
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    const root = document.documentElement;
    const ratio = parseFloat(getComputedStyle(root).fontSize) / 16;
    const heights = { sm: 28, md: 36, lg: 44, xl: 56 };
    const previous = root.style.getPropertyValue("--radius-scale");
    const priority = root.style.getPropertyPriority("--radius-scale");
    try {
      for (const scale of [1, 1.25]) {
        root.style.setProperty("--radius-scale", String(scale));
        for (const group of canvasElement.querySelectorAll<HTMLElement>("[data-control-radius]")) {
          const size = group.dataset.controlRadius as keyof typeof heights;
          const radius = fixedUiRadii.find(role => role.id === `radius/ui/${size}`);
          expect(radius).toBeDefined();
          for (const control of group.querySelectorAll("button, [data-appearance][data-size]")) {
            expect(parseFloat(getComputedStyle(control).borderTopLeftRadius)).toBeCloseTo(radius!.resolvedSourcePx * ratio * scale, 3);
            expect(control.getBoundingClientRect().height).toBeCloseTo(heights[size] * ratio, 1);
          }
        }
      }
    } finally {
      if (previous) root.style.setProperty("--radius-scale", previous, priority);
      else root.style.removeProperty("--radius-scale");
    }
  },
};

export const Layout: Story = {
  render: () => (
    <FoundationStoryPage
      description="Layout radii belong to cards, panels and containers. Fixed roles remain stable; responsive outer radius is an explicit opt-in composition role."
      title="Layout radius"
      width="wide"
    >
      <FoundationStorySection
        description="Use the smallest purpose-appropriate role. Larger values do not imply greater elevation or stronger color."
        title="Fixed layout roles"
      >
        <div className={styles.layoutGrid}>
          {fixedLayoutRadii.map((role) => (
            <article
              className={styles.radiusItem}
              data-radius-layout={role.id}
              key={role.id}
            >
              <div
                className={styles.layoutSample}
                style={getRadiusStyle(role.cssVariable)}
              />
              <div className={styles.radiusIdentity}>
                <Text variant="technical-sm">{role.id}</Text>
                <Text className={styles.secondary} variant="body-sm">
                  {role.resolvedSourcePx}px · {role.referenceId}
                </Text>
              </div>
            </article>
          ))}
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="Only a container explicitly using radius/layout/responsive/outer changes with layout mode. Fixed cards and UI controls do not inherit this behavior."
        title="Responsive outer · opt-in"
        token={responsiveLayoutOuterRadius.id}
      >
        <div className={styles.responsiveGrid}>
          {Object.entries(responsiveLayoutOuterRadius.modes).map(
            ([modeId, mode]) => (
              <article
                className={styles.radiusItem}
                data-radius-responsive={modeId}
                key={modeId}
              >
                <div
                  className={styles.responsiveSample}
                  style={{ "--demo-radius": mode.resolvedWebValue } as RadiusStyle}
                >
                  <Text variant="label-base">{modeId.toUpperCase()}</Text>
                </div>
                <Text className={styles.secondary} variant="body-sm">
                  {mode.resolvedSourcePx}px · {mode.referenceId}
                </Text>
              </article>
            ),
          )}
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-radius-layout]"),
    ).toHaveLength(6);
    await expect(
      canvasElement.querySelectorAll("[data-radius-responsive]"),
    ).toHaveLength(4);
  },
};

export const Nesting: Story = {
  render: () => (
    <FoundationStoryPage
      description="A panel around a known row selects the next admitted outer radius above row plus inset. A Surface or Card with a fixed outer radius resolves its inner surface in the opposite direction."
      title="Nested radius"
      width="wide"
    >
      <FoundationStorySection
        description="The selected outer radius comes from the admitted token set, not a fixed added pixel amount. Menu, Select and Combobox share these SelectionPanel aliases."
        title="Panel around ListItem"
      >
        <div className={styles.panelNestingGrid}>
          {(["sm", "md", "lg"] as const).map((size) => {
            const insetId = size === "sm" ? "space/1" : size === "md" ? "space/1.5" : "space/2";
            const resolved = resolveConcentricOuterRadius({ innerRadiusId: `radius/ui/${size}`, insetSpacingId: insetId });
            return <div className={styles.panelNestingExample} key={size} data-panel-nesting={size}>
              <Text variant="label-sm">{size.toUpperCase()}</Text>
              <Text variant="technical-sm">{resolved.strictSourcePx}px strict → {resolved.outerReferenceId} ({resolved.resolvedOuterSourcePx}px)</Text>
              <div className={styles.panelNestingOuter} data-size={size}>
                <div className={styles.panelNestingInner} />
              </div>
            </div>;
          })}
        </div>
      </FoundationStorySection>
      <FoundationStorySection
        description="Small through Large follow the concentric resolver. At Extra Large the 32px inset reaches the 32px outer radius, so the child becomes an independent Surface and explicitly selects the existing 12px layout radius."
        title="Nested container padding"
      >
        <div className={styles.cornerComparisonGrid}>
          {cornerSofteningExamples.map((example) => (
            <article
              className={`${styles.cornerComparison} ${styles[example.className]}`}
              data-corner-comparison={example.id}
              key={example.id}
            >
              <div className={styles.cornerComparisonHeader}>
                <Text as="h3" variant="heading-sm">
                  {example.label}
                </Text>
                <Text variant="technical-sm">{example.formula}</Text>
              </div>

              {example.kind === "concentric" ? (
                <div className={styles.cornerVariants}>
                  <div className={styles.cornerVariant}>
                    <Text variant="label-sm">Strict · {example.strictRadius}px</Text>
                    <div className={styles.cornerOuter}>
                      <div
                        className={`${styles.cornerInner} ${styles.cornerInnerStrict}`}
                        data-corner-variant="strict"
                      />
                    </div>
                  </div>

                  <div className={styles.cornerVariant}>
                    <Text variant="label-sm">
                      Optical · {example.opticalRadius}px
                    </Text>
                    <div className={styles.cornerOuter}>
                      <div
                        className={`${styles.cornerInner} ${styles.cornerInnerOptical}`}
                        data-corner-variant="optical"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.cornerVariant}>
                  <Text variant="label-sm">
                    Independent · {example.independentRadius}px
                  </Text>
                  <div className={styles.cornerOuter}>
                    <div
                      className={`${styles.cornerInner} ${styles.cornerInnerIndependent}`}
                      data-corner-variant="independent"
                    />
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </FoundationStorySection>

      <FoundationStorySection
        description="The resolver uses existing references only. Once the inset reaches the outer radius, the child leaves the concentric relationship and selects its own semantic layout role. Nothing inspects the DOM at runtime."
        title="Boundary"
      >
        <div className={styles.boundaryNotes}>
          <Text variant="body-sm">Direct visible Surface/Card pair only</Text>
          <Text variant="body-sm">Concentric only while inset is below outer radius</Text>
          <Text variant="body-sm">Separated children use an explicit layout role</Text>
          <Text variant="body-sm">Theme, color and elevation do not change the geometry</Text>
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    for (const [size, outer, inset, inner] of [["sm", 10, 4, 4], ["md", 16, 6, 6], ["lg", 20, 8, 8]] as const) {
      const example = canvasElement.querySelector<HTMLElement>(`[data-panel-nesting="${size}"]`);
      const panel = example?.querySelector<HTMLElement>(`.${styles.panelNestingOuter}`);
      const row = example?.querySelector<HTMLElement>(`.${styles.panelNestingInner}`);
      await expect(panel).not.toBeNull();
      await expect(row).not.toBeNull();
      await expect(parseFloat(getComputedStyle(panel!).borderTopLeftRadius)).toBe(outer);
      await expect(parseFloat(getComputedStyle(panel!).paddingTop)).toBe(inset);
      await expect(parseFloat(getComputedStyle(row!).borderTopLeftRadius)).toBe(inner);
    }
    await expect(
      canvasElement.querySelectorAll("[data-corner-comparison]"),
    ).toHaveLength(4);
    await expect(
      canvasElement.querySelectorAll("[data-corner-variant]"),
    ).toHaveLength(7);
  },
};

export const IntrinsicShape: Story = {
  render: () => <FoundationStoryPage title="Intrinsic round shape" description="Radio, its dot, indeterminate marks and loading rings use this role independently of control size.">
    <FoundationStorySection title={intrinsicRoundRadius.id}>
      <div className={styles.uiSample} style={getRadiusStyle(intrinsicRoundRadius.cssVariable)}>
        <Text variant="ui-md">Round</Text>
      </div>
      <Text variant="technical-sm">{intrinsicRoundRadius.referenceId}</Text>
    </FoundationStorySection>
  </FoundationStoryPage>,
};

const reviewScales = [0.75, 1, 1.25] as const;
// Generate the bounded review fixtures once through the canonical configuration resolver.
// Switching a fixture selects its factor AND dependent alias; no DOM measurement is involved.
const opticalConfigurations = reviewScales.map(scale => {
  const result = resolveConcentricInnerRadius({
    outerRadiusId: "radius/layout/fixed/xl",
    insetSpacingId: "space/4",
    borderWidthId: "border/width/0",
    scale,
  });
  return result;
});

function ScaleExample({ scale }: { scale: number }) {
  const optical = opticalConfigurations.find(configuration => configuration.scale === scale);
  // Preview-only root configuration. Product components remain CSS-only consumers.
  useLayoutEffect(() => {
    assertRadiusScale(scale);
    const root = document.documentElement.style;
    const previous = root.getPropertyValue(radiusScale.cssVariable);
    const priority = root.getPropertyPriority(radiusScale.cssVariable);
    root.setProperty(radiusScale.cssVariable, String(scale));
    return () => {
      if (previous) root.setProperty(radiusScale.cssVariable, previous, priority);
      else root.removeProperty(radiusScale.cssVariable);
    };
  }, [scale]);

  return (
    <FoundationStoryPage title="Global radius scale" description="Change scale in Controls. Corners update together; padding, text and control sizes stay unchanged." width="wide">
      <FoundationStorySection title="Cards and controls" description="Responsive compact and comfortable cards, with real MD controls.">
        <div className={styles.scaleGrid}>
          {(["compact", "comfortable"] as const).map(size => (
            <Card key={size} size={size}>
              <div className={styles.scaleContent}>
                <Text as="h2" variant="heading-sm">{size === "compact" ? "Compact" : "Comfortable"}</Text>
                <Text variant="body-sm">Your delivery preferences are saved.</Text>
                <SearchField aria-label={`${size} search`} clearLabel={`Clear ${size} search`} defaultValue="São Paulo" />
                <div><Button intent="accent" variant="primary">Review details</Button></div>
              </div>
            </Card>
          ))}
        </div>
      </FoundationStorySection>
      <FoundationStorySection title="Dropdowns" description="Open a list: its outer radius follows the row radius plus the unchanged inset.">
        <div className={styles.scaleControls}>
          {(["sm", "md", "lg"] as const).map(size => (
            <Select key={size} size={size} label={`City ${size.toUpperCase()}`} closeLabel="Close cities" width="hug" defaultValue="sao-paulo"
              options={[{ value: "sao-paulo", label: "São Paulo" }, { value: "lisbon", label: "Lisbon" }]} />
          ))}
        </div>
      </FoundationStorySection>
      <FoundationStorySection title="Optical nesting" description="A true concentric Surface pair. Each review preset resolves the existing formula again, including its bounded optical correction.">
        {optical ? (
          <>
            <Surface className={styles.scaleOuterSurface} data-optical-outer>
              <Surface className={styles.scaleInnerSurface} data-optical-inner style={{ "--demo-radius": optical.resolvedInnerWebValue } as RadiusStyle}>
                <Text variant="body-base">Nested surface</Text>
              </Surface>
            </Surface>
            <Text variant="technical-sm">
              {optical.resolvedOuterSourcePx} − {optical.resolvedInsetSourcePx} = {optical.idealSourcePx} → {optical.resolvedInnerSourcePx} · optical +{optical.opticalCompensationSourcePx} · source units
            </Text>
          </>
        ) : <Text variant="body-sm">Choose a review preset to see its resolved optical composition.</Text>}
      </FoundationStorySection>
      <FoundationStorySection title="Intrinsic shapes" description="Circles and pills keep their shape at every scale.">
        <div className={styles.scaleControls}>
          <StatusBadge icon="general/info-filled" label="Information" collapsed />
          <StatusBadge icon="general/info-filled" label="Information" />
        </div>
      </FoundationStorySection>
    </FoundationStoryPage>
  );
}

function geometry(element: Element) {
  const style = getComputedStyle(element);
  return {
    radius: parseFloat(style.borderTopLeftRadius),
    unchanged: [style.padding, style.gap, style.font, style.letterSpacing, style.width, style.height, style.borderWidth].join("|"),
  };
}

export const GlobalScale: StoryObj<{ scale: number }> = {
  tags: ["!autodocs"],
  args: { scale: radiusScale.defaultValue },
  argTypes: { scale: { control: "inline-radio", options: reviewScales } },
  parameters: { controls: { include: ["scale"] } },
  render: args => <ScaleExample {...args} />,
};

/** Automated geometry mutations stay outside the adjustable review example. */
export const ScaleGeometry: StoryObj<{ scale: number }> = {
  ...GlobalScale,
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement.style;
    const variable = radiusScale.cssVariable;
    const previous = root.getPropertyValue(variable);
    const priority = root.getPropertyPriority(variable);
    const fontSize = root.getPropertyValue("font-size");
    const fontPriority = root.getPropertyPriority("font-size");
    const cards = [...canvasElement.querySelectorAll<HTMLElement>("[data-card]")];
    const controls = canvas.getAllByRole("button", { name: "Review details" });
    const fields = canvas.getAllByRole("searchbox").map(input => input.closest("[data-search-clear]")!);
    const round = [...canvasElement.querySelectorAll<HTMLElement>("[data-collapsed]")];
    const subjects = [...cards, ...controls, ...fields];
    const opticalInner = canvasElement.querySelector<HTMLElement>("[data-optical-inner]")!;
    const opticalOuter = canvasElement.querySelector<HTMLElement>("[data-optical-outer]")!;
    const previousInner = opticalInner.style.getPropertyValue("--demo-radius");
    try {
      await document.fonts.ready;
      // Verify true root recomputation, including a non-default rem conversion baseline.
      for (const font of [fontSize, "20px"]) {
        if (font) root.setProperty("font-size", font); else root.removeProperty("font-size");
        root.setProperty(variable, "1");
        // Root-font proof also changes rem-based badge padding; let its existing transition settle.
        await Promise.all(canvasElement.getAnimations({ subtree: true }).map(animation => animation.finished));
        const baseline = subjects.map(geometry);
        const intrinsic = round.map(geometry);
        for (const configuration of opticalConfigurations) {
          const { scale } = configuration;
          root.setProperty(variable, String(scale));
          opticalInner.style.setProperty("--demo-radius", configuration.resolvedInnerWebValue);
          const rootRatio = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
          await expect(geometry(opticalOuter).radius).toBeCloseTo(configuration.resolvedOuterSourcePx * rootRatio, 4);
          await expect(geometry(opticalInner).radius).toBeCloseTo(configuration.resolvedInnerSourcePx * rootRatio, 4);
          const actualIdeal = geometry(opticalOuter).radius - parseFloat(getComputedStyle(opticalOuter).paddingTop);
          await expect(actualIdeal).toBeCloseTo(configuration.idealSourcePx * rootRatio, 4);
          if (configuration.opticalCandidateSelected) {
            await expect(geometry(opticalInner).radius - actualIdeal).toBeCloseTo(configuration.opticalCompensationSourcePx * rootRatio, 4);
          }
          for (const [index, element] of subjects.entries()) {
            const current = geometry(element);
            await expect(current.radius).toBeCloseTo(baseline[index].radius * scale, 4);
            await expect(current.unchanged).toBe(baseline[index].unchanged);
          }
          await expect(round.map(geometry)).toEqual(intrinsic);
          for (const input of canvas.getAllByRole("searchbox")) {
            const frame = input.closest("[data-search-clear]")!;
            const clear = frame.querySelector("button")!;
            const style = getComputedStyle(frame);
            await expect(parseFloat(getComputedStyle(clear).borderTopRightRadius)).toBeCloseTo(
              Math.max(0, parseFloat(style.borderTopRightRadius) - parseFloat(style.borderRightWidth)), 4);
          }
          for (const size of ["SM", "MD", "LG"]) {
            await userEvent.click(canvas.getByRole("combobox", { name: `City ${size}` }));
            const list = await canvas.findByRole("listbox");
            const panel = list.closest("[data-presentation]")!;
            const row = within(list).getAllByRole("option")[0];
            const insetSpacingId = size === "SM" ? "space/1" : size === "MD" ? "space/1.5" : "space/2";
            // Runtime scale multiplies the configured token; it cannot reselect a discrete candidate.
            const compensated = resolveConcentricOuterRadius({
              innerRadiusId: `radius/ui/${size.toLowerCase()}`,
              insetSpacingId,
            });
            await waitFor(() => expect(parseFloat(getComputedStyle(panel).borderTopLeftRadius)).toBeCloseTo(
              compensated.resolvedOuterSourcePx * scale * rootRatio, 4));
            await expect(parseFloat(getComputedStyle(panel).borderTopLeftRadius)).toBeGreaterThan(
              parseFloat(getComputedStyle(row).borderTopLeftRadius) +
              parseFloat(getComputedStyle(panel).paddingTop) +
              parseFloat(getComputedStyle(panel).borderTopWidth));
            await userEvent.keyboard("{Escape}");
            await waitFor(() => expect(canvas.queryByRole("listbox")).toBeNull());
          }
        }
        root.setProperty(variable, "0.01");
        for (const input of canvas.getAllByRole("searchbox")) {
          const clear = input.closest("[data-search-clear]")!.querySelector("button")!;
          await expect(getComputedStyle(clear).borderTopRightRadius).toBe("0px");
        }
      }
    } finally {
      opticalInner.style.setProperty("--demo-radius", previousInner);
      if (previous) root.setProperty(variable, previous, priority); else root.removeProperty(variable);
      if (fontSize) root.setProperty("font-size", fontSize, fontPriority); else root.removeProperty("font-size");
    }
    (document.activeElement as HTMLElement | null)?.blur();
  },
};
