import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button, List, ListItem, Select, Text, TextInput } from "../components";
import { columns, icons, owners, statuses, type FilterBarCopy, type FilterField, type Filters, type SortRule, type TextRule } from "./filter-bar-content.story";
import styles from "./filter-bar.story.module.css";

type EditorProps = {
  field: FilterField;
  filters: Filters;
  copy: FilterBarCopy;
  query: string;
  onCommit: (filters: Filters) => void;
  onCancel: () => void;
};

export function FilterEditor({ field, filters, copy, query, onCommit, onCancel }: EditorProps) {
  const [text, setText] = useState<TextRule>(filters.name ?? { operator: "contains", value: "" });
  const [ownerIds, setOwnerIds] = useState(filters.owner);
  const emptyRule = text.operator === "empty" || text.operator === "notEmpty";
  const applied = field === "name" ? !!filters.name : field === "owner" ? filters.owner.length > 0 : !!filters.status;
  const clear = () => onCommit({ ...filters, [field]: field === "owner" ? [] : field === "name" ? null : "" });
  if (field === "status") {
    const matches = statuses.filter(status => copy.statusLabels[status].toLocaleLowerCase(copy.locale).includes(query.trim().toLocaleLowerCase(copy.locale)));
    return <List role="presentation">
      {matches.map(status => <ListItem key={status} size="sm" role="button" tabIndex={0} label={copy.statusLabels[status]} leading={{ selectionMark: filters.status === status }} selected={filters.status === status} aria-pressed={filters.status === status}
        onClick={() => onCommit({ ...filters, status })} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onCommit({ ...filters, status }); } }} />)}
      {!matches.length ? <ListItem size="sm" label={<span role="status">{copy.noMatches}</span>} /> : null}
      {applied ? <ListItem size="sm" role="button" tabIndex={0} label={copy.clear} onClick={clear} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); clear(); } }} /> : null}
    </List>;
  }
  const matchingOwners = owners.filter(owner => owner.name.toLocaleLowerCase(copy.locale).includes(query.trim().toLocaleLowerCase(copy.locale)));
  const valid = field === "owner" ? ownerIds.length > 0 : emptyRule || text.value.trim().length > 0;
  return <form className={styles.editor} data-rule-type={field} onSubmit={event => {
    event.preventDefault();
    if (valid) onCommit(field === "owner" ? { ...filters, owner: ownerIds } : { ...filters, name: { ...text, value: emptyRule ? "" : text.value.trim() } });
  }}>
    {field === "name" ? <>
      <div className={styles.conditionRow}>
        <Text as="span" variant="ui-sm" className={styles.muted}>{copy.name}</Text>
        <Select label={copy.operator} closeLabel={copy.close} size="sm" appearance="ghost" width="hug" value={text.operator} onValueChange={operator => setText(current => ({ ...current, operator: operator as TextRule["operator"] }))}
          options={[{ value: "contains", label: copy.contains }, { value: "notContains", label: copy.notContains }, { value: "equals", label: copy.equals }, { value: "empty", label: copy.emptyOperator }, { value: "notEmpty", label: copy.notEmpty }]} />
      </div>
      {!emptyRule ? <TextInput aria-label={copy.value} placeholder={copy.enterValue} required appearance="soft" size="sm" value={text.value} onChange={event => { const value = event.currentTarget.value; setText(current => ({ ...current, value })); }} /> : null}
    </> : <>
      <Text variant="body-sm" className={styles.choiceHint}>{copy.anyOf}</Text>
      <List>{matchingOwners.map(owner => <ListItem key={owner.id} size="sm" label={owner.name} leading={{ checkbox: { checked: ownerIds.includes(owner.id), onChange: event => { const checked = event.currentTarget.checked; setOwnerIds(current => checked ? [...current, owner.id] : current.filter(id => id !== owner.id)); } } }} />)}</List>
      {!matchingOwners.length ? <Text variant="body-sm" role="status">{copy.noMatches}</Text> : null}
    </>}
    <div className={styles.editorActions}>
      <Button intent="neutral" variant="ghost" size="sm" onClick={onCancel}>{copy.cancel}</Button>
      <Button intent="accent" variant="primary" size="sm" type="submit" disabled={!valid}>{copy.apply}</Button>
    </div>
    {applied ? <Button intent="neutral" variant="ghost" size="sm" onClick={clear}>{copy.clear}</Button> : null}
  </form>;
}

