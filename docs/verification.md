# Verification — 0.1 alpha

The standalone extraction passes TypeScript checks, all 503 unit tests, semantic-token validation and the static Storybook build.

An initial browser run covered 728 checks across light/English and dark/narrow/Portuguese contexts: 662 passed, 66 failed. One failure was the new welcome page’s palette ARIA role and has been corrected. The remaining inherited failures include accessible-name checks for abbreviated labels, exact geometry assertions for Dialog/Radius, a stale icon count and interaction fixtures for ValuePicker and EditableValue. These require review before a stable release; do not interpret passing unit tests as full accessibility or Figma parity certification.

Product application portals, backend services, credentials and live business records were excluded. The complete shared design-system Storybook was retained, including engineering regression examples.

The source Figma duplicate contained 64 pages; a Getting Started page has been added. All six variable collections were preserved. Original node IDs are retained. Linking is explicit; no automatic two-way synchronization service is implemented. Community publication is tracked separately.
