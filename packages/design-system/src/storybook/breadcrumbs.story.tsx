import { useId, useRef, useState } from "react";
import { Breadcrumbs, type BreadcrumbsItem, type BreadcrumbsSize } from "../components/Breadcrumbs/Breadcrumbs";
import { Button } from "../components/Button/Button";
import { Text } from "../components/Text/Text";
import { breadcrumbsCopy } from "./breadcrumbs-content.story";
import styles from "./breadcrumbs.story.module.css";

export const breadcrumbsExamplePaths = ["short", "deep", "current"] as const;
export type BreadcrumbsExamplePath = (typeof breadcrumbsExamplePaths)[number];

/** Synthetic owner navigation is confined to Storybook. */
export function BreadcrumbsExample({ profile, size, path }: { profile: unknown; size: BreadcrumbsSize; path: BreadcrumbsExamplePath }) {
  const copy = breadcrumbsCopy(profile);
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const initial = path === "current" ? copy.labels.slice(-1) : path === "short" ? [copy.labels[0], copy.labels[3], copy.labels[4]] : copy.labels;
  const [depth, setDepth] = useState(initial.length);
  const items: BreadcrumbsItem[] = initial.slice(0, depth - 1).map((label, index) => ({
    id: String(index), label, href: `#${id}`,
    onClick: event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      setDepth(index + 1);
      requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    },
  }));
  return <section className={styles.example} lang={copy.lang}>
    <Breadcrumbs items={items} currentPage={initial[depth - 1]} size={size} label={copy.navigation} overflowLabel={count => `${copy.overflow} (${count})`} closeLabel={copy.close} />
    <div className={styles.content}>
      <h2 ref={heading} id={id} tabIndex={-1} className={styles.heading}><Text as="span" variant="heading-sm">{initial[depth - 1]}</Text></h2>
      <Text className={styles.description} variant="body-sm">{copy.description}</Text>
      {depth < initial.length ? <Button size={size} intent="neutral" variant="ghost" onClick={() => { setDepth(initial.length); requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }}>{copy.reset}</Button> : null}
    </div>
  </section>;
}
