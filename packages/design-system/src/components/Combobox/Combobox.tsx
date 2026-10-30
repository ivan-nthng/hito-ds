"use client";

import { forwardRef, useContext, useEffect, useId, useImperativeHandle, useRef, useState, type InputHTMLAttributes, type KeyboardEvent } from "react";
import type { ControlWidth } from "../control-width";
import type { ListItemSize } from "../ListItem/ListItem";
import { InputFrame, inputFrameStyles, type InputFrameAppearance } from "../input-frame/InputFrame";
import { ControlClearAction } from "../input-frame/ControlClearAction";
import { resolveControlState, type ControlValidationState } from "../input-frame/control-state";
import { Icon } from "../Icon/Icon";
import { List } from "../List/List";
import { Text } from "../Text/Text";
import { Option, type OptionData } from "../listbox/Option";
import { SelectionPanel } from "../selection-panel/SelectionPanel";
import { useSelectionSheet } from "../selection-panel/useSelectionSheet";
import { classNames } from "../class-names";
import { FieldDescriptionContext } from "../Field/field-description";
import fieldStyles from "../Field/Field.module.css";
import styles from "./Combobox.module.css";

export type ComboboxOption = OptionData;
export type ComboboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "children" | "size" | "width" | "type"> & {
  options: readonly ComboboxOption[];
  label: string;
  clearLabel: string;
  closeLabel: string;
  emptyLabel: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: ListItemSize;
  width?: ControlWidth;
  appearance?: InputFrameAppearance;
  loading?: boolean;
  validationState?: ControlValidationState;
};
const normalize = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();

