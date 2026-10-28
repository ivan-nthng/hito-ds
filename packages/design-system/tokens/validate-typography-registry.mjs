import { readFile } from "node:fs/promises";

import { referenceSpacingById } from "./reference-spacing.mjs";
import {
  referenceFontWeights,
  semanticFontWeightPolicy,
} from "./reference-font-weights.mjs";
import { referenceTracking, trackingPolicy } from "./reference-tracking.mjs";
import {
  semanticFontFamilies,
  semanticFontFamilyPolicy,
} from "./semantic-font-families.mjs";
import {
  semanticLineHeightPolicy,
  semanticTypographyPolicy,
  typographyEmphasis,
  typographyFixedMetricRoles,
  typographyMetricRoles,
  typographyPurposeLanes,
  typographyResponsiveMetricRoles,
  typographyViewportModes,
} from "./semantic-typography.mjs";
import { assert } from "./validation-helpers.mjs";

const STORYBOOK_PREVIEW_URL = new URL(
  "../../../apps/storybook/.storybook/preview.tsx",
  import.meta.url,
);
const TEXT_STORIES_URL = new URL(
  "../src/components/Text/Text.stories.tsx",
  import.meta.url,
);

const EXPECTED_FONT_WEIGHTS = Object.freeze([400, 500, 600, 700]);
const EXPECTED_TRACKING = Object.freeze([
  ["font/tracking/tight", "-0.02em"],
  ["font/tracking/slightly-tight", "-0.01em"],
  ["font/tracking/normal", "0"],
  ["font/tracking/wide", "0.02em"],
  ["font/tracking/wider", "0.04em"],
  ["font/tracking/caps", "0.08em"],
  ["font/tracking/expanded", "0.12em"],
]);
const EXPECTED_PURPOSE_LANES = Object.freeze([
  "typography/ui",
  "typography/body",
  "typography/heading",
  "typography/label",
  "typography/technical",
  "typography/data",
  "typography/display",
]);
const EXPECTED_EMPHASIS = Object.freeze([
  ["typography/emphasis/regular", "font/weight/400"],
  ["typography/emphasis/medium", "font/weight/500"],
  ["typography/emphasis/strong", "font/weight/600"],
  ["typography/emphasis/bold", "font/weight/700"],
]);
const EXPECTED_FAMILY_SLOTS = Object.freeze([
  [
    "font/family/base",
    "Instrument Sans",
    "--type-family-base",
    "--font-hito-base-source",
  ],
  [
    "font/family/display",
    "Poppins",
    "--type-family-display",
    "--font-hito-display-source",
  ],
  [
    "font/family/mono",
    "Fira Mono",
    "--type-family-mono",
    "--font-hito-mono-source",
  ],
]);
const EXPECTED_METRIC_ROLES = Object.freeze([
  [
    "typography/ui/sm",
    12,
    16,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/ui/md",
    14,
    20,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/ui/lg",
    16,
    24,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/ui/xl",
    20,
    28,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/label/sm",
    12,
    16,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/label/base",
    14,
    20,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/label/lg",
    16,
    24,
    "font/tracking/normal",
    "typography/emphasis/medium",
  ],
  [
    "typography/label/eyebrow",
    10,
    12,
    "font/tracking/caps",
    "typography/emphasis/strong",
  ],
  [
    "typography/body/sm",
    14,
    20,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/body/base",
    16,
    24,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/body/md",
    20,
    28,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/body/lg",
    24,
    36,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/heading/sm",
    20,
    24,
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
  ],
  [
    "typography/heading/base",
    24,
    32,
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
  ],
  [
    "typography/heading/md",
    28,
    36,
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
  ],
  [
    "typography/heading/lg",
    32,
    36,
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
  ],
  [
    "typography/heading/xl",
    40,
    44,
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
  ],
  [
    "typography/technical/sm",
    12,
    16,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/data/sm",
    12,
    16,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/data/base",
    14,
    20,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/data/lg",
    16,
    24,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/display/subtitle",
    24,
    32,
    "font/tracking/normal",
    "typography/emphasis/regular",
  ],
  [
    "typography/display/eyebrow",
    12,
    16,
    "font/tracking/caps",
    "typography/emphasis/strong",
  ],
]);
const EXPECTED_VIEWPORT_MODES = Object.freeze([
  ["sm", 0, null],
  ["md", 640, "40rem"],
  ["lg", 1024, "64rem"],
  ["xl", 1280, "80rem"],
]);
const EXPECTED_RESPONSIVE_METRIC_ROLES = Object.freeze([
  [
    "typography/display/hero",
    "fluid",
    "font/tracking/tight",
    "typography/emphasis/strong",
    "40/48,48/56,56/64,64/64",
  ],
  [
    "typography/display/section",
    "responsive",
    "font/tracking/slightly-tight",
    "typography/emphasis/strong",
    "32/40,40/48,48/56,48/56",
  ],
]);

