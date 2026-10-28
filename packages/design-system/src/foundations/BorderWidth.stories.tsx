import type { CSSProperties, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  focusIndicator,
  referenceBorderWidths,
  semanticBorderWidths,
} from "@hito-ds/react/tokens/border-focus";
import { expect, userEvent } from "storybook/test";
import { Text } from "../components/Text/Text";
import {
  FoundationSpecimen,
  FoundationSpecimenGrid,
  FoundationStoryCopy,
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./BorderWidth.stories.module.css";

type WidthStyle = CSSProperties & { "--demo-border-width": string };

const referencePurpose = {
  "border/width/0": "Technical coordinate · no visible edge",
  "border/width/1": "Standard structural edge",
  "border/width/2": "Rare explicit emphasis",
} as const;

const applications = [
  ["Surface / Card", "Optional boundary when layering is insufficient", "surface"],
  ["Separator", "One-dimensional structural division", "separator"],
  ["Input", "Reserved structural geometry across states", "input"],
  ["Outlined Button", "Stable outline without size-based thickening", "button"],
  ["Tag / Chip", "Stable outline when the variant needs an edge", "tag"],
  ["Table", "Rules only where they clarify structure", "table"],
] as const;

const states = ["Default", "Hover", "Pressed", "Selected", "Invalid", "Disabled"] as const;

const environmentRules = [
  "Do not add 0.5px retina variants; CSS pixels already map through device pixel ratio.",
  "At 200% zoom, inspect clipping and reflow without changing the token.",
  "Required edges use system colors in forced-colors and never rely on shadow alone.",
  "Print may adapt an essential rule, but decorative separators may disappear.",
] as const;

function widthStyle(cssVariable: string) {
  return { "--demo-border-width": `var(${cssVariable})` } as WidthStyle;
}

function ApplicationSample({ kind }: { kind: (typeof applications)[number][2] }) {
  const samples: Record<typeof kind, ReactNode> = {
    button: (
      <button className={styles.outlinedButton} tabIndex={-1} type="button">
        Action
      </button>
    ),
    input: <div className={styles.inputSample}>Sample value</div>,
    separator: <div className={styles.separatorSample} />,
    surface: <div className={styles.surfaceSample}>Grouped content</div>,
    table: (
      <div className={styles.tableSample}>
        <span>Order</span>
        <span>Status</span>
      </div>
    ),
    tag: <span className={styles.tagSample}>Label</span>,
  };

  return samples[kind];
}

const meta = {
  id: "foundations-border-width",
  title: "Foundations/Border Width",
  tags: ["test"],
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReferenceRoles: Story = {
  name: "Reference & Roles",
  render: () => (
    <FoundationStoryPage
      description="Which fixed coordinates and structural roles define border width without encoding color, focus or interaction state?"
      title="Border width"
      width="wide"
    >
      <FoundationStorySection title="Reference coordinates">
        <FoundationSpecimenGrid>
          {referenceBorderWidths.map((token) => (
            <FoundationSpecimen
              guidance={referencePurpose[token.id as keyof typeof referencePurpose]}
              key={token.id}
              label={token.webValue}
              token={token.id}
            >
              <div className={styles.referenceStage}>
                <div
                  className={styles.referenceSample}
                  data-border-reference={token.id}
                  style={widthStyle(token.cssVariable)}
                />
              </div>
            </FoundationSpecimen>
          ))}
        </FoundationSpecimenGrid>
      </FoundationStorySection>

      <FoundationStorySection
        description="There is no semantic border/width/none. Components decide whether an edge is visibly absent."
        title="Structural roles"
      >
        <FoundationSpecimenGrid minItemWidth="wide">
          {semanticBorderWidths.map((token) => (
            <FoundationSpecimen
              guidance={`${token.resolvedWebValue} · ${token.referenceId}`}
              key={token.id}
              label={token.id.split("/").at(-1)}
              token={token.id}
            >
              <div
                className={styles.roleSample}
                data-border-role={token.id}
                style={widthStyle(token.cssVariable)}
              />
            </FoundationSpecimen>
          ))}
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const references = canvasElement.querySelectorAll<HTMLElement>(
      "[data-border-reference]",
    );
    await expect(references).toHaveLength(3);
    expect(
      Array.from(references, (element) => getComputedStyle(element).borderLeftWidth),
    ).toEqual(["0px", "1px", "2px"]);
    await expect(canvasElement.querySelectorAll("[data-border-role]")).toHaveLength(2);
  },
};

export const StructuralApplications: Story = {
  name: "Structural Applications",
  render: () => (
    <FoundationStoryPage
      description="Where does the standard structural edge apply, and when may a component opt into a stronger edge?"
      title="Structural applications"
      width="wide"
    >
      <FoundationStorySection title="Common uses">
        <FoundationSpecimenGrid>
          {applications.map(([title, description, kind]) => (
            <FoundationSpecimen
              data-border-application={kind}
              guidance={description}
              key={kind}
              label={title}
            >
              <div className={styles.applicationStage}>
                <ApplicationSample kind={kind} />
              </div>
            </FoundationSpecimen>
          ))}
        </FoundationSpecimenGrid>
      </FoundationStorySection>

      <FoundationStorySection
        description="State is communicated by color, fill, icon or message. The structural box remains unchanged."
        title="State stability"
      >
        <FoundationSpecimenGrid>
          {states.map((state) => (
            <div
              className={`${styles.stateSample} ${styles[`state${state}`]}`}
              data-border-state="stable"
              key={state}
            >
              <Text variant="ui-sm">{state}</Text>
            </div>
          ))}
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-border-application]"),
    ).toHaveLength(6);
    const specimens = canvasElement.querySelectorAll<HTMLElement>(
      '[data-border-state="stable"]',
    );
    await expect(specimens).toHaveLength(6);
    const boxes = Array.from(specimens, (element) => {
      const rect = element.getBoundingClientRect();
      return {
        border: getComputedStyle(element).borderLeftWidth,
        height: Math.round(rect.height),
        width: Math.round(rect.width),
      };
    });
    expect(new Set(boxes.map((box) => `${box.width}×${box.height}`)).size).toBe(1);
    expect(new Set(boxes.map((box) => box.border))).toEqual(new Set(["1px"]));
  },
};

