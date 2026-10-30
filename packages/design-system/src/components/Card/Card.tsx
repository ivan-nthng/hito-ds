import type { HTMLAttributes, ReactElement } from "react";
import { classNames } from "../class-names";
import type { ButtonProps } from "../Button/Button";
import type { MenuProps } from "../Menu/Menu";
import { Surface, type SurfaceProps } from "../Surface/Surface";
import { Text } from "../Text/Text";
import styles from "./Card.module.css";

export const cardSizes = ["compact", "comfortable"] as const;
export const cardLayouts = ["fixed", "responsive"] as const;
export const cardElevations = ["none", "raised"] as const;

export type CardSize = (typeof cardSizes)[number];
export type CardLayout = (typeof cardLayouts)[number];
export type CardElevation = (typeof cardElevations)[number];

export type CardProps = SurfaceProps & {
  size?: CardSize;
  /** Controls padding and radius together. Width belongs to the parent layout. */
  layout?: CardLayout;
  elevation?: CardElevation;
};

/** A visual container; its children own content, layout and interaction. */
export function Card({
  size = "compact",
  layout = "responsive",
  elevation = "none",
  className,
  ...props
}: CardProps) {
  return (
    <Surface
      {...props}
      className={classNames(styles.root, className)}
      data-card=""
      data-size={size}
      data-layout={layout}
      data-elevation={elevation}
    />
  );
}

export type CardHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> & {
  /** Section title. Restaurant identity and descriptions belong to the content. */
  title: string;
  headingLevel?: 1 | 2 | 3;
  titleId?: string;
  /** Adjacent native Button: secondary, neutral, MD. The caller owns its label and behavior. */
  action?: ReactElement<ButtonProps>;
  /** Native Menu with a ghost/neutral MD controls/more Button. Omit when there are no actions. */
  overflow?: ReactElement<MenuProps>;
};

/** Optional content composition. Card and its content layout retain all inset and separation. */
export function CardHeader({ title, headingLevel = 2, titleId, action, overflow, className, ...props }: CardHeaderProps) {
  if (!title.trim()) throw new Error("CardHeader requires a non-empty section title; omit it for a headerless Card.");
  return <div {...props} className={classNames(styles.header, className)} data-card-header="" data-actions={action || overflow ? "" : undefined}>
    <div className={styles.headerGroup}>
      <Text as={`h${headingLevel}`} variant="heading-sm" id={titleId} className={styles.headerTitle}>{title}</Text>
      {action ? <div className={styles.headerAction}>{action}</div> : null}
    </div>
    {overflow ? <div className={styles.headerOverflow}>{overflow}</div> : null}
  </div>;
}
