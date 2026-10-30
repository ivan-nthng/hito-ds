import type { CSSProperties } from "react";
import type { Preview } from "@storybook/nextjs-vite";
import "../src/fonts.css";
import "@hito-ds/react/tokens.css";
import "@hito-ds/react/base.css";
import {
  defaultStoryContentProfile,
  resolveStoryContentProfile,
  storyContentProfiles,
} from "../../../packages/design-system/src/storybook/story-content";
import previewStyles from "../src/preview.module.css";

// Explicit local faces bypass next/font's Google CSS/runtime network path in Storybook.
const fontSourceStyle = {
  "--font-hito-base-source": '"Instrument Sans"',
  "--font-hito-display-source": '"Poppins"',
  "--font-hito-mono-source": '"Fira Mono"',
} as CSSProperties;

const contentViewports = {
  narrow: {
    name: "Narrow — 320px",
    styles: { width: "320px", height: "720px" },
    type: "mobile",
  },
  boundarySm: {
    name: "40rem boundary — 640px",
    styles: { width: "640px", height: "900px" },
    type: "other",
  },
  boundaryMd: {
    name: "64rem boundary — 1024px",
    styles: { width: "1024px", height: "900px" },
    type: "other",
  },
  boundaryXl: {
    name: "80rem boundary — 1280px",
    styles: { width: "1280px", height: "900px" },
    type: "desktop",
  },
} as const;

const preview: Preview = {
  tags: ["stable"],
  initialGlobals: {
    colorScheme: "system",
    theme: "neutral",
    storyContentProfile: defaultStoryContentProfile,
  },
  globalTypes: {
    theme: {
      description: "Product theme (independent of color scheme)",
      toolbar: { icon: "mirror", items: [
        { value: "neutral", title: "Neutral" },
        { value: "inherited", title: "Inherited brand" },
      ] },
    },
    storyContentProfile: {
      description: "Language and text length",
      toolbar: {
        icon: "paragraph",
        items: storyContentProfiles.map(value => ({
          value,
          title: value.replace("en-", "EN · ").replace("pt-", "PT · "),
        })),
      },
    },
    colorScheme: {
      description: "Semantic color-scheme context",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "system", title: "System" },
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const colorScheme = context.globals.colorScheme;
      const storyContentProfile = resolveStoryContentProfile(
        context.globals.storyContentProfile,
      );
      const layout = context.parameters.layout;
      const semanticColorScheme =
        colorScheme === "light" || colorScheme === "dark"
          ? colorScheme
          : undefined;
      const layoutClassName =
        layout === "centered"
          ? previewStyles.centered
          : layout === "fullscreen"
            ? ""
            : previewStyles.padded;
      const style = {
        ...fontSourceStyle,
        colorScheme:
          colorScheme === "light" || colorScheme === "dark"
            ? colorScheme
            : "light dark",
      } as CSSProperties;

      return (
        <div
          className={`${previewStyles.canvas} ${
            context.viewMode === "docs"
              ? previewStyles.docs
              : previewStyles.story
          } ${layoutClassName}`}
          data-hito-theme={context.globals.theme === "inherited" ? "inherited" : "neutral"}
          data-hito-color-scheme={semanticColorScheme}
          data-hito-story-content={storyContentProfile}
          data-hito-story-canvas=""
          dir="ltr"
          lang="en"
          style={style}
        >
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    a11y: {
      test: "error",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Start here",
          "Foundations",
          [
            "Color",
            [
              "Hito Identity",
              "Reference Palettes",
              [
                "Neutral",
                "Blue",
                "Green",
                "Red",
                "Orange",
                "Brand",
                "Pink",
                "Yellow",
                "Basic",
              ],
              "Opacity",
              ["Reference Scale"],
              "Surface",
              ["Layers", "Intent", "Usage", "Overlay & Scrim"],
              "Text",
              ["Hierarchy", "Intent"],
              "Icon",
              ["Hierarchy", "Intent"],
              "Border",
              ["Surface & Separator", "Button", "Field", "Badge & Tag", "Chip"],
              "Focus",
              ["Indicator"],
              "Data",
              ["Categorical", "Sequential", "Diverging"],
            ],
            "Typography",
            [
              "Roles",
              "Families",
              "UI",
              "Body",
              "Heading",
              "Label",
              "Technical",
              "Data",
              "Display",
              "Emphasis",
              "Responsive & Accessibility",
            ],
            "Spacing",
            [
              "Reference Scale",
              "Fixed UI",
              "Fixed Layout",
              "Usage Rules",
            ],
            "Sizing",
            "Radius",
            ["Reference", "UI", "Layout", "Nesting"],
            "Border Width",
            [
              "Reference & Roles",
              "Structural Applications",
              "Rendering & Accessibility",
            ],
            "Elevation",
            ["Roles", "Compositions", "Safeguards"],
            "Motion",
            [
              "Duration Roles",
              "Easing & Direction",
              "Enter & Exit",
              "Reduced Motion & Safeguards",
            ],
            "Responsive Layout",
            "Iconography",
            ["Arrows", "General", "Controls"],
            "Accessibility",
          ],
          "Components",
          [
            "Primitives",
            ["Text", "Icon", "Surface", "Separator"],
            "Actions",
            ["Button", "Link"],
            "Forms",
            "Navigation",
            ["PageHeader"],
            "Overlays",
            "Feedback",
            "Collections",
            ["List", "ListItem"],
          ],
          "Patterns",
          [
            "Shells & Navigation",
            "Forms & Validation",
            "Search & Filtering",
            "Data & Collections",
            "Feedback & Recovery",
          ],
          "Internal",
          [
            "Storybook Infrastructure",
            "Regression Fixtures",
            "Test Harnesses",
          ],
        ],
      },
    },
    viewport: {
      options: contentViewports,
    },
  },
};

export default preview;
