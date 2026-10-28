type ReferenceColors = typeof import("./reference-colors.mjs");
type ReferenceOpacity = typeof import("./reference-opacity.mjs");
type ReferenceSpacing = typeof import("./reference-spacing.mjs");
type FixedUiSpacing = typeof import("./fixed-ui-spacing.mjs");
type FixedUiSizing = typeof import("./fixed-ui-sizing.mjs");
type FixedLayoutSpacing = typeof import("./fixed-layout-spacing.mjs");
type ResponsiveLayoutSpacing = typeof import("./responsive-layout-spacing.mjs");
type RadiusGeometry = typeof import("./radius-geometry.mjs");
type SemanticRadii = typeof import("./semantic-radii.mjs");
type SemanticTextColors = typeof import("./semantic-text-colors.mjs");

export type ReferenceColorFamily =
  ReferenceColors["referenceColorFamilies"][number];
export type ReferenceColorToken =
  ReferenceColors["referenceColors"][number];
export type ReferenceOpacityToken =
  ReferenceOpacity["referenceOpacity"][number];
export type ReferenceSpacingToken =
  ReferenceSpacing["referenceSpacing"][number];
export type FixedUiSpacingRole =
  FixedUiSpacing["fixedUiSpacing"][number];
export type FixedUiSizingRole = FixedUiSizing["fixedUiSizing"][number];
export type FixedLayoutSpacingRole =
  FixedLayoutSpacing["fixedLayoutSpacing"][number];
export type ResponsiveLayoutMode =
  ResponsiveLayoutSpacing["responsiveLayoutModes"][number];
export type ResponsiveLayoutSpacingRole =
  ResponsiveLayoutSpacing["responsiveLayoutSpacing"][number];
export type ResponsiveSpacingMode =
  ResponsiveLayoutSpacingRole["modes"][string];
export type IntrinsicRadiusToken = RadiusGeometry["fullRadius"];
export type RadiusScaleToken = RadiusGeometry["radiusScale"];
export type SelectionPanelRadiusToken =
  typeof import("./component-radii.mjs")["selectionPanelRadii"][number];
export type FixedRadiusRole =
  | SemanticRadii["fixedUiRadii"][number]
  | SemanticRadii["fixedLayoutRadii"][number];
export type ResponsiveRadiusMode =
  SemanticRadii["responsiveLayoutOuterRadius"]["modes"][string];
export type ConcentricInnerRadiusResolution = Pick<
  ReturnType<SemanticRadii["resolveConcentricInnerRadius"]>,
  | "idealSourcePx"
  | "innerReferenceId"
  | "opticalCompensationApplied"
  | "opticalCompensationSourcePx"
  | "resolvedInnerSourcePx"
>;
export type SemanticTextColorRole =
  SemanticTextColors["semanticTextColorRoles"][number];
export type SemanticTextColorMode = Extract<
  SemanticTextColorRole,
  { readonly modes: unknown }
>["modes"]["light" | "dark"];