export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox({
  options, label, clearLabel, closeLabel, emptyLabel, value, defaultValue = "", onValueChange,
  size = "md", appearance = "outlined", width = appearance === "ghost" ? "hug" : "fill",
  loading, validationState, disabled, readOnly, required, name, form, id, className,
  onKeyDown, onClick, onBlur, "aria-invalid": ariaInvalid, ...props
}, ref) {
  const description = useContext(FieldDescriptionContext);
  const generated = useId();
  const controlId = id ?? `${generated}-combobox`;
  const listId = `${controlId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const nativeRef = useRef<HTMLSelectElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  const sheet = useSelectionSheet(size);
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [active, setActive] = useState<string>();
  const committed = value ?? internal;
  const selected = options.find(option => option.value === committed);
  const state = resolveControlState({ disabled, readOnly, loading, validationState, ariaInvalid });
  const unavailable = disabled || state.isReadOnly || !options.some(option => !option.disabled);
  const visibleOpen = open && !unavailable;
  const filtered = draft?.trim() ? options.filter(option => normalize(`${option.label} ${option.description ?? ""}`).includes(normalize(draft.trim()))) : options;
  const enabled = filtered.filter(option => !option.disabled);
  const current = enabled.some(option => option.value === active) ? active : enabled.find(option => option.value === committed)?.value ?? enabled[0]?.value;
  const optionId = (key: string) => `${listId}-${encodeURIComponent(key)}`;
  const latest = useRef({ value, defaultValue });
  useEffect(() => { latest.current = { value, defaultValue }; }, [value, defaultValue]);
  useEffect(() => {
    const owner = nativeRef.current?.form;
    const reset = (event: Event) => queueMicrotask(() => {
      if (event.defaultPrevented) return;
      if (latest.current.value === undefined) setInternal(latest.current.defaultValue);
      if (nativeRef.current) nativeRef.current.value = latest.current.value ?? latest.current.defaultValue;
      setDraft(null); setOpen(false);
    });
    owner?.addEventListener("reset", reset);
    return () => owner?.removeEventListener("reset", reset);
  }, [form]);
  useEffect(() => { setDraft(null); }, [committed]);
  useEffect(() => { if (unavailable) { setOpen(false); setDraft(null); } }, [unavailable]);
  useEffect(() => {
    if (visibleOpen && current) document.getElementById(`${listId}-${encodeURIComponent(current)}`)?.scrollIntoView?.({ block: "nearest" });
  }, [visibleOpen, current, listId]);
  if (new Set(options.map(option => option.value)).size !== options.length || options.some(option => !option.value))
    throw new Error("Combobox options require unique, non-empty values.");
  function cancel() { setDraft(null); setOpen(false); }
  function begin() { if (!unavailable && !visibleOpen) { setDraft(null); setActive(committed); setOpen(true); } }
  function commit(next: string) {
    if (unavailable || !options.some(option => option.value === next && !option.disabled)) return;
    if (value === undefined) setInternal(next);
    if (next !== committed) onValueChange?.(next);
    cancel(); inputRef.current?.focus({ preventScroll: true });
  }
  function clear() {
    if (unavailable) return;
    if (value === undefined) setInternal("");
    if (committed) onValueChange?.("");
    setDraft(null); setActive(undefined);
    (sheet && visibleOpen ? sheetInputRef : inputRef).current?.focus({ preventScroll: true });
  }
  function keys(event: KeyboardEvent<HTMLInputElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing || event.keyCode === 229 || event.altKey || event.ctrlKey || event.metaKey || unavailable) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!visibleOpen) begin();
      else if (enabled.length) {
        const index = enabled.findIndex(option => option.value === current);
        setActive(enabled[(index + (event.key === "ArrowDown" ? 1 : -1) + enabled.length) % enabled.length]?.value);
      }
    } else if (event.key === "Enter" && visibleOpen) {
      event.preventDefault(); if (current) commit(current);
    } else if (event.key === "Escape" && visibleOpen) {
      event.preventDefault(); event.stopPropagation(); cancel();
    } else if (event.key === "Tab" && visibleOpen && !sheet) cancel();
  }
  const text = draft ?? selected?.label ?? "";
  function field(inSheet: boolean) {
    return <InputFrame ref={inSheet ? undefined : frameRef} width={inSheet ? "fill" : width} appearance={inSheet ? "soft" : appearance}
      size={size} disabled={disabled} readOnly={state.isReadOnly} loading={state.isLoading}
      onBlur={event => {
        if (!sheet && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node)) cancel();
      }}
      invalid={state.invalid} validationState={state.resolvedValidationState}
      trailing={!unavailable && (text || committed) ? <ControlClearAction label={clearLabel} onClick={clear} tabIndex={props.tabIndex === -1 ? -1 : undefined} /> : undefined}>
      <Icon name="general/search" size={size} tone="secondary" />
      <input {...props} id={inSheet ? `${controlId}-search` : controlId} ref={inSheet ? sheetInputRef : inputRef}
        type="text" role="combobox" autoComplete="off" className={classNames(inputFrameStyles.input, className)}
        value={text} disabled={disabled} readOnly={state.isReadOnly || unavailable}
        aria-label={inSheet || !props["aria-labelledby"] ? label : undefined}
        aria-labelledby={inSheet ? undefined : props["aria-labelledby"]}
        aria-describedby={inSheet && description ? [description.describedBy, description.error ? `${controlId}-sheet-error` : "", description.hint ? `${controlId}-sheet-hint` : ""].filter(Boolean).join(" ") || undefined : props["aria-describedby"]}
        aria-errormessage={inSheet && description?.error ? `${controlId}-sheet-error` : props["aria-errormessage"]}
        aria-expanded={visibleOpen} aria-controls={visibleOpen ? listId : undefined}
        aria-autocomplete="list" aria-haspopup="listbox" aria-activedescendant={visibleOpen && current && (inSheet || !sheet) ? optionId(current) : undefined}
        aria-required={required || undefined} aria-readonly={state.isReadOnly || undefined}
        aria-disabled={unavailable || undefined} aria-invalid={state.invalid || ariaInvalid} aria-busy={state.isLoading || undefined}
        onKeyDown={keys} onClick={event => { onClick?.(event); if (!event.defaultPrevented) begin(); }}
        onChange={event => { if (!unavailable) { setDraft(event.target.value); setActive(undefined); setOpen(true); } }}
        onBlur={event => {
          onBlur?.(event);
          if (!sheet && event.relatedTarget && !frameRef.current?.contains(event.relatedTarget as Node)) cancel();
        }} />
    </InputFrame>;
  }
  return <>
    {field(false)}
    <select className={styles.native} ref={nativeRef} name={name} form={form} value={selected?.value ?? ""}
      required={required} disabled={disabled} tabIndex={-1} aria-hidden="true"
      onChange={event => commit(event.target.value)} onInvalid={event => { event.preventDefault(); inputRef.current?.focus(); }}>
      <option value="">{props.placeholder}</option>
      {options.map(option => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
    </select>
    <SelectionPanel id={`${controlId}-panel`} open={visibleOpen} onOpenChange={next => next ? begin() : cancel()}
      anchorRef={inputRef} positioningRef={frameRef} initialFocusRef={sheet ? sheetInputRef : undefined}
      autoFocus={sheet} interactiveAnchor size={size} title={label} closeLabel={closeLabel}
      searchRegion={sheet ? <>
        {field(true)}
        {description?.error ? <p id={`${controlId}-sheet-error`} className={fieldStyles.error}>{description.error}</p> : null}
        {description?.hint ? <p id={`${controlId}-sheet-hint`} className={fieldStyles.hint}>{description.hint}</p> : null}
      </> : undefined}>
      <List id={listId} role="listbox" aria-label={label}>
        {filtered.map(option => <Option key={option.value} id={optionId(option.value)} option={option} size={size}
          active={option.value === current} selected={option.value === committed} onActivate={() => setActive(option.value)} onCommit={() => commit(option.value)} />)}
      </List>
      {!filtered.length ? <Text role="status" variant="body-sm">{emptyLabel}</Text> : null}
    </SelectionPanel>
  </>;
});
