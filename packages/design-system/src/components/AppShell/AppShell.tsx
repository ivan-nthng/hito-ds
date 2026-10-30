"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode, type Ref } from "react";
import { Button } from "../Button/Button";
import type { IconName } from "../Icon/icon-catalog";
import { Link } from "../Link/Link";
import { Menu } from "../Menu/Menu";
import { Tooltip } from "../Tooltip/Tooltip";
import { classNames } from "../class-names";
import styles from "./AppShell.module.css";

export type AppShellPresentation = { compact: boolean; mobile: boolean };
export type AppShellNavItem = {
  id: string;
  label: string;
  icon: IconName;
  current?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  accessibleLabel?: string;
};
export type AppShellProps = {
  lang?: string;
  colorScheme?: "light" | "dark";
  className?: string;
  mainId: string;
  skipLabel: string;
  collapseLabel: string;
  expandLabel: string;
  service: (presentation: AppShellPresentation) => ReactNode;
  navigation?: {
    label: string;
    triggerLabel: string;
    items: readonly AppShellNavItem[];
    /** The application keeps its route, permission and leave/save guards. */
    onAction: (id: string) => void;
  };
  user?: (presentation: AppShellPresentation) => ReactNode;
  utility?: (presentation: AppShellPresentation) => ReactNode;
  /** Pending domain actions can suspend navigation without suspending layout controls. */
  navigationDisabled?: boolean;
  /** Logical successor for an application-owned setup reminder that can disappear. */
  currentItemRef?: Ref<HTMLButtonElement>;
  children: ReactNode;
};

const mobileQuery = "(max-width: 63.999rem)";
const mobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const serverSnapshot = () => false;

