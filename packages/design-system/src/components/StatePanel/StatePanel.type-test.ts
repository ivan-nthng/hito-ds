import type { StatePanelProps } from "./StatePanel";

export const headingLevels: NonNullable<StatePanelProps["titleAs"]>[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
// @ts-expect-error StatePanel titles must retain native heading semantics.
export const nonHeading: StatePanelProps["titleAs"] = "div";
