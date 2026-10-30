import { SearchField } from "./SearchField";

const handleValueChange = () => undefined;

void (
  <SearchField
    appearance="ghost"
    aria-label="Search"
    clearLabel="Clear search"
    onValueChange={handleValueChange}
    value="orders"
  />
);

void (
  <SearchField
    aria-label="Search"
    clearLabel="Clear search"
    defaultValue="orders"
  />
);

void (
  (
    // @ts-expect-error A controlled SearchField requires its value-change callback.
    <SearchField aria-label="Search" clearLabel="Clear search" value="orders" />
  )
);

void (
  (
    // @ts-expect-error Controlled and uncontrolled values are mutually exclusive.
    <SearchField
      aria-label="Search"
      clearLabel="Clear search"
      defaultValue="orders"
      onValueChange={handleValueChange}
      value="orders"
    />
  )
);

void (
  <SearchField
    aria-label="Search"
    clearLabel="Clear search"
    // @ts-expect-error SearchField exposes one string value-change seam, not native onChange.
    onChange={() => undefined}
  />
);

void (
  (
    // @ts-expect-error SearchField owns its native search type.
    <SearchField aria-label="Search" clearLabel="Clear search" type="text" />
  )
);
