"use client";

import { useEffectEvent, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { BottomSheet, type BottomSheetDismissReason } from "../../components/BottomSheet/BottomSheet";
import { canFocus, focusableElements } from "../../components/modal/focus-scope";

export type NavigationSheetProps = {
  open: boolean;
  onDismiss: (reason: BottomSheetDismissReason) => void;
  title: string;
  closeLabel: string;
  backLabel: string;
  children: ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
  /** Changes the controlled view to root; never commits or discards caller data. */
  onBack: () => void;
  nested?: {
    /** Stable view identity, independent of its query or contents. */
    id: string;
    title: string;
    children: ReactNode;
    initialFocusRef?: RefObject<HTMLElement | null>;
    /** The root action to focus after Back. It may be absent for direct nested entry. */
    returnFocusRef: RefObject<HTMLElement | null>;
  };
};

/** One modal, a root and one caller-controlled nested view. Query and form state stay with the caller. */
export function NavigationSheet({ open, onDismiss, title, closeLabel, backLabel, children, returnFocusRef, onBack, nested }: NavigationSheetProps) {
  if (!title.trim() || !backLabel.trim() || nested && (!nested.id.trim() || !nested.title.trim())) {
    throw new Error("NavigationSheet requires non-empty titles, Back label and nested view id.");
  }
  const body = useRef<HTMLDivElement>(null);
  const entry = useRef<{ open: boolean; id: string | null; fromRoot: boolean; returnTo?: RefObject<HTMLElement | null> }>({ open: false, id: null, fromRoot: false });
  const view = useEffectEvent(() => nested);
  const id = nested?.id ?? null;
  useLayoutEffect(() => {
    const previous = entry.current;
    if (!open) { entry.current = { open: false, id: null, fromRoot: false }; return; }
    const current = view();
    // Provenance belongs to each entry: direct nested → Back → nested must now Escape to root.
    entry.current = {
      open: true, id,
      fromRoot: id !== null && previous.open && (previous.id === null || previous.fromRoot),
      returnTo: current?.returnFocusRef,
    };
    const contents = body.current, dialog = contents?.closest("dialog");
    if (!contents || !dialog) return;
    const heading = dialog.ownerDocument.getElementById(dialog.getAttribute("aria-labelledby") ?? "");
    if (current) {
      const requested = current.initialFocusRef?.current;
      const target = requested && contents.contains(requested) && canFocus(requested) ? requested : focusableElements(contents)[0];
      (target ?? heading)?.focus();
    } else {
      const target = previous.id !== null ? previous.returnTo?.current : null;
      (target && dialog.contains(target) && canFocus(target) ? target : heading)?.focus({ preventScroll: true });
    }
  }, [open, id]);
  return <BottomSheet open={open} title={nested?.title ?? title} closeLabel={closeLabel}
    initialFocus="title" returnFocusRef={returnFocusRef}
    navigation={nested ? { back: { label: backLabel, onBack } } : {}}
    onDismiss={reason => {
      if (reason === "escape" && nested && entry.current.fromRoot) onBack();
      else onDismiss(reason);
    }}>
    <div ref={body}>{nested ? nested.children : children}</div>
  </BottomSheet>;
}
