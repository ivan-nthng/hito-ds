"use client";

import { Fragment, isValidElement, useCallback, useEffectEvent, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Text } from "../Text/Text";
import { StatusBadge, type StatusBadgeProps } from "../StatusBadge/StatusBadge";
import { List } from "../List/List";
import { ListItem, type ListItemArtwork, type ListItemSize, type ListItemTrailing } from "../ListItem/ListItem";
import { Separator } from "../Separator/Separator";
import type { IconName } from "../Icon/icon-catalog";
import { AnchoredTrigger, type AnchoredTriggerElement } from "../anchored/AnchoredTrigger";
import { assignTriggerRef } from "../anchored/compose-trigger-ref";
import { useAnchoredPanel } from "../anchored/use-anchored-panel";
import { observeAnchoredPosition } from "../anchored/observe-position";
import { classNames } from "../class-names";
import { findTypeaheadMatch } from "./menu-keyboard";
import { useMenuHover } from "./use-menu-hover";
import layerStyles from "../anchored/anchored.module.css";
import styles from "./Menu.module.css";

type MenuLeading = { icon?: IconName; artwork?: never } | { artwork: ListItemArtwork; icon?: never };
export type MenuCommand = { id: string; label: string; disabled?: boolean; intent?: "neutral" | "destructive"; checked?: boolean;
  /** Passive trailing text in the existing ListItem slot; typeahead still uses label. */
  annotation?: string;
  /** Passive status appearance; label remains the accessible/typeahead text. */ statusBadge?: Pick<StatusBadgeProps, "icon" | "intent" | "variant"> } & MenuLeading;
type MenuSeparator = { id: string; separator: true };
export type MenuSubmenu = Omit<MenuCommand, "intent" | "checked" | "statusBadge"> & MenuLeading & { submenu: { label: string; items: readonly (MenuCommand | MenuSeparator)[] } };
export type MenuEntry = MenuCommand | MenuSubmenu | MenuSeparator;
function commandTrailing(item: MenuCommand | MenuSubmenu): ListItemTrailing | undefined {
  if ("submenu" in item) return { icon: "arrows/compact/right", annotation: item.annotation };
  if (item.checked !== undefined) return { selectionMark: item.checked, annotation: item.annotation };
  return item.annotation === undefined ? undefined : { annotation: item.annotation };
}
export type MenuOpenChangeReason = "trigger" | "action" | "tab" | "escape" | "outside-pointer" | "focus-exit" | "anchor-hidden" | "hover" | "close";
export type MenuProps = {
  open: boolean;
  onOpenChange: (open: boolean, reason: MenuOpenChangeReason) => void;
  trigger: AnchoredTriggerElement;
  label: string;
  /** Optional compact visible heading for the popover; sheet always has its native header. */
  heading?: string;
  items: readonly MenuEntry[];
  onAction: (id: string) => void;
  /** Shared panel inset and row geometry; Menu keeps strict row-plus-inset outer radius. */
  size?: Extract<ListItemSize, "sm" | "md">;
  /** Align the menu's inline end with the trigger; start remains the default. */
  align?: "start" | "end";
  /** Explicit host choice. Sheet uses the existing compact native BottomSheet. */
  presentation?: "popover" | "sheet";
  /** Required for sheet presentation. */
  closeLabel?: string;
  /** Fine-pointer preview only; click and keyboard still enter the command menu. */
  openOnHover?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
};

const itemSelector = ':scope > [role="menuitem"], :scope > [role="menuitemradio"]';
const menuRows = (menu: HTMLElement | null) => [...menu?.querySelectorAll<HTMLElement>(itemSelector) ?? []];
function focusRow(menu: HTMLElement | null, item: HTMLElement | undefined) {
  menuRows(menu).forEach(row => { row.tabIndex = row === item ? 0 : -1; });
  item?.focus();
}

