"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type UseControlDisclosureOptions = {
  defaultExpanded?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

type CloseOptions = {
  returnFocus?: boolean;
};

export function useControlDisclosure({
  defaultExpanded = false,
  disabled = false,
  expanded,
  onExpandedChange,
}: UseControlDisclosureOptions) {
  const controlled = expanded !== undefined;
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    useState(defaultExpanded);
  const isExpanded = controlled ? expanded : uncontrolledExpanded;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLInputElement | null>(null);
  const focusContentOnOpenRef = useRef(false);
  const focusTriggerOnCloseRef = useRef(false);

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (nextExpanded === isExpanded) return;
      if (!controlled) setUncontrolledExpanded(nextExpanded);
      onExpandedChange?.(nextExpanded);
    },
    [controlled, isExpanded, onExpandedChange],
  );

  const open = useCallback(() => {
    if (disabled || isExpanded) return;
    focusContentOnOpenRef.current = true;
    setExpanded(true);
  }, [disabled, isExpanded, setExpanded]);

  const close = useCallback(
    ({ returnFocus = false }: CloseOptions = {}) => {
      if (!isExpanded) return;
      focusTriggerOnCloseRef.current = returnFocus;
      setExpanded(false);
    },
    [isExpanded, setExpanded],
  );

  const toggle = useCallback(() => {
    if (isExpanded) {
      close({ returnFocus: true });
    } else {
      open();
    }
  }, [close, isExpanded, open]);

  const handleContentKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (
        event.defaultPrevented ||
        event.nativeEvent.isComposing ||
        event.key !== "Escape"
      ) {
        return;
      }

      event.preventDefault();
      close({ returnFocus: true });
    },
    [close],
  );

  useEffect(() => {
    if (!isExpanded || !focusContentOnOpenRef.current) return;

    focusContentOnOpenRef.current = false;
    contentRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded || !focusTriggerOnCloseRef.current) return;

    focusTriggerOnCloseRef.current = false;
    triggerRef.current?.focus();
  }, [isExpanded]);

  useEffect(() => {
    if (!isExpanded) return;

    function handleOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || rootRef.current?.contains(target)) return;
      close();
    }

    document.addEventListener("pointerdown", handleOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer, true);
  }, [close, isExpanded]);

  return {
    close,
    contentRef,
    expanded: isExpanded,
    handleContentKeyDown,
    open,
    rootRef,
    toggle,
    triggerRef,
  };
}