function parseCssCustomProperties(css) {
  return new Map(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/giu)].map((match) => [
      match[1],
      match[2]
        .trim()
        .replace(/\s+/gu, " ")
        .replace(/\(\s+/gu, "(")
        .replace(/\s+\)/gu, ")"),
    ]),
  );
}

assert(
  semanticLineHeightPolicy.canonicalReferences === "direct-space-primitives",
  "Typography numeric metrics must reference shared space primitives directly",
);
for (const role of typographyMetricRoles) {
  const metrics = role.viewportPolicy === "fixed" ? [role] : Object.values(role.modes);
  for (const metric of metrics) {
    for (const [key, referenceId] of [
      ["fontSize", metric.fontSizeReferenceId],
      ["lineHeight", metric.lineHeightReferenceId],
    ]) {
      const space = referenceSpacingById[referenceId];
      assert(
        space && space.sourcePx > 0 && space.kind === "space" &&
          space.sourcePx === metric.resolvedSourcePx[key],
        `Typography metric must resolve directly through space: ${role.id}/${key}`,
      );
    }
  }
}

assert(
  semanticLineHeightPolicy.defaultViewportPolicy === "fixed",
  "Typography must not become viewport-responsive by default",
);
assert(
  semanticLineHeightPolicy.viewportPolicies.join(",") ===
    "fixed,responsive,fluid",
  "Typography viewport policies drifted",
);
assert(
  semanticLineHeightPolicy.fluidAdmission === "explicit-display-role-only",
  "Fluid typography must remain restricted to explicitly admitted display roles",
);
assert(
  semanticLineHeightPolicy.webFluidAdapter ===
    "role-specific-rem-and-viewport-clamp-from-accepted-mode-pairs",
  "Fluid line-height must preserve accepted mode pairs through a role-specific Web adapter",
);
assert(
  semanticLineHeightPolicy.accessibilityScaling === "required",
  "Typography must preserve browser and user accessibility scaling",
);
assert(
  referenceFontWeights.map((token) => token.value).join(",") ===
    EXPECTED_FONT_WEIGHTS.join(","),
  "Font-weight reference scale drifted",
);
assert(
  new Set(referenceFontWeights.map((token) => token.id)).size ===
    referenceFontWeights.length,
  "Duplicate font-weight identity",
);
assert(
  !referenceFontWeights.some(
    (token) => token.value === 300 || token.value === 800,
  ),
  "Font weights 300 and 800 require separately admitted consumers",
);
assert(
  semanticFontWeightPolicy.canonicalIdentity === "numeric-weight" &&
    semanticFontWeightPolicy.familyStyleName === "adapter-metadata-only",
  "Font weight must remain independent from family-specific style names",
);
assert(
  semanticFontWeightPolicy.semanticRoleAssignment === "rebindable-alias" &&
    semanticFontWeightPolicy.directComponentValue === "prohibited",
  "Font weight assignments must remain rebindable semantic aliases",
);
assert(
  referenceTracking.map((token) => [token.id, token.webValue]).join("|") ===
    EXPECTED_TRACKING.join("|"),
  "Tracking reference scale drifted",
);
assert(
  new Set(referenceTracking.map((token) => token.id)).size ===
    referenceTracking.length,
  "Duplicate tracking identity",
);
assert(
  trackingPolicy.unit === "em",
  "Tracking must scale with the selected font size",
);
assert(
  trackingPolicy.defaultReferenceId === "font/tracking/normal",
  "Normal tracking must remain the default",
);
assert(
  referenceTracking.find((token) => token.id === "font/tracking/expanded")
    ?.status === "restricted",
  "Expanded tracking must remain restricted",
);
assert(
  trackingPolicy.semanticRoleAssignment === "rebindable-alias" &&
    trackingPolicy.directComponentValue === "prohibited",
  "Tracking assignments must remain rebindable semantic aliases",
);
assert(
  typographyPurposeLanes.map((lane) => lane.id).join(",") ===
    EXPECTED_PURPOSE_LANES.join(","),
  "Typography purpose-lane inventory drifted",
);
assert(
  !typographyPurposeLanes.some((lane) => lane.id.includes("header")),
  "Heading text roles must not be named after Header containers",
);
assert(
  typographyEmphasis.map((token) => [token.id, token.referenceId]).join("|") ===
    EXPECTED_EMPHASIS.join("|"),
  "Typography emphasis aliases drifted",
);
assert(
  semanticFontFamilies
    .map((family) => [
      family.id,
      family.preferredFamily,
      family.cssVariable,
      family.sourceCssVariable,
    ])
    .join("|") === EXPECTED_FAMILY_SLOTS.join("|"),
  "Semantic font-family slots drifted",
);
assert(
  semanticFontFamilies.every(
    (family) =>
      family.identityStatus === "active-replaceable-adapter" &&
      family.source === "google-fonts-via-next-font" &&
      family.webFallbacks.length > 0,
  ),
  "Every active Google Font adapter must retain a fallback chain",
);
assert(
  semanticFontFamilyPolicy.rejectedLegacyFamilies.join(",") ===
    "Inter,Roboto Mono" &&
    semanticFontFamilies.every(
      (family) =>
        !semanticFontFamilyPolicy.rejectedLegacyFamilies.includes(
          family.preferredFamily,
        ) &&
        !semanticFontFamilyPolicy.rejectedLegacyFamilies.includes(
          family.figmaAdapterFamily,
        ),
    ),
  "Rejected legacy families must not return as canonical adapters",
);
assert(
  semanticFontFamilies.find((family) => family.id === "font/family/display")
    ?.webValue ===
    'var(--font-hito-display-source, "Poppins"), var(--font-hito-base-source, "Instrument Sans"), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "Display must fall back through the active Base font slot before system fonts",
);
assert(
  semanticFontFamilyPolicy.actualFontFiles ===
    "next-font-google-build-assets" &&
    semanticFontFamilyPolicy.licenseEvidence === "google-fonts-upstream" &&
    semanticFontFamilyPolicy.automaticFontFetch ===
      "next-font-build-time-only" &&
    semanticFontFamilyPolicy.browserExternalRequest === "none",
  "Google Fonts must remain build-time self-hosted through next/font",
);
assert(
  semanticTypographyPolicy.emphasisComposition === "independent-from-metrics" &&
    semanticTypographyPolicy.cartesianStyleGeneration === "prohibited",
  "Typography emphasis must not create a metrics-by-weight matrix",
);
assert(
  semanticTypographyPolicy.currentTechnicalLane === "typography/technical" &&
    semanticTypographyPolicy.technicalLane === "typography/technical",
  "Technical must remain an admitted independent purpose lane",
);
assert(
  semanticTypographyPolicy.admittedMetricLanes.join(",") ===
    "typography/ui,typography/label,typography/body,typography/heading,typography/technical,typography/data,typography/display" &&
    semanticTypographyPolicy.deferredMetricLanes.length === 0,
  "Only accepted typography metric lanes may be implemented",
);
assert(
  typographyFixedMetricRoles
    .map((role) => [
      role.id,
      role.resolvedSourcePx.fontSize,
      role.resolvedSourcePx.lineHeight,
      role.trackingReferenceId,
      role.defaultEmphasisId,
    ])
    .join("|") === EXPECTED_METRIC_ROLES.join("|"),
  "Accepted fixed typography metric-role mapping drifted",
);
assert(
  typographyFixedMetricRoles.every(
    (role) =>
      role.viewportPolicy === "fixed" &&
      role.familySlotStatus === "active-replaceable-adapter",
  ),
  "Accepted fixed typography metrics must remain fixed with replaceable family adapters",
);
assert(
  typographyFixedMetricRoles
    .filter((role) => role.id.startsWith("typography/data/"))
    .every((role) => role.familySlotId === "font/family/mono"),
  "Data roles must target the independent mono family slot",
);
assert(
  typographyFixedMetricRoles
    .filter(
      (role) =>
        role.id.startsWith("typography/ui/") ||
        role.id.startsWith("typography/body/") ||
        role.id.startsWith("typography/technical/"),
    )
    .every((role) => role.familySlotId === "font/family/base"),
  "Fixed UI, Body, and Technical roles must target the independent base family slot",
);
assert(
  typographyFixedMetricRoles
    .filter(
      (role) =>
        role.id.startsWith("typography/label/") ||
        role.id.startsWith("typography/heading/") ||
        role.id.startsWith("typography/display/"),
    )
    .every((role) => role.familySlotId === "font/family/display"),
  "Fixed Label, Heading, and Display roles must target the independent display family slot",
);
assert(
  typographyViewportModes
    .map((mode) => [mode.id, mode.minWidthSourcePx, mode.minWidthWebValue])
    .join("|") === EXPECTED_VIEWPORT_MODES.join("|"),
  "Typography viewport-mode contract drifted",
);
assert(
  typographyResponsiveMetricRoles
    .map((role) => [
      role.id,
      role.viewportPolicy,
      role.trackingReferenceId,
      role.defaultEmphasisId,
      typographyViewportModes
        .map((mode) => {
          const metrics = role.modes[mode.id].resolvedSourcePx;
          return `${metrics.fontSize}/${metrics.lineHeight}`;
        })
        .join(","),
    ])
    .join("|") === EXPECTED_RESPONSIVE_METRIC_ROLES.join("|"),
  "Accepted responsive Display metric-role mapping drifted",
);
assert(
  typographyResponsiveMetricRoles.every(
    (role) =>
      role.familySlotId === "font/family/display" &&
      role.familySlotStatus === "active-replaceable-adapter",
  ),
  "Responsive Display roles must target the independent display family slot",
);
assert(
  semanticTypographyPolicy.responsiveRoleIds.join(",") ===
    "typography/display/hero,typography/display/section" &&
    semanticTypographyPolicy.fluidRoleIds.join(",") ===
      "typography/display/hero",
  "Only Hero may be fluid and only Hero/Section may respond to viewport",
);

