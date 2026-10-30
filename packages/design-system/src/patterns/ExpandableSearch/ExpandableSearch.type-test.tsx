import { ExpandableSearch } from "./ExpandableSearch";

void (
  <ExpandableSearch
    aria-label="Search"
    clearLabel="Clear search"
    closeLabel="Close search"
    defaultExpanded
    openLabel="Open search"
  />
);

void (
  <ExpandableSearch
    aria-label="Search"
    clearLabel="Clear search"
    closeLabel="Close search"
    expanded
    onExpandedChange={() => undefined}
    openLabel="Open search"
  />
);

void (
  (
    // @ts-expect-error Controlled disclosure requires its change callback.
    <ExpandableSearch
      aria-label="Search"
      clearLabel="Clear search"
      closeLabel="Close search"
      expanded
      openLabel="Open search"
    />
  )
);

void (
  (
    // @ts-expect-error Controlled and uncontrolled disclosure are exclusive.
    <ExpandableSearch
      aria-label="Search"
      clearLabel="Clear search"
      closeLabel="Close search"
      defaultExpanded
      expanded
      onExpandedChange={() => undefined}
      openLabel="Open search"
    />
  )
);
