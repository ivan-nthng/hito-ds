"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { BottomSheet } from "../BottomSheet/BottomSheet";
import { Button } from "../Button/Button";
import { CalendarGrid, type CalendarGridProps } from "../CalendarGrid/CalendarGrid";
import { calendarMonthOf, daysInCalendarMonth, formatCalendarMonth, parseCalendarDay, parseCalendarMonth, shiftCalendarMonth } from "../date/calendar-day";
import { spokenCalendarDay, draftFromCalendarDay } from "../DateField/date-value";
import { DateRangeField, type DateRangeDraft, type DateRangeFieldProps, type DateRangeValue } from "../DateRangeField/DateRangeField";
import { Popover } from "../Popover/Popover";
import { useNarrowViewport } from "../responsive/use-narrow-viewport";
import { Text } from "../Text/Text";
import styles from "./DateRangePicker.module.css";

export type DateRangeQuickPeriod = {
  id: string;
  label: { en: string; pt: string };
  /** Resolved by the caller, including its reference day and reporting cutoff. */
  value: DateRangeValue;
  disabledReason?: { en: string; pt: string };
};

export type DateRangePickerProps = Omit<
  DateRangeFieldProps,
  "value" | "onValueChange" | "draftValue" | "onDraftChange" | "onDraftValidityChange" | "draftResetKey" | "pendingValidationMessage" | "endpointLayout"
> & {
  value: DateRangeValue | null;
  onValueChange?: (value: DateRangeValue | null) => void;
  /** One transaction callback for consumers that store the range and preset together. */
  onApply?: (value: DateRangeValue | null, quickPeriodId: string | null) => void;
  /** The applied choice ID; null means Custom. */
  selectedQuickPeriodId?: string | null;
  onQuickPeriodChange?: (id: string | null) => void;
  quickPeriods?: readonly DateRangeQuickPeriod[];
  todayDay: string;
  minDay?: string;
  maxDay?: string;
  unavailableDays?: CalendarGridProps["unavailableDays"];
  /** Desktop calendar density; mobile always uses one touch-sized month. */
  calendarLayout?: "regular" | "compact";
  /** Opt in to a month count independent of density; two falls back to one when the panel cannot fit both. */
  desktopMonthCount?: 1 | 2;
  /** Align the preset caption with endpoint labels and keep the range announcement visually hidden. */
  panelLayout?: "default" | "aligned";
  /** Optional short visible label; the picker retains its complete accessible range name and owned trigger. */
  triggerLabel?: string;
};

const copy = {
  en: {
    open: "Open date range picker", title: "Choose a date range", close: "Close date range picker",
    cancel: "Cancel", apply: "Apply range", clear: "Clear", custom: "Custom", more: "More periods", less: "Fewer periods",
    summary: "Selected range", empty: "No range selected", start: "Choose a start date",
    pending: "Apply or cancel the draft range before submitting.",
    invalid: "Invalid date range", beforeMin: "Before the earliest available date",
    afterMax: "After the latest available date", unavailable: "Date unavailable",
    presets: "Presets", calendar: "Calendar", chooseMonthYear: "Choose month and year",
    previousYears: "Previous years", nextYears: "Next years", useEntireYear: "Use entire year",
  },
  pt: {
    open: "Abrir seletor de período", title: "Escolha um período", close: "Fechar seletor de período",
    cancel: "Cancelar", apply: "Aplicar período", clear: "Limpar", custom: "Personalizado", more: "Mais períodos", less: "Menos períodos",
    summary: "Período selecionado", empty: "Nenhum período selecionado", start: "Escolha a data de início",
    pending: "Aplique ou cancele o período antes de enviar o formulário.",
    invalid: "Período inválido", beforeMin: "Antes da primeira data disponível",
    afterMax: "Depois da última data disponível", unavailable: "Data indisponível",
    presets: "Períodos", calendar: "Calendário", chooseMonthYear: "Escolher mês e ano",
    previousYears: "Anos anteriores", nextYears: "Próximos anos", useEntireYear: "Usar o ano inteiro",
  },
} as const;

function fromValue(value: DateRangeValue | null): DateRangeDraft {
  return { startDay: value?.startDay ?? null, endDay: value?.endDay ?? null };
}

function sameRange(a: DateRangeDraft, b: DateRangeDraft): boolean {
  return a.startDay === b.startDay && a.endDay === b.endDay;
}

