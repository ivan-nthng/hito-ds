import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { focusIndicator } from "@hito-ds/react/tokens/border-focus";
import { fixedUiSizingById } from "@hito-ds/react/tokens/fixed-ui-sizing";
import { reducedMotionPolicy } from "@hito-ds/react/tokens/motion";
import { semanticBorderColorPolicy } from "@hito-ds/react/tokens/semantic-border-colors";
import { semanticIconColorPolicy } from "@hito-ds/react/tokens/semantic-icon-colors";
import { expect } from "storybook/test";
import { Text } from "../components/Text/Text";
import {
  FoundationSpecimenGrid,
  FoundationStoryCopy,
  FoundationStoryGroup,
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";

const minimumTarget = fixedUiSizingById["ui/interaction/target/min"];

if (!minimumTarget) {
  throw new Error("Missing minimum interaction target role");
}

const meta = {
  id: "foundations-accessibility",
  title: "Foundations/Accessibility",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Baseline: Story = {
  render: () => (
    <FoundationStoryPage
      description="Accessibility is part of every foundation and component contract. This page connects existing mechanisms; it does not create a parallel token system."
      title="Accessibility baseline"
      width="wide"
    >
      <FoundationStorySection
        description="Each mechanism is defined and demonstrated by its owning foundation."
        title="Foundation mechanisms"
      >
        <FoundationSpecimenGrid minItemWidth="compact">
          <FoundationStoryGroup
            note={`${focusIndicator.widthId} · ${focusIndicator.offsetWebValue} offset`}
            title="Keyboard focus"
          >
            <FoundationStoryCopy>
              {focusIndicator.activation} outer outline · forced colors uses {focusIndicator.forcedColorsAdapter}
            </FoundationStoryCopy>
          </FoundationStoryGroup>

          <FoundationStoryGroup
            note={semanticIconColorPolicy.contrastValidation}
            title="Measured contrast"
          >
            <FoundationStoryCopy>
              Text, icons and required edges are measured against their actual adjacent Surface.
            </FoundationStoryCopy>
          </FoundationStoryGroup>

          <FoundationStoryGroup
            note={`${minimumTarget.id} · ${minimumTarget.resolvedSourcePx}px`}
            title="Interaction target"
          >
            <FoundationStoryCopy>
              The active area may exceed compact visible geometry and must not overlap neighbouring targets.
            </FoundationStoryCopy>
          </FoundationStoryGroup>

          <FoundationStoryGroup
            note={reducedMotionPolicy.preference}
            title="Reduced motion"
          >
            <FoundationStoryCopy>
              Spatial motion is {reducedMotionPolicy.spatialMotion}; state and meaning remain complete.
            </FoundationStoryCopy>
          </FoundationStoryGroup>
        </FoundationSpecimenGrid>
      </FoundationStorySection>

      <FoundationStorySection title="Ownership boundary">
        <FoundationSpecimenGrid>
          <FoundationStoryGroup title="Foundations own">
            <Text variant="body-sm">Focus mechanism and contextual color</Text>
            <Text variant="body-sm">Measured color-pair requirements</Text>
            <Text variant="body-sm">Minimum target geometry</Text>
            <Text variant="body-sm">Reduced-motion safeguards</Text>
          </FoundationStoryGroup>

          <FoundationStoryGroup title="Components own">
            <Text variant="body-sm">Accessible name and semantic role</Text>
            <Text variant="body-sm">Keyboard model and focus order</Text>
            <Text variant="body-sm">Errors, descriptions and announcements</Text>
            <Text variant="body-sm">Disabled and state-specific behavior</Text>
          </FoundationStoryGroup>
        </FoundationSpecimenGrid>
      </FoundationStorySection>

      <FoundationStorySection
        description="Automated checks supplement rather than replace manual assistive-technology review."
        title="Required component evidence"
      >
        <FoundationSpecimenGrid minItemWidth="compact">
          <FoundationStoryGroup title="Keyboard">
            <FoundationStoryCopy>Complete operation, logical order and visible focus.</FoundationStoryCopy>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Semantics">
            <FoundationStoryCopy>Correct role, name, value, state and announcements.</FoundationStoryCopy>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Perception">
            <FoundationStoryCopy>Contrast, non-color cues and forced-colors survival.</FoundationStoryCopy>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Reflow">
            <FoundationStoryCopy>Zoom, narrow width and long-content behavior without loss.</FoundationStoryCopy>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Touch">
            <FoundationStoryCopy>Minimum target, spacing and alternatives to gesture-only input.</FoundationStoryCopy>
          </FoundationStoryGroup>
          <FoundationStoryGroup title="Motion">
            <FoundationStoryCopy>Reduced-motion behavior with equivalent state and meaning.</FoundationStoryCopy>
          </FoundationStoryGroup>
        </FoundationSpecimenGrid>
      </FoundationStorySection>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("main")).toBeVisible();
    await expect(canvasElement.querySelector("h1")).toHaveTextContent(
      "Accessibility baseline",
    );
    await expect(
      canvasElement.querySelectorAll("section"),
    ).toHaveLength(3);
    expect(semanticBorderColorPolicy.contrastValidation).toBe(
      "measured-edge-against-each-adjacent-surface",
    );
    expect(semanticIconColorPolicy.contrastValidation).toBe(
      "measured-icon-against-adjacent-surface",
    );
  },
};
