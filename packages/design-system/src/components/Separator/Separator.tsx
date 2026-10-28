import type { HTMLAttributes } from "react";
import { classNames } from "../class-names";
import styles from "./Separator.module.css";

export type SeparatorProps = Omit<HTMLAttributes<HTMLDivElement>, "role"> & {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
};

export function Separator({
  className,
  decorative = false,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      {...props}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={classNames(styles.root, styles[orientation], className)}
      role={decorative ? "presentation" : "separator"}
    />
  );
}
