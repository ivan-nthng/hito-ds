import { classNames } from "../class-names";
import styles from "./Skeleton.module.css";

export const skeletonShapes = ["text", "block", "circle"] as const;
export type SkeletonProps = {
  shape?: (typeof skeletonShapes)[number];
  /** The consuming layout supplies the dimensions of the content being replaced. */
  className?: string;
};

/** A hidden shape, never fake text or a live region. Compose it inside the owning busy region. */
export function Skeleton({ shape = "text", className }: SkeletonProps) {
  return <span aria-hidden="true" className={classNames(styles.skeleton, className)} data-skeleton="" data-shape={shape} />;
}
