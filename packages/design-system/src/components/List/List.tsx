import { createElement, type Ref, type HTMLAttributes } from "react";
import { classNames } from "../class-names";
import styles from "./List.module.css";

export type ListProps = HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
  ordered?: boolean;
  ref?: Ref<HTMLUListElement | HTMLOListElement>;
};

export function List({ className, ordered = false, ...props }: ListProps) {
  return createElement(ordered ? "ol" : "ul", {
    ...props,
    className: classNames(styles.root, className),
  });
}
