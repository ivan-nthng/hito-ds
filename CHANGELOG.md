# Changelog

## 2026-11-10 — Figma and Storybook catalogue update

- HDS-121 simplified collection names and guidance in the editable Figma library.
- HDS-122 aligned 44 existing UI and layout roles in the editable Figma library and live Storybook. The [catalogue guide](docs/figma-and-code.md#figma-variable-catalogue) records their runtime mappings.
- HDS-126 verified 146 additional variable renames in the editable Figma library. The local Storybook source aligns the four affected labels. Live Storybook retains the HDS-122 labels, and publication of the HDS-126 names to Figma Community is paused.
- The Figma Community listing provides the published snapshot. The editable library contains the latest catalogue names. [Figma Community](https://www.figma.com/community/file/1701056607203868758/hito-design-system) · [Live Storybook](https://www.hitocajon.com/storybook/)
- The npm package remains at 0.3.0.

## 0.3.0

- DateRangePicker fits the visible months and presets, places compact date fields below the calendar, and keeps the selection announcement available to assistive technology.
- DateField and DateRangeField accept `showFormatHint` to control the built-in format hint. The picker hides it in the popup.
- Updated the package metadata to point to the [Hito repository](https://github.com/ivan-nthng/hito-ds), [Hito website](https://www.hitocajon.com/) and [issue tracker](https://github.com/ivan-nthng/hito-ds/issues).

## 0.2.0

- Removed the `@hito-ds/react/assets/hito-mark.svg` and `@hito-ds/react/assets/hub-soft-3d/*` exports. Use application-owned brand assets. `SignInPrompt` now uses the library's lock icon.
- Compiled token provenance uses opaque source identifiers. Integrate through semantic token IDs and CSS variable names.
- The package guide now links to the customer Figma library.

## 0.1.0

Initial standalone Hito DS extraction: React components, semantic tokens, foundations, patterns and Storybook. Package names and appearance controls are independent of the source product. Figma duplication and Community publication are tracked separately from the code release.
