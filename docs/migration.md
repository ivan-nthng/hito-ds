# Replacing the original Hito prototype

This version replaces the early Tailwind-based Hito DS prototype with the standalone design system extracted from Saavi. The previous implementation remains available in Git history at commit `88654a85dd7eb28b6cc58acb28848ba608f96e84`; no history or branches are rewritten.

The new component API, CSS Modules and semantic token registry are a major structural change. Existing consumers should evaluate and migrate intentionally. The package is now `@hito-ds/react`; there is no backwards-compatibility claim with the prototype.
