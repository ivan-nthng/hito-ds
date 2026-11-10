# Figma and code

Hito DS has three complementary parts:

1. **Figma:** reusable design components, their variants, properties and variable bindings.
2. **Code:** executable React components and semantic design tokens.
3. **Storybook:** rendered states, interactions, documentation and review examples.

## Update direction

The versioned token registry in `packages/design-system/tokens/registry.mjs` owns token identities, modes and aliases. `src/tokens.css` is the web adapter. Figma is the design representation; visual changes need to be reconciled with the registry and implemented in code.

A change follows this loop: agree on the component API and states → update tokens when needed → update the Figma component and React implementation → review the corresponding Storybook states → validate the changed boundary → release together.

This is an explicit maintenance workflow, not automatic two-way conversion of arbitrary Figma edits into production code.

## Fonts

Inherited preset: base Instrument Sans, display Poppins, explicit data Fira Mono. Neutral preset: base and display Instrument Sans; explicit data retains Fira Mono. Technical text uses Instrument Sans in both presets. Storybook serves vendored Latin/Latin Extended WOFF2 through its local CSS adapter, with upstream OFL licenses and provenance under `apps/storybook/src/fonts/`; consuming applications provide the same families or intentionally override the source font variables. React components do not require a Next.js application.

## Themes and content

Use `data-hito-theme="neutral"` or `"inherited"` independently of `data-hito-color-scheme="light"` or `"dark"`. Without a theme attribute consumers retain the inherited preset; without a color-scheme attribute they follow their parent/system. Storybook defaults to Neutral and has separate Theme and Color scheme controls, alongside viewport and content controls. No React props change.

## Figma file and mappings

The [standalone Hito DS Figma file](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS) is an exact duplicate of the source library, with node IDs preserved. File and node mappings are recorded in `figma/mapping.json` and exposed by the Storybook toolbar. Community publication and public access still require verification; an editable file link is not a Community release.

## Figma variable catalogue

These 44 roles name the existing variables in the customer Figma library. Use the registry IDs and CSS variables for runtime integration. Where a Figma role spans several modes, the table lists its existing runtime identifiers.

