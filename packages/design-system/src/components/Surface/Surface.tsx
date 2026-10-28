import { createElement, type HTMLAttributes } from "react";
import { classNames } from "../class-names";
import styles from "./Surface.module.css";

export type SurfaceElement = "article" | "aside" | "div" | "section";

export type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: SurfaceElement;
};

export function Surface({ as = "div", className, ...props }: SurfaceProps) {
  return createElement(as, {
    ...props,
    className: classNames(styles.root, className),
  });
}
