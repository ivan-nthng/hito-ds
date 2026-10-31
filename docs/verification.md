# Verification — 0.1 alpha

The current source passes workspace TypeScript checks, 514 unit tests, token validation and the combined landing/Storybook build. Focused foundation browser checks cover the neutral theme and monochrome identity in Chromium, including light/desktop and dark/narrow contexts.

Earlier full-library browser coverage reported inherited failures in accessible names, geometry assertions, icon counts and interaction fixtures. These remain a limitation before a stable release. Passing focused checks is not a full accessibility, cross-browser or Figma parity certification. Safari, Firefox and screen-reader sessions are not certified.

Examples use synthetic data. Product portals, backend services, credentials and business records are excluded. Figma linking is explicit and maintained manually; no automatic synchronization or Community publication is claimed.

Run `npm run check` and relevant `npm run test:stories -- <story file>` checks for changes. The combined build serves the native landing at `/` and static Storybook at `/storybook/` from `output/public-site`; `vercel.json` records its build configuration. `npm run verify:site` checks the actual combined artifact with ordinary directory hosting and real missing-file 404 responses. Hosting-specific slash and production routes are verified separately at release.
