"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
  type KeyboardEvent,
} from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import type { ListItemSize } from "../ListItem/ListItem";
import { useSelectionSheet } from "./useSelectionSheet";
import styles from "./SelectionPanel.module.css";

export type SelectionPanelProps = {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: RefObject<HTMLElement | null>;
  size?: ListItemSize;
  title: string;
  closeLabel: string;
  back?: { label: string; onBack: () => void };
  placement?: "bottom" | "inline-end";
  autoFocus?: boolean;
  positioningRef?: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnTab?: boolean;
  interactiveAnchor?: boolean;
  searchRegion?: ReactNode;
  children: ReactNode;
};

/** Internal presentation seam. Consumers own option, query and selection semantics. */
export function SelectionPanel({
  id,
  open,
  onOpenChange,
  anchorRef,
  size = "md",
  title,
  closeLabel,
  back,
  placement = "bottom",
  autoFocus = true,
  initialFocusRef,
  positioningRef,
  closeOnTab = false,
  interactiveAnchor = false,
  searchRegion,
  children,
}: SelectionPanelProps) {
  const sheet = useSelectionSheet(size);
  const panelRef = useRef<HTMLDivElement | HTMLDialogElement | null>(null);
  const titleId = useId();
  const latest = useRef({ onOpenChange });
  useEffect(() => {
    latest.current = { onOpenChange };
  }, [onOpenChange]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !open) return;
    const anchor = anchorRef.current;
    const geometryAnchor = positioningRef?.current ?? anchor;
    const modal = panel instanceof HTMLDialogElement;
    const position = () => {
      if (modal || !geometryAnchor) return;
      const rect = geometryAnchor.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(panel).paddingTop);
      panel.style.width = "max-content";
      const naturalWidth = panel.getBoundingClientRect().width;
      const width = Math.min(
        Math.max(rect.width, naturalWidth),
        window.innerWidth - inset * 2,
      );
      panel.style.width = `${width}px`;
      panel.style.left = `${Math.max(inset, Math.min(rect.left, window.innerWidth - width - inset))}px`;
      if (placement === "inline-end") {
        const rtl = getComputedStyle(geometryAnchor).direction === "rtl";
        const preferred = rtl ? rect.left - width : rect.right;
        const alternate = rtl ? rect.right : rect.left - width;
        const fits = (left: number) =>
          left >= inset && left + width <= window.innerWidth - inset;
        const preferredSpace = rtl
          ? rect.left - inset
          : window.innerWidth - rect.right - inset;
        const alternateSpace = rtl
          ? window.innerWidth - rect.right - inset
          : rect.left - inset;
        const left = fits(preferred)
          ? preferred
          : fits(alternate)
            ? alternate
            : preferredSpace >= alternateSpace
              ? preferred
              : alternate;
        panel.style.left = `${Math.max(inset, Math.min(left, window.innerWidth - width - inset))}px`;
        panel.style.maxHeight = `${window.innerHeight - inset * 2}px`;
        panel.style.top = `${Math.max(inset, Math.min(rect.top, window.innerHeight - Math.min(panel.scrollHeight, window.innerHeight - inset * 2) - inset))}px`;
        return;
      }
      const below = window.innerHeight - rect.bottom - inset * 2;
      const above = rect.top - inset * 2;
      const flipped = below < panel.scrollHeight && above > below;
      const available = Math.max(0, flipped ? above : below);
      panel.style.maxHeight = `${available}px`;
      panel.style.top = `${flipped ? Math.max(inset, rect.top - Math.min(panel.scrollHeight, available) - inset) : rect.bottom + inset}px`;
    };
    const dismissOutside = (event: PointerEvent) => {
      if (modal || !interactiveAnchor) return;
      const path = event.composedPath();
      if (!path.includes(panel) && (!geometryAnchor || !path.includes(geometryAnchor)))
        latest.current.onOpenChange(false);
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    const previousOverflow = document.documentElement.style.overflow;
    if (modal) {
      document.documentElement.style.overflow = "hidden";
      panel.showModal();
    } else {
      panel.showPopover();
      position();
    }
    const focusTarget =
      initialFocusRef?.current ??
      panel.querySelector<HTMLElement>("input:not(:disabled)") ??
      panel.querySelector<HTMLElement>('button:not(:disabled), [tabindex="0"]');
    if (autoFocus) (focusTarget ?? panel).focus({ preventScroll: true });
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(position);
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(panel);
    if (geometryAnchor) resize.observe(geometryAnchor);
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
      if (modal && panel.open) panel.close();
      else if (!modal && panel.matches(":popover-open")) panel.hidePopover();
      if (modal && document.documentElement.style.overflow === "hidden")
        document.documentElement.style.overflow = previousOverflow;
      if (
        autoFocus &&
        (document.activeElement === document.body ||
          panel.contains(document.activeElement))
      )
        anchor?.focus({ preventScroll: true });
    };
  }, [
    open,
    sheet,
    anchorRef,
    placement,
    autoFocus,
    initialFocusRef,
    positioningRef,
    interactiveAnchor,
  ]);

  useEffect(() => {
    if (!open || !autoFocus) return;
    const panel = panelRef.current;
    (
      initialFocusRef?.current ??
      panel?.querySelector<HTMLElement>("input:not(:disabled)") ??
      panel
    )?.focus({ preventScroll: true });
  }, [title, open, autoFocus, initialFocusRef]);

  if (!open) return null;
  const contents = (
    <>
      {sheet ? (
        <header className={styles.header}>
          <span className={styles.action}>
            {back ? (
              <Button
                aria-label={back.label}
                icon="arrows/compact/left"
                intent="neutral"
                size="sm"
                variant="ghost"
                onClick={back.onBack}
              />
            ) : null}
          </span>
          <Text
            as="h2"
            id={titleId}
            variant="heading-sm"
            className={styles.title}
          >
            {title}
          </Text>
          <span className={styles.action}>
            <Button
              aria-label={closeLabel}
              icon="controls/close-s"
              intent="neutral"
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            />
          </span>
        </header>
      ) : null}
      {searchRegion ? (
        <div className={styles.search}>{searchRegion}</div>
      ) : null}
      <div className={styles.content}>{children}</div>
    </>
  );
  const common = {
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Tab" && closeOnTab) {
        const panel = panelRef.current;
        if (panel instanceof HTMLDialogElement) panel.close();
        else if (panel?.matches(":popover-open")) panel.hidePopover();
        anchorRef.current?.focus({ preventScroll: true });
        onOpenChange(false);
        return;
      }
      if (sheet && event.key === "Tab") {
        const targets = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
          ),
        ].filter(
          (node) => node.tabIndex >= 0 && node.getClientRects().length > 0,
        );
        const first = targets[0];
        const last = targets.at(-1);
        if (!first) {
          event.preventDefault();
          event.currentTarget.focus();
        } else if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === event.currentTarget)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        anchorRef.current?.focus({ preventScroll: true });
        onOpenChange(false);
      }
    },
    id,
    className: styles.panel,
    "data-size": size,
    "data-placement": placement,
    "data-presentation": sheet ? "sheet" : "anchored",
    tabIndex: -1,
    "aria-label": title,
  };
  return sheet ? (
    <dialog
      {...common}
      ref={(node) => {
        panelRef.current = node;
      }}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          onOpenChange(false);
      }}
    >
      {contents}
    </dialog>
  ) : (
    <div
      {...common}
      role="dialog"
      popover={interactiveAnchor ? "manual" : "auto"}
      ref={(node) => {
        panelRef.current = node;
      }}
      onToggle={(event) => {
        if (event.target === event.currentTarget && event.newState === "closed")
          latest.current.onOpenChange(false);
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node) &&
          event.relatedTarget !== anchorRef.current
        )
          onOpenChange(false);
      }}
    >
      {contents}
    </div>
  );
}
