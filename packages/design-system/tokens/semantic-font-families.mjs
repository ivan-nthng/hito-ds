const familyDefinitions = [
  {
    id: "font/family/base",
    cssVariable: "--type-family-base",
    sourceCssVariable: "--font-hito-base-source",
    preferredFamily: "Instrument Sans",
    figmaAdapterFamily: "Instrument Sans",
    webFallbacks: Object.freeze([
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ]),
  },
  {
    id: "font/family/display",
    cssVariable: "--type-family-display",
    sourceCssVariable: "--font-hito-display-source",
    preferredFamily: "Poppins",
    figmaAdapterFamily: "Poppins",
    webFallbacks: Object.freeze([
      'var(--font-hito-base-source, "Instrument Sans")',
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "sans-serif",
    ]),
  },
  {
    id: "font/family/mono",
    cssVariable: "--type-family-mono",
    sourceCssVariable: "--font-hito-mono-source",
    preferredFamily: "Fira Mono",
    figmaAdapterFamily: "Fira Mono",
    webFallbacks: Object.freeze([
      "ui-monospace",
      '"SFMono-Regular"',
      "Menlo",
      "Monaco",
      "Consolas",
      '"Liberation Mono"',
      "monospace",
    ]),
  },
];

export const semanticFontFamilies = Object.freeze(
  familyDefinitions.map((definition) =>
    Object.freeze({
      ...definition,
      webValue: [
        `var(${definition.sourceCssVariable}, "${definition.preferredFamily}")`,
        ...definition.webFallbacks,
      ].join(", "),
      identityStatus: "active-replaceable-adapter",
      source: "google-fonts-via-next-font",
    }),
  ),
);

export const semanticFontFamiliesById = Object.freeze(
  Object.fromEntries(semanticFontFamilies.map((family) => [family.id, family])),
);

export const semanticFontFamilyPolicy = Object.freeze({
  canonicalOwner: "frontend-registry",
  preferredFamilies: "ivan-accepted-google-font-adapters",
  rejectedLegacyFamilies: Object.freeze(["Inter", "Roboto Mono"]),
  actualFontFiles: "next-font-google-build-assets",
  licenseEvidence: "google-fonts-upstream",
  automaticFontFetch: "next-font-build-time-only",
  browserExternalRequest: "none",
  fallbackRequired: true,
  directComponentFamilyValue: "prohibited",
  familyReplacement: "rebind-semantic-slot-without-changing-metric-role-ids",
  figmaDirection: "downstream-adapter-only",
});
