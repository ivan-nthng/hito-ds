import { useSyncExternalStore } from "react";
const mobileQuery = "(max-width: 39.999rem)";
const subscribe = (callback: () => void) => {
  const query = window.matchMedia(mobileQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getNarrow = () => window.matchMedia(mobileQuery).matches;
const getServerNarrow = () => false;

export function useSelectionSheet(size: string) {
  return useSyncExternalStore(subscribe, getNarrow, getServerNarrow) && size !== "sm";
}