function firstVisibleMonth(day: string): string {
  const selected = calendarMonthOf(day)!;
  return shiftCalendarMonth(selected, 1) ? selected : shiftCalendarMonth(selected, -1)!;
}

function rangeVisibleMonth(startDay: string | null | undefined, endDay: string | null | undefined, todayDay: string, showEndMonth: boolean): string {
  return firstVisibleMonth((showEndMonth ? endDay : startDay) ?? startDay ?? todayDay);
}

export function DateRangePicker({
  locale,
  legend,
  value,
  onValueChange,
  onApply,
  selectedQuickPeriodId = null,
  onQuickPeriodChange,
  quickPeriods = [],
  todayDay,
  minDay,
  maxDay,
  unavailableDays,
  calendarLayout = "regular",
  desktopMonthCount,
  panelLayout = "default",
  triggerLabel,
  disabled = false,
  readOnly = false,
  required = false,
  size = "md",
  startName,
  endName,
  form,
  ...fieldProps
}: DateRangePickerProps) {
  if (!parseCalendarDay(todayDay)) throw new TypeError("DateRangePicker requires a valid todayDay in YYYY-MM-DD form.");
  const ids = new Set<string>();
  for (const period of quickPeriods) {
    if (!period.id || ids.has(period.id)) throw new TypeError("DateRangePicker quick periods require unique non-empty IDs.");
    ids.add(period.id);
  }

  const labels = copy[locale];
  const narrow = useNarrowViewport();
  const requestedMonths = desktopMonthCount ?? (calendarLayout === "compact" ? 1 : 2);
  const [fitsTwoMonths, setFitsTwoMonths] = useState(true);
  const monthCount = narrow || requestedMonths === 1 || (desktopMonthCount === 2 && !fitsTwoMonths) ? 1 : 2;
  const showEndMonth = monthCount === 1;
  const aligned = panelLayout === "aligned";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeDraft>(() => fromValue(value));
  const [draftChoiceId, setDraftChoiceId] = useState<string | null>(selectedQuickPeriodId);
  const [month, setMonth] = useState(() => rangeVisibleMonth(value?.startDay, value?.endDay, todayDay, showEndMonth));
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [manualValidity, setManualValidity] = useState({ startDay: true, endDay: true });
  const [view, setView] = useState<"calendar" | "presets" | "monthYear">("calendar");
  const [viewYear, setViewYear] = useState(() => parseCalendarMonth(rangeVisibleMonth(value?.startDay, value?.endDay, todayDay, showEndMonth))!.year);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const monthsRef = useRef<HTMLDivElement>(null);
  const validationRef = useRef<HTMLInputElement>(null);
  const suppressImmediateSubmitRef = useRef(false);
  const previousAppliedRef = useRef({ start: value?.startDay ?? null, end: value?.endDay ?? null, choice: selectedQuickPeriodId });
  const panelId = useId();
  const unavailable = disabled || readOnly;
  const visibleOpen = open && !unavailable;
  const appliedStartDay = value?.startDay ?? null;
  const appliedEndDay = value?.endDay ?? null;

  useLayoutEffect(() => {
    const months = monthsRef.current;
    if (!visibleOpen || narrow || desktopMonthCount !== 2 || !months) return;
    // Measure the available main column, including caller constraints and resolved token sizes.
    // The requested panel width stays stable when the second month is removed.
    const measure = () => {
      const grid = months.querySelector<HTMLElement>("[data-density]");
      if (!grid) return;
      const monthWidth = parseFloat(getComputedStyle(grid).maxInlineSize);
      const gap = parseFloat(getComputedStyle(months).columnGap) || 0;
      setFitsTwoMonths(months.clientWidth >= monthWidth * 2 + gap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(months);
    return () => observer.disconnect();
  }, [visibleOpen, narrow, desktopMonthCount, calendarLayout, view]);

  function restriction(day: string): string | undefined {
    if (minDay && day < minDay) return labels.beforeMin;
    if (maxDay && day > maxDay) return labels.afterMax;
    return unavailableDays?.[day]?.reason ?? (unavailableDays?.[day] ? labels.unavailable : undefined);
  }

  function pairIssue(pair: DateRangeDraft): string | undefined {
    if (!pair.startDay || !pair.endDay || !parseCalendarDay(pair.startDay) || !parseCalendarDay(pair.endDay) || pair.endDay < pair.startDay) return labels.invalid;
    return restriction(pair.startDay) ?? restriction(pair.endDay);
  }

  const restrictionError = draft.startDay && draft.endDay && draft.startDay <= draft.endDay
    ? restriction(draft.startDay) ?? restriction(draft.endDay)
    : undefined;
  const changed = !sameRange(draft, fromValue(value)) || draftChoiceId !== selectedQuickPeriodId;
  const pending = changed || !manualValidity.startDay || !manualValidity.endDay;
  const canApply = !unavailable && (cleared ? !required : Boolean(
    draft.startDay && draft.endDay && !pairIssue(draft) && manualValidity.startDay && manualValidity.endDay,
  ));

  useEffect(() => {
    const previous = previousAppliedRef.current;
    const next = { start: appliedStartDay, end: appliedEndDay, choice: selectedQuickPeriodId };
    previousAppliedRef.current = next;
    if (previous.start !== next.start || previous.end !== next.end || previous.choice !== next.choice || unavailable) {
      setDraft({ startDay: appliedStartDay, endDay: appliedEndDay });
      setDraftChoiceId(selectedQuickPeriodId);
      setMonth(rangeVisibleMonth(appliedStartDay, appliedEndDay, todayDay, showEndMonth));
      setAwaitingEnd(false);
      setCleared(false);
      setManualValidity({ startDay: true, endDay: true });
      setView("calendar");
      setViewYear(parseCalendarMonth(rangeVisibleMonth(appliedStartDay, appliedEndDay, todayDay, showEndMonth))!.year);
      setResetKey((key) => key + 1);
      setOpen(false);
    }
  }, [appliedStartDay, appliedEndDay, selectedQuickPeriodId, unavailable, todayDay, showEndMonth]);

  useEffect(() => {
    if (!suppressImmediateSubmitRef.current) {
      validationRef.current?.setCustomValidity(visibleOpen && pending ? labels.pending : "");
    }
  }, [visibleOpen, pending, labels.pending]);

  function reset() {
    setDraft(fromValue(value));
    setDraftChoiceId(selectedQuickPeriodId);
    setMonth(rangeVisibleMonth(appliedStartDay, appliedEndDay, todayDay, showEndMonth));
    setAwaitingEnd(false);
    setCleared(false);
    setManualValidity({ startDay: true, endDay: true });
    setView("calendar");
    setViewYear(parseCalendarMonth(rangeVisibleMonth(appliedStartDay, appliedEndDay, todayDay, showEndMonth))!.year);
    setResetKey((key) => key + 1);
  }

  function beginOpen() {
    if (unavailable) return;
    reset();
    setOpen(true);
  }

  function discard(reason?: string) {
    if (reason === "outside-pointer" && pending) {
      suppressImmediateSubmitRef.current = true;
      const input = validationRef.current;
      input?.setCustomValidity(labels.pending);
      window.setTimeout(() => {
        suppressImmediateSubmitRef.current = false;
        input?.setCustomValidity("");
      }, 0);
    } else {
      validationRef.current?.setCustomValidity("");
    }
    reset();
    setOpen(false);
  }

  function commit() {
    if (!canApply) return;
    validationRef.current?.setCustomValidity("");
    const next = cleared ? null : { startDay: draft.startDay!, endDay: draft.endDay! };
    if (!sameRange(fromValue(next), fromValue(value))) onValueChange?.(next);
    if (draftChoiceId !== selectedQuickPeriodId) onQuickPeriodChange?.(draftChoiceId);
    onApply?.(next, draftChoiceId);
    setOpen(false);
  }

  function chooseDay(day: string) {
    if (restriction(day)) return;
    if (awaitingEnd && draft.startDay && day >= draft.startDay) {
      setDraft({ startDay: draft.startDay, endDay: day });
      setAwaitingEnd(false);
    } else {
      setDraft({ startDay: day, endDay: null });
      setAwaitingEnd(true);
    }
    setDraftChoiceId(null);
    setCleared(false);
    setManualValidity({ startDay: true, endDay: true });
    setResetKey((key) => key + 1);
  }

  function choosePeriod(period: DateRangeQuickPeriod) {
    if (period.disabledReason || pairIssue(period.value)) return;
    setDraft(period.value);
    setDraftChoiceId(period.id);
    setMonth(rangeVisibleMonth(period.value.startDay, period.value.endDay, todayDay, showEndMonth));
    setAwaitingEnd(false);
    setCleared(false);
    setManualValidity({ startDay: true, endDay: true });
    setResetKey((key) => key + 1);
    setView("calendar");
  }

  function editDraft(next: DateRangeDraft) {
    setDraft(next);
    setDraftChoiceId(null);
    setAwaitingEnd(false);
    setCleared(false);
    if (next.startDay) setMonth(firstVisibleMonth(next.startDay));
  }

  function renderPeriod(period: DateRangeQuickPeriod) {
    const reason = period.disabledReason?.[locale] ?? pairIssue(period.value);
    return <span className={styles.quickChoice} key={period.id}>
      <Button
        aria-pressed={draftChoiceId === period.id}
        disabled={Boolean(reason)}
        intent={draftChoiceId === period.id ? "accent" : "neutral"}
        onClick={() => choosePeriod(period)}
        className={styles.periodButton}
        size={narrow ? "lg" : "sm"}
        title={reason}
        variant={draftChoiceId === period.id ? "soft" : "ghost"}
      >{period.label[locale]}</Button>
      {reason ? <Text className={styles.reason} variant="body-sm">{reason}</Text> : null}
    </span>;
  }

  const minYear = minDay ? parseCalendarDay(minDay)?.year ?? 1 : 1;
  const maxYear = maxDay ? parseCalendarDay(maxDay)?.year ?? 9999 : 9999;
  const yearPage = Math.floor((viewYear - 1) / 12) * 12 + 1;
  const monthName = (number: number) => new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "en-US", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2000, number - 1, 1)));
  const monthAvailable = (year: number, number: number) => {
    const start = `${formatCalendarMonth({ year, month: number })}-01`;
    const end = `${formatCalendarMonth({ year, month: number })}-${String(daysInCalendarMonth(year, number)).padStart(2, "0")}`;
    if ((minDay && end < minDay) || (maxDay && start > maxDay)) return false;
    return Array.from({ length: daysInCalendarMonth(year, number) }, (_, index) => `${formatCalendarMonth({ year, month: number })}-${String(index + 1).padStart(2, "0")}`)
      .some((day) => !restriction(day));
  };
  const yearAvailable = (year: number) => year >= minYear && year <= maxYear && Array.from({ length: 12 }, (_, index) => monthAvailable(year, index + 1)).some(Boolean);
  const wholeYear: DateRangeDraft = { startDay: `${formatCalendarMonth({ year: viewYear, month: 1 })}-01`, endDay: `${formatCalendarMonth({ year: viewYear, month: 12 })}-31` };
  const showMonthYear = (targetMonth: string) => { setViewYear(parseCalendarMonth(targetMonth)!.year); setView("monthYear"); };
  const chooseMonth = (number: number) => { setMonth(formatCalendarMonth({ year: viewYear, month: number })); setView("calendar"); };
  const useWholeYear = () => {
    if (pairIssue(wholeYear)) return;
    setDraft(wholeYear); setDraftChoiceId(null); setAwaitingEnd(false); setCleared(false);
    setManualValidity({ startDay: true, endDay: true }); setResetKey((key) => key + 1);
    setMonth(formatCalendarMonth({ year: viewYear, month: 1 })); setView("calendar");
  };

  const display = (day: string) => spokenCalendarDay(draftFromCalendarDay(day), locale) ?? day;
  const appliedSummary = value ? `${display(value.startDay)} – ${display(value.endDay)}` : labels.empty;
  const draftSummary = draft.startDay
    ? draft.endDay ? `${display(draft.startDay)} – ${display(draft.endDay)}` : `${display(draft.startDay)} – ${labels.start}`
    : labels.empty;
  const selection = { kind: "range" as const, ...draft };
  const secondMonth = shiftCalendarMonth(month, 1);
  const firstGrid = <CalendarGrid
    density={narrow ? "mobile" : calendarLayout}
    locale={locale}
    maxDay={maxDay}
    minDay={minDay}
    month={month}
    onDaySelect={chooseDay}
    onHeadingClick={() => showMonthYear(month)}
    onMonthChange={setMonth}
    selection={selection}
    todayDay={todayDay}
    unavailableDays={unavailableDays}
  />;
  const periods = quickPeriods.length ? <div aria-label={locale === "pt" ? "Períodos rápidos" : "Quick periods"} className={styles.quickPeriods} role="group">
    {quickPeriods.map(renderPeriod)}
    <Button aria-pressed={draftChoiceId === null} className={styles.periodButton} intent={draftChoiceId === null ? "accent" : "neutral"} onClick={() => { setDraftChoiceId(null); setView("calendar"); }} size={narrow ? "lg" : "sm"} variant={draftChoiceId === null ? "soft" : "ghost"}>{labels.custom}</Button>
  </div> : null;
  const chosenPeriod = quickPeriods.find((period) => period.id === draftChoiceId);
  const panelTitle = typeof legend === "string" ? legend : labels.title;
  const monthYearView = view === "monthYear" && visibleOpen ? <div className={styles.monthYearView}>
    <div className={styles.yearNavigation}>
      <Button aria-label={labels.previousYears} disabled={yearPage <= minYear} icon="arrows/compact/left" intent="neutral" onClick={() => setViewYear(Math.max(minYear, yearPage - 12))} size={narrow ? "lg" : "sm"} variant="ghost" />
      <Text as="h3" variant="heading-sm">{yearPage}–{Math.min(yearPage + 11, 9999)}</Text>
      <Button aria-label={labels.nextYears} disabled={yearPage + 11 >= maxYear} icon="arrows/compact/right" intent="neutral" onClick={() => setViewYear(Math.min(maxYear, yearPage + 12))} size={narrow ? "lg" : "sm"} variant="ghost" />
    </div>
    <div aria-label={labels.chooseMonthYear} className={styles.yearGrid} role="group">
      {Array.from({ length: 12 }, (_, index) => yearPage + index).filter((year) => year <= 9999).map((year) => <Button key={year} aria-pressed={year === viewYear} disabled={!yearAvailable(year)} intent={year === viewYear ? "accent" : "neutral"} onClick={() => setViewYear(year)} size="sm" variant={year === viewYear ? "soft" : "ghost"}>{year}</Button>)}
    </div>
    <div className={styles.monthGrid}>
      {Array.from({ length: 12 }, (_, index) => index + 1).map((number) => <Button key={number} disabled={!monthAvailable(viewYear, number)} intent="neutral" onClick={() => chooseMonth(number)} size="sm" variant="ghost">{monthName(number)}</Button>)}
    </div>
    <Button disabled={Boolean(pairIssue(wholeYear))} intent="neutral" onClick={useWholeYear} size={narrow ? "lg" : "sm"} variant="secondary">{labels.useEntireYear} {viewYear}</Button>
  </div> : null;
  const content = <div className={styles.content} data-calendar-layout={calendarLayout} data-calendar-view={view} data-month-count={monthCount} data-panel-layout={panelLayout}>
    <div className={styles.workspace} data-has-presets={Boolean(periods)}>
      {!narrow && periods ? <div className={styles.desktopPresets}>{aligned ? <Text variant="label-sm">{panelTitle}</Text> : null}{periods}</div> : null}
      <div className={styles.main}>
        {!narrow && aligned && !periods ? <Text variant="label-sm">{panelTitle}</Text> : null}
        {narrow && view === "calendar" && quickPeriods.length ? <Button
          aria-label={`${labels.presets}: ${chosenPeriod?.label[locale] ?? labels.custom}`}
          className={styles.mobilePresetTrigger}
          intent="neutral"
          onClick={() => setView("presets")}
          size="md"
          trailingIcon="arrows/compact/down"
          variant="soft"
        >{chosenPeriod?.label[locale] ?? labels.custom}</Button> : null}
        {(!narrow || view === "calendar") ? <div className={styles.rangeField}><DateRangeField
          {...fieldProps}
          disabled={!visibleOpen}
          draftResetKey={resetKey}
          draftValue={draft}
          endpointLayout="columns"
          error={restrictionError ?? fieldProps.error}
          legend={legend}
          locale={locale}
          onDraftChange={editDraft}
          onDraftValidityChange={(endpoint, valid) => setManualValidity((previous) => ({ ...previous, [endpoint]: valid }))}
          pendingValidationMessage={changed ? labels.pending : undefined}
          readOnly={readOnly}
          required={required}
          size={size}
          value={value}
        /></div> : null}
        {narrow && view !== "calendar" && !aligned ? <Button className={styles.backButton} intent="neutral" leadingIcon="arrows/compact/left" onClick={() => setView("calendar")} size="sm" variant="ghost">{labels.calendar}</Button> : null}
        {narrow && view === "presets" ? periods : view === "monthYear" ? monthYearView : <div className={styles.months} ref={monthsRef}>
          {firstGrid}
          {monthCount === 2 && secondMonth ? <CalendarGrid
            density={calendarLayout}
            locale={locale}
            maxDay={maxDay}
            minDay={minDay}
            month={secondMonth}
            onDaySelect={chooseDay}
            onHeadingClick={() => showMonthYear(secondMonth)}
            onMonthChange={(next) => { const first = shiftCalendarMonth(next, -1); if (first) setMonth(first); }}
            selection={selection}
            todayDay={todayDay}
            unavailableDays={unavailableDays}
          /> : null}
        </div>}
      </div>
    </div>
    <Text aria-live="polite" className={aligned ? styles.hiddenSummary : styles.summary} variant="body-sm">{labels.summary}: {draftSummary}</Text>
  </div>;
  const footer = <>
    {!required ? <Button intent="neutral" onClick={() => {
      setDraft({ startDay: null, endDay: null });
      setDraftChoiceId(null);
      setAwaitingEnd(false);
      setCleared(true);
      setManualValidity({ startDay: true, endDay: true });
      setResetKey((key) => key + 1);
    }} size="md" variant="ghost">{labels.clear}</Button> : null}
    <Button intent="neutral" onClick={() => discard()} size="md" variant="secondary">{labels.cancel}</Button>
    <Button disabled={!canApply} intent="accent" onClick={commit} size="md" variant="primary">{labels.apply}</Button>
  </>;

  return <div className={styles.root}>
    <Button
      aria-controls={narrow ? undefined : panelId}
      aria-expanded={visibleOpen}
      aria-haspopup="dialog"
      aria-label={`${labels.open}: ${appliedSummary}`}
      disabled={unavailable}
      intent="neutral"
      leadingIcon={aligned ? undefined : "general/calendar"}
      onClick={() => { if (visibleOpen) discard(); else beginOpen(); }}
      ref={triggerRef}
      size={size}
      trailingIcon={aligned ? "arrows/compact/down" : undefined}
      variant={aligned ? "soft" : "secondary"}
    >{triggerLabel ?? appliedSummary}</Button>
    <input
      aria-label={labels.title}
      aria-required={required || undefined}
      className={styles.validationProxy}
      disabled={unavailable}
      form={form}
      onChange={() => {}}
      onInvalid={() => { if (required && !value && !visibleOpen) beginOpen(); }}
      ref={validationRef}
      required={required}
      tabIndex={-1}
      type="text"
      value={value ? "selected" : ""}
    />
    {startName ? <input disabled={disabled} form={form} name={startName} type="hidden" value={value?.startDay ?? ""} /> : null}
    {endName ? <input disabled={disabled} form={form} name={endName} type="hidden" value={value?.endDay ?? ""} /> : null}
    {narrow ? <BottomSheet
      closeLabel={labels.close}
      dismissOnBackdrop
      footer={footer}
      headerVariant={aligned ? "compact" : "default"}
      initialFocus="title"
      navigation={aligned ? { back: view === "calendar" ? undefined : { label: labels.calendar, onBack: () => setView("calendar") } } : undefined}
      onDismiss={discard}
      open={visibleOpen}
      returnFocusRef={triggerRef}
      title={panelTitle}
    >{content}</BottomSheet> : <Popover
      anchorRef={triggerRef}
      className={`${styles.popover} ${calendarLayout === "compact" ? requestedMonths === 2 ? styles.pairedCompactPopover : styles.compactPopover : ""}`}
      closeLabel={labels.close}
      footer={footer}
      id={panelId}
      headerVisibility={aligned ? "hidden" : "visible"}
      initialFocus={aligned ? undefined : "title"}
      onOpenChange={(next, reason) => { if (next) beginOpen(); else discard(reason); }}
      open={visibleOpen}
      returnFocusRef={triggerRef}
      title={panelTitle}
    >{content}</Popover>}
  </div>;
}