const [css, storybookPreview, textStories] = await Promise.all([
  readFile(new URL("../src/tokens.css", import.meta.url), "utf8"),
  readFile(STORYBOOK_PREVIEW_URL, "utf8"),
  readFile(TEXT_STORIES_URL, "utf8"),
]);

const firaMonoLoader =
  /const monoFont = Fira_Mono\(\{\s*subsets: \["latin", "latin-ext"\],\s*weight: \["400", "500", "700"\],\s*variable: "--font-hito-mono-source",\s*display: "swap",\s*preload: false,\s*\}\);/u;
for (const [name, source] of [
  ["Storybook preview", storybookPreview],
]) {
  assert(
    source.includes("Fira_Mono") && firaMonoLoader.test(source),
    `${name} must load the accepted Fira Mono adapter`,
  );
  assert(!source.includes("Inter("), `${name} retains Inter legacy`);
  assert(!source.includes("Roboto_Mono"), `${name} retains Roboto Mono legacy`);
}
assert(
  textStories.includes('id: "Technical/SM"') &&
    textStories.includes('variant: "technical-sm"') &&
    !textStories.includes("Data and technical text"),
  "Typography stories must keep Technical separate from Data",
);
assert(
  textStories.includes('role: "Base"') &&
    !textStories.includes('role: "Interface"'),
  "Typography family specimens must use Base instead of the legacy Interface name",
);
const cssProperties = parseCssCustomProperties(css);
for (const family of semanticFontFamilies) {
  assert(
    cssProperties.get(family.cssVariable) === family.webValue,
    `CSS adapter drifted: ${family.cssVariable}`,
  );
}
assert(
  !/--ref-(?:font-size|line-height)-/u.test(css),
  "Retired numeric typography CSS identities must not return",
);
for (const role of typographyMetricRoles) {
  const metrics = role.viewportPolicy === "fixed" ? [role] : Object.values(role.modes);
  for (const metric of metrics) {
    for (const referenceId of [metric.fontSizeReferenceId, metric.lineHeightReferenceId]) {
      const space = referenceSpacingById[referenceId];
      assert(
        cssProperties.get(space.cssVariable) === space.webValue,
        `Typography space CSS adapter drifted: ${referenceId}`,
      );
    }
  }
}
for (const token of referenceFontWeights) {
  assert(
    cssProperties.get(token.cssVariable) === token.webValue,
    `CSS adapter drifted: ${token.cssVariable}`,
  );
}
for (const token of referenceTracking) {
  assert(
    cssProperties.get(token.cssVariable) === token.webValue,
    `CSS adapter drifted: ${token.cssVariable}`,
  );
}
for (const token of typographyEmphasis) {
  assert(
    cssProperties.get(token.cssVariable) ===
      `var(--ref-font-weight-${token.resolvedValue})`,
    `CSS adapter drifted: ${token.cssVariable}`,
  );
}
for (const role of typographyFixedMetricRoles) {
  assert(
    role.familyCssVariable ===
      semanticFontFamilies.find((family) => family.id === role.familySlotId)
        ?.cssVariable,
    `Typography role family slot drifted: ${role.id}`,
  );
  assert(
    cssProperties.get(role.cssVariables.fontSize) ===
      `var(${referenceSpacingById[role.fontSizeReferenceId].cssVariable})`,
    `CSS adapter drifted: ${role.cssVariables.fontSize}`,
  );
  assert(
    cssProperties.get(role.cssVariables.lineHeight) ===
      role.resolvedWeb.lineHeight,
    `CSS adapter drifted: ${role.cssVariables.lineHeight}`,
  );
  assert(
    cssProperties.get(role.cssVariables.letterSpacing) ===
      `var(--ref-font-tracking-${role.trackingReferenceId.split("/").at(-1)})`,
    `CSS adapter drifted: ${role.cssVariables.letterSpacing}`,
  );
  assert(
    cssProperties.get(role.cssVariables.defaultFontWeight) ===
      `var(--type-emphasis-${role.defaultEmphasisId.split("/").at(-1)})`,
    `CSS adapter drifted: ${role.cssVariables.defaultFontWeight}`,
  );
}
for (const role of typographyResponsiveMetricRoles) {
  assert(
    role.familyCssVariable ===
      semanticFontFamilies.find((family) => family.id === role.familySlotId)
        ?.cssVariable,
    `Responsive typography family slot drifted: ${role.id}`,
  );
  assert(
    cssProperties.get(role.cssVariables.letterSpacing) ===
      `var(--ref-font-tracking-${role.trackingReferenceId.split("/").at(-1)})`,
    `CSS adapter drifted: ${role.cssVariables.letterSpacing}`,
  );
  assert(
    cssProperties.get(role.cssVariables.defaultFontWeight) ===
      `var(--type-emphasis-${role.defaultEmphasisId.split("/").at(-1)})`,
    `CSS adapter drifted: ${role.cssVariables.defaultFontWeight}`,
  );
}

