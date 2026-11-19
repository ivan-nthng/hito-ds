# Install and update

Use the compiled ESM npm package in a React application. The verified consumer baseline is Node.js 24, `@hito-ds/react` **0.3.1**, React/React DOM **19.2.8**, TypeScript **5.9.3** and Vite **8.2.2**. Inspect the installed exports/types; the repository source version and hosted Storybook are not package-version certificates. [npm package](https://www.npmjs.com/package/@hito-ds/react)

## Manual setup

For agent assistance, send the [copyable request](../README.md#install-and-start-setup) and follow the [canonical guide](ai.md#agent-assisted-setup). Ordinary npm installation starts no conversation. When your agent installs Hito, it verifies app/CSS wiring, reports that result and continues directly to unanswered theme questions. Existing preferences and skips are preserved; installation, wiring and applied theme outcomes are separate results.

For an empty app, copy the existing [consumer template](../examples/consumer-storybook/README.md) to a new directory, including `.storybook/`. An existing app should use its [additive integration instructions](../examples/consumer-storybook/README.md#existing-application--storybook), preserving providers, stories, framework and lockfile. You can read these documents online without cloning; copying the template is only one empty-app route.

In the consumer directory, using Node24:

```sh
npm install @hito-ds/react@0.3.1 --save-exact --ignore-scripts --no-audit --no-fund
npm run typecheck
npm run build
npm run build-storybook
npm run dev -- --port 5173
```

In a second terminal in that directory:

```sh
npm run storybook
```

Open the app at http://127.0.0.1:5173 and local Storybook at http://localhost:6006 (App / Example). These are **consumer-template commands**, not commands to run in the library repository. Existing applications retain their own equivalent scripts.

Import `@hito-ds/react/styles.css` once through the shared application stylesheet. Both targets must resolve one physical installed compiled package and import the same `src/theme-config.ts`, `src/font-registration.ts` and `src/global.css`. Use `--color-surface-canvas` for the page canvas. Do not alias library source or modify node_modules. The app type check uses `skipLibCheck: false`; the separate Storybook check retains `true` for existing Storybook10.6.0 declaration issues under TypeScript5.9.3. No installed declarations are patched. Other frameworks, SSR/RSC, CommonJS and other tool versions are outside this proof.

## Shared application config

Edit the one existing app-owned version1 `ThemeConfig`, retaining unrelated nested selections. For example:

```ts
import type { ThemeConfig } from '@hito-ds/react/theme-config';
export const themeConfig = {
  version: 1, preset: 'neutral', scheme: 'light',
  colors: { primary: '#6D28D9' },
  geometry: { radius: 1.25, density: 'compact' },
  fonts: {},
} satisfies ThemeConfig;
```

Use installed `resolveThemeConfig(candidate)` locally **before writing**. It returns `{ ok: true, config }` or `{ ok: false, code, reason }`; reject invalid colors/unknown fields without changing files. The resolver checks shape, not loaded fonts or rendered safety. Keep explicit preferences separately from expanded defaults: a config is a complete selection, not a patch. Omitted settings resolve to neutral/system/radius1/default density/empty fonts and fills; omission is not permission to erase an existing explicit choice.

The template's shared `ThemeRuntime` owns one `createThemeConfigController(document.documentElement, { fontReady })` and disposes it on unmount. Do not add a second root owner or standalone axis controllers. Runtime `apply` exposes schema `accepted`, settled `ok`, per-request `outcomes` and `snapshot`; inspect requested/applied/status/reason before claiming success. Reset/dispose restore owned originals; source-config restoration resets both hosts on reload. Story args remain transient and never save theme settings.

## Primary palette

Primary accepts opaque sRGB HEX6. The installed generator maps the seed into a palette; rendered Button paint need not equal the seed. In the verified #6D28D9 example the light600 Button paint is #7942EE. Inspect `primaryReport`, validation pairs and the actual composition. Runtime contrast refusal keeps the last valid primary; valid JSON alone does not mean applied paint. Keep returned provenance with persisted choices; a seed alone is not a cross-version certificate. Theme/preset and light/dark/system remain independent.

## Shared secondary

The installed schema is `colors.secondary: { enabled: true, seed: '#…' }`; explicit off is `{ enabled: false, seed: null }`. Skip preserves existing intent. Enabled secondary has stable-neutral eligibility and bootstrap requirements; do not assume an arbitrary root/preset is eligible. Using the **same controller**, establish and await/check a neutral baseline with secondary off before applying a full enabled-secondary config when needed. Guard cleanup so a disposed controller cannot issue another apply. The unchanged copyable template demonstrates the primary path and does not automatically perform this secondary bootstrap. Check installed types and actual secondary report; do not report unsupported/refused settings as applied. Linked surface tint has separate dependencies and is not silently cleared when secondary changes.

## Public radius and layout density

For 0.3.1, radius multipliers are Sharper `0.75`, Default `1`, Softer `1.25`; density is `compact/default/spacious`. Density applies to supported layout recipes, not all controls/type/reference spacing. The verified responsive compact Card changes padding from 12/20 px to 10/16 px at 390/1440 px; Softer yields a 7.5 px primary Button radius. Inspect actual supported compositions rather than scaling all namespaces. Do not double-scale derived concentric radii or assume arbitrary nested Cards are solved automatically.

## Add licensed application fonts

The template has no bundled font registrations. Preset family names are fallback choices, not proof of downloaded/loaded faces. Keep licensed files and provenance in the app, never node_modules. For an actual Instrument Sans normal Latin variable face400–700, put the file in `public/fonts/` and add this row to the existing `fontFaces` array in `src/font-registration.ts`:

```ts
{ family: 'Instrument Sans', url: '/fonts/instrument-sans-latin-400-700.woff2', weight: '400 700',
  coverage: { weights: [400, 500, 600, 700], scripts: ['latin'] } }
```

Set only the selected slot in shared config:

```ts
fonts: {
  base: { family: 'Instrument Sans',
    coverage: { weights: [400, 500, 600, 700], scripts: ['latin'] },
    source: { kind: 'woff2', url: '/fonts/instrument-sans-latin-400-700.woff2' } },
},
```

The existing readiness binding registers and loads the actual FontFace objects, verifies declared requested coverage and returns readiness. Static faces need separate real file/weight rows. Do not declare missing weights/scripts, mono600 or tabular numerals from a Latin400–700 sample. Keep the same registration/public font directory in app and Storybook.

## Runtime font selection

Inspect installed `getThemeFontDefaults(preset)`. Neutral base is Instrument Sans; omitted neutral display follows the resolved base; mono defaults to Fira Mono. Inherited explicit display uses Poppins. Empty slots remain preset defaults with no separate loaded-face claim.

Explicit `fonts.base/display/mono` settings contain `family`, declared `coverage` and optional `requires/source`; actual readiness callbacks belong separately in `bindings.fontReady`, never JSON. Source metadata alone loads nothing. Missing readiness/coverage or failed loading is fallback/unsupported with its reason, not applied. Use the existing binding and truthful licensed normal styles/weights/scripts; do not replace registrations merely to make a check pass.

A Google family/catalog link needs actual requested CSS/styles, e.g. Poppins400/500/600/700 via `https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap`. A provider URL is not a font family. The app loads provider CSS and verifies actual registered faces; the template's local-file manifest does not parse that CSS. Adobe requires the user's existing Web Project embed CSS and its family/style metadata, not a catalog page. Ask one precise follow-up for a missing source and mark the slot pending; continue independent settings. Do not rehost Adobe binaries, create accounts/projects or change credentials. [Google CSS2](https://developers.google.com/fonts/docs/css2) · [Adobe embedding](https://helpx.adobe.com/fonts/web/introduction/add-fonts-website.html). Live provider loading was not part of the proof; registered licensed local faces were.

## Consumer-local Storybook and updates

The [existing template](../examples/consumer-storybook/README.md) imports the actual app Example into its story and uses the same runtime/config/fonts/CSS. Preserve existing stories/decorators/providers on integration. Confirm real font/color/geometry outcomes and a synthetic interaction in both hosts at narrow/wide widths. An inherited `fills` selection with no registered target remains unsupported with its report; preserving it does not mean applying it. This workflow introduces no installer, CLI, postinstall, service or persistence format.

Before updating, retain the matching package/lock, shared config, registrations and application inputs as a checkpoint. Install an explicitly selected version with `npm install @hito-ds/react@<version> --save-exact --ignore-scripts`, then run the same consumer types/builds and inspect both hosts. Review that installed release's exports/types and migration notes rather than assuming source parity. To roll back, restore the previous dependency declaration **and matching lockfile/config/registration checkpoint**, run `npm ci --ignore-scripts --no-audit --no-fund`, rebuild and inspect both. Do not claim a lock/config mismatch is a valid rollback.

## Storybook and Figma

[Hosted Storybook](https://www.hitocajon.com/storybook/) may differ from the installed package; local Storybook uses your installed version. [Figma Community](https://www.figma.com/community/file/1701056607203868758/hito-design-system) provides a published snapshot; [design/code guidance](figma-and-code.md) describes its boundaries. Package installation grants no Figma access and does not sync designs or load remote fonts. No full package/hosted/Figma parity, universal accessibility or all-browser/font guarantee follows from this consumer proof.
