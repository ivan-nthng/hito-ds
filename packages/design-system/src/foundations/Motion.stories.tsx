import type { CSSProperties } from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  motionEasings,
  motionPolicy,
  reducedMotionPolicy,
  semanticDurations,
} from "@hito-ds/react/tokens/motion";
import { expect, userEvent } from "storybook/test";
import { Icon } from "../components/Icon/Icon";
import { Text } from "../components/Text/Text";
import {
  FoundationStoryGroup,
  FoundationSpecimen,
  FoundationSpecimenGrid,
  FoundationStoryCopy,
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./Motion.stories.module.css";

const {
  durationUsage: motionUsageByDurationId,
  easingUsage: motionUsageByEasingId,
  property: motionPropertyPolicy,
  transition: motionTransitionPolicy,
} = motionPolicy;
type MotionVariables = CSSProperties & {
  "--demo-duration"?: string;
  "--demo-easing"?: string;
};

type MotionScaleItem = {
  durationVariable: string;
  easingVariable: string;
  guidance: string;
  id: string;
  kind: "duration" | "easing";
  label: string;
  value: string;
};

function tokenName(id: string) {
  return id.split("/").at(-1) ?? id;
}

function usageGuidance(
  usage: { guidance: string } | undefined,
  id: string,
) {
  if (!usage) {
    throw new Error(`Missing Motion usage: ${id}`);
  }

  return usage.guidance;
}

const durationSpecimens: readonly MotionScaleItem[] = semanticDurations.map(
  (token) => ({
    durationVariable: token.cssVariable,
    easingVariable: "--motion-easing-standard",
    guidance: usageGuidance(
      motionUsageByDurationId[
        token.id as keyof typeof motionUsageByDurationId
      ],
      token.id,
    ),
    id: token.id,
    kind: "duration",
    label: tokenName(token.id),
    value: token.resolvedWebValue,
  }),
);

const easingSpecimens: readonly MotionScaleItem[] = motionEasings.map(
  (token) => ({
    durationVariable: "--motion-duration-reveal",
    easingVariable: token.cssVariable,
    guidance: usageGuidance(
      motionUsageByEasingId[token.id as keyof typeof motionUsageByEasingId],
      token.id,
    ),
    id: token.id,
    kind: "easing",
    label: tokenName(token.id),
    value: token.webValue,
  }),
);

function MotionTrack({
  durationVariable,
  easingVariable,
  label,
}: {
  durationVariable: string;
  easingVariable: string;
  label: string;
}) {
  return (
    <button
      aria-label={`Preview ${label}`}
      className={styles.motionTrack}
      style={
        {
          "--demo-duration": `var(${durationVariable})`,
          "--demo-easing": `var(${easingVariable})`,
        } as MotionVariables
      }
      type="button"
    >
      <span aria-hidden="true" className={styles.motionMarker} />
    </button>
  );
}

function MotionScale({ items }: { items: readonly MotionScaleItem[] }) {
  return (
    <FoundationSpecimenGrid minItemWidth="full">
      {items.map((item) => (
        <FoundationSpecimen
          data-motion-duration={item.kind === "duration" ? item.id : undefined}
          data-motion-easing={item.kind === "easing" ? item.id : undefined}
          guidance={item.guidance}
          key={item.id}
          label={item.label[0]?.toUpperCase() + item.label.slice(1)}
          layout="row"
          token={item.id}
          value={item.value}
        >
          <MotionTrack
            durationVariable={item.durationVariable}
            easingVariable={item.easingVariable}
            label={`${item.label} ${item.kind}`}
          />
        </FoundationSpecimen>
      ))}
    </FoundationSpecimenGrid>
  );
}

function TransitionSpecimen({ preferenceAware = false }) {
  const [open, setOpen] = useState(preferenceAware);

  return (
    <div className={styles.transitionStage}>
      <header className={styles.transitionHeader}>
        <button
          aria-expanded={open}
          aria-label={open ? "Play exit transition" : "Play enter transition"}
          className={styles.toggle}
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <Icon name="controls/play" size="sm" tone="accent" />
          <span>Play</span>
        </button>
      </header>
      <div className={styles.transitionCanvas}>
        <div
          aria-hidden={!open}
          className={styles.transitionTarget}
          data-motion-preference-aware={preferenceAware ? "true" : undefined}
          data-motion-transition="target"
          data-open={open ? "true" : "false"}
        >
          <Text variant="label-sm">Motion target</Text>
          <FoundationStoryCopy variant="technical-sm">
            opacity + transform
          </FoundationStoryCopy>
        </div>
      </div>
    </div>
  );
}

const meta = {
  id: "foundations-motion",
  title: "Foundations/Motion",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const DurationRoles: Story = {
  name: "Duration Roles",
  render: () => (
    <FoundationStoryPage
      description="Which semantic duration communicates each motion intent?"
      title="Motion duration"
      width="wide"
    >
      <FoundationStorySection
        description="Components consume these semantic roles. They do not select raw millisecond references."
        title="Semantic scale"
      >
        <MotionScale items={durationSpecimens} />
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-motion-duration]"),
    ).toHaveLength(5);
  },
};

