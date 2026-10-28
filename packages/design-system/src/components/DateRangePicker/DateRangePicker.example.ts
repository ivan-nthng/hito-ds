import type { DateRangeQuickPeriod } from "./DateRangePicker";

/** Caller-resolved synthetic reporting periods. DateRangePicker does no cutoff arithmetic. */
export const exampleReferenceDay = "2026-09-29";

export const exampleQuickPeriods = [
  { id: "last-seven-days", label: { en: "Last 7 days", pt: "Últimos 7 dias" }, value: { startDay: "2026-09-23", endDay: exampleReferenceDay } },
  { id: "last-thirty-days", label: { en: "Last 30 days", pt: "Últimos 30 dias" }, value: { startDay: "2026-08-31", endDay: exampleReferenceDay } },
  { id: "last-six-months", label: { en: "Last 6 months", pt: "Últimos 6 meses" }, value: { startDay: "2026-03-30", endDay: exampleReferenceDay } },
  { id: "last-twelve-months", label: { en: "Last 12 months", pt: "Últimos 12 meses" }, value: { startDay: "2025-09-30", endDay: exampleReferenceDay } },
  { id: "current-week", label: { en: "Current week", pt: "Semana atual" }, value: { startDay: "2026-09-27", endDay: exampleReferenceDay } },
  { id: "current-month", label: { en: "Current month", pt: "Mês atual" }, value: { startDay: "2026-09-01", endDay: exampleReferenceDay } },
  { id: "previous-year", label: { en: "Previous year", pt: "Ano anterior" }, value: { startDay: "2025-01-01", endDay: "2025-12-31" } },
  { id: "this-month-last-year", label: { en: "This month last year", pt: "Este mês no ano passado" }, value: { startDay: "2025-09-01", endDay: "2025-09-29" } },
] satisfies readonly DateRangeQuickPeriod[];
