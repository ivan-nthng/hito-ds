# Verification — 0.1 alpha

The current source passes workspace TypeScript checks, 503 unit tests, token validation and the static Storybook build. Focused foundation browser checks cover the neutral theme and monochrome identity in Chromium, including light/desktop and dark/narrow contexts.

Earlier full-library browser coverage reported inherited failures in accessible names, geometry assertions, icon counts and interaction fixtures. These remain a limitation before a stable release. Passing focused checks is not a full accessibility, cross-browser or Figma parity certification. Safari, Firefox and screen-reader sessions are not certified.

Examples use synthetic data. Product portals, backend services, credentials and business records are excluded. Figma linking is explicit and maintained manually; no automatic synchronization or Community publication is claimed.

Run `npm run check` and relevant `npm run test:stories -- <story file>` checks for changes. The existing production site serves static Storybook from `apps/storybook/storybook-static`; `vercel.json` records its build configuration.
