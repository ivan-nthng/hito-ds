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

Base: Instrument Sans. Display: Poppins. Technical: Fira Mono. Storybook self-hosts them at build time through `next/font`; consuming applications provide the same families or intentionally override the source font variables. React components do not require a Next.js application.

## Themes and content

Use `data-hito-color-scheme="light"` or `"dark"` on a container to choose appearance. Without an explicit value, the styles follow the system. Storybook also includes responsive viewport and English/Portuguese content controls.

## Figma file and mappings

The [standalone Hito DS Figma file](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS) is an exact duplicate of the source library, with node IDs preserved. File and node mappings are recorded in `figma/mapping.json` and exposed by the Storybook toolbar. Community publication and public access still require verification; an editable file link is not a Community release.

## AI-assisted implementation

Give your assistant the exported component APIs, token registry and an existing Storybook example before asking it to build a screen. Ask it to reuse components, list missing capabilities, preserve keyboard behavior and use semantic tokens. MCP can provide Figma context when configured by the consuming team. This repository does not include an MCP server or an automatic synchronization service.

## Native Code Connect

Figma rejected the native Code Connect mapping for this file because it requires an Organization or Enterprise plan. The current integration uses verified node links, source paths and token names; it does not claim a registered native Code Connect integration. No subscription changes were made.
