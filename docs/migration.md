# Repository and identity migration

Hito DS now occupies `ivan-nthng/hito-runner`, replacing the former Runner application in a forward commit. The previous Runner source remains in this repository’s Git history. Its backend, environment setup and application routes are outside the design-system runtime.

The package is `@hito-ds/react`, with React components, CSS Modules and semantic tokens. It has no API compatibility claim with the former Runner application or the early Hito prototype. There is no npm registry release yet; see the root README for source consumption.

The original Runner monochrome logo is the active identity. The five former Hito-specific palettes and identity metadata export are retired; generic palettes and semantic statuses are retained. See [identity migration](figma-and-code.md#identity-migration).