/** A caller-owned, synthetic ordered-sort editor; it does not belong to FilterBar's public API. */
export function SortEditor({ sorts, onChange, copy }: { sorts: SortRule[]; onChange: (sorts: SortRule[]) => void; copy: FilterBarCopy }) {
  const [adding, setAdding] = useState(sorts.length === 0);
  const root = useRef<HTMLDivElement>(null);
  const addButton = useRef<HTMLLIElement>(null);
  const pendingFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (pendingFocus.current?.hasAttribute("disabled") || pendingFocus.current?.getAttribute("aria-disabled") === "true") root.current?.querySelector<HTMLElement>('[role="combobox"]')?.focus();
    else pendingFocus.current?.focus();
    pendingFocus.current = null;
  }, [sorts]);
  const available = columns.filter(column => !sorts.some(rule => rule.column === column));
  const activate = (event: KeyboardEvent<HTMLLIElement>, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  };
  const toggleAdding = () => { if (available.length) setAdding(value => !value); };
  const add = (column: SortRule["column"]) => {
    pendingFocus.current = addButton.current;
    setAdding(false);
    onChange([...sorts, { column, direction: column === "updated" ? "descending" : "ascending" }]);
  };
  const clear = () => { pendingFocus.current = addButton.current; setAdding(true); onChange([]); };
  const move = (index: number, offset: number, trigger: HTMLButtonElement) => {
    const next = [...sorts];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    // The opposite arrow remains enabled when this rule arrives at either boundary.
    pendingFocus.current = trigger.parentElement?.querySelector<HTMLButtonElement>(`[data-move="${-offset}"]`) ?? addButton.current;
    onChange(next);
  };
  return <div ref={root} className={styles.sortEditor}>
    {sorts.map((rule, index) => <div className={styles.sortRule} key={rule.column} data-sort-field={rule.column}>
      <List role="presentation"><ListItem size="sm" label={`${index + 1}. ${copy[rule.column]}`} leading={{ icon: icons[rule.column] }} /></List>
      <Select size="sm" appearance="soft" label={`${copy.direction}: ${copy[rule.column]}`} closeLabel={copy.close} value={rule.direction} options={[{ value: "ascending", label: copy.ascending }, { value: "descending", label: copy.descending }]}
        onValueChange={direction => onChange(sorts.map(item => item.column === rule.column ? { ...item, direction: direction as SortRule["direction"] } : item))} />
      <div className={styles.sortActions}>
        <Button size="sm" variant="ghost" intent="neutral" icon="arrows/compact/up" data-move="-1" aria-label={`${copy.moveUp}: ${copy[rule.column]}`} title={copy.moveUp} disabled={index === 0} onClick={event => move(index, -1, event.currentTarget)} />
        <Button size="sm" variant="ghost" intent="neutral" icon="arrows/compact/down" data-move="1" aria-label={`${copy.moveDown}: ${copy[rule.column]}`} title={copy.moveDown} disabled={index === sorts.length - 1} onClick={event => move(index, 1, event.currentTarget)} />
        <Button size="sm" variant="ghost" intent="neutral" icon="controls/close-s" aria-label={`${copy.remove}: ${copy[rule.column]}`} title={copy.remove} onClick={() => { pendingFocus.current = addButton.current; onChange(sorts.filter(item => item.column !== rule.column)); }} />
      </div>
    </div>)}
    <List role="presentation">
      <ListItem ref={addButton} size="sm" role="button" tabIndex={available.length ? 0 : -1} label={copy.addSort} leading={{ icon: "controls/plus-s" }} aria-expanded={adding && available.length > 0} aria-disabled={!available.length || undefined} className={!available.length ? styles.muted : undefined}
        onClick={toggleAdding} onKeyDown={event => activate(event, toggleAdding)} />
      {adding && available.length ? available.map(column => <ListItem key={column} size="sm" role="button" tabIndex={0} label={copy[column]} leading={{ icon: icons[column] }}
        onClick={() => add(column)} onKeyDown={event => activate(event, () => add(column))} />) : null}
      {sorts.length ? <ListItem size="sm" role="button" tabIndex={0} label={copy.clearSort}
        onClick={clear} onKeyDown={event => activate(event, clear)} /> : null}
    </List>
  </div>;
}
