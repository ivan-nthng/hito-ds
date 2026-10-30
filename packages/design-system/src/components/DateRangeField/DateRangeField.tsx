"use client";

import { forwardRef, useEffect, useRef, useState, type ReactNode } from "react";
import { parseCalendarDay } from "../date/calendar-day";
import { getDateIssue, type DateDraft } from "../DateField/date-value";
import { DateField, type DateFieldProps } from "../DateField/DateField";
import { Fieldset } from "../Fieldset/Fieldset";
import styles from "./DateRangeField.module.css";

/** Both endpoints are inclusive calendar days, never timestamps. */
export type DateRangeValue = { startDay: string; endDay: string };
export type DateRangeDraft = { startDay: string | null; endDay: string | null };

export type DateRangeFieldProps = {
  legend: ReactNode;
  description?: ReactNode;
  locale: DateFieldProps["locale"];
  value: DateRangeValue | null;
  onValueChange?: (value: DateRangeValue | null) => void;
  /** Optional transaction draft owned by DateRangePicker; value remains the applied pair. */
  draftValue?: DateRangeDraft;
  onDraftChange?: (draft: DateRangeDraft) => void;
  onDraftValidityChange?: (endpoint: keyof DateRangeDraft, valid: boolean) => void;
  draftResetKey?: number;
  pendingValidationMessage?: string;
  startLabel?: string;
  endLabel?: string;
  startName?: string;
  endName?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: DateFieldProps["size"];
  labelSize?: DateFieldProps["labelSize"];
  appearance?: DateFieldProps["appearance"];
  /** Prefer paired endpoints when the containing composition has room; default keeps standalone layout. */
  endpointLayout?: "responsive" | "columns";
  error?: string;
  id?: string;
};

const copy = {
  en: { start: "Start date", end: "End date", order: "End date must be on or after start date." },
  pt: { start: "Data de início", end: "Data de término", order: "A data de término deve ser igual ou posterior à data de início." },
} as const;

function fromValue(value: DateRangeValue | null): DateRangeDraft {
  return { startDay: value?.startDay ?? null, endDay: value?.endDay ?? null };
}

export const DateRangeField = forwardRef<HTMLFieldSetElement, DateRangeFieldProps>(function DateRangeField({
  legend,
  description,
  locale,
  value,
  onValueChange,
  draftValue,
  onDraftChange,
  onDraftValidityChange,
  draftResetKey,
  pendingValidationMessage,
  startLabel,
  endLabel,
  startName,
  endName,
  form,
  required = false,
  disabled = false,
  readOnly = false,
  size = "md",
  labelSize,
  appearance = "outlined",
  endpointLayout = "responsive",
  error,
  id,
}, ref) {
  if (value && (!parseCalendarDay(value.startDay) || !parseCalendarDay(value.endDay))) {
    throw new TypeError("DateRangeField requires complete YYYY-MM-DD endpoints.");
  }

  const appliedStartDay = value?.startDay ?? null;
  const appliedEndDay = value?.endDay ?? null;
  const [draft, setDraft] = useState<DateRangeDraft>(() => fromValue(value));
  const draftRef = useRef(draft);
  const shownDraft = draftValue ?? draft;
  useEffect(() => {
    const next = { startDay: appliedStartDay, endDay: appliedEndDay };
    draftRef.current = next;
    setDraft(next);
  }, [appliedStartDay, appliedEndDay]);

  const labels = copy[locale];
  const orderError = shownDraft.startDay && shownDraft.endDay && shownDraft.endDay < shownDraft.startDay ? labels.order : undefined;
  const endError = orderError ?? error;
  const endpointsRequired = required || Boolean(shownDraft.startDay || shownDraft.endDay);

  function changeEndpoint(endpoint: keyof DateRangeDraft, day: string | null) {
    if (disabled || readOnly) return;
    const next = { ...(draftValue ?? draftRef.current), [endpoint]: day };
    draftRef.current = next;
    if (draftValue !== undefined) {
      onDraftChange?.(next);
      return;
    }
    setDraft(next);
    if (next.startDay && next.endDay && next.startDay <= next.endDay) {
      onValueChange?.({ startDay: next.startDay, endDay: next.endDay });
    } else if (!next.startDay && !next.endDay) {
      onValueChange?.(null);
    }
  }

  return <Fieldset className={styles.root} data-endpoint-layout={endpointLayout} description={description} id={id} legend={legend} ref={ref}>
    <div className={styles.fields}>
      <DateField
        appearance={appearance}
        disabled={disabled}
        draftResetKey={draftResetKey}
        form={form}
        label={startLabel ?? labels.start}
        labelSize={labelSize}
        locale={locale}
        onDraftChange={(next: DateDraft) => onDraftValidityChange?.("startDay", !getDateIssue(next, locale, true))}
        onValueChange={(day) => changeEndpoint("startDay", day)}
        readOnly={readOnly}
        required={endpointsRequired}
        size={size}
        value={shownDraft.startDay}
      />
      <DateField
        appearance={appearance}
        disabled={disabled}
        draftResetKey={draftResetKey}
        error={endError}
        form={form}
        label={endLabel ?? labels.end}
        labelSize={labelSize}
        locale={locale}
        onDraftChange={(next: DateDraft) => onDraftValidityChange?.("endDay", !getDateIssue(next, locale, true))}
        onValueChange={(day) => changeEndpoint("endDay", day)}
        readOnly={readOnly}
        required={endpointsRequired}
        size={size}
        validationMessage={endError ?? pendingValidationMessage}
        value={shownDraft.endDay}
      />
      {startName ? <input disabled={disabled} form={form} name={startName} type="hidden" value={appliedStartDay ?? ""} /> : null}
      {endName ? <input disabled={disabled} form={form} name={endName} type="hidden" value={appliedEndDay ?? ""} /> : null}
    </div>
  </Fieldset>;
});
