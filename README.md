<p align="left"><img src="docs/hito-wordmark.svg" width="240" alt="Hito DS" /></p>

# Design it. Build it. Keep it together.

Hito DS connects a Figma library, reusable React components and a working Storybook. It comes from building real products: dense workspaces, forms, data tables and the small interactions that make them usable.

**[Explore Storybook](https://ivan-nthng.github.io/hito-ds/)** · **[Figma library](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS)** · **[How design and code connect](docs/figma-and-code.md)** · **[Implementation services](docs/implementation.md)**

**Status: alpha.** See [verification notes](docs/verification.md) before adopting.

## What’s inside

- A complete React component library with CSS Modules and semantic CSS custom properties.
- Foundations for color, typography, spacing, sizing, radius, elevation and motion.
- Light/dark appearance, responsive examples, keyboard interaction and reduced-motion behavior.
- Interactive Storybook examples with English/Portuguese and short/long content profiles.
- Figma references alongside components, token validation and interaction tests.

This is a standalone extraction of the shared design system developed for Saavi. Product portals, backend services, environment configuration and business records are outside this repository. The system is a starting point to adapt to your product, not a claim that every component fits every use case.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run storybook
```

Storybook starts on http://localhost:6006. `npm run build` produces the static site in `apps/storybook/storybook-static`.

## Use the components

The package is included in this workspace as `@hito-ds/react`. There is no npm registry release yet. To consume it in another application, add the package from a local checkout or vendor the source and configure your bundler for TypeScript and CSS Modules.

```tsx
import '@hito-ds/react/tokens.css';
import '@hito-ds/react/base.css';
import { Button } from '@hito-ds/react/components';

export function SaveAction() {
  return <Button intent="neutral" variant="primary" onClick={() => console.log('save')}>Save changes</Button>;
}
```

See [integration guidance](docs/figma-and-code.md) for fonts, themes, token ownership and the maintenance workflow.

## Checks

```sh
npm run typecheck
npm test
npm run validate:tokens
npm run test:stories
npm run build
```

The tests and examples make behavior reviewable; they do not replace testing in the consuming product.

## Need this in your team?

I help teams audit their existing UI, align Figma and frontend components, build Storybook documentation and introduce the system into a working product. [See the implementation offer](docs/implementation.md).

Created by [Ivan Cheremisin](https://www.cheremisin.co.uk/), Product Designer & Design Engineer.

## Previous Hito prototype

This release replaces the early prototype. See [migration notes](docs/migration.md); its history is preserved.

## License

Code and original design-system assets: [MIT](LICENSE). Third-party glyphs, fonts and marks retain their own terms; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The MIT license does not grant rights to third-party trademarks.