/** Structural workspace presentation only; no routes, identity, data or persisted preferences. */
export function AppShell({ lang, colorScheme, className, mainId, skipLabel, collapseLabel, expandLabel,
  service, navigation, user, utility, navigationDisabled = false, currentItemRef, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [preview, setPreview] = useState(false);
  const sidebar = useRef<HTMLElement>(null), pointerInside = useRef(false), dismissed = useRef(false), touch = useRef(false);
  const focusReturn = useRef<{ element: HTMLElement; slot: HTMLElement } | null>(null);
  const returnToNavigation = useRef(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const subscribe = useCallback((change: () => void) => {
    const query = window.matchMedia(mobileQuery);
    const update = () => { setNavigationOpen(false); setPreview(false); dismissed.current = false; change(); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const mobile = useSyncExternalStore(subscribe, mobileSnapshot, serverSnapshot);
  const temporary = collapsed && preview && !mobile;
  const presentation = { compact: collapsed && !temporary && !mobile, mobile };
  const rememberFocus = useCallback(() => {
    const element = sidebar.current?.ownerDocument.activeElement;
    const slot = element instanceof HTMLElement ? element.closest<HTMLElement>("[data-shell-focus]") : null;
    focusReturn.current = element instanceof HTMLElement && slot ? { element, slot } : null;
  }, []);
  useLayoutEffect(() => {
    const previous = focusReturn.current;
    focusReturn.current = null;
    if (returnToNavigation.current) {
      returnToNavigation.current = false;
      sidebar.current?.querySelector<HTMLElement>("[aria-current='page'], ." + styles.service + " button")?.focus({ preventScroll: true });
    }
    if (previous && !previous.element.isConnected && sidebar.current?.ownerDocument.activeElement === document.body)
      previous.slot.querySelector<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']")?.focus({ preventScroll: true });
  }, [temporary, collapsed, mobile]);
  useLayoutEffect(() => {
    const element = sidebar.current;
    if (!temporary || !element) return;
    const dismiss = () => {
      if (pointerInside.current || element.contains(element.ownerDocument.activeElement) || element.querySelector(":popover-open, dialog[open]")) return;
      rememberFocus(); setPreview(false);
    };
    const observer = new MutationObserver(dismiss);
    observer.observe(element, { subtree: true, attributes: true, attributeFilter: ["aria-expanded", "open"] });
    element.addEventListener("toggle", dismiss, true);
    return () => { observer.disconnect(); element.removeEventListener("toggle", dismiss, true); };
  }, [temporary, rememberFocus]);
  const navigationId = useId();
  const activate = (id: string) => {
    const item = navigation?.items.find(item => item.id === id);
    if (item && !item.disabled && !navigationDisabled) navigation?.onAction(id);
  };
  return <div className={classNames(styles.shell, className)} lang={lang} data-app-shell
    data-compact={collapsed && !mobile || undefined} data-preview={temporary || undefined} data-hito-color-scheme={colorScheme}
    onKeyDownCapture={event => { touch.current = false; if (event.key === "Tab") dismissed.current = false; }}>
    <Link href={`#${mainId}`} className={styles.skip}>{skipLabel}</Link>
    <aside ref={sidebar} className={styles.sidebar}
      onPointerDownCapture={event => { touch.current = event.pointerType === "touch"; }}
      onPointerEnter={event => {
        pointerInside.current = true;
        if (collapsed && !mobile && !dismissed.current && event.pointerType === "mouse" && matchMedia("(hover: hover) and (pointer: fine)").matches) {
          rememberFocus(); setPreview(true);
        }
      }}
      onPointerLeave={() => {
        pointerInside.current = false; dismissed.current = false;
        if (!sidebar.current?.contains(document.activeElement) && !sidebar.current?.querySelector(":popover-open, dialog[open]")) { rememberFocus(); setPreview(false); }
      }}
      onFocusCapture={() => { if (collapsed && !mobile && !dismissed.current && !touch.current) { rememberFocus(); setPreview(true); } }}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) { dismissed.current = false; if (!pointerInside.current) setPreview(false); }
      }}
      onKeyDown={event => {
        touch.current = false;
        if (event.key === "Escape" && temporary && !event.defaultPrevented && !sidebar.current?.querySelector(":popover-open, dialog[open]")) {
          if (event.target instanceof HTMLElement && event.target.closest(`.${styles.collapseSlot}`))
            returnToNavigation.current = true;
          event.preventDefault(); dismissed.current = true; rememberFocus(); setPreview(false);
        }
      }}>
      <div className={styles.service} data-shell-focus inert={navigationDisabled}>{service(presentation)}</div>
      {navigation?.items.length ? <>
        <div className={styles.mobileNavigation}>
          <Menu label={navigation.label} size="md" align="end" open={mobile && navigationOpen && !navigationDisabled} onOpenChange={setNavigationOpen}
            trigger={<Button size="md" variant="ghost" intent="neutral" icon="controls/hamburger" hitArea="minimum"
              disabled={navigationDisabled} aria-label={navigation.triggerLabel} />}
            items={navigation.items.map(item => ({ id: item.id, label: item.disabled && item.disabledReason ? `${item.label} · ${item.disabledReason}` : item.accessibleLabel ?? item.label,
              icon: item.icon, checked: Boolean(item.current), disabled: item.disabled || navigationDisabled }))} onAction={activate} />
        </div>
        <nav id={navigationId} aria-label={navigation.label} className={styles.navigation}>
          {navigation.items.map(item => {
            const disabled = item.disabled || navigationDisabled;
            const props = { ref: item.current ? currentItemRef : undefined, size: "md" as const, variant: item.current ? "soft" as const : "ghost" as const, intent: "neutral" as const,
              disabled, "aria-current": item.current ? "page" as const : undefined,
              title: item.disabled ? item.disabledReason : undefined, onClick: () => activate(item.id), className: styles.navButton };
            const button = presentation.compact
              ? <Button {...props} icon={item.icon} hitArea="minimum" aria-label={item.accessibleLabel ?? item.label} />
              : <Button {...props} leadingIcon={item.icon} width="full" aria-label={item.accessibleLabel}>{item.label}</Button>;
            return <div key={item.id} className={styles.navSlot} data-shell-focus>
              {presentation.compact && !disabled ? <Tooltip trigger={button} content={item.accessibleLabel ?? item.label} /> : button}
            </div>;
          })}
        </nav>
      </> : null}
      {utility ? <div className={styles.utility} data-shell-focus>{utility(presentation)}</div> : null}
      {user ? <div className={styles.user} data-shell-focus inert={navigationDisabled}>{user(presentation)}</div> : null}
      <div className={styles.collapseSlot}>
        <Button variant="soft" intent="neutral" size="sm" hitArea="minimum" icon={collapsed ? "controls/pin" : "arrows/basic/left"}
          aria-label={collapsed ? expandLabel : collapseLabel} aria-expanded={!collapsed} aria-controls={navigation?.items.length ? navigationId : undefined}
          onClick={() => { dismissed.current = true; returnToNavigation.current = !collapsed; rememberFocus(); setPreview(false); setCollapsed(value => !value); }} className={styles.collapse} />
      </div>
    </aside>
    <main id={mainId} tabIndex={-1} className={styles.main}>{children}</main>
  </div>;
}
