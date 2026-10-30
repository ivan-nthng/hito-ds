"use client";

import { Fragment, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type MouseEvent, type MouseEventHandler } from "react";
import { Button } from "../Button/Button";
import { Link } from "../Link/Link";
import { List } from "../List/List";
import { ListItem } from "../ListItem/ListItem";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import { SelectionPanel } from "../selection-panel/SelectionPanel";
import styles from "./Breadcrumbs.module.css";

export const breadcrumbsSizes = ["sm", "md"] as const;
export type BreadcrumbsSize = (typeof breadcrumbsSizes)[number];

export type BreadcrumbsItem = {
  /** Stable, unique identity among the ancestors; not a DOM id. */
  id: string;
  label: string;
  /** The consumer supplies the actual navigation destination. */
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export type BreadcrumbsProps = Omit<HTMLAttributes<HTMLElement>,
  "children" | "dangerouslySetInnerHTML" | "role" | "aria-label" | "aria-labelledby" | "aria-current"
> & {
  /** Ordered ancestors only. The current page never becomes a link. */
  items: readonly BreadcrumbsItem[];
  currentPage: string;
  label: string;
  /** Caller-localized accessible name, including the hidden-level count. */
  overflowLabel: (count: number) => string;
  closeLabel: string;
  size?: BreadcrumbsSize;
};

type TrailMode = "full" | "compact" | "parent" | "current";

function BreadcrumbSlash({ size, current = false }: { size: BreadcrumbsSize; current?: boolean }) {
  return <Text as="span" variant={`ui-${size}`} aria-hidden="true" data-breadcrumb-separator data-current={current || undefined} className={styles.separator}>/</Text>;
}

function visibleAncestors(items: readonly BreadcrumbsItem[], mode: TrailMode) {
  if (mode === "full") return items;
  if (mode === "current") return [];
  if (mode === "parent") return items.slice(-1);
  return items.filter((_, index) => index === 0 || index === items.length - 1);
}

/** Location presentation and overflow only. Navigation and destination focus belong to the caller. */
export function Breadcrumbs({ items, currentPage, size = "md", label, overflowLabel, closeLabel, className, ...props }: BreadcrumbsProps) {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const path = useRef<HTMLOListElement>(null);
  const measurement = useRef<HTMLOListElement>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  const currentText = useRef<HTMLLIElement>(null);
  const firstLink = useRef<HTMLElement | null>(null);
  const lostFocus = useRef<HTMLElement | null>(null);
  const modelKey = JSON.stringify([currentPage, items.map(({ id: itemId, label: text, href }) => [itemId, text, href])]);
  const [openedModel, setOpenedModel] = useState<string | null>(null);
  const open = openedModel === modelKey;
  const [mode, setMode] = useState<TrailMode>("full");
  const changeOpen = (next: boolean) => setOpenedModel(next ? modelKey : null);

  // Ref cleanup runs before removal, including model changes that keep the same
  // overflow mode. Repair only genuinely lost focus from this instance.
  const trackRemoval = (node: HTMLElement | null) => {
    if (!node) return;
    return () => {
      const active = node.ownerDocument.activeElement;
      if (active instanceof HTMLElement && node.contains(active)) lostFocus.current = active;
    };
  };

  // Reset against the incoming model before commit so returning to an earlier
  // path cannot reopen a stale panel.
  if (openedModel !== null && openedModel !== modelKey) setOpenedModel(null);

  useLayoutEffect(() => {
    const container = root.current;
    const rail = path.current;
    const row = measurement.current;
    if (!container || !rail || !row) return;
    const measure = () => {
      const widths = Array.from(row.children, child => child.getBoundingClientRect().width);
      const railStyle = getComputedStyle(rail);
      const gap = parseFloat(railStyle.columnGap) || 0;
      const available = rail.getBoundingClientRect().width - [railStyle.paddingLeft, railStyle.paddingRight, railStyle.borderLeftWidth, railStyle.borderRightWidth].reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
      const overflowWidth = widths.at(-1)!;
      const fits = (candidate: TrailMode) => {
        const visible = visibleAncestors(items, candidate);
        const collapsed = visible.length < items.length;
        const total = visible.reduce((sum, item) => sum + widths[items.indexOf(item)], widths[items.length]) + (collapsed ? overflowWidth : 0);
        return total + gap * (visible.length + Number(collapsed)) <= available;
      };
      const next = (["full", "compact", "parent"] as const).find(fits) ?? "current";
      if (next !== mode) {
        // Existing SelectionPanel dismisses before its anchor changes groups.
        setOpenedModel(null);
        setMode(next);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    Array.from(row.children).forEach(child => observer.observe(child));
    return () => observer.disconnect();
  }, [items, currentPage, size, mode]);

  useLayoutEffect(() => {
    const previous = lostFocus.current;
    lostFocus.current = null;
    const container = root.current;
    if (!previous || previous.isConnected || !container) return;
    const active = container.ownerDocument.activeElement;
    // A caller may already have focused the new destination. Never take it back.
    if (active && active !== container.ownerDocument.body && active.isConnected) return;
    (anchor.current ?? container.querySelector<HTMLElement>("a[data-crumb]") ?? currentText.current)?.focus({ preventScroll: true });
  });

  if (!currentPage.trim()) return null;
  const visible = visibleAncestors(items, mode);
  const hidden = items.filter(item => !visible.includes(item));
  const overflowName = overflowLabel(hidden.length);
  const navigate = (event: MouseEvent<HTMLAnchorElement>, item: BreadcrumbsItem) => {
    item.onClick?.(event);
    if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) changeOpen(false);
  };
  const overflow = hidden.length ? <li className={styles.item} key="overflow" ref={trackRemoval}>
    <Button ref={anchor} className={styles.overflowTrigger} size={size} variant="ghost" intent="neutral" icon="controls/more" aria-label={overflowName}
      aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => changeOpen(!open)} />
    <BreadcrumbSlash size={size} current={visible.length === 0} />
  </li> : null;
  return <nav {...props} ref={root} aria-label={label} className={classNames(styles.root, className)} data-size={size} data-trail-mode={mode}>
    <ol ref={path} className={styles.path}>
      {mode !== "compact" ? overflow : null}
      {visible.map((item, index) => <Fragment key={`ancestor-${item.id}`}>
        <li className={styles.item} ref={trackRemoval}>
          <Link size={size} href={item.href} data-crumb={item.id} className={styles.ancestor} onClick={event => navigate(event, item)}>{item.label}</Link>
          <BreadcrumbSlash size={size} current={item === items.at(-1)} />
        </li>
        {mode === "compact" && index === 0 ? overflow : null}
      </Fragment>)}
      <li ref={currentText} className={styles.current} tabIndex={-1}><Text as="span" variant={`ui-${size}`} aria-current="page">{currentPage}</Text></li>
    </ol>
    <div className={styles.measurementClip} aria-hidden="true" inert><ol ref={measurement} className={`${styles.path} ${styles.measurement}`}>
      {items.map(item => <li className={styles.item} key={`measure-${item.id}`}>
        <Text as="span" variant={`ui-${size}`}>{item.label}</Text><BreadcrumbSlash size={size} />
      </li>)}
      <li className={styles.item}><Text as="span" variant={`ui-${size}`}>{currentPage}</Text></li>
      <li className={styles.item}><Button size={size} variant="ghost" intent="neutral" icon="controls/more" aria-label={overflowName} /><BreadcrumbSlash size={size} /></li>
    </ol></div>
    <SelectionPanel id={id} anchorRef={anchor} initialFocusRef={firstLink} open={open && hidden.length > 0} onOpenChange={changeOpen} size={size} title={overflowName} closeLabel={closeLabel}>
      <div className={styles.overflow} ref={node => { firstLink.current = node?.querySelector("a") ?? null; return trackRemoval(node); }}>
        <List>{hidden.map(item => <ListItem key={item.id} ref={trackRemoval} size={size} label={<Link size={size} href={item.href} className={styles.panelLink} onClick={event => navigate(event, item)}>{item.label}</Link>} />)}</List>
      </div>
    </SelectionPanel>
  </nav>;
}