export const RenderingAccessibility: Story = {
  name: "Rendering & Accessibility",
  render: () => (
    <FoundationStoryPage
      description="How do fixed whole-pixel borders coexist with focus, nesting, zoom, forced colors and print?"
      title="Rendering and accessibility"
      width="wide"
    >
      <FoundationStorySection
        description="The selected state keeps a 1px structural border while keyboard focus adds a separate external 2px outline."
        title="Structural border plus focus"
        token={`${focusIndicator.widthId} · offset ${focusIndicator.offsetWebValue}`}
      >
        <button
          aria-pressed="true"
          className={styles.focusTarget}
          data-border-focus="structural-plus-focus"
          type="button"
        >
          Selected and focused
        </button>
      </FoundationStorySection>

      <FoundationStorySection
        description="The nesting resolver includes the actual border in its inset before selecting an admitted inner radius."
        title="Nested geometry"
      >
        <div className={styles.nestedOuter}>
          <div className={styles.nestedInner}>
            <FoundationStoryCopy>Inner Surface</FoundationStoryCopy>
          </div>
        </div>
      </FoundationStorySection>

      <FoundationStorySection title="Environment rules">
        <ul className={styles.ruleList}>
          {environmentRules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const target = canvasElement.querySelector<HTMLButtonElement>(
      '[data-border-focus="structural-plus-focus"]',
    );
    if (!target) throw new Error("Missing border/focus coexistence target");
    const before = target.getBoundingClientRect();
    await userEvent.tab();
    await expect(target).toHaveFocus();
    const after = target.getBoundingClientRect();
    const style = getComputedStyle(target);
    expect(style.borderLeftWidth).toBe("1px");
    expect(style.outlineWidth).toBe("2px");
    expect(style.outlineOffset).toBe("2px");
    expect(Math.round(after.width)).toBe(Math.round(before.width));
    expect(Math.round(after.height)).toBe(Math.round(before.height));
  },
};