/** Commands and one level of submenus. Callers own permissions and selected values. */
export function Menu({ open, onOpenChange, trigger, label, heading, items, onAction, size = "sm", align = "start", openOnHover = false, presentation = "popover", closeLabel, returnFocusRef, className, style }: MenuProps) {
  if (!label.trim()) throw new Error("Menu requires a non-empty accessible label.");
  if (!isValidElement(trigger) || trigger.type === Fragment) throw new Error("Menu requires one labelled button trigger.");
  const commands = items.filter((item): item is MenuCommand | MenuSubmenu => !("separator" in item));
  const allEntries = items.flatMap(item => "submenu" in item ? [item, ...item.submenu.items] : [item]);
  if (!commands.length || commands.some(item => "submenu" in item && (!item.submenu.label.trim() || !item.submenu.items.some(child => !("separator" in child)))) ||
    allEntries.some(item => !item.id.trim() || (!("separator" in item) && !item.label.trim())) || new Set(allEntries.map(item => item.id)).size !== allEntries.length)
    throw new Error("Menu requires labelled commands with unique non-empty entry IDs.");
  const sheet = presentation === "sheet";
  if (sheet && !closeLabel?.trim()) throw new Error("Menu sheet requires a non-empty closeLabel.");
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const parentRow = useRef<HTMLLIElement | null>(null);
  const parentCommand = useRef<string | null>(null), restoreParent = useRef<string | null>(null);
  const [submenuId, setSubmenuId] = useState<string | null>(null);
  const [focusSubmenu, setFocusSubmenu] = useState(false);
  const submenu = commands.find((item): item is MenuSubmenu => "submenu" in item && !item.disabled && item.id === submenuId);
  if (submenuId !== null && (!open || !submenu)) setSubmenuId(null);
  const closeReasonRef = useRef<MenuOpenChangeReason | null>(null);
  const endRef = useRef(false);
  const performedRef = useRef(false);
  const prefixRef = useRef({ text: "", time: 0 });
  const id = useId();
  const callerRef = trigger.props.ref;
  const triggerRef = useCallback((node: HTMLButtonElement | null) => {
    anchorRef.current = node;
    const cleanup = assignTriggerRef(callerRef, node);
    return () => { anchorRef.current = null; if (typeof cleanup === "function") cleanup(); else assignTriggerRef(callerRef, null); };
  }, [callerRef]);
  const request = (next: boolean, reason: MenuOpenChangeReason) => {
    closeReasonRef.current = next ? null : reason;
    if (next) setSubmenuId(null);
    onOpenChange(next, reason);
  };
  const hover = useMenuHover({ enabled: openOnHover && !sheet, open, anchorRef, panelRef, onOpenChange: request });
  const rows = () => menuRows(menuRef.current);
  const focus = (item: HTMLElement | undefined) => focusRow(menuRef.current, item);
  const focusInitial = () => {
    const enabled = rows().filter(item => item.getAttribute("aria-disabled") !== "true");
    const item = endRef.current ? enabled.at(-1) : enabled[0];
    focus(item);
    if (!item) menuRef.current?.focus();
    endRef.current = false;
  };
  useAnchoredPanel({ open: open && !sheet, anchorRef, panelRef, closeReasonRef, returnFocusRef, align,
    onDismiss: reason => request(false, reason),
    preserveTriggerFocus: () => hover.preview.current,
    onInitialFocus: () => { performedRef.current = false; prefixRef.current = { text: "", time: 0 }; if (!hover.preview.current) focusInitial(); },
  });
  const focusSheet = useEffectEvent(() => {
    performedRef.current = false; prefixRef.current = { text: "", time: 0 };
    const parent = !submenuId && restoreParent.current ? rows().find(row => row.dataset.menuCommandId === restoreParent.current && row.getAttribute("aria-disabled") !== "true") : undefined;
    restoreParent.current = null;
    if (parent) focus(parent); else focusInitial();
  });
  useLayoutEffect(() => {
    if (!open || !sheet) return;
    focusSheet();
  }, [open, sheet, submenuId]);
  const activate = (command: MenuCommand) => {
    if (!open || command.disabled || performedRef.current) return;
    performedRef.current = true;
    request(false, "action");
    onAction(command.id);
  };
  const closeSubmenu = useCallback(() => { if (sheet) restoreParent.current = parentCommand.current; else parentRow.current?.focus(); setSubmenuId(null); }, [sheet]);
  const openSubmenu = (item: MenuSubmenu, row: HTMLLIElement, focusOnOpen = true) => {
    if (!open || item.disabled) return;
    parentRow.current = row;
    parentCommand.current = item.id;
    prefixRef.current = { text: "", time: 0 };
    setFocusSubmenu(focusOnOpen);
    setSubmenuId(item.id);
  };
  const hoverSubmenu = (event: PointerEvent<HTMLLIElement>, item: MenuEntry) => {
    if (sheet || event.pointerType !== "mouse" || !event.currentTarget.ownerDocument.defaultView?.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;
    if ("submenu" in item && !item.disabled) openSubmenu(item, event.currentTarget, false);
    else setSubmenuId(null);
  };
  const keyboard = (event: KeyboardEvent<HTMLUListElement>, entries: readonly (MenuCommand | MenuSubmenu)[], child = false) => {
    const menu = event.currentTarget;
    const elements = menuRows(menu); const current = elements.indexOf(document.activeElement as HTMLElement);
    const positions: Record<string, number> = { ArrowDown: (current + 1) % elements.length, ArrowUp: (current - 1 + elements.length) % elements.length, Home: 0, End: elements.length - 1 };
    const rtl = getComputedStyle(menu).direction === "rtl";
    if (child && (event.key === "Escape" || event.key === (rtl ? "ArrowRight" : "ArrowLeft"))) {
      event.preventDefault(); event.stopPropagation(); closeSubmenu();
    } else if (event.key in positions) { event.preventDefault(); focusRow(menu, elements[positions[event.key]]); }
    else if (event.key === "Tab" && !sheet) {
      closeReasonRef.current = "tab";
      focusRow(menu, undefined);
      anchorRef.current?.focus({ preventScroll: true });
      request(false, "tab");
    } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      const now = event.timeStamp;
      const text = (now - prefixRef.current.time < 700 ? prefixRef.current.text : "") + event.key;
      prefixRef.current = { text, time: now };
      const match = findTypeaheadMatch(entries.map(command => command.label), text, current);
      if (match !== -1) focusRow(menu, elements[match]);
    }
  };
  const visibleItems = sheet && submenu ? submenu.submenu.items : items;
  const visibleCommands = visibleItems.filter((item): item is MenuCommand | MenuSubmenu => !("separator" in item));
  const hasLeading = visibleCommands.some(command => command.icon || command.artwork);
  const content = <List ref={menuRef} id={id} role="menu" aria-label={sheet && submenu ? submenu.submenu.label : label} tabIndex={-1} className={styles.menu}
        onKeyDown={event => keyboard(event, visibleCommands, sheet && !!submenu)}>
        {visibleItems.map(item => "separator" in item ? <li key={item.id} role="presentation" className={styles.divider}><Separator /></li> :
          <ListItem key={item.id} data-menu-command-id={item.id} size={size} role={!("submenu" in item) && item.checked !== undefined ? "menuitemradio" : "menuitem"} tabIndex={-1} className={styles.item}
            label={<CommandLabel item={item} size={size} />}
            leading={item.artwork ? { artwork: item.artwork } : item.icon ? { icon: item.icon } : hasLeading ? { reserved: true } : undefined}
            trailing={commandTrailing(item)}
            aria-haspopup={"submenu" in item ? "menu" : undefined}
            aria-expanded={"submenu" in item ? open && submenu?.id === item.id : undefined}
            aria-controls={"submenu" in item && open && submenu?.id === item.id ? sheet ? id : `${id}-submenu` : undefined}
            aria-checked={!("submenu" in item) ? item.checked : undefined}
            aria-disabled={item.disabled || undefined} data-destructive={!("submenu" in item) && item.intent === "destructive" || undefined}
            onPointerEnter={event => hoverSubmenu(event, item)}
            onFocus={event => { rows().forEach(row => { row.tabIndex = row === event.currentTarget ? 0 : -1; }); if (!sheet && parentRow.current !== event.currentTarget) setSubmenuId(null); }}
            onClick={event => { if ("submenu" in item) { if (submenuId === item.id && focusSubmenu) closeSubmenu(); else openSubmenu(item, event.currentTarget); } else activate(item); }}
            onKeyDown={event => {
              const forward = getComputedStyle(event.currentTarget).direction === "rtl" ? "ArrowLeft" : "ArrowRight";
              if (event.key === "Enter" || event.key === " " || ("submenu" in item && event.key === forward)) {
                event.preventDefault(); if (event.repeat) return;
                if ("submenu" in item) openSubmenu(item, event.currentTarget); else activate(item);
              }
            }} />)}
      </List>;
  return <>
    <AnchoredTrigger element={trigger} ref={triggerRef} popup={sheet ? "dialog" : "menu"} open={open} panelId={sheet ? `${id}-sheet` : id}
      onActivate={() => {
        if (open && hover.preview.current) { hover.activate(); focusInitial(); request(true, "trigger"); }
        else { hover.activate(); request(!open, "trigger"); }
      }}
      onKeyDown={event => {
        if (event.currentTarget.disabled || event.currentTarget.getAttribute("aria-disabled") === "true") return;
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault(); hover.activate(); endRef.current = event.key === "ArrowUp";
        if (open) focusInitial(); else request(true, "trigger");
      }} />
    {sheet ? <BottomSheet id={`${id}-sheet`} open={open} title={submenu?.submenu.label ?? label} headerVariant="compact" closeLabel={closeLabel!}
      onDismiss={reason => request(false, reason === "backdrop" ? "outside-pointer" : reason)} dismissOnBackdrop
      navigation={submenu ? { back: { label, onBack: closeSubmenu } } : undefined}
      initialFocus={menuRef} returnFocusRef={returnFocusRef ?? anchorRef} className={className} style={style}>
      {content}
    </BottomSheet> : <div ref={panelRef} popover="manual" data-size={size} className={classNames(layerStyles.panel, styles.panel, className)} style={style}>
      {heading ? <Text variant="label-base" className={styles.heading}>{heading}</Text> : null}
      {content}
      {submenu ? <SubmenuPanel key={submenu.id} open={open} size={size} id={`${id}-submenu`} item={submenu} anchorRef={parentRow} focusOnOpen={focusSubmenu}
        closeReasonRef={closeReasonRef} onClose={closeSubmenu} onAction={activate} onKeyDown={event => keyboard(event, submenu.submenu.items.filter((item): item is MenuCommand => !("separator" in item)), true)} /> : null}
    </div>}
  </>;
}

