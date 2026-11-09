# Repository and identity migration

Hito DS replaced the former Runner application in a forward commit when the repository was named `ivan-nthng/hito-runner`. The active repository is now [ivan-nthng/hito-ds](https://github.com/ivan-nthng/hito-ds). The original Hito repository is archived separately at [ivan-nthng/hito-ds-legacy](https://github.com/ivan-nthng/hito-ds-legacy). The previous Runner source remains in this repository’s Git history. Its backend, environment setup and application routes are outside the design-system runtime.

The package is `@hito-ds/react`, with React components, CSS Modules and semantic tokens. It has no API compatibility claim with the former Runner application or the early Hito prototype. See the [package documentation](https://www.npmjs.com/package/@hito-ds/react) for the React package.

The original Runner monochrome logo is the active identity. The five former Hito-specific palettes and identity metadata export are retired; generic palettes and semantic statuses are retained. See [identity migration](figma-and-code.md#identity-migration).
