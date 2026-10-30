import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  referenceBasicColors,
  referenceColorFamilies,
} from "@hito-ds/react/tokens/reference-colors";
import type {
  ReferenceColorFamily,
  ReferenceColorToken,
} from "@hito-ds/react/tokens/types";
import { expect, userEvent } from "storybook/test";
import { ColorReferenceScale, ColorSample } from "./ColorScale";
import { FoundationStoryPage, FoundationStorySection, FoundationSpecimenGrid, FoundationSpecimen } from "./FoundationStoryLayout";

function ColorSwatch({ token }: { token: ReferenceColorToken }) {
  return <FoundationSpecimen data-reference-color={token.id} label={String(token.step)} value={token.value} token={token.id}>
    <ColorSample cssVariable={token.cssVariable} label={`${token.id} swatch`} />
  </FoundationSpecimen>;
}

function getFamily(familyId: string) {
  const family = referenceColorFamilies.find(
    (candidate) => candidate.family === familyId,
  );

  if (!family) {
    throw new Error(`Missing reference color family: ${familyId}`);
  }

  return family;
}

function Palette({ family }: { family: ReferenceColorFamily }) {
  return <FoundationStoryPage title={family.displayName} description="Twelve admitted reference steps from 50 through 1000." width="wide"><ColorReferenceScale family={family} /></FoundationStoryPage>;
}

function paletteStory(familyId: string) {
  return {
    render: () => <Palette family={getFamily(familyId)} />,
    play: async ({
      canvasElement,
      globals,
    }: {
      canvasElement: HTMLElement;
      globals: Record<string, unknown>;
    }) => {
      await expect(
        canvasElement.querySelectorAll("[data-reference-color]"),
      ).toHaveLength(12);
      const palette = canvasElement.querySelector<HTMLElement>(
        '[role="region"]',
      );
      await expect(palette).not.toBeNull();
      await expect(palette).toHaveAccessibleName(
        `${getFamily(familyId).displayName} reference color scale`,
      );

      if (globals.proofContext === "primary") {
        await expect(palette!.scrollWidth).toBeLessThanOrEqual(
          palette!.clientWidth,
        );
      }

      if (familyId === "neutral") {
        await userEvent.tab();
        await expect(palette).toHaveFocus();
        await expect(getComputedStyle(palette!).outlineStyle).toBe("solid");
        await userEvent.tab();
        await expect(palette).not.toHaveFocus();
      }
    },
  };
}

const meta = {
  id: "foundations-color-primitives-palettes",
  title: "Foundations/Color/Reference Palettes",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = paletteStory("neutral");
export const Blue: Story = paletteStory("blue");
export const Green: Story = paletteStory("green");
export const Red: Story = paletteStory("red");
export const Orange: Story = paletteStory("orange");
export const Brand: Story = paletteStory("brand");
export const Pink: Story = paletteStory("pink");
export const Yellow: Story = paletteStory("yellow");

export const Basic: Story = {
  render: () => <FoundationStoryPage title="Basic" description="White and black reference colors."><FoundationStorySection title="Basic colors"><FoundationSpecimenGrid minItemWidth="compact">{referenceBasicColors.map(token => <ColorSwatch key={token.id} token={token} />)}</FoundationSpecimenGrid></FoundationStorySection></FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-reference-color]"),
    ).toHaveLength(2);
  },
};
