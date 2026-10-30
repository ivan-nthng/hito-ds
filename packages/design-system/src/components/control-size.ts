export const controlSizes = ["sm", "md", "lg", "xl"] as const;

export type ControlSize = (typeof controlSizes)[number];
