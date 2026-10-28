"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { Button } from "../Button/Button";
import {
  calendarMonthOf,
  calendarWeekday,
  daysInCalendarMonth,
  formatCalendarDay,
  parseCalendarDay,
  parseCalendarMonth,
  shiftCalendarDay,
  shiftCalendarDayByMonth,
  shiftCalendarMonth,
} from "../date/calendar-day";
import { draftFromCalendarDay, spokenCalendarDay, type DateFieldLocale } from "../DateField/date-value";
import styles from "./CalendarGrid.module.css";

export type CalendarSelection =
  | { kind: "day"; day: string | null }
  | { kind: "range"; startDay: string | null; endDay: string | null };

export type CalendarGridProps = {
  density?: "regular" | "compact" | "mobile";
  /** The current roving day, for an enclosing overlay's initial-focus contract. */
  focusRef?: RefObject<HTMLButtonElement | null>;
  locale: DateFieldLocale;
  /** Controlled visible month in YYYY-MM form. The caller updates it in onMonthChange. */
  month: string;
  onMonthChange: (month: string) => void;
  onHeadingClick?: () => void;
  onDaySelect: (day: string) => void;
  selection?: CalendarSelection;
  /** A calendar day supplied by the caller; this component does not infer a timezone. */
  todayDay?: string;
  minDay?: string;
  maxDay?: string;
  /** Caller-owned availability, with an optional reason shown on focus and hover. */
  unavailableDays?: Readonly<Record<string, { reason?: string }>>;
};

const copy = {
  en: {
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    previous: "Previous month",
    next: "Next month",
    today: "Today",
    selected: "Selected",
    start: "Range start",
    end: "Range end",
    inRange: "In range",
    unavailable: "Unavailable",
    beforeMinimum: "Before the earliest available date",
    afterMaximum: "After the latest available date",
  },
  pt: {
    months: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
    weekdays: ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"],
    previous: "Mês anterior",
    next: "Próximo mês",
    today: "Hoje",
    selected: "Selecionado",
    start: "Início do intervalo",
    end: "Fim do intervalo",
    inRange: "No intervalo",
    unavailable: "Indisponível",
    beforeMinimum: "Antes da primeira data disponível",
    afterMaximum: "Depois da última data disponível",
  },
} as const;

function selectionState(day: string, selection?: CalendarSelection) {
  if (!selection) return undefined;
  if (selection.kind === "day") return day === selection.day ? "day" : undefined;
  const { startDay, endDay } = selection;
  if (startDay === day && endDay === day) return "both";
  if (startDay === day) return "start";
  if (endDay === day) return "end";
  if (startDay && endDay && startDay < day && day < endDay) return "inside";
  return undefined;
}

function preferredDay(month: string, selection?: CalendarSelection, todayDay?: string): string {
  const candidates = selection?.kind === "day"
    ? [selection.day, todayDay]
    : [selection?.startDay, selection?.endDay, todayDay];
  return candidates.find((candidate): candidate is string => Boolean(candidate && calendarMonthOf(candidate) === month))
    ?? `${month}-01`;
}

