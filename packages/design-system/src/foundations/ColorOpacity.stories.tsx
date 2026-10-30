import type { CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { referenceOpacity } from "@hito-ds/react/tokens/reference-opacity";
import { expect } from "storybook/test";
import styles from "./PrimitiveTokens.stories.module.css";

type TokenStyle = CSSProperties &
  Readonly<Record<`--primitive-${string}`, string>>;

const meta = {
  id: "foundations-color-primitives",
  title: "Foundations/Color/Opacity",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Opacity: Story = {
  name: "Reference Scale",
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <h1>Reference opacity</h1>
        <p>
          Governed opacity values shown with Brand/500 as the visual carrier.
        </p>
      </header>
      <section className={styles.opacityStage}>
        <div className={styles.opacityPalette}>
          {referenceOpacity.map((token) => {
            const style = {
              "--primitive-opacity": `var(${token.cssVariable})`,
            } as TokenStyle;

            return (
              <article
                className={styles.swatch}
                data-reference-opacity={token.id}
                key={token.id}
              >
                <div className={styles.opacitySample} style={style} />
                <p className={styles.tokenId}>{token.id}</p>
                <p className={styles.tokenValue}>{token.value * 100}%</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-reference-opacity]"),
    ).toHaveLength(11);
  },
};
