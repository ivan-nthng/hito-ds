/** Migrate only Storybook story/docs bookmarks to a fixed same-origin destination. */
export function legacyBookmark(search: string): string | null {
  const incoming = new URLSearchParams(search);
  const paths = incoming.getAll("path");
  if (paths.length !== 1 || !/^\/(story|docs)\/[a-z0-9][a-z0-9_-]*$/i.test(paths[0])) return null;
  const safe = new URLSearchParams({ path: paths[0] });
  for (const key of ["args", "globals"] as const) {
    const value = incoming.get(key);
    if (value && value.length <= 4096) safe.set(key, value);
  }
  return `/storybook/?${safe.toString()}`;
}