export function CalendarGrid({
  density = "regular",
  focusRef,
  locale,
  month,
  onMonthChange,
  onHeadingClick,
  onDaySelect,
  selection,
  todayDay,
  minDay,
  maxDay,
  unavailableDays,
}: CalendarGridProps) {
  const headingId = useId();
  const parsedMonth = parseCalendarMonth(month);
  if (!parsedMonth) throw new TypeError("CalendarGrid requires a valid YYYY-MM month.");

  const [activeDay, setActiveDay] = useState(() => preferredDay(month, selection, todayDay));
  const [explainedDay, setExplainedDay] = useState<string | null>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocusDay = useRef<string | null>(null);
  const offset = calendarWeekday({ ...parsedMonth, day: 1 });
  const previousMonth = shiftCalendarMonth(month, -1);
  const nextMonth = shiftCalendarMonth(month, 1);
  const previousParts = previousMonth ? parseCalendarMonth(previousMonth) : null;
  const previousEnd = previousParts ? formatCalendarDay({ ...previousParts, day: daysInCalendarMonth(previousParts.year, previousParts.month) }) : null;
  const previousEnabled = Boolean(previousEnd && (!minDay || previousEnd >= minDay));
  const nextEnabled = Boolean(nextMonth && (!maxDay || `${nextMonth}-01` <= maxDay));
  const tabDay = calendarMonthOf(activeDay) === month ? activeDay : preferredDay(month, selection, todayDay);
  const labels = copy[locale];

  useEffect(() => {
    if (pendingFocusDay.current === tabDay) {
      dayRefs.current.get(tabDay)?.focus();
      pendingFocusDay.current = null;
    }
  }, [tabDay]);

  function unavailableReason(day: string): string | undefined {
    if (minDay && day < minDay) return labels.beforeMinimum;
    if (maxDay && day > maxDay) return labels.afterMaximum;
    const descriptor = unavailableDays?.[day];
    return descriptor ? descriptor.reason || labels.unavailable : undefined;
  }

  function focusDay(day: string) {
    setActiveDay(day);
    if (calendarMonthOf(day) === month) {
      dayRefs.current.get(day)?.focus();
    } else {
      pendingFocusDay.current = day;
      onMonthChange(calendarMonthOf(day)!);
    }
  }

  function handleDayKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    let target: string | null = null;
    if (event.key === "ArrowLeft") target = shiftCalendarDay(day, -1);
    else if (event.key === "ArrowRight") target = shiftCalendarDay(day, 1);
    else if (event.key === "ArrowUp") target = shiftCalendarDay(day, -7);
    else if (event.key === "ArrowDown") target = shiftCalendarDay(day, 7);
    else if (event.key === "Home") target = shiftCalendarDay(day, -calendarWeekday(parseCalendarDay(day)!));
    else if (event.key === "End") target = shiftCalendarDay(day, 6 - calendarWeekday(parseCalendarDay(day)!));
    else if (event.key === "PageUp") target = shiftCalendarDayByMonth(day, event.shiftKey ? -12 : -1);
    else if (event.key === "PageDown") target = shiftCalendarDayByMonth(day, event.shiftKey ? 12 : 1);
    else return;
    event.preventDefault();
    if (target) focusDay(target);
  }

  function changeMonth(next: string | null) {
    if (!next) return;
    const currentDay = parseCalendarDay(tabDay)?.day ?? 1;
    const parts = parseCalendarMonth(next)!;
    setActiveDay(formatCalendarDay({ ...parts, day: Math.min(currentDay, daysInCalendarMonth(parts.year, parts.month)) }));
    onMonthChange(next);
  }

  const heading = locale === "pt"
    ? `${labels.months[parsedMonth.month - 1]} de ${parsedMonth.year}`
    : `${labels.months[parsedMonth.month - 1]} ${parsedMonth.year}`;
  const explainedReason = explainedDay ? unavailableReason(explainedDay) : undefined;
  const explainedLabel = explainedDay
    ? spokenCalendarDay(draftFromCalendarDay(explainedDay), locale)
    : undefined;

  return (
    <section className={styles.root} aria-labelledby={headingId} data-density={density}>
      <div className={styles.header}>
        <Button aria-label={labels.previous} disabled={!previousEnabled} icon="arrows/compact/left" intent="neutral" onClick={() => changeMonth(previousMonth)} size={density === "mobile" ? "lg" : "sm"} variant="ghost" />
        <h2 aria-atomic="true" aria-live="polite" className={styles.heading} id={headingId}>{onHeadingClick ? <Button aria-label={heading} intent="neutral" onClick={onHeadingClick} size="sm" trailingIcon="arrows/compact/down" variant="ghost">{heading}</Button> : heading}</h2>
        <Button aria-label={labels.next} disabled={!nextEnabled} icon="arrows/compact/right" intent="neutral" onClick={() => changeMonth(nextMonth)} size={density === "mobile" ? "lg" : "sm"} variant="ghost" />
      </div>
      <table aria-labelledby={headingId} className={styles.grid} role="grid">
        <thead>
          <tr>
            {labels.weekdays.map((weekday) => (
              <th className={styles.weekday} key={weekday} scope="col">
                <abbr title={weekday}>{weekday.slice(0, 3)}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, week) => (
            <tr key={week}>
              {Array.from({ length: 7 }, (_, column) => {
                const number = week * 7 + column - offset + 1;
                if (number < 1 || number > daysInCalendarMonth(parsedMonth.year, parsedMonth.month)) {
                  return <td className={styles.empty} key={column} role="gridcell" />;
                }
                const day = formatCalendarDay({ ...parsedMonth, day: number });
                const state = selectionState(day, selection);
                const isToday = day === todayDay;
                const reason = unavailableReason(day);
                const spoken = spokenCalendarDay(draftFromCalendarDay(day), locale) ?? day;
                const descriptors = [
                  isToday ? labels.today : null,
                  state === "day" ? labels.selected : null,
                  state === "start" || state === "both" ? labels.start : null,
                  state === "end" || state === "both" ? labels.end : null,
                  state === "inside" ? labels.inRange : null,
                  reason ? `${labels.unavailable}: ${reason}` : null,
                ].filter(Boolean).join(", ");
                return (
                  <td aria-selected={Boolean(state)} className={styles.cell} data-selection={state} key={column} role="gridcell">
                    <button
                      aria-current={isToday ? "date" : undefined}
                      aria-disabled={reason ? true : undefined}
                      aria-label={`${spoken}${descriptors ? `, ${descriptors}` : ""}`}
                      className={styles.day}
                      data-calendar-day={day}
                      data-today={isToday || undefined}
                      onClick={() => { if (!reason) onDaySelect(day); }}
                      onFocus={() => { setActiveDay(day); setExplainedDay(reason ? day : null); }}
                      onKeyDown={(event) => handleDayKeyDown(event, day)}
                      onMouseEnter={() => setExplainedDay(reason ? day : null)}
                      onMouseLeave={() => setExplainedDay(null)}
                      ref={(node) => {
                        if (node) dayRefs.current.set(day, node);
                        else dayRefs.current.delete(day);
                        if (focusRef && day === tabDay) focusRef.current = node;
                      }}
                      tabIndex={day === tabDay ? 0 : -1}
                      title={reason}
                      type="button"
                    >
                      <span>{number}</span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p aria-live="polite" className={styles.explanation}>
        {explainedReason && explainedLabel ? `${explainedLabel}: ${explainedReason}` : "\u00a0"}
      </p>
    </section>
  );
}
