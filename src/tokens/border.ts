export const border = {
  rounded: {
    sm: "space/1", // 4px
    md: "space/1.5", // 6px
    lg: "space/2", // 8px
    xl: "space/2.5", // 10px
  },
} as const;

// Size-specific border radius mapping
export const sizeBorderRadius = {
  sm: "space/1", // 4px
  md: "space/1.5", // 6px
  lg: "space/2", // 8px
  xl: "space/2.5", // 10px
} as const;

export type BorderRadiusToken = keyof typeof sizeBorderRadius;
