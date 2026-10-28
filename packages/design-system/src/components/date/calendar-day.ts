/** Calendar-day arithmetic is deliberately independent of timestamps and timezones. */
export type CalendarDateParts = { year: number; month: number; day: number };
export type CalendarMonthParts = Pick<CalendarDateParts, "year" | "month">;

export function daysInCalendarMonth(year: number, month: number): number {
  if (month === 2) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function parseCalendarMonth(value: string): CalendarMonthParts | null {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value);
  if (!match || Number(match[1]) < 1) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

export function parseCalendarDay(value: string): CalendarDateParts | null {
  const match = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || day > daysInCalendarMonth(year, month)) return null;
  return { year, month, day };
}

export function formatCalendarMonth({ year, month }: CalendarMonthParts): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

export function formatCalendarDay({ year, month, day }: CalendarDateParts): string {
  return `${formatCalendarMonth({ year, month })}-${String(day).padStart(2, "0")}`;
}

export function calendarMonthOf(day: string): string | null {
  const parts = parseCalendarDay(day);
  return parts ? formatCalendarMonth(parts) : null;
}

/** Gregorian weekday, Sunday = 0. */
export function calendarWeekday({ year, month, day }: CalendarDateParts): number {
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  const adjustedYear = month < 3 ? year - 1 : year;
  return (
    adjustedYear + Math.floor(adjustedYear / 4) - Math.floor(adjustedYear / 100) +
    Math.floor(adjustedYear / 400) + offsets[month - 1] + day
  ) % 7;
}

export function shiftCalendarMonth(value: string, offset: number): string | null {
  const month = parseCalendarMonth(value);
  if (!month || !Number.isInteger(offset)) return null;
  const index = (month.year - 1) * 12 + month.month - 1 + offset;
  if (index < 0 || index >= 9999 * 12) return null;
  return formatCalendarMonth({ year: Math.floor(index / 12) + 1, month: index % 12 + 1 });
}

export function shiftCalendarDayByMonth(value: string, offset: number): string | null {
  const day = parseCalendarDay(value);
  if (!day) return null;
  const target = shiftCalendarMonth(formatCalendarMonth(day), offset);
  const month = target ? parseCalendarMonth(target) : null;
  return month ? formatCalendarDay({ ...month, day: Math.min(day.day, daysInCalendarMonth(month.year, month.month)) }) : null;
}

export function shiftCalendarDay(value: string, offset: number): string | null {
  const original = parseCalendarDay(value);
  if (!original || !Number.isInteger(offset)) return null;
  const parts = { ...original };
  for (let remaining = Math.abs(offset); remaining > 0; remaining--) {
    if (offset > 0) {
      parts.day++;
      if (parts.day > daysInCalendarMonth(parts.year, parts.month)) {
        parts.day = 1;
        parts.month++;
        if (parts.month > 12) { parts.month = 1; parts.year++; }
      }
    } else {
      parts.day--;
      if (parts.day < 1) {
        parts.month--;
        if (parts.month < 1) { parts.month = 12; parts.year--; }
        parts.day = daysInCalendarMonth(parts.year, parts.month);
      }
    }
    if (parts.year < 1 || parts.year > 9999) return null;
  }
  return formatCalendarDay(parts);
}
