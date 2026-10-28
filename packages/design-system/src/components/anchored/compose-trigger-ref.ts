import type { Ref } from "react";

/** Ref assignments happen at commit, including React 19 callback-ref cleanup. */
export function assignTriggerRef(targetRef: Ref<HTMLButtonElement> | undefined, node: HTMLButtonElement | null) {
  if (typeof targetRef === "function") return targetRef(node);
  if (targetRef) targetRef.current = node;
}
