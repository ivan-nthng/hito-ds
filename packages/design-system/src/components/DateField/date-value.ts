import { daysInCalendarMonth } from "../date/calendar-day";

export type DateFieldLocale = "pt" | "en";
export type DateSegment = "day" | "month" | "year";
export type DateDraft = Record<DateSegment, string>;
export type DateIssue = { segment: DateSegment; kind: "incomplete" | "invalid" };

export const emptyDateDraft: DateDraft = { day: "", month: "", year: "" };

export function dateSegmentOrder(locale: DateFieldLocale): DateSegment[] {
  return locale === "pt" ? ["day", "month", "year"] : ["month", "day", "year"];
}

export function dateFormatHint(locale: DateFieldLocale) {
  return locale === "pt" ? "DD/MM/AAAA" : "MM/DD/YYYY";
}

export function getDateIssue(
  draft: DateDraft,
  locale: DateFieldLocale,
  required = false,
): DateIssue | undefined {
  const order = dateSegmentOrder(locale);
  if (order.every((segment) => draft[segment] === "") && !required) return undefined;

  for (const segment of order) {
    const text = draft[segment];
    if (!text) continue;
    if (!/^\d+$/.test(text) || text.length > (segment === "year" ? 4 : 2)) {
      return { segment, kind: "invalid" };
    }
    const number = Number(text);
    if ((segment === "day" && (number < 1 || number > 31)) ||
      (segment === "month" && (number < 1 || number > 12)) ||
      (segment === "year" && text.length === 4 && number < 1)) {
      return { segment, kind: "invalid" };
    }
  }

  for (const segment of order) {
    if (!draft[segment] || (segment === "year" && draft.year.length < 4)) {
      return { segment, kind: "incomplete" };
    }
  }
  const month = Number(draft.month);
  const day = Number(draft.day);
  if (day > daysInCalendarMonth(Number(draft.year), month)) {
    return { segment: "day", kind: "invalid" };
  }
  return undefined;
}

export function calendarDayFromDraft(draft: DateDraft): string {
  return `${draft.year}-${draft.month.padStart(2, "0")}-${draft.day.padStart(2, "0")}`;
}

export function draftFromCalendarDay(day: string | null): DateDraft {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day ?? "");
  if (!match) return { ...emptyDateDraft };
  const draft = { year: match[1], month: match[2], day: match[3] };
  return getDateIssue(draft, "en") ? { ...emptyDateDraft } : draft;
}

export function dateDraftFromPastedText(
  text: string,
  locale: DateFieldLocale,
): DateDraft | undefined {
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text.trim());
  if (iso) return { year: iso[1], month: iso[2], day: iso[3] };
  const local = /^(\d{1,2})\s*[/.\-]\s*(\d{1,2})\s*[/.\-]\s*(\d{4})$/.exec(text.trim());
  if (!local) return undefined;
  return locale === "pt"
    ? { day: local[1], month: local[2], year: local[3] }
    : { month: local[1], day: local[2], year: local[3] };
}

const monthNames = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  pt: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
} as const;

export function spokenCalendarDay(draft: DateDraft, locale: DateFieldLocale) {
  if (getDateIssue(draft, locale) || !draft.day) return undefined;
  const day = Number(draft.day);
  const month = monthNames[locale][Number(draft.month) - 1];
  return locale === "pt"
    ? `${day} de ${month} de ${draft.year}`
    : `${month} ${day}, ${draft.year}`;
}

export function dateIssueMessage(issue: DateIssue, locale: DateFieldLocale) {
  const names = locale === "pt"
    ? { day: "dia", month: "mês", year: "ano" }
    : { day: "day", month: "month", year: "year" };
  if (issue.kind === "incomplete") {
    return locale === "pt"
      ? `Informe o ${names[issue.segment]}.`
      : `Enter the ${names[issue.segment]}.`;
  }
  return locale === "pt"
    ? `Informe um ${names[issue.segment]} válido.`
    : `Enter a valid ${names[issue.segment]}.`;
}