const expectedResponsiveCss = [
  "--type-display-hero-font-size: clamp(var(--ref-space-10), calc(2rem + 2.5vw), var(--ref-space-12));",
  "--type-display-hero-line-height: clamp(var(--ref-space-12), calc(2.5rem + 2.5vw), var(--ref-space-14));",
  "--type-display-section-font-size: var(--ref-space-8);",
  "--type-display-section-line-height: 1.25;",
  "--type-display-hero-font-size: clamp(var(--ref-space-12), calc(2.1667rem + 2.0833vw), var(--ref-space-14));",
  "--type-display-hero-line-height: clamp(var(--ref-space-14), calc(2.6667rem + 2.0833vw), var(--ref-space-16));",
  "--type-display-section-font-size: var(--ref-space-10);",
  "--type-display-section-line-height: 1.2;",
  "--type-display-hero-font-size: clamp(var(--ref-space-14), calc(1.5rem + 3.125vw), var(--ref-space-16));",
  "--type-display-hero-line-height: var(--ref-space-16);",
  "--type-display-section-font-size: var(--ref-space-12);",
  "--type-display-section-line-height: 1.1667;",
  "--type-display-hero-font-size: var(--ref-space-16);",
];
const normalizeCssWhitespace = (value) =>
  value.replace(/\s+/gu, " ").replace(/\(\s+/gu, "(").replace(/\s+\)/gu, ")");
