# Changelog

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
