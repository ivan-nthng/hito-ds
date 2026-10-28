import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import {
  getStoryContent,
  storyContentProfiles,
} from "../../../packages/design-system/src/storybook/story-content";
import styles from "./foundation.module.css";

const meta = {
  id: "internal-storybook-foundation",
  title: "Internal/Storybook Infrastructure/Foundation",
  tags: ["!stable", "internal", "test"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Infrastructure-only fixture proving Storybook, CSS Modules, tokens, fonts, themes and browser story execution. It is not a Design System component.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  render: () => (
    <main className={styles.canvas} data-storybook-foundation="ready">
      <section className={styles.panel} aria-labelledby="storybook-foundation-title">
        <p className={styles.eyebrow}>Internal foundation</p>
        <h1 className={styles.title} id="storybook-foundation-title">Hito DS Storybook is ready</h1>
        <p className={styles.body}>Components are added only after their contracts are reviewed.</p>
        <code className={styles.code}>@hito-ds/react</code>
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvas.getByText("@hito-ds/react")).toBeVisible();

    for (const profile of storyContentProfiles) {
      const content = getStoryContent(profile);
      const expectedLanguage = profile.startsWith("pt") ? "pt-BR" : "en";
      const expectedLocale = profile.startsWith("pt") ? "pt-BR" : "en-US";
      await expect(content.lang).toBe(expectedLanguage);
      await expect(content.locale).toBe(expectedLocale);
      await expect(content.inlineEdit.description.trim().length).toBeGreaterThan(0);
      await expect(content.editableValue.draftValue.trim().length).toBeGreaterThan(0);
      await expect(content.textarea.localizedLongValue.trim().length).toBeGreaterThan(0);
    }

    await expect(
      getStoryContent("en-long").inlineEdit.description.length,
    ).toBeGreaterThan(getStoryContent("en-short").inlineEdit.description.length);
    await expect(
      getStoryContent("pt-long").inlineEdit.description.length,
    ).toBeGreaterThan(getStoryContent("pt-short").inlineEdit.description.length);
    await expect(
      getStoryContent("en-long").textarea.localizedLongValue.length,
    ).toBeGreaterThan(
      getStoryContent("en-short").textarea.localizedLongValue.length,
    );
    await expect(
      getStoryContent("pt-long").textarea.localizedLongValue.length,
    ).toBeGreaterThan(
      getStoryContent("pt-short").textarea.localizedLongValue.length,
    );
  },
};
