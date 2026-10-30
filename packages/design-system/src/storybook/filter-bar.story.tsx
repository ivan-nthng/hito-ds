import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { Avatar, Button, Checkbox, FilterTrigger, List, ListItem, Menu, SearchField, StatusBadge, Text, type MenuEntry } from "../components";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, type TableDensity } from "../components/Table/Table";
import { SelectionPanel } from "../components/selection-panel/SelectionPanel";
import { ExpandableSearch } from "../patterns/ExpandableSearch/ExpandableSearch";
import { FilterBar } from "../patterns/FilterBar/FilterBar";
import { columns, fields, filterBarCopy, filterSummary, icons, owners, type FilterColumn, type FilterField, type Filters, type SortRule } from "./filter-bar-content.story";
import { FilterEditor, SortEditor } from "./filter-bar-editors.story";
import { toggleVisibleSelection, visibleSelectionState } from "./table-selection.story";
import styles from "./filter-bar.story.module.css";

type Panel = "filters" | "sort" | FilterColumn;
type DemoAction = "export" | "share";
type Props = { density: TableDensity; initialFilters: boolean; initialSorts?: boolean; selection?: boolean; profile: unknown; onAction?: (id: DemoAction) => void };
const narrowQuery = "(max-width: 39.999rem)";
const subscribeNarrow = (callback: () => void) => {
  const media = window.matchMedia(narrowQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const readNarrow = () => window.matchMedia(narrowQuery).matches;
const readServerNarrow = () => false;
const emptyFilters = (): Filters => ({ name: null, owner: [], status: "" });
function activate(event: KeyboardEvent<HTMLLIElement>, action: () => void, branch = false) {
  if (event.key === "Enter" || event.key === " " || (branch && event.key === "ArrowRight")) {
    event.preventDefault(); event.stopPropagation(); action();
  }
}

/** Synthetic consumer recipe. No business predicates or query state belong to the public pattern. */
export function FilterBarExample({ density, initialFilters, initialSorts = false, selection = false, profile, onAction }: Props) {
  const copy = filterBarCopy(profile);
  const focusBeforeResize = useRef<Element | null>(null);
  const subscribeViewport = useCallback((notify: () => void) => subscribeNarrow(() => {
    focusBeforeResize.current = document.activeElement;
    notify();
  }), []);
  const narrow = useSyncExternalStore(subscribeViewport, readNarrow, readServerNarrow);
  const previousNarrow = useRef(narrow);
  const id = useId();
  const anchor = useRef<HTMLElement | null>(null);
  const filterButton = useRef<HTMLButtonElement | null>(null);
  const moreButton = useRef<HTMLButtonElement | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);
  const focusSearch = useRef(false);
  const branchAnchor = useRef<HTMLLIElement | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelHover = () => clearTimeout(hoverTimer.current);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [filterSource, setFilterSource] = useState<"toolbar" | "add" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoAction, setDemoAction] = useState<DemoAction | null>(null);
  const [branch, setBranch] = useState<FilterField | null>(null);
  const [focusChild, setFocusChild] = useState(false);
  const [panelQuery, setPanelQuery] = useState("");
  const [choiceQuery, setChoiceQuery] = useState("");
  const [query, setQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => initialFilters ? { name: null, owner: ["alex"], status: "review" } : emptyFilters());
  const [shownFields, setShownFields] = useState<FilterField[]>(() => initialFilters ? ["status", "owner"] : []);
  const [chipOpen, setChipOpen] = useState<FilterField | null>(null);
  const [chipQuery, setChipQuery] = useState("");
  const [sorts, setSorts] = useState<SortRule[]>(() => initialSorts ? [{ column: "status", direction: "ascending" }, { column: "name", direction: "ascending" }] : []);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (searchExpanded && focusSearch.current) {
      focusSearch.current = false;
      searchInput.current?.focus();
    }
  }, [searchExpanded]);
  useEffect(() => {
    if (previousNarrow.current === narrow) return;
    previousNarrow.current = narrow;
    clearTimeout(hoverTimer.current);
    setPanel(null); setFilterSource(null); setMenuOpen(false); setBranch(null); setChipOpen(null);
    if ((focusBeforeResize.current && !focusBeforeResize.current.isConnected) || (panel && anchor.current && !anchor.current.isConnected)) {
      (narrow ? moreButton : filterButton).current?.focus();
    }
    focusBeforeResize.current = null;
  }, [narrow, panel]);

  const close = () => { cancelHover(); setPanel(null); setFilterSource(null); setBranch(null); setPanelQuery(""); setChoiceQuery(""); };
  const open = (next: Panel, target: HTMLElement, source: "toolbar" | "add" | null = null) => {
    cancelHover(); anchor.current = target; setMenuOpen(false); setChipOpen(null); setBranch(null); setPanelQuery(""); setChoiceQuery(""); setFilterSource(next === "filters" ? source : null); setPanel(next);
  };
  const changeSearch = (next: boolean) => {
    close(); setSearchExpanded(next);
    if (!next && narrow) moreButton.current?.focus();
  };
  const showSearch = () => {
    close();
    if (searchExpanded) searchInput.current?.focus();
    else { focusSearch.current = true; setSearchExpanded(true); }
  };
  const clearFilters = () => {
    setFilters(emptyFilters()); setShownFields([]); close();
    (narrow ? moreButton : filterButton).current?.focus();
  };
  const commit = (field: FilterField, next: Filters) => {
    setFilters(next);
    setShownFields(current => current.includes(field) ? current : [...current, field]);
    close(); setChipOpen(null);
  };
  const enter = (field: FilterField, target: HTMLLIElement, focus: boolean) => {
    cancelHover(); branchAnchor.current = target;
    if (branch !== field) setChoiceQuery("");
    setFocusChild(focus); setBranch(field);
  };
  const back = () => { cancelHover(); setBranch(null); setChoiceQuery(""); branchAnchor.current?.focus(); };
  const updatePrimarySort = (column: FilterColumn, direction: SortRule["direction"]) => {
    setSorts(current => [{ column, direction }, ...current.filter(rule => rule.column !== column)]);
    close();
  };
  const handleBranchPointerEnter = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType !== "mouse") return;
    const target = event.currentTarget;
    const field = target.dataset.field as FilterField;
    cancelHover();
    if (branch && branch !== field) {
      const duration = getComputedStyle(target).getPropertyValue("--motion-duration-feedback").trim();
      hoverTimer.current = setTimeout(() => enter(field, target, false), parseFloat(duration) * (duration.endsWith("ms") ? 1 : 1000));
    } else enter(field, target, false);
  };
  const sortRow = (column: FilterColumn, direction: SortRule["direction"]) => <ListItem
    key={`${column}-${direction}`} size="sm" role="button" tabIndex={0} label={copy[direction]}
    leading={{ icon: direction === "ascending" ? "arrows/compact/up" : "arrows/compact/down" }}
    trailing={{ selectionMark: sorts[0]?.column === column && sorts[0]?.direction === direction }}
    selected={sorts[0]?.column === column && sorts[0]?.direction === direction}
    onClick={() => updatePrimarySort(column, direction)} onKeyDown={event => activate(event, () => updatePrimarySort(column, direction))}
  />;
  const branchRow = (field: FilterField, column = false) => <ListItem key={field} size="sm" role="button" tabIndex={0}
    label={column ? copy.filterColumn : copy[field]} leading={{ icon: icons[field] }} trailing={{ icon: "arrows/compact/right" }}
    aria-haspopup="dialog" aria-expanded={branch === field} data-field={field}
    onPointerEnter={handleBranchPointerEnter} onPointerLeave={cancelHover}
    onClick={event => enter(field, event.currentTarget, true)} onKeyDown={event => activate(event, () => enter(field, event.currentTarget, true), true)}
  />;
  const rootTitle = panel === "filters" ? copy.addFilter : panel === "sort" ? copy.sort : panel ? copy[panel] : copy.filters;
  const filterCount = fields.filter(field => filterSummary(field, filters, copy)).length;
  const menuItems: MenuEntry[] = [
    ...(narrow ? [
      { id: "search", label: copy.search },
      { id: "filters", label: copy.filters },
      { id: "sort", label: copy.sort },
      ...(filterCount ? [{ id: "clear-filters", label: copy.clearAll }] : []),
      { id: "table-actions", separator: true as const },
    ] : []),
    { id: "export", label: copy.exportAction },
    { id: "share", label: copy.shareAction },
  ];
  const handleMenuAction = (action: string) => {
    if (action === "search") showSearch();
    else if (action === "filters" || action === "sort") {
      if (moreButton.current) open(action, moreButton.current);
    } else if (action === "clear-filters") clearFilters();
    else if (action === "export" || action === "share") {
      setDemoAction(action);
      onAction?.(action);
    }
  };
  const records = [
    { id: "SA-104", name: copy.names[0], owner: owners[0], status: "ready", updated: "2026-09-16" },
    { id: "SA-103", name: copy.names[1], owner: owners[1], status: "review", updated: "2026-09-15" },
    { id: "SA-102", name: copy.names[2], owner: owners[2], status: "draft", updated: "2026-09-14" },
    { id: "SA-101", name: copy.names[3], owner: owners[1], status: "review", updated: "2026-09-13" },
  ];
  const rows = records.filter(row => {
    const name = row.name.toLocaleLowerCase(copy.locale);
    const rule = filters.name;
    const textValue = rule?.value.toLocaleLowerCase(copy.locale) ?? "";
    const matchesName = !rule || (rule.operator === "empty" ? name === "" : rule.operator === "notEmpty" ? name !== "" : rule.operator === "equals" ? name === textValue : rule.operator === "notContains" ? !name.includes(textValue) : name.includes(textValue));
    return matchesName && (!filters.owner.length || filters.owner.includes(row.owner.id)) && (!filters.status || row.status === filters.status) && `${row.name} ${row.owner.name}`.toLocaleLowerCase(copy.locale).includes(query.trim().toLocaleLowerCase(copy.locale));
  });
  if (sorts.length) rows.sort((a, b) => {
    for (const sort of sorts) {
      // This synthetic fixture has its own explicit status order; the pattern never defines one.
      const compared = sort.column === "status" ? ["draft", "review", "ready"].indexOf(a.status) - ["draft", "review", "ready"].indexOf(b.status) :
        (sort.column === "owner" ? a.owner.name : a[sort.column]).localeCompare(sort.column === "owner" ? b.owner.name : b[sort.column], copy.locale);
      if (compared) return compared * (sort.direction === "ascending" ? 1 : -1);
    }
    return a.id.localeCompare(b.id);
  });
  const visibleIds = rows.map(row => row.id);
  const headerSelection = visibleSelectionState(selected, visibleIds);
  const searchChoices = (value: string, onValueChange: (value: string) => void) => <SearchField size="sm" appearance="soft" aria-label={copy.findValue} placeholder={copy.findValue} clearLabel={copy.clearSearch} value={value} onValueChange={onValueChange} />;

  return <main className={styles.page} lang={copy.lang}>
    <FilterBar title={copy.title} actions={<>
      {!narrow || searchExpanded ? <ExpandableSearch ref={searchInput} collapseVariant="ghost" size="sm" appearance="soft" aria-label={copy.search} placeholder={copy.search} openLabel={copy.search} closeLabel={copy.closeSearch} clearLabel={copy.clearSearch} expanded={searchExpanded} onExpandedChange={changeSearch} value={query} onValueChange={setQuery} /> : null}
      {!narrow ? <>
        <Button ref={filterButton} size="sm" variant={filterCount ? "soft" : "ghost"} intent="neutral" icon="controls/filter" aria-label={copy.filters} title={copy.filters} aria-describedby={`${id}-filter-count`} aria-haspopup="dialog" aria-expanded={panel === "filters" && filterSource === "toolbar"} aria-controls={panel === "filters" && filterSource === "toolbar" ? `${id}-panel` : undefined} onClick={event => panel === "filters" && filterSource === "toolbar" ? close() : open("filters", event.currentTarget, "toolbar")} />
        <Button size="sm" variant={sorts.length ? "soft" : "ghost"} intent="neutral" icon="arrows/sorting" aria-label={copy.sort} title={copy.sort} aria-describedby={`${id}-sort-count`} aria-haspopup="dialog" aria-expanded={panel === "sort"} aria-controls={panel === "sort" ? `${id}-panel` : undefined} onClick={event => panel === "sort" ? close() : open("sort", event.currentTarget)} />
      </> : null}
      <Menu label={copy.moreActions} open={menuOpen} size="sm" align="end" className={styles.moreMenu} items={menuItems}
        onOpenChange={next => { setMenuOpen(next); if (next) close(); }} onAction={handleMenuAction}
        trigger={<Button ref={moreButton} size="sm" variant={menuOpen || (narrow && (filterCount || sorts.length || query.trim())) ? "soft" : "ghost"} intent="neutral" icon="controls/more" aria-label={copy.moreActions} title={copy.moreActions} aria-describedby={narrow ? `${id}-filter-count ${id}-sort-count` : undefined} data-open={narrow && panel !== null || undefined} />} />
    </>} filters={shownFields.length ? <>
      {filterCount > 1 ? <Text as="span" variant="body-sm" className={styles.muted}>{copy.matchAll}</Text> : null}
      {shownFields.map(field => <FilterTrigger key={field} size="sm" label={`${copy[field]}:`} addLabel={`${copy.add} ${copy[field]}`} value={filterSummary(field, filters, copy) || null} leadingIcon={icons[field]} title={copy[field]} closeLabel={copy.close} open={chipOpen === field} onOpenChange={next => { close(); setChipQuery(""); setChipOpen(next ? field : null); }} searchRegion={field === "name" ? undefined : searchChoices(chipQuery, setChipQuery)}>
        <FilterEditor field={field} filters={filters} copy={copy} query={chipQuery} onCommit={next => commit(field, next)} onCancel={() => setChipOpen(null)} />
      </FilterTrigger>)}
      {!narrow ? <Button size="sm" variant="ghost" intent="neutral" leadingIcon="controls/plus-s" aria-haspopup="dialog" aria-expanded={panel === "filters" && filterSource === "add"} aria-controls={panel === "filters" && filterSource === "add" ? `${id}-panel` : undefined} onClick={event => panel === "filters" && filterSource === "add" ? close() : open("filters", event.currentTarget, "add")}>{copy.addFilter}</Button> : null}
      {!narrow && filterCount ? <Button size="sm" variant="ghost" intent="neutral" onClick={clearFilters}>{copy.clearAll}</Button> : null}
    </> : null} />
    {demoAction ? <Text variant="body-sm" role="status" className={styles.muted}>{demoAction === "export" ? copy.exportDemoOnly : copy.shareDemoOnly}</Text> : null}
    <span id={`${id}-filter-count`} className={styles.visuallyHidden}>{copy.filters}: {filterCount}</span>
    <span id={`${id}-sort-count`} className={styles.visuallyHidden}>{copy.sort}: {sorts.length}</span>
    <span id={`${id}-sort-description`} className={styles.visuallyHidden}>{sorts.map((rule, index) => `${copy.priority} ${index + 1}: ${copy[rule.column]}, ${copy[rule.direction]}`).join(". ")}</span>
    <span className={styles.visuallyHidden} role="status">{copy.results}: {rows.length}</span>
    {selection ? <span className={styles.visuallyHidden} role="status">{selected.length} {copy.selected}</span> : null}
    <Table density={narrow ? "compact" : density} aria-label={copy.results} aria-describedby={`${id}-sort-description`}>
      <TableHeader><TableRow>{selection ? <TableHeaderCell><Checkbox size="sm" label={null} aria-label={copy.selectVisible} disabled={!visibleIds.length} checked={headerSelection.checked} indeterminate={headerSelection.indeterminate} onChange={() => setSelected(current => toggleVisibleSelection(current, visibleIds, !visibleSelectionState(current, visibleIds).checked))} /></TableHeaderCell> : null}{columns.map(column => <TableHeaderCell key={column} aria-sort={sorts[0]?.column === column ? sorts[0].direction : undefined}>
        <Button size="sm" intent="neutral" variant="ghost" className={styles.columnButton} trailingIcon={sorts.some(rule => rule.column === column) ? sorts.find(rule => rule.column === column)?.direction === "ascending" ? "arrows/compact/up" : "arrows/compact/down" : undefined} aria-label={`${copy.columnMenu}: ${copy[column]}`} aria-haspopup="dialog" aria-expanded={panel === column} onClick={event => panel === column ? close() : open(column, event.currentTarget)}>{copy[column]}</Button>
      </TableHeaderCell>)}</TableRow></TableHeader>
      <TableBody>{rows.length ? rows.map(row => <TableRow key={row.id} data-record-id={row.id} selected={selection && selected.includes(row.id)}>
        {selection ? <TableCell><Checkbox size="sm" label={null} aria-label={`${copy.select} ${row.name}`} checked={selected.includes(row.id)} onChange={event => setSelected(current => event.target.checked ? [...new Set([...current, row.id])] : current.filter(id => id !== row.id))} /></TableCell> : null}
        <TableHeaderCell scope="row"><Text variant={narrow ? "body-sm" : "body-base"} className={styles.name}>{row.name}</Text></TableHeaderCell>
        <TableCell><span className={styles.entity}><Avatar size="xs" decorative initials={row.owner.initials} /><Text as="span" variant="body-sm">{row.owner.name}</Text></span></TableCell>
        <TableCell><StatusBadge size="sm" variant="soft" label={copy.statusLabels[row.status as keyof typeof copy.statusLabels]} intent={row.status === "ready" ? "success" : row.status === "review" ? "info" : "neutral"} icon={row.status === "ready" ? "general/status-check-circle" : row.status === "review" ? "general/status-progress-half" : "general/status-dashed-circle"} /></TableCell>
        <TableCell><Text as="span" variant="data-sm" className={styles.date}><time dateTime={row.updated}>{new Intl.DateTimeFormat(copy.locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${row.updated}T12:00:00Z`))}</time></Text></TableCell>
      </TableRow>) : <TableRow><TableCell colSpan={selection ? 5 : 4}><Text variant={narrow ? "body-sm" : "body-base"} className={styles.empty}>{copy.empty}</Text></TableCell></TableRow>}</TableBody>
    </Table>

    <SelectionPanel id={`${id}-panel`} open={panel !== null} onOpenChange={next => { if (!next) close(); }} anchorRef={anchor} size="sm" title={rootTitle} closeLabel={copy.close}
      searchRegion={panel === "filters" ? <SearchField size="sm" appearance="soft" aria-label={copy.findFilter} placeholder={copy.findFilter} clearLabel={copy.clearSearch} value={panelQuery} onValueChange={value => { setPanelQuery(value); setBranch(null); }} /> : undefined}>
      {panel === "sort" ? <SortEditor sorts={sorts} onChange={setSorts} copy={copy} /> : <List role="presentation">
        {panel === "filters" ? fields.filter(field => copy[field].toLocaleLowerCase(copy.locale).includes(panelQuery.trim().toLocaleLowerCase(copy.locale))).map(field => branchRow(field)) : panel ? <>{sortRow(panel, "ascending")}{sortRow(panel, "descending")}{panel !== "updated" ? branchRow(panel, true) : null}</> : null}
        {panel === "filters" && !fields.some(field => copy[field].toLocaleLowerCase(copy.locale).includes(panelQuery.trim().toLocaleLowerCase(copy.locale))) ? <ListItem size="sm" label={<span role="status">{copy.noMatches}</span>} /> : null}
      </List>}
      {branch ? <SelectionPanel key={branch} id={`${id}-child`} open anchorRef={branchAnchor} placement="inline-end" autoFocus={focusChild} size="sm" title={copy[branch]} closeLabel={copy.close} onOpenChange={next => { if (!next) back(); }} searchRegion={branch === "name" ? undefined : searchChoices(choiceQuery, setChoiceQuery)}>
        <div onPointerEnter={cancelHover} onKeyDown={event => { if (event.key === "ArrowLeft" && !["INPUT", "TEXTAREA"].includes((event.target as HTMLElement).tagName)) { event.preventDefault(); event.stopPropagation(); back(); } }}><FilterEditor field={branch} filters={filters} copy={copy} query={choiceQuery} onCommit={next => commit(branch, next)} onCancel={close} /></div>
      </SelectionPanel> : null}
    </SelectionPanel>
  </main>;
}