function CommandLabel({ item, size }: { item: MenuCommand | MenuSubmenu; size: NonNullable<MenuProps["size"]> }) {
  return !("submenu" in item) && item.statusBadge ? <StatusBadge {...item.statusBadge} label={item.label} size={size} />
    : <span className={styles.itemLabel}>{item.label}</span>;
}

function SubmenuPanel({ open, size, id, item, anchorRef, focusOnOpen, closeReasonRef, onClose, onAction, onKeyDown }: {
  size: NonNullable<MenuProps["size"]>;
  open: boolean; id: string; item: MenuSubmenu; anchorRef: RefObject<HTMLLIElement | null>; focusOnOpen: boolean;
  closeReasonRef: RefObject<MenuOpenChangeReason | null>; onClose: () => void;
  onAction: (item: MenuCommand) => void; onKeyDown: (event: KeyboardEvent<HTMLUListElement>) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const closeReason = useEffectEvent(() => closeReasonRef.current);
  useLayoutEffect(() => {
    const panel = panelRef.current, anchor = anchorRef.current;
    if (!open || !panel || !anchor) return;
    panel.showPopover();
    const stop = observeAnchoredPosition(anchor, panel, onClose, "inline");
    return () => {
      stop();
      const focusedInside = panel.contains(panel.ownerDocument.activeElement);
      if (panel.matches(":popover-open")) panel.hidePopover();
      // Keep root focus-return intact when a selected leaf closes the entire tree.
      const reason = closeReason();
      if (focusedInside && (!reason || ["action", "escape", "trigger"].includes(reason))) anchor.focus({ preventScroll: true });
    };
  }, [open, anchorRef, onClose]);
  useLayoutEffect(() => {
    if (!open || !focusOnOpen) return;
    const menu = menuRef.current;
    const first = menuRows(menu).find(row => row.getAttribute("aria-disabled") !== "true");
    if (first) focusRow(menu, first); else menu?.focus();
  }, [open, focusOnOpen]);
  const commands = item.submenu.items.filter((item): item is MenuCommand => !("separator" in item));
  const hasLeading = commands.some(command => command.icon || command.artwork);
  return <div ref={panelRef} popover="manual" data-size={size} className={classNames(layerStyles.panel, styles.panel, styles.submenuPanel)}>
    <List ref={menuRef} id={id} role="menu" aria-label={item.submenu.label} tabIndex={-1} className={styles.menu} onKeyDown={onKeyDown}>
      {item.submenu.items.map(entry => "separator" in entry ? <li key={entry.id} role="presentation" className={styles.divider}><Separator /></li> :
        <ListItem key={entry.id} size={size} role={entry.checked === undefined ? "menuitem" : "menuitemradio"} tabIndex={-1} className={styles.item}
          label={<CommandLabel item={entry} size={size} />}
          leading={entry.artwork ? { artwork: entry.artwork } : entry.icon ? { icon: entry.icon } : hasLeading ? { reserved: true } : undefined}
          trailing={commandTrailing(entry)}
          aria-checked={entry.checked} aria-disabled={entry.disabled || undefined} data-destructive={entry.intent === "destructive" || undefined}
          onFocus={event => { menuRows(menuRef.current).forEach(row => { row.tabIndex = row === event.currentTarget ? 0 : -1; }); }}
          onClick={() => onAction(entry)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (!event.repeat) onAction(entry); } }} />)}
    </List>
  </div>;
}
