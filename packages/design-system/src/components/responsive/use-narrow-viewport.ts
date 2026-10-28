import { useSyncExternalStore } from "react";

const narrowQuery = "(max-width: 39.999rem)";
const subscribe = (callback: () => void) => {
  const query = window.matchMedia(narrowQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
};
const getNarrow = () => window.matchMedia(narrowQuery).matches;
const getServerNarrow = () => false;

export function useNarrowViewport() {
  return useSyncExternalStore(subscribe, getNarrow, getServerNarrow);
}