const normalizedCss = normalizeCssWhitespace(css);
assert(
  expectedResponsiveCss.every((declaration) =>
    normalizedCss.includes(normalizeCssWhitespace(declaration)),
  ),
  "Responsive Display CSS adapter drifted",
);

console.log(
  [
    "SAVI-71 typography registry validation PASS",
    `fontWeights=${referenceFontWeights.length}`,
    `tracking=${referenceTracking.length}`,
    `purposeLanes=${typographyPurposeLanes.length}`,
    `emphasisAliases=${typographyEmphasis.length}`,
    `familySlots=${semanticFontFamilies.length}`,
    `metricRoles=${typographyMetricRoles.length}`,
    `fixedMetricRoles=${typographyFixedMetricRoles.length}`,
    `responsiveMetricRoles=${typographyResponsiveMetricRoles.length}`,
    "numericMetrics=DIRECT_SPACE",
    "unused9and72=RETIRED",
    "size18=ABSENT",
    "cssParity=PASS",
    "defaultViewportPolicy=FIXED",
    "accessibilityScaling=REQUIRED",
    "semanticWeightRebinding=ENABLED",
    "directComponentWeight=PROHIBITED",
    "expandedTracking=RESTRICTED",
    "directComponentTracking=PROHIBITED",
    "cartesianEmphasisMatrix=ABSENT",
    "technicalLane=INSTRUMENT_SANS_12_16",
    "uiLabelBodyHeadingTechnicalDataDisplayMetrics=ADMITTED",
    "dataFamilySlot=MONO",
    "fontAdapters=GOOGLE_FONTS_ACTIVE",
    "webStorybookMonoLoader=FIRA_MONO",
    "fontFiles=NEXT_FONT_SELF_HOSTED",
    "fontLicense=GOOGLE_FONTS_UPSTREAM",
    "browserFontRequests=NONE",
    "displayMetrics=ADMITTED",
    "componentAliases=DEFERRED",
    "responsiveTypography=HERO_SECTION_ONLY",
  ].join(" "),
);
