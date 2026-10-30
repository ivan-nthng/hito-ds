"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Button } from "../Button/Button";
import { CalendarGrid, type CalendarGridProps } from "../CalendarGrid/CalendarGrid";
import { calendarMonthOf, parseCalendarDay } from "../date/calendar-day";
import { DateField, type DateFieldProps } from "../DateField/DateField";
import { Popover } from "../Popover/Popover";
import { useNarrowViewport } from "../responsive/use-narrow-viewport";
import styles from "./DatePicker.module.css";

export type DatePickerProps = Omit<DateFieldProps, "calendarAction" | "onCalendarOpen" | "validationMessage"> & {
  /** Caller-resolved today in YYYY-MM-DD form, avoiding a hidden timezone policy. */
  todayDay: string;
  minDay?: string;
  maxDay?: string;
  unavailableDays?: CalendarGridProps["unavailableDays"];
};

const copy = {
  en: { open: "Open calendar", title: "Choose a date", close: "Close calendar", cancel: "Cancel", apply: "Apply date", beforeMin: "Before the earliest available date.", afterMax: "After the latest available date.", unavailable: "This date is unavailable." },
  pt: { open: "Abrir calendário", title: "Escolha uma data", close: "Fechar calendário", cancel: "Cancelar", apply: "Aplicar data", beforeMin: "Antes da primeira data disponível.", afterMax: "Depois da última data disponível.", unavailable: "Esta data está indisponível." },
} as const;

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    locale,
    value,
    onValueChange,
    error,
    todayDay,
    minDay,
    maxDay,
    unavailableDays,
    disabled = false,
    readOnly = false,
    size = "md",
    ...fieldProps
  },
  ref,
) {
  const todayMonth = calendarMonthOf(todayDay);
  if (!todayMonth) throw new TypeError("DatePicker requires a valid todayDay in YYYY-MM-DD form.");
  const validTodayMonth: string = todayMonth;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(value);
  const [rejectedDay, setRejectedDay] = useState<string | null>(null);
  const [month, setMonth] = useState(calendarMonthOf(value ?? "") ?? validTodayMonth);
  const calendarId = useId();
  const narrow = useNarrowViewport();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridFocusRef = useRef<HTMLButtonElement>(null);
  const previousControlledRef = useRef({ value, unavailable: disabled || readOnly });
  const unavailable = disabled || readOnly;
  const visibleOpen = open && !unavailable;
  const labels = copy[locale];
  const restriction = (day: string) => {
    if (minDay && day < minDay) return labels.beforeMin;
    if (maxDay && day > maxDay) return labels.afterMax;
    return unavailableDays?.[day]?.reason ?? (unavailableDays?.[day] ? labels.unavailable : undefined);
  };
  const restrictionError = rejectedDay ? restriction(rejectedDay) : undefined;
  const canApply = Boolean(draft && parseCalendarDay(draft) && !restriction(draft) && !unavailable);

  useEffect(() => {
    const previous = previousControlledRef.current;
    previousControlledRef.current = { value, unavailable };
    if (previous.value !== value || (!previous.unavailable && unavailable)) {
      setDraft(value);
      setRejectedDay(null);
      setMonth(calendarMonthOf(value ?? "") ?? validTodayMonth);
      setOpen(false);
    }
  }, [value, unavailable, validTodayMonth]);

  function beginOpen() {
    if (unavailable) return;
    setDraft(value);
    setMonth(calendarMonthOf(value ?? "") ?? validTodayMonth);
    setOpen(true);
  }

  function discard() {
    setDraft(value);
    setOpen(false);
  }

  function commit() {
    if (!draft || !canApply) return;
    setRejectedDay(null);
    if (draft !== value) onValueChange?.(draft);
    setOpen(false);
  }

  function changeField(next: string | null) {
    const reason = next ? restriction(next) : undefined;
    setRejectedDay(reason ? next : null);
    if (!reason) onValueChange?.(next);
  }

  const action = (
    <Button
      aria-controls={narrow ? undefined : calendarId}
      aria-expanded={visibleOpen}
      aria-haspopup="dialog"
      aria-label={labels.open}
      disabled={unavailable}
      icon="general/calendar"
      intent="neutral"
      onClick={() => { if (visibleOpen) discard(); else beginOpen(); }}
      ref={triggerRef}
      size={size}
      variant="ghost"
    />
  );
  const calendar = (
    <CalendarGrid
      focusRef={gridFocusRef}
      locale={locale}
      maxDay={maxDay}
      minDay={minDay}
      month={month}
      onDaySelect={setDraft}
      onMonthChange={setMonth}
      selection={{ kind: "day", day: draft }}
      todayDay={todayDay}
      unavailableDays={unavailableDays}
    />
  );
  const footer = (
    <>
      <Button intent="neutral" onClick={discard} size="md" variant="secondary">{labels.cancel}</Button>
      <Button disabled={!canApply} intent="accent" onClick={commit} size="md" variant="primary">
        {labels.apply}
      </Button>
    </>
  );

  return (
    <div className={styles.root}>
      <DateField
        {...fieldProps}
        calendarAction={action}
        disabled={disabled}
        error={restrictionError ?? error}
        locale={locale}
        onValueChange={changeField}
        readOnly={readOnly}
        ref={ref}
        size={size}
        validationMessage={restrictionError}
        value={value}
      />
      {narrow ? (
        <BottomSheet
          closeLabel={labels.close}
          dismissOnBackdrop
          footer={footer}
          initialFocus={gridFocusRef}
          onDismiss={discard}
          open={visibleOpen}
          returnFocusRef={triggerRef}
          title={labels.title}
        >
          <div className={styles.calendar}>{calendar}</div>
        </BottomSheet>
      ) : (
        <Popover
          anchorRef={triggerRef}
          className={styles.popover}
          closeLabel={labels.close}
          footer={footer}
          id={calendarId}
          initialFocus={gridFocusRef}
          onOpenChange={(next) => { if (next) beginOpen(); else discard(); }}
          open={visibleOpen}
          returnFocusRef={triggerRef}
          title={labels.title}
        >
          {calendar}
        </Popover>
      )}
    </div>
  );
});
