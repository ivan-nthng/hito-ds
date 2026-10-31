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
for (const [i] of mediaObjects.entries()) {
  const variable = `--media-object-${i + 1}-phase`;
  geometryVariables[`${i + 1}-phase`] = variable;
  geometryValues[variable] = `calc(var(--media-ambient-cycle) * -${i} / 6)`;
}
export const mediaRecipe = Object.freeze([
  parameter("background", "var(--ref-color-basic-black)", "Quiet full-page artwork base; no canonical canvas override."),
  // Exact approved source colors, scoped here because no retained reference is an exact match.
  parameter("glow-violet", "color(srgb 0.5960784314 0.3490196078 0.9450980392)", "Approved source violet, native six-object field."),
  parameter("glow-warm", "color(srgb 1 0.7254901961 0.1764705882)", "Approved source warm field; footer contrast correction retained."),
  parameter("glow-cool", "color(srgb 0 0.8078431373 0.8196078431)", "Approved source cool field."),
  Object.freeze({ ...parameter("coverage-height", "100vh", "HDS-46 revision2 composition sizer only; the document paint carrier is not viewport-clipped."), largeViewportWebValue: "100lvh", sourceTask: "HDS-46" }),
  ...[
    ["ambient-cycle", "96s", "Very slow bounded decorative movement; not UI response timing."],
    ["ambient-easing", "ease-in-out", "Zero-velocity seamless turnarounds."],
    ["ambient-shift-x", "4%", "Bounded object-relative horizontal travel."],
    ["ambient-shift-y", "3%", "Bounded object-relative vertical travel."],
    ["ambient-scale", "1.06", "Subtle transform-only breathing/morphing."],
    ["ambient-rotation", "3deg", "Small transform-only mixing rotation."],
    ["grain-cycle", "96s", "Reserved/inactive in HDS-46 revision2: grain is static, no directional translation."],
  ].map(([name,value,role]) => Object.freeze({ ...parameter(name,value,role), sourceTask: "HDS-46" })),
  parameter("field-width", "124vw", "Reference isolated field extent."),
  parameter("field-height", "144%", "HDS-46 taller/higher six-form composition, explicitly requested by Ivan.", "160%"),
  parameter("field-left", "-12vw", "Reference field crop."),
  parameter("field-bottom", "-12%", "HDS-44 source viewport-bottom overscan, independent of document height."),
  parameter("field-overhang", "0px", "HDS-44 reserved compatibility parameter; obsolete document compensation is no longer consumed."),
  Object.freeze({ ...parameter("field-blur", "clamp(44px, 7vw, 100px)", "HDS-44 exact implemented source clamp; objects remain SCREEN."), narrowWebValue: "52px" }),
  parameter("mask-start", "25%", "Revision2 top-fade paint plateau start; retained mask name for compatibility."),
  parameter("mask-end", "80%", "Revision2 top-fade paint transparent end; no alpha clip at the field boundary."),
  parameter("field-blend", "screen", "Six-object approved compositing operation."),
  parameter("warm-opacity", "0.4", "Final desktop warm objects2/3/6 footer contrast correction.", "0.8"),
  parameter("warm-third-opacity", "0.4", "Source object3 opacity on mobile.", "1"),
  parameter("warm-sixth-opacity", "0.4", "Source object6 opacity on mobile.", "0.75"),
  parameter("soft-opacity", "0.9", "Source violet/cool object opacity."),
  parameter("grain-opacity", "0.12", "Separate above-field grain overlay."),
  parameter("grain-luminance", "1", "HDS-44 source-consistent visible grain; neutral brightness."),
  parameter("grain-contrast", "1", "HDS-44 source-consistent visible grain; neutral contrast."),
  parameter("grain-size", "var(--ref-space-64)", "HDS-46 revision2 original256px static finer texture."),
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
  Object.freeze({ id: "recipe/media/field-geometry", type: "illustration-geometry", cssVariables: Object.freeze(geometryVariables), values: Object.freeze(geometryValues), role: "Bounded six-object geometry preserving source lineage, plus HDS-46 asynchronous phase aliases.", sourceTask: "HDS-41", lifecycle: "admitted" }),
]);
export function mediaRecipeCss() {
  const declarations = mediaRecipe.flatMap(p => p.cssVariable ? [`    ${p.cssVariable}: ${p.webValue};`] : Object.entries(p.values).map(([name,value]) => `    ${name}: ${value};`)).join("\n");
  const mobile = mediaRecipe.filter(p => p.mobileWebValue).map(p => `      ${p.cssVariable}: ${p.mobileWebValue};`).join("\n");
  const narrow = mediaRecipe.filter(p => p.narrowWebValue).map(p => `      ${p.cssVariable}: ${p.narrowWebValue};`).join("\n");
  const largeViewport = mediaRecipe.filter(p => p.largeViewportWebValue).map(p => `      ${p.cssVariable}: ${p.largeViewportWebValue};`).join("\n");
  return `/* HDS-41 media recipe start */\n@layer hito.tokens {\n  :root {\n${declarations}\n  }\n  @media (max-width: 64rem) {\n    :root {\n${mobile}\n    }\n  }\n  @media (max-width: 37.5rem) {\n    :root {\n${narrow}\n    }\n  }\n  @supports (height: 100lvh) {\n    :root {\n${largeViewport}\n    }\n  }\n}\n/* HDS-41 media recipe end */`;
}
