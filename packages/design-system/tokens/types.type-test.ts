import { fixedLayoutSpacing } from "@hito-ds/react/tokens/fixed-layout-spacing";
import { fixedUiSizing } from "@hito-ds/react/tokens/fixed-ui-sizing";
import { fixedUiSpacing } from "@hito-ds/react/tokens/fixed-ui-spacing";
import {
  referenceColorFamilies,
  referenceColors,
} from "@hito-ds/react/tokens/reference-colors";
import { referenceOpacity } from "@hito-ds/react/tokens/reference-opacity";
import { fullRadius } from "@hito-ds/react/tokens/radius-geometry";
import { referenceSpacing } from "@hito-ds/react/tokens/reference-spacing";
import {
  responsiveLayoutModes,
  responsiveLayoutSpacing,
} from "@hito-ds/react/tokens/responsive-layout-spacing";
import {
  fixedUiRadii,
  resolveConcentricInnerRadius,
  responsiveLayoutOuterRadius,
} from "@hito-ds/react/tokens/semantic-radii";
import { semanticTextColorRoles } from "@hito-ds/react/tokens/semantic-text-colors";
import type {
  ConcentricInnerRadiusResolution,
  FixedLayoutSpacingRole,
  FixedRadiusRole,
  FixedUiSizingRole,
  FixedUiSpacingRole,
  ReferenceColorFamily,
  ReferenceColorToken,
  ReferenceOpacityToken,
  IntrinsicRadiusToken,
  ReferenceSpacingToken,
  ResponsiveLayoutMode,
  ResponsiveLayoutSpacingRole,
  ResponsiveRadiusMode,
  ResponsiveSpacingMode,
  SemanticTextColorMode,
  SemanticTextColorRole,
} from "@hito-ds/react/tokens/types";

type IsAny<Value> = 0 extends 1 & Value ? true : false;
type AnyFieldFlags<Value> = {
  [Key in keyof Value]-?: IsAny<Value[Key]>;
}[keyof Value];
type ContainsNoAny<Value> = true extends AnyFieldFlags<Value> ? false : true;
type Expect<Condition extends true> = Condition;

export type PublicTokenTypesContainNoAny = [
  Expect<ContainsNoAny<ReferenceColorFamily>>,
  Expect<ContainsNoAny<ReferenceColorToken>>,
  Expect<ContainsNoAny<ReferenceOpacityToken>>,
  Expect<ContainsNoAny<ReferenceSpacingToken>>,
  Expect<ContainsNoAny<FixedUiSpacingRole>>,
  Expect<ContainsNoAny<FixedUiSizingRole>>,
  Expect<ContainsNoAny<FixedLayoutSpacingRole>>,
  Expect<ContainsNoAny<ResponsiveLayoutMode>>,
  Expect<ContainsNoAny<ResponsiveLayoutSpacingRole>>,
  Expect<ContainsNoAny<ResponsiveSpacingMode>>,
  Expect<ContainsNoAny<IntrinsicRadiusToken>>,
  Expect<ContainsNoAny<FixedRadiusRole>>,
  Expect<ContainsNoAny<ResponsiveRadiusMode>>,
  Expect<ContainsNoAny<ConcentricInnerRadiusResolution>>,
  Expect<ContainsNoAny<SemanticTextColorRole>>,
  Expect<ContainsNoAny<SemanticTextColorMode>>,
];

const colorFamily: ReferenceColorFamily = referenceColorFamilies[0];
const color: ReferenceColorToken = referenceColors[0];
const opacity: ReferenceOpacityToken = referenceOpacity[0];
const spacing: ReferenceSpacingToken = referenceSpacing[0];
const fixedUiSpace: FixedUiSpacingRole = fixedUiSpacing[0];
const fixedUiSize: FixedUiSizingRole = fixedUiSizing[0];
const fixedLayoutSpace: FixedLayoutSpacingRole = fixedLayoutSpacing[0];
const responsiveLayoutMode: ResponsiveLayoutMode = responsiveLayoutModes[0];
const responsiveLayoutRole: ResponsiveLayoutSpacingRole =
  responsiveLayoutSpacing[0];
const responsiveSpaceMode: ResponsiveSpacingMode =
  responsiveLayoutSpacing[0].modes.sm;
const radius: IntrinsicRadiusToken = fullRadius;
const fixedRadius: FixedRadiusRole = fixedUiRadii[0];
const responsiveRadius: ResponsiveRadiusMode =
  responsiveLayoutOuterRadius.modes.sm;
const concentricRadius: ConcentricInnerRadiusResolution =
  resolveConcentricInnerRadius({
    outerRadiusId: "radius/layout/fixed/xl",
    insetSpacingId: "space/1.5",
    borderWidthId: "border/width/1",
  });
const semanticTextRole: SemanticTextColorRole = semanticTextColorRoles[0];
const semanticTextMode: SemanticTextColorMode = {
  referenceId: "color/neutral/950",
  resolvedWebValue: "#201E23",
};

void colorFamily;
void color;
void opacity;
void spacing;
void fixedUiSpace;
void fixedUiSize;
void fixedLayoutSpace;
void responsiveLayoutMode;
void responsiveLayoutRole;
void responsiveSpaceMode;
void radius;
void fixedRadius;
void responsiveRadius;
void concentricRadius;
void semanticTextRole;
void semanticTextMode;

// @ts-expect-error Radius identifiers are strings, never numbers.
const invalidFixedRadiusId: FixedRadiusRole["id"] = 123;
// @ts-expect-error Semantic color references are token identifiers.
const invalidTextReference: SemanticTextColorMode["referenceId"] = 123;
// @ts-expect-error Spacing kind is the admitted space/hairline union.
const invalidSpacingKind: ReferenceSpacingToken["kind"] = "invalid-kind";
// @ts-expect-error Opaque semantic color roles require both light and dark modes.
const missingSemanticTextModes: Extract<
  SemanticTextColorRole,
  { modes: unknown }
>["modes"] = {};
// @ts-expect-error Opacity tokens are not color tokens.
const opacityAsColor: ReferenceColorToken = referenceOpacity[0];
// @ts-expect-error Resolved spacing source values are numeric.
const invalidResolvedSpacing: ResponsiveSpacingMode["resolvedSourcePx"] =
  "16";

void invalidFixedRadiusId;
void invalidTextReference;
void invalidSpacingKind;
void missingSemanticTextModes;
void opacityAsColor;
void invalidResolvedSpacing;
