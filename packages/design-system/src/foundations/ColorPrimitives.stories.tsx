import type { CSSProperties } from "react";
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
import styles from "./PrimitiveTokens.stories.module.css";

type TokenStyle = CSSProperties &
  Readonly<Record<`--primitive-${string}`, string>>;

function ColorSwatch({ token }: { token: ReferenceColorToken }) {
  const style = {
    "--primitive-color": `var(${token.cssVariable})`,
  } as TokenStyle;

  return (
    <article className={styles.swatch} data-reference-color={token.id}>
      <div className={styles.colorSample} style={style} />
      <p className={styles.tokenId}>{String(token.step)}</p>
      <p className={styles.tokenValue}>{token.value}</p>
    </article>
  );
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
  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1>{family.displayName}</h1>
        <p>Twelve admitted reference steps from 50 through 1000.</p>
      </header>
      <section className={styles.family}>
        <div
          aria-label={`${family.displayName} reference color scale`}
          className={styles.palette}
          role="region"
          tabIndex={0}
        >
          {family.tokens.map((token) => (
            <ColorSwatch key={token.id} token={token} />
          ))}
        </div>
      </section>
    </main>
  );
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
        await expect(palette!.scrollWidth).toBeGreaterThan(
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
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1>Basic</h1>
        <p>White and black reference colors.</p>
      </header>
      <section className={styles.family}>
        <div className={styles.basicPalette}>
          {referenceBasicColors.map((token) => (
            <ColorSwatch key={token.id} token={token} />
          ))}
        </div>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-reference-color]"),
    ).toHaveLength(2);
  },
};
