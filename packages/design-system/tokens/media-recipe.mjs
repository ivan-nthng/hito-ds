// HDS-41: one bounded illustration/media recipe, not a new palette/theme engine.
// Native sources: Hito 11312:141/369; reference 8356:20655 (implemented six SCREEN objects).
const parameter = (name, webValue, role, mobileWebValue) => Object.freeze({
  id: `recipe/media/${name}`, cssVariable: `--media-${name}`, type: "recipe-parameter",
  webValue, ...(mobileWebValue ? { mobileWebValue } : {}), role, sourceTask: "HDS-41", lifecycle: "admitted",
});
export const mediaObjects = Object.freeze([
  [72,90,70,68], [98,55,18,93], [75,100,-36,78],
  [60,60,78,92], [70,55,25,97], [45,70,-18,72],
].map(row => Object.freeze(row)));
const geometryVariables = {}, geometryValues = {};
for (const [i, row] of mediaObjects.entries()) for (const [j, axis] of ["width", "height", "left", "top"].entries()) {
  const key = `${i + 1}-${axis}`, variable = `--media-object-${key}`;
  geometryVariables[key] = variable; geometryValues[variable] = `${row[j]}%`;
}
export const mediaRecipe = Object.freeze([
  parameter("background", "var(--ref-color-basic-black)", "Quiet full-page artwork base; no canonical canvas override."),
  // Exact approved source colors, scoped here because no retained reference is an exact match.
  parameter("glow-violet", "color(srgb 0.5960784314 0.3490196078 0.9450980392)", "Approved source violet, native six-object field."),
  parameter("glow-warm", "color(srgb 1 0.7254901961 0.1764705882)", "Approved source warm field; footer contrast correction retained."),
  parameter("glow-cool", "color(srgb 0 0.8078431373 0.8196078431)", "Approved source cool field."),
  parameter("field-width", "124vw", "Reference isolated field extent."),
  parameter("field-height", "69.75vw", "Native retained field geometry at desktop/mobile."),
  parameter("field-left", "-12vw", "Reference field crop."),
  parameter("field-bottom", "-6.75vw", "Native field anchor inside retained artwork bounds."),
  parameter("field-overhang", "calc(var(--layout-space-responsive-2xl) / 2)", "Retained artwork exceeds shortened desktop root by28px/mobile16px.", "var(--layout-space-fixed-lg)"),
  parameter("field-blur", "7vw", "Approved isolated group blur; objects remain SCREEN."),
  parameter("mask-start", "25%", "Source isolated field mask transparent stop."),
  parameter("mask-end", "80%", "Source isolated field mask opaque stop."),
  parameter("field-blend", "screen", "Six-object approved compositing operation."),
  parameter("warm-opacity", "0.4", "Final desktop warm objects2/3/6 footer contrast correction.", "0.8"),
  parameter("warm-third-opacity", "0.4", "Source object3 opacity on mobile.", "1"),
  parameter("warm-sixth-opacity", "0.4", "Source object6 opacity on mobile.", "0.75"),
  parameter("soft-opacity", "0.9", "Source violet/cool object opacity."),
  parameter("grain-opacity", "0.18", "Separate above-field grain overlay."),
  parameter("grain-luminance", "0.45", "Runtime SVG calibration to approved native black+monotone NOISE; not a Figma filter property."),
  parameter("grain-contrast", "2.35", "Scoped SVG texture variance calibration; brightness precedes contrast, preserving native near-black grain."),
  parameter("grain-size", "var(--ref-space-64)", "Original256px grain tile."),
  parameter("orb-radius", "50%", "Ellipse geometry, not a UI corner token."),
  parameter("intro-column", "32rem", "Native512px desktop introduction column."),
  parameter("intro-width", "25rem", "Native400px supporting copy limit."),
  parameter("heading-width", "25rem", "Native headline phrase rhythm400/280px.", "17.5rem"),
  parameter("card-width", "28rem", "Native448px maximum; narrow fills available width."),
  parameter("card-radius", "var(--radius-layout-fixed-xl)", "User-local desktop24/mobile16; shared Card default unchanged.", "var(--radius-layout-fixed-lg)"),
  parameter("photo-radius", "var(--radius-layout-fixed-lg)", "Concentric desktop24−8=16/mobile16−8=8.", "var(--radius-layout-fixed-sm)"),
  parameter("photo-aspect", "3 / 2", "Exact approved centered photo frame."),
  parameter("body-inset", "var(--layout-space-fixed-md)", "Local desktop12/mobile16 inside native Card8.", "var(--layout-space-fixed-lg)"),
  parameter("logo-aspect", "68 / 32", "Existing native logo slot; original paths centered, not stretched."),
  parameter("dot-size", "var(--ref-space-1)", "Separate decorative metadata Dot4px."),
  parameter("live-dot-size", "var(--ref-space-1-5)", "Semantic Live dot6px."),
  parameter("live-dim", "0.45", "Approved pulse trough; label stays static."),
  parameter("live-cycle", "calc(var(--motion-duration-emphasis) * 4)", "1.92s, repeating indefinitely rather than finite Figma export."),
  parameter("live-easing", "var(--motion-easing-standard)", "Approved cubic(0.2,0,0,1)."),
  Object.freeze({ id: "recipe/media/field-geometry", type: "illustration-geometry", cssVariables: Object.freeze(geometryVariables), values: Object.freeze(geometryValues), role: "One bounded six-object coordinate recipe; percentage geometry from the verified reference.", sourceTask: "HDS-41", lifecycle: "admitted" }),
]);
export function mediaRecipeCss() {
  const declarations = mediaRecipe.flatMap(p => p.cssVariable ? [`    ${p.cssVariable}: ${p.webValue};`] : Object.entries(p.values).map(([name,value]) => `    ${name}: ${value};`)).join("\n");
  const mobile = mediaRecipe.filter(p => p.mobileWebValue).map(p => `      ${p.cssVariable}: ${p.mobileWebValue};`).join("\n");
  return `/* HDS-41 media recipe start */\n@layer hito.tokens {\n  :root {\n${declarations}\n  }\n  @media (max-width: 64rem) {\n    :root {\n${mobile}\n    }\n  }\n}\n/* HDS-41 media recipe end */`;
}