| Figma collection | Figma role | Registry IDs | CSS variables |
| --- | --- | --- | --- |
| Controls · size | Control/Corner radius | `radius/ui/sm`, `radius/ui/md`, `radius/ui/lg`, `radius/ui/xl` | `--radius-ui-lg`, `--radius-ui-md`, `--radius-ui-sm`, `--radius-ui-xl` |
| Controls · size | Control/Height | `ui/control/height/sm`, `ui/control/height/md`, `ui/control/height/lg`, `ui/control/height/xl` | `--ui-control-height-lg`, `--ui-control-height-md`, `--ui-control-height-sm`, `--ui-control-height-xl` |
| Controls · size | Icon/Size | `ui/icon/size/sm`, `ui/icon/size/md`, `ui/icon/size/lg`, `ui/icon/size/xl` | `--ui-icon-size-lg`, `--ui-icon-size-md`, `--ui-icon-size-sm`, `--ui-icon-size-xl` |
| Controls · size | Shape/Round | `radius/shape/round` | `--radius-shape-round` |
| Controls · size | Target/Minimum | `ui/interaction/target/min` | `--ui-interaction-target-min` |
| Controls · size | Text/Line height | `typography/ui/sm`, `typography/ui/md`, `typography/ui/lg`, `typography/ui/xl` | `--type-ui-lg-line-height`, `--type-ui-md-line-height`, `--type-ui-sm-line-height`, `--type-ui-xl-line-height` |
| Controls · size | Text/Size | `typography/ui/sm`, `typography/ui/md`, `typography/ui/lg`, `typography/ui/xl` | `--type-ui-lg-font-size`, `--type-ui-md-font-size`, `--type-ui-sm-font-size`, `--type-ui-xl-font-size` |
| Corners | Control/LG | `radius/ui/lg` | `--radius-ui-lg` |
| Corners | Control/MD | `radius/ui/md` | `--radius-ui-md` |
| Corners | Control/SM | `radius/ui/sm` | `--radius-ui-sm` |
| Corners | Control/XL | `radius/ui/xl` | `--radius-ui-xl` |
| Corners | Control/XS | `radius/ui/xs` | `--radius-ui-xs` |
| Fonts | Data | `font/family/mono` | `--type-family-mono` |
| Fonts | Headings | `font/family/display` | `--type-family-display` |
| Fonts | Interface | `font/family/base` | `--type-family-base` |
| Layout · density | App shell/Main padding LG | `layout/space/responsive/xs` | `--app-shell-density-main-padding`, `--layout-space-responsive-xs` |
| Layout · density | App shell/Main padding XL | `layout/space/responsive/xs` | `--app-shell-density-main-padding`, `--layout-space-responsive-xs` |
| Layout · density | Card/Comfortable padding | `component/card/padding/fixed-comfortable` | `--card-padding-fixed-comfortable` |
| Layout · density | Card/Compact padding | `component/card/padding/fixed-compact` | `--card-padding-fixed-compact` |
| Layout · density | Fieldset/Control gap | `ui/space/sm` | `--fieldset-density-control-gap`, `--ui-space-sm` |
| Layout · density | Fieldset/Group gap | `ui/space/2xl` | `--fieldset-density-group-gap`, `--ui-space-2xl` |
| Layout · viewport | Card/Responsive comfortable padding | `component/card/padding/responsive-comfortable` | `--card-padding-responsive-comfortable` |
| Layout · viewport | Card/Responsive compact padding | `component/card/padding/responsive-compact` | `--card-padding-responsive-compact` |
| Layout · viewport | Radius/Comfortable Card | `component/card/radius/responsive/comfortable` | `--card-radius-responsive-comfortable` |
| Layout · viewport | Radius/Compact Card | `component/card/radius/responsive/compact` | `--card-radius-responsive-compact` |
| Layout · viewport | Radius/Fixed 2XL | `radius/layout/fixed/2xl` | `--radius-layout-fixed-2xl` |
| Layout · viewport | Radius/Fixed LG | `radius/layout/fixed/lg` | `--radius-layout-fixed-lg` |
| Layout · viewport | Radius/Fixed MD | `radius/layout/fixed/md` | `--radius-layout-fixed-md` |
| Layout · viewport | Radius/Fixed SM | `radius/layout/fixed/sm` | `--radius-layout-fixed-sm` |
| Layout · viewport | Radius/Fixed XL | `radius/layout/fixed/xl` | `--radius-layout-fixed-xl` |
| Layout · viewport | Radius/Fixed XS | `radius/layout/fixed/xs` | `--radius-layout-fixed-xs` |
| Layout · viewport | Radius/Outer | `radius/layout/responsive/outer` | `--radius-layout-responsive-outer` |
| Layout · viewport | Spacing/Fixed 2XL | `layout/space/fixed/2xl` | `--layout-space-fixed-2xl` |
| Layout · viewport | Spacing/Fixed LG | `layout/space/fixed/lg` | `--layout-space-fixed-lg` |
| Layout · viewport | Spacing/Fixed MD | `layout/space/fixed/md` | `--layout-space-fixed-md` |
| Layout · viewport | Spacing/Fixed SM | `layout/space/fixed/sm` | `--layout-space-fixed-sm` |
| Layout · viewport | Spacing/Fixed XL | `layout/space/fixed/xl` | `--layout-space-fixed-xl` |
| Layout · viewport | Spacing/Fixed XS | `layout/space/fixed/xs` | `--layout-space-fixed-xs` |
| Layout · viewport | Spacing/Responsive 2XL | `layout/space/responsive/2xl` | `--layout-space-responsive-2xl` |
| Layout · viewport | Spacing/Responsive LG | `layout/space/responsive/lg` | `--layout-space-responsive-lg` |
| Layout · viewport | Spacing/Responsive MD | `layout/space/responsive/md` | `--layout-space-responsive-md` |
| Layout · viewport | Spacing/Responsive SM | `layout/space/responsive/sm` | `--layout-space-responsive-sm` |
| Layout · viewport | Spacing/Responsive XL | `layout/space/responsive/xl` | `--layout-space-responsive-xl` |
| Layout · viewport | Spacing/Responsive XS | `layout/space/responsive/xs` | `--layout-space-responsive-xs` |

## AI-assisted implementation

Give your assistant the exported component APIs, token registry and an existing Storybook example before asking it to build a screen. Ask it to reuse components, list missing capabilities, preserve keyboard behavior and use semantic tokens. MCP can provide Figma context when configured by the consuming team. This repository does not include an MCP server or an automatic synchronization service.

## Native Code Connect

Figma rejected the native Code Connect mapping for this file because it requires an Organization or Enterprise plan. The current integration uses verified node links, source paths and token names; it does not claim a registered native Code Connect integration. No subscription changes were made.


## Runtime theme contract

The `neutral` and `inherited` presets retain existing component APIs and CSS token identities. `packages/design-system/tokens/themes.mjs` owns the neutral overrides and is exported through `tokens/registry` and `tokens/themes`. `tokens/build-themes.mjs` generates the final theme section of `src/tokens.css`; run it after changing preset or inherited adapter values, and use `--check` to verify freshness.

Theme and color scheme are independent axes. The adapter uses `light-dark()` and CSS `@scope` to support nested boundaries. Consumers need modern CSS color and `@scope` support. Portals outside a themed subtree must receive the same theme and scheme attributes from their host. Storybook’s Neutral pilot composition exercises all four combinations; focused coverage is Chromium only.

## Identity migration

Active branding uses the original monochrome Hito wordmark and symbol from the former Runner repository. The five previous Hito-specific color families, identity aliases and `@hito-ds/react/tokens/identity-colors` export have been retired. Remove obsolete identity swatches and use the SVG assets for branding. Generic Blue, Green and the other general palettes, semantic statuses and the blue Brand remain available. Historical Figma artwork is not evidence of the current runtime identity.
