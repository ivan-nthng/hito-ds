import type { DescriptionListProps } from "./DescriptionList";

export const facts: DescriptionListProps = { items: [{ id: "count", term: "Count", value: 0 }] };
// @ts-expect-error Stable pair identity is required to preserve value child state.
export const unstableFact: DescriptionListProps = { items: [{ term: "City", value: "São Paulo" }] };
// @ts-expect-error DescriptionList does not own container density.
export const density: DescriptionListProps = { items: [], size: "compact" };
// @ts-expect-error Interactive state belongs to an existing value child.
export const interactive: DescriptionListProps = { items: [], state: "interactive" };
