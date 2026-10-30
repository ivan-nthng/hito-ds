const WEB_ROOT_PX = 16;

const definitions = /** @type {const} */ ([
  ["space/0", "0", 0],
  ["space/px", "px", 1, "hairline"],
  ["space/0.5", "0-5", 2],
  ["space/1", "1", 4],
  ["space/1.5", "1-5", 6],
  ["space/2", "2", 8],
  ["space/2.5", "2-5", 10],
  ["space/3", "3", 12],
  ["space/3.5", "3-5", 14],
  ["space/4", "4", 16],
  ["space/5", "5", 20],
  ["space/6", "6", 24],
  ["space/7", "7", 28],
  ["space/8", "8", 32],
  ["space/9", "9", 36],
  ["space/10", "10", 40],
  ["space/11", "11", 44],
  ["space/12", "12", 48],
  ["space/14", "14", 56],
  ["space/16", "16", 64],
  ["space/20", "20", 80],
  ["space/24", "24", 96],
  ["space/28", "28", 112],
  ["space/32", "32", 128],
  ["space/36", "36", 144],
  ["space/40", "40", 160],
  ["space/44", "44", 176],
  ["space/48", "48", 192],
  ["space/52", "52", 208],
  ["space/56", "56", 224],
  ["space/60", "60", 240],
  ["space/64", "64", 256],
  ["space/72", "72", 288],
  ["space/80", "80", 320],
  ["space/96", "96", 384],
]);

function formatRem(px) {
  return `${Number((px / WEB_ROOT_PX).toFixed(4))}rem`;
}

export const referenceSpacing = Object.freeze(
  definitions.map(([id, cssSuffix, sourcePx, definitionKind]) => {
    const kind = definitionKind ?? "space";

    return Object.freeze({
      id,
      cssVariable: `--ref-space-${cssSuffix}`,
      sourcePx,
      kind,
      webValue: sourcePx === 0 ? "0" : kind === "hairline" ? "1px" : formatRem(sourcePx),
    });
  }),
);

export const referenceSpacingById = Object.freeze(
  Object.fromEntries(referenceSpacing.map((token) => [token.id, token])),
);
