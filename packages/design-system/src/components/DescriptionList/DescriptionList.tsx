import type { HTMLAttributes, ReactNode, Ref } from "react";
import { classNames } from "../class-names";
import { Text } from "../Text/Text";
import styles from "./DescriptionList.module.css";

export type DescriptionListItem = {
  /** Stable, unique identity within this list; not a DOM id. */
  id: string;
  term: ReactNode;
  /** The consumer supplies missing-value copy or an existing value component. */
  value: ReactNode;
};

export type DescriptionListProps = Omit<HTMLAttributes<HTMLDListElement>, "children"> & {
  items: readonly DescriptionListItem[];
  ref?: Ref<HTMLDListElement>;
};

/** Name–value layout. The parent owns its surface; value children own interaction. */
export function DescriptionList({ items, className, ref, ...props }: DescriptionListProps) {
  return (
    <div className={styles.container}>
      <dl {...props} ref={ref} className={classNames(styles.list, className)}>
        {items.map(({ id, term, value }) => (
          <div className={styles.pair} key={id}>
            <dt><Text as="div" variant="label-sm" emphasis="regular" className={styles.term}>{term}</Text></dt>
            <dd><Text as="div" variant="body-sm" className={styles.value}>{value}</Text></dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
