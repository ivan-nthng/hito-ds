"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Button } from "../Button/Button";
import type { ControlWidth } from "../control-width";
import { Field } from "../Field/Field";
import { Icon } from "../Icon/Icon";
import { InputFrame, inputFrameStyles, type ControlAppearance } from "../input-frame/InputFrame";
import { Listbox } from "../listbox/Listbox";
import type { ListItemSize } from "../ListItem/ListItem";
import { Popover } from "../Popover/Popover";
import { useNarrowViewport } from "../responsive/use-narrow-viewport";
import { Text } from "../Text/Text";
import styles from "./TimePicker.module.css";

/** A local wall-clock time, never a date, instant, timezone or interval duration. */
export type TimePickerProps = {
  value: string | null;
  onValueChange?: (time: string) => void;
  label: string;
  locale: "en" | "pt";
  appearance?: ControlAppearance;
  size?: ListItemSize;
  width?: ControlWidth;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  id?: string;
  name?: string;
  form?: string;
};

const copy = {
  en: { hours: "Hours", minutes: "Minutes", set: "Set time", close: "Close time picker", invalid: "Choose a valid time." },
  pt: { hours: "Horas", minutes: "Minutos", set: "Definir horário", close: "Fechar seletor de horário", invalid: "Escolha um horário válido." },
} as const;
const hours = Array.from({ length: 24 }, (_, n) => ({ value: String(n).padStart(2, "0"), label: String(n).padStart(2, "0") }));
const minutes = Array.from({ length: 60 }, (_, n) => ({ value: String(n).padStart(2, "0"), label: String(n).padStart(2, "0") }));
function draftOf(value: string | null) {
  if (value !== null && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new TypeError("TimePicker value must be HH:mm (00:00–23:59) or null.");
  const [hour = "", minute = ""] = value?.split(":") ?? [];
  return { hour, minute };
}

export const TimePicker = forwardRef<HTMLButtonElement, TimePickerProps>(function TimePicker({
  value, onValueChange, label, locale, appearance = "soft", size = "sm", width = "fill", disabled = false,
  readOnly = false, required = false, error, hint, id, name, form,
}, ref) {
  const applied = draftOf(value), labels = copy[locale], generated = useId(), controlId = id ?? `${generated}-trigger`, panelId = `${generated}-panel`;
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(applied);
  const [session, setSession] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null), nativeRef = useRef<HTMLInputElement>(null);
  const hoursRef = useRef<HTMLUListElement>(null), minutesRef = useRef<HTMLUListElement>(null);
  const previous = useRef({ value, unavailable: disabled || readOnly });
  const narrow = useNarrowViewport(), unavailable = disabled || readOnly, visibleOpen = open && !unavailable;
  const draftTime = draft.hour && draft.minute ? `${draft.hour}:${draft.minute}` : null;
  const invalid = error !== undefined && error !== null && error !== false && error !== "";
  useImperativeHandle(ref, () => triggerRef.current!, []);
  useEffect(() => {
    const prior = previous.current; previous.current = { value, unavailable };
    if (prior.value !== value || !prior.unavailable && unavailable) { setDraft(draftOf(value)); setOpen(false); }
  }, [value, unavailable]);
  useEffect(() => { nativeRef.current?.setCustomValidity(invalid ? typeof error === "string" ? error : labels.invalid : ""); }, [invalid, error, labels.invalid]);
  useEffect(() => {
    const owner = nativeRef.current?.form;
    const reset = (event: Event) => queueMicrotask(() => { if (!event.defaultPrevented) { setDraft(draftOf(value)); setOpen(false); } });
    owner?.addEventListener("reset", reset);
    return () => owner?.removeEventListener("reset", reset);
  }, [form, value]);
  useLayoutEffect(() => {
    if (!visibleOpen) return;
    for (const list of [hoursRef.current, minutesRef.current]) {
      const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]'), viewport = list?.parentElement;
      if (selected && viewport) viewport.scrollTop = selected.offsetTop - (viewport.clientHeight - selected.offsetHeight) / 2;
    }
  }, [visibleOpen, narrow]);
  function begin() { if (!unavailable) { setDraft(draftOf(value)); setSession(n => n + 1); setOpen(true); } }
  function discard() { setDraft(draftOf(value)); setOpen(false); }
  function commit() {
    if (!draftTime || unavailable) return;
    if (draftTime !== value) onValueChange?.(draftTime);
    setOpen(false);
  }
  const columns = <div className={styles.content}>
    <Text variant="heading-sm" aria-live="polite" aria-atomic>{draft.hour || "--"}:{draft.minute || "--"}</Text>
    <div className={styles.columns}>
      {[{ key: "hour" as const, label: labels.hours, options: hours, focus: hoursRef }, { key: "minute" as const, label: labels.minutes, options: minutes, focus: minutesRef }].map(column => <div key={column.key} className={styles.column}>
        <Text variant="body-sm" className={styles.secondary}>{column.label}</Text>
        <div className={styles.viewport} data-time-column={column.key} onPointerDown={() => column.focus.current?.focus({ preventScroll: true })}>
          <Listbox key={session} id={`${panelId}-${column.key}`} label={column.label} options={column.options} value={draft[column.key]} size="sm" focusRef={column.focus}
            className={styles.options} onCommit={next => setDraft(current => ({ ...current, [column.key]: next }))} />
        </div>
      </div>)}
    </div>
  </div>;
  const footer = <Button size="md" variant="primary" intent="neutral" disabled={!draftTime || unavailable} onClick={commit}>{labels.set}</Button>;
  return <div className={styles.root} data-time-picker>
    <Field label={label} controlId={controlId} error={error} hint={hint} required={required}>
      {({ controlProps }) => <InputFrame appearance={appearance} size={size} width={width} disabled={disabled} readOnly={readOnly} invalid={invalid}
        className={styles.frame} trailing={<Icon name="arrows/compact/down" size={size} tone="secondary" />}>
        <button {...controlProps} ref={triggerRef} type="button" role="combobox" disabled={disabled} aria-disabled={unavailable || undefined} aria-readonly={readOnly || undefined}
          aria-haspopup="dialog" aria-expanded={visibleOpen} aria-controls={visibleOpen ? panelId : undefined}
          className={`${inputFrameStyles.input} ${styles.trigger}`} data-placeholder={!value || undefined}
          onClick={() => { if (visibleOpen) discard(); else begin(); }} onKeyDown={event => {
            if (!unavailable && ["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); if (!visibleOpen) begin(); }
          }}>{value ?? "--:--"}</button>
      </InputFrame>}
    </Field>
    <input ref={nativeRef} className={styles.native} type="time" aria-hidden tabIndex={-1} name={name} form={form} value={value ?? ""}
      required={required} disabled={disabled} readOnly={readOnly} onChange={() => {}} onInvalid={event => { event.preventDefault(); triggerRef.current?.focus(); }} />
    {narrow ? <BottomSheet id={panelId} open={visibleOpen} title={label} headerVariant="compact" navigation={{}} closeLabel={labels.close}
      initialFocus={hoursRef} returnFocusRef={triggerRef} onDismiss={discard} dismissOnBackdrop footer={footer}>{columns}</BottomSheet>
      : <Popover id={panelId} anchorRef={triggerRef} open={visibleOpen} title={label} initialFocus={hoursRef} returnFocusRef={triggerRef}
        onOpenChange={next => { if (next) begin(); else discard(); }} className={styles.popover} footer={footer}>{columns}</Popover>}
  </div>;
});
