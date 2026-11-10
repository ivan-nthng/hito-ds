<p align="left"><img src="docs/hito-wordmark.svg" width="240" alt="Hito DS" /></p>

# Design it. Build it. Keep it together.

Hito DS connects a Figma library, reusable React components and a working Storybook. It comes from building real products: dense workspaces, forms, data tables and the small interactions that make them usable.

**[Hito DS](https://www.hitocajon.com/)** · **[Explore Storybook](https://www.hitocajon.com/storybook/)** · **[Figma Community](https://www.figma.com/community/file/1701056607203868758/hito-design-system)** · **[How design and code connect](docs/figma-and-code.md)**

**Status: alpha.** See [verification notes](docs/verification.md) before adopting.

## What’s inside

- A complete React component library with CSS Modules and semantic CSS custom properties.
- Foundations for color, typography, spacing, sizing, radius, elevation and motion.
- Light/dark appearance, responsive examples, keyboard interaction and reduced-motion behavior.
- Interactive Storybook examples with English/Portuguese and short/long content profiles.
- Figma references alongside components, token validation and interaction tests.

Hito DS is a standalone open-source design system for adaptation to different products. Product-specific backend services and business records are outside its scope. Test the components in your consuming application before adopting them.

## Run locally

Use Node.js 24 and npm.

```sh
npm ci
npm run dev --workspace=@hito-ds/site
```

The site dev server prints its local URL. Run `npm run storybook` for the separate component explorer at http://localhost:6006.

`npm run build` produces the combined static site in `output/public-site`: the landing at `/` and the complete Storybook at `/storybook/`. `npm run verify:site` checks that real combined artifact, including links, demo interactions, local assets and missing-file responses. Browser checks need the existing Playwright Chromium installation (`npx playwright install chromium`).

## Use the components

Install the React package with `npm install @hito-ds/react`. See [package documentation](https://www.npmjs.com/package/@hito-ds/react) for the application and Storybook setup.

```tsx
import '@hito-ds/react/tokens.css';
import '@hito-ds/react/base.css';
import { Button } from '@hito-ds/react/components';

export function SaveAction() {
  return <Button intent="neutral" variant="primary" onClick={() => console.log('save')}>Save changes</Button>;
}
```

The landing demonstrates a local media session using public Hito components. See [media recipe and behavior](docs/media-landing.md).

See [integration guidance](docs/figma-and-code.md) for fonts, themes, token ownership and the maintenance workflow.

## Checks

```sh
npm run typecheck
npm test
npm run validate:tokens
npm run test:stories
npm run build
npm run verify:site
```

The tests and examples make behavior reviewable; they do not replace testing in the consuming product.

## Repository migration

This repository now hosts Hito DS in place of the former Runner application. Its history is preserved. See [migration notes](docs/migration.md).

## License

Code and original design-system assets: [MIT](LICENSE). Third-party glyphs, fonts and marks retain their own terms; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The MIT license does not grant rights to third-party trademarks.
