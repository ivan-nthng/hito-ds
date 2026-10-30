import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

type StorybookProjectOptions = {
  colorScheme: "dark" | "light";
  contentProfile: "en-short" | "pt-long";
  height: number;
  name: "storybook" | "storybook-context";
  proofContext: "matrix" | "primary";
  reducedMotion: "no-preference" | "reduce";
  tags?: string[];
  viewport: "boundaryMd" | "narrow";
  width: number;
};

function storybookProject({
  colorScheme,
  contentProfile,
  height,
  name,
  proofContext,
  reducedMotion,
  tags,
  viewport,
  width,
}: StorybookProjectOptions) {
  return {
    extends: true as const,
    plugins: [
      storybookTest({
        configDir: path.join(dirname, ".storybook"),
        initialGlobals: {
          colorScheme,
          proofContext,
          storyContentProfile: contentProfile,
          viewport: { isRotated: false, value: viewport },
        },
        tags: tags
          ? { exclude: [], include: tags, skip: [] }
          : undefined,
      }),
    ],
    test: {
      name,
      // Bound browser resources per project; CPU defaults multiply across both profiles.
      maxWorkers: 2,
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({
          contextOptions: { colorScheme, reducedMotion },
        }),
        instances: [{ browser: "chromium" as const }],
        viewport: { height, width },
      },
    },
  };
}

export default defineConfig({
  test: {
    projects: [
      storybookProject({
        colorScheme: "light",
        contentProfile: "en-short",
        height: 900,
        name: "storybook",
        proofContext: "primary",
        reducedMotion: "no-preference",
        viewport: "boundaryMd",
        width: 1024,
      }),
      storybookProject({
        colorScheme: "dark",
        contentProfile: "pt-long",
        height: 720,
        name: "storybook-context",
        proofContext: "matrix",
        reducedMotion: "reduce",
        tags: ["context-matrix"],
        viewport: "narrow",
        width: 320,
      }),
    ],
  },
});
