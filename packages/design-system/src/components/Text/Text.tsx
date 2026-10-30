import { createElement, type HTMLAttributes } from "react";
import { classNames } from "../class-names";
import styles from "./Text.module.css";

export const textVariants = [
  "ui-sm",
  "ui-md",
  "ui-lg",
  "ui-xl",
  "label-sm",
  "label-base",
  "label-lg",
  "label-eyebrow",
  "body-sm",
  "body-base",
  "body-md",
  "body-lg",
  "heading-sm",
  "heading-base",
  "heading-md",
  "heading-lg",
  "heading-xl",
  "technical-sm",
  "data-sm",
  "data-base",
  "data-lg",
  "display-hero",
  "display-section",
  "display-subtitle",
  "display-eyebrow",
] as const;

export type TextVariant = (typeof textVariants)[number];
export type TextEmphasis = "bold" | "medium" | "regular" | "strong";
export type TextElement =
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "small"
  | "span"
  | "strong";

export type TextProps = Omit<HTMLAttributes<HTMLElement>, "color"> & {
  as?: TextElement;
  emphasis?: TextEmphasis;
  variant?: TextVariant;
};

const variantClasses: Record<TextVariant, string> = {
  "ui-sm": styles.uiSm,
  "ui-md": styles.uiMd,
  "ui-lg": styles.uiLg,
  "ui-xl": styles.uiXl,
  "label-sm": styles.labelSm,
  "label-base": styles.labelBase,
  "label-lg": styles.labelLg,
  "label-eyebrow": styles.labelEyebrow,
  "body-sm": styles.bodySm,
  "body-base": styles.bodyBase,
  "body-md": styles.bodyMd,
  "body-lg": styles.bodyLg,
  "heading-sm": styles.headingSm,
  "heading-base": styles.headingBase,
  "heading-md": styles.headingMd,
  "heading-lg": styles.headingLg,
  "heading-xl": styles.headingXl,
  "technical-sm": styles.technicalSm,
  "data-sm": styles.dataSm,
  "data-base": styles.dataBase,
  "data-lg": styles.dataLg,
  "display-hero": styles.displayHero,
  "display-section": styles.displaySection,
  "display-subtitle": styles.displaySubtitle,
  "display-eyebrow": styles.displayEyebrow,
};

const emphasisClasses: Record<TextEmphasis, string> = {
  bold: styles.bold,
  medium: styles.medium,
  regular: styles.regular,
  strong: styles.strong,
};

export function Text({
  as = "p",
  className,
  emphasis,
  variant = "body-base",
  ...props
}: TextProps) {
  return createElement(as, {
    ...props,
    className: classNames(
      styles.root,
      variantClasses[variant],
      emphasis && emphasisClasses[emphasis],
      className,
    ),
  });
}
