"use client";

import { useId, useLayoutEffect, useRef, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { Button } from "../Button/Button";
import { controlSizes, type ControlSize } from "../control-size";
import { classNames } from "../class-names";
import type { IconName } from "../Icon/icon-catalog";
import styles from "./Tabs.module.css";

export const tabsSizes = controlSizes.filter((size): size is Extract<ControlSize, "sm" | "md"> => size === "sm" || size === "md");
export const tabsAppearances = ["underline", "segmented"] as const;
export type TabsAppearance = (typeof tabsAppearances)[number];
export type TabsSize = (typeof tabsSizes)[number];
export type TabsItem = {
  id: string;
  label: string;
  icon?: IconName;
  count?: { display: string; label: string };
  disabled?: boolean;
  content: ReactNode;
};

export type TabsProps = Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & {
  items: readonly TabsItem[];
  value: string | null;
  onValueChange: (id: string) => void;
  label: string;
  size?: TabsSize;
  appearance?: TabsAppearance;
};

/** Controlled local panels; the caller owns coherent items and selection. */
export function Tabs({ items, value, onValueChange, label, size = "md", appearance = "underline", className, onFocusCapture, onBlurCapture, ...props }: TabsProps) {
  const instance = useId();
  const strip = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const indicatorGeometry = useRef<{ id: string; x: number; y: number; width: number; height: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const focusedRegion = useRef<HTMLElement | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter(item => !item.disabled);
  const selected = enabled.some(item => item.id === value) ? value : null;

  useLayoutEffect(() => {
    const previous = focusedRegion.current;
    if (!previous) return;
    const active = document.activeElement;
    if (active && active !== document.body && !root.current?.contains(active)) {
      focusedRegion.current = null;
      return;
    }
    const unavailable = !previous.isConnected || previous.hidden || (previous instanceof HTMLButtonElement && previous.disabled);
    if (unavailable) (selected ? buttons.current.get(selected) : strip.current)?.focus({ preventScroll: true });
  }, [items, selected]);

  // Only the decorative backing is measured. Selection, spacing and radii remain owner/token driven.
  useLayoutEffect(() => {
    const backing = indicator.current;
    const track = rail.current;
    if (appearance !== "segmented" || !backing || !track) {
      indicatorGeometry.current = null;
      return;
    }
    const update = (allowMotion: boolean) => {
      const button = selected ? buttons.current.get(selected) : undefined;
      if (!button || !selected || !button.offsetWidth || !button.offsetHeight) {
        backing.hidden = true;
        backing.dataset.ready = "false";
        indicatorGeometry.current = null;
        return;
      }
      const next = { id: selected, x: button.offsetLeft, y: button.offsetTop, width: button.offsetWidth, height: button.offsetHeight };
      const previous = indicatorGeometry.current;
      if (previous && previous.id === next.id && previous.x === next.x && previous.y === next.y && previous.width === next.width && previous.height === next.height) return;
      backing.dataset.moving = String(allowMotion && Boolean(previous) && previous?.id !== selected);
      backing.hidden = false;
      backing.dataset.ready = "true";
      backing.style.transform = `translate(${next.x}px, ${next.y}px)`;
      backing.style.width = `${next.width}px`;
      backing.style.height = `${next.height}px`;
      indicatorGeometry.current = next;
    };
    update(true);
    const observer = new ResizeObserver(() => update(false));
    observer.observe(track);
    buttons.current.forEach(button => observer.observe(button));
    return () => observer.disconnect();
  });

  const reveal = (button: HTMLButtonElement) => {
    const list = strip.current;
    if (!list) return;
    const rect = button.getBoundingClientRect();
    const viewport = list.getBoundingClientRect();
    const inset = parseFloat(getComputedStyle(list).paddingInlineStart);
    const start = rect.left - viewport.left - inset;
    const end = rect.right - viewport.right + inset;
    const rtl = getComputedStyle(list).direction === "rtl";
    const wide = rect.width > list.clientWidth - inset * 2;
    const delta = wide ? (rtl ? end : start) : start < 0 ? start : end > 0 ? end : 0;
    if (delta) list.scrollBy({ left: delta, behavior: "instant" });
  };

  const navigate = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const index = enabled.findIndex(item => item.id === id);
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = enabled.length - 1;
    else if (event.key === "ArrowRight") next = (index + (rtl ? -1 : 1) + enabled.length) % enabled.length;
    else if (event.key === "ArrowLeft") next = (index + (rtl ? 1 : -1) + enabled.length) % enabled.length;
    else return;
    event.preventDefault();
    buttons.current.get(enabled[next]?.id)?.focus({ preventScroll: true });
  };

  if (!items.length) return null;
  return <div {...props} ref={root} className={classNames(styles.root, className)} data-tabs data-appearance={appearance} data-size={size}
    onFocusCapture={event => { onFocusCapture?.(event); focusedRegion.current = (event.target as HTMLElement).closest<HTMLElement>('[role="tab"], [role="tabpanel"]'); }}
    onBlurCapture={event => { onBlurCapture?.(event); if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) focusedRegion.current = null; }}>
    <div ref={strip} className={styles.strip} role="tablist" aria-label={label} tabIndex={enabled.length ? -1 : 0}>
      <div ref={rail} className={styles.rail}>
      {appearance === "segmented" ? <span ref={indicator} aria-hidden hidden data-tabs-indicator className={styles.indicator} /> : null}
      {items.map(item => <Button
        key={item.id}
        ref={element => { if (element) buttons.current.set(item.id, element); else buttons.current.delete(item.id); }}
        id={`${instance}-tab-${item.id}`}
        role="tab"
        aria-selected={selected === item.id}
        aria-controls={`${instance}-panel-${item.id}`}
        aria-label={item.count ? `${item.label}, ${item.count.label}` : undefined}
        tabIndex={!item.disabled && (selected === item.id || (!selected && enabled[0]?.id === item.id)) ? 0 : -1}
        disabled={item.disabled}
        size={size}
        intent="neutral"
        variant="ghost"
        leadingIcon={item.icon}
        className={styles.tab}
        onKeyDown={event => navigate(event, item.id)}
        onFocus={event => { onValueChange(item.id); reveal(event.currentTarget); }}
        onClick={event => { onValueChange(item.id); reveal(event.currentTarget); }}
      >
        <span className={styles.tabCopy}>
          {item.label}
          {item.count ? <span aria-hidden className={styles.count}>{item.count.display}</span> : null}
        </span>
      </Button>)}
      </div>
    </div>
    {items.map(item => <div key={item.id} id={`${instance}-panel-${item.id}`} role="tabpanel" aria-labelledby={`${instance}-tab-${item.id}`} hidden={selected !== item.id} tabIndex={0} className={styles.panel}>
      {item.content}
    </div>)}
  </div>;
}
