"use client";

import {
  forwardRef,
  useCallback,
  useId,
  type FocusEvent,
  type ForwardedRef,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Button } from "../../components/Button/Button";
import { useControlDisclosure } from "../../components/control-disclosure/useControlDisclosure";
import {
  SearchField,
  type SearchFieldProps,
} from "../../components/SearchField/SearchField";
import styles from "./ExpandableSearch.module.css";

type ExpandableSearchDisclosureProps =
  | {
      defaultExpanded?: never;
      expanded: boolean;
      onExpandedChange: (expanded: boolean) => void;
    }
  | {
      defaultExpanded?: boolean;
      expanded?: never;
      onExpandedChange?: (expanded: boolean) => void;
    };

type ExpandableSearchBaseProps = SearchFieldProps & {
  collapseVariant?: "secondary" | "ghost";
  closeLabel: string;
  openLabel: string;
};

export type ExpandableSearchProps = ExpandableSearchBaseProps &
  ExpandableSearchDisclosureProps;

function setForwardedRef(
  ref: ForwardedRef<HTMLInputElement>,
  node: HTMLInputElement | null,
) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

export const ExpandableSearch = forwardRef<
  HTMLInputElement,
  ExpandableSearchProps
>(function ExpandableSearch(
  {
    collapseVariant = "secondary",
    closeLabel,
    defaultExpanded,
    disabled,
    expanded,
    onExpandedChange,
    onFocus,
    onInvalid,
    onKeyDown,
    openLabel,
    size = "md",
    tabIndex,
    ...searchFieldProps
  },
  ref,
) {
  const contentId = useId();
  const disclosure = useControlDisclosure({
    defaultExpanded,
    disabled,
    expanded,
    onExpandedChange,
  });

  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      disclosure.contentRef.current = node;
      setForwardedRef(ref, node);
    },
    [disclosure.contentRef, ref],
  );

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (!disclosure.expanded) disclosure.open();
    onFocus?.(event);
  }

  function handleInvalid(event: FormEvent<HTMLInputElement>) {
    if (!disclosure.expanded) disclosure.open();
    onInvalid?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    disclosure.handleContentKeyDown(event);
  }

  return (
    <div
      className={styles.root}
      data-expanded={disclosure.expanded || undefined}
      data-size={size}
      ref={disclosure.rootRef}
    >
      <span
        aria-hidden={disclosure.expanded ? undefined : true}
        className={styles.viewport}
        id={contentId}
      >
        <SearchField
          {...searchFieldProps}
          disabled={disabled}
          onFocus={handleFocus}
          onInvalid={handleInvalid}
          onKeyDown={handleKeyDown}
          ref={setInputRef}
          size={size}
          tabIndex={disclosure.expanded ? tabIndex : -1}
        />
      </span>
      <Button
        aria-controls={contentId}
        aria-expanded={disclosure.expanded}
        aria-label={disclosure.expanded ? closeLabel : openLabel}
        className={styles.trigger}
        disabled={!disclosure.expanded && disabled}
        icon={disclosure.expanded ? "controls/close-s" : "general/search"}
        intent="neutral"
        onClick={disclosure.toggle}
        ref={disclosure.triggerRef}
        size={size}
        variant={disclosure.expanded ? collapseVariant : "ghost"}
      />
    </div>
  );
});
