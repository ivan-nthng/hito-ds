import { useId, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "../../components/class-names";
import { Text } from "../../components/Text/Text";
import styles from "./FilterBar.module.css";

export type FilterBarProps = Omit<HTMLAttributes<HTMLElement>, "title" | "children"> & {
  title: string;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  actions?: ReactNode;
  filters?: ReactNode;
};

/** Arranges caller-owned controls; query, disclosure and results remain with the consumer. */
export function FilterBar({ title, headingLevel = 2, actions, filters, className, ...props }: FilterBarProps) {
  const headingId = useId();
  return <section aria-labelledby={headingId} {...props} className={classNames(styles.root, className)}>
    <div className={styles.header}>
      <Text id={headingId} as={`h${headingLevel}`} variant="heading-md" className={styles.title}>{title}</Text>
      {actions != null && actions !== false ? <div className={styles.actions}>{actions}</div> : null}
    </div>
    {filters != null && filters !== false ? <div className={styles.filters}>{filters}</div> : null}
  </section>;
}
