export const colorScaleSteps = Object.freeze(
  /** @type {const} */ ([
    50,
    100,
    200,
    300,
    400,
    500,
    600,
    700,
    800,
    900,
    950,
    1000,
  ]),
);

/**
 * @typedef {readonly [step: number, value: string, provenance: string]}
 * ColorAnchorDefinition
 */
/**
 * @typedef {{
 *   id: string;
 *   displayName: string;
 *   values: readonly string[];
 *   anchors: readonly ColorAnchorDefinition[];
 *   sourceTask?: string;
 * }} ColorFamilyDefinition
 */

/** @type {readonly ColorFamilyDefinition[]} */
const familyDefinitions = [
  {
    id: "neutral",
    displayName: "Neutral",
    values: [
      "#F6F3EE",
      "#F0EAE5",
      "#E3D8D6",
      "#CAC1C8",
      "#B0A8B0",
      "#948C96",
      "#79717B",
      "#615B63",
      "#4B464D",
      "#353138",
      "#201E23",
      "#0E0C0F",
    ],
    anchors: [
      [50, "#F6F3EE", "accepted visual-reference background"],
      [700, "#615B63", "accepted visual-reference foreground"],
    ],
  },
  {
    id: "blue",
    displayName: "Blue",
    values: [
      "#EDF7FE",
      "#DAEEFE",
      "#BBE0FE",
      "#91CFFE",
      "#62BDFE",
      "#12ABFE",
      "#0690DE",
      "#0373B9",
      "#005894",
      "#013E6F",
      "#012950",
      "#001630",
    ],
    anchors: [[500, "#12ABFE", "accepted visual-reference sky blue"]],
  },
  {
    id: "green",
    displayName: "Green",
    values: [
      "#F2FDF2",
      "#E1F9E1",
      "#C3F4C5",
      "#95E89E",
      "#61D779",
      "#2FBC56",
      "#279C47",
      "#177531",
      "#16612D",
      "#134924",
      "#092913",
      "#031107",
    ],
    anchors: [[500, "#2FBC56", "Ivan-accepted Hito DS green"]],
    sourceTask: "SAVI-102",
  },
  {
    id: "red",
    displayName: "Red",
    values: [
      "#FFF4F4",
      "#FFE6E5",
      "#FFCFCD",
      "#FFAAA8",
      "#FF7A7A",
      "#F94047",
      "#D62B32",
      "#B01E25",
      "#8F0D1B",
      "#6D1119",
      "#3F060B",
      "#1E0305",
    ],
    anchors: [[500, "#F94047", "Ivan-accepted Hito DS red"]],
    sourceTask: "SAVI-102",
  },
  {
    id: "orange",
    displayName: "Orange",
    values: [
      "#FFF3E6",
      "#FFE6D0",
      "#FFD0AC",
      "#FEB989",
      "#FFA064",
      "#F6843C",
      "#DC6414",
      "#B84B03",
      "#933700",
      "#6D2602",
      "#4B1A07",
      "#2D0D03",
    ],
    anchors: [[500, "#F6843C", "accepted visual-reference orange"]],
  },
  {
    id: "brand",
    displayName: "Corporate / Brand",
    values: [
      "#FEF3E7",
      "#FDE7CF",
      "#FED6AD",
      "#FEC589",
      "#FBB367",
      "#F4A34B",
      "#D88015",
      "#B26402",
      "#8B4B04",
      "#693602",
      "#4B2506",
      "#2F1502",
    ],
    anchors: [[500, "#F4A34B", "Ivan-accepted corporate color"]],
  },
  {
    id: "pink",
    displayName: "Pink",
    values: [
      "#FEF1F7",
      "#FEE2EF",
      "#FFCEE5",
      "#FEAFD7",
      "#EF91C6",
      "#DA72B2",
      "#C1569E",
      "#A24287",
      "#81336E",
      "#602654",
      "#411B3A",
      "#270E22",
    ],
    anchors: [[300, "#FEAFD7", "accepted visual-reference pink"]],
  },
  {
    id: "yellow",
    displayName: "Yellow",
    values: [
      "#FEF8E6",
      "#FFF1CD",
      "#FEE29F",
      "#FCD271",
      "#FDC43F",
      "#FEBB05",
      "#D49807",
      "#AD7707",
      "#865903",
      "#643E00",
      "#452903",
      "#281601",
    ],
    anchors: [[500, "#FEBB05", "accepted visual-reference yellow"]],
  },
];

/** @type {readonly (readonly [id: string, cssSuffix: string, value: string])[]} */
const basicDefinitions = [
  ["color/basic/white", "basic-white", "#FFFFFF"],
  ["color/basic/black", "basic-black", "#000000"],
];

/** @param {ColorAnchorDefinition} definition */
function freezeAnchor([step, value, provenance]) {
  return Object.freeze({ step, value, provenance });
}

export const referenceColorFamilies = Object.freeze(
  familyDefinitions.map((definition) => {
    const anchors = Object.freeze(definition.anchors.map(freezeAnchor));
    const anchorByStep = new Map(anchors.map((anchor) => [anchor.step, anchor]));
    const tokens = Object.freeze(
      colorScaleSteps.map((step, index) =>
        Object.freeze({
          id: `color/${definition.id}/${step}`,
          type: "color",
          family: definition.id,
          step,
          value: definition.values[index],
          cssVariable: `--ref-color-${definition.id}-${step}`,
          webValue: definition.values[index],
          anchor: anchorByStep.get(step) ?? null,
          sourceTask: definition.sourceTask ?? "SAVI-70",
          lifecycle: "admitted",
        }),
      ),
    );

    return Object.freeze({
      id: `color/${definition.id}`,
      family: definition.id,
      displayName: definition.displayName,
      steps: colorScaleSteps,
      anchors,
      tokens,
      sourceTask: definition.sourceTask ?? "SAVI-70",
      lifecycle: "admitted",
    });
  }),
);

export const referenceBasicColors = Object.freeze(
  basicDefinitions.map(([id, cssSuffix, value]) =>
    Object.freeze({
      id,
      type: "color",
      family: "basic",
      step: id.endsWith("/white") ? "white" : "black",
      value,
      cssVariable: `--ref-color-${cssSuffix}`,
      webValue: value,
      anchor: null,
      sourceTask: "SAVI-70",
      lifecycle: "admitted",
    }),
  ),
);

export const referenceColors = Object.freeze([
  ...referenceColorFamilies.flatMap((family) => family.tokens),
  ...referenceBasicColors,
]);

export const referenceColorFamiliesById = Object.freeze(
  Object.fromEntries(referenceColorFamilies.map((family) => [family.id, family])),
);

export const referenceColorsById = Object.freeze(
  Object.fromEntries(referenceColors.map((token) => [token.id, token])),
);