export const EasingDirection: Story = {
  name: "Easing & Direction",
  render: () => (
    <FoundationStoryPage
      description="How does easing describe an object's relationship to its context and direction?"
      title="Motion easing"
      width="wide"
    >
      <FoundationStorySection title="Semantic curves">
        <MotionScale items={easingSpecimens} />
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-motion-easing]"),
    ).toHaveLength(4);
  },
};

export const EnterExit: Story = {
  name: "Enter & Exit",
  render: () => (
    <FoundationStoryPage
      description="Which foundation pairing governs arrival and departure before a component owns its specific recipe?"
      title="Enter and exit"
      width="wide"
    >
      <FoundationStorySection
        description="Enter may take longer to establish a new relationship. Exit stays no longer than enter so it does not obstruct the next task."
        title="Directional pairing"
      >
        <TransitionSpecimen />
      </FoundationStorySection>

      <FoundationStorySection title="Ownership boundaries">
        <FoundationSpecimenGrid>
          <FoundationStoryGroup title="Enter">
            <Text variant="technical-sm">
              {motionTransitionPolicy.enter.durationId}
            </Text>
            <Text variant="technical-sm">
              {motionTransitionPolicy.enter.easingId}
            </Text>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Exit">
            <Text variant="technical-sm">
              {motionTransitionPolicy.exit.durationId}
            </Text>
            <Text variant="technical-sm">
              {motionTransitionPolicy.exit.easingId}
            </Text>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Component recipe">
            <Text variant="technical-sm">
              {motionTransitionPolicy.componentRecipes}
            </Text>
            <Text variant="technical-sm">
              origin · {motionTransitionPolicy.spatialOrigin}
            </Text>
          </FoundationStoryGroup>
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const toggle = canvasElement.querySelector<HTMLButtonElement>(
      "button[aria-expanded]",
    );
    await expect(toggle).not.toBeNull();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle!);
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvasElement.querySelector('[data-motion-transition="target"]'),
    ).toHaveAttribute("data-open", "true");
  },
};

export const ReducedMotionSafeguards: Story = {
  name: "Reduced Motion & Safeguards",
  tags: ["context-matrix"],
  render: () => (
    <FoundationStoryPage
      description="How does reduced motion remove spatial movement while retaining complete state and meaning?"
      title="Reduced motion"
      width="wide"
    >
      <FoundationStorySection
        description="This specimen uses transform plus opacity normally. With reduced motion it keeps only the admitted short opacity fade."
        title="Preference-aware transition"
        token={reducedMotionPolicy.preference}
      >
        <TransitionSpecimen preferenceAware />
      </FoundationStorySection>

      <FoundationStorySection title="Safeguards">
        <FoundationSpecimenGrid>
          <FoundationStoryGroup title="Spatial motion">
            <Text variant="technical-sm">
              transform · {reducedMotionPolicy.spatialMotion}
            </Text>
            <Text variant="technical-sm">
              scale · {reducedMotionPolicy.scaleMotion}
            </Text>
            <Text variant="technical-sm">
              parallax · {reducedMotionPolicy.parallax}
            </Text>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Retained meaning">
            <Text variant="technical-sm">
              progress · {reducedMotionPolicy.essentialProgress}
            </Text>
            <Text variant="technical-sm">
              animation-only information · {reducedMotionPolicy.informationOnlyInAnimation}
            </Text>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="CSS properties">
            <Text variant="technical-sm">
              spatial · {motionPropertyPolicy.preferredSpatialProperties.join(", ")}
            </Text>
            <Text variant="technical-sm">
              transition: all · {motionPropertyPolicy.transitionAll}
            </Text>
            <Text variant="technical-sm">
              focus · {motionPropertyPolicy.focusIndicator}
            </Text>
          </FoundationStoryGroup>
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement, globals }) => {
    const target = canvasElement.querySelector(
      '[data-motion-preference-aware="true"]',
    );
    await expect(target).not.toBeNull();
    await expect(target).toHaveAttribute("data-open", "true");
    await expect(target!.closest("[lang]")).toHaveAttribute("lang", "en");

    if (globals.proofContext === "primary") {
      await expect(
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      ).toBe(false);
    }

    if (globals.proofContext === "matrix") {
      await expect(
        matchMedia("(prefers-reduced-motion: reduce)").matches,
      ).toBe(true);
    }
  },
};
