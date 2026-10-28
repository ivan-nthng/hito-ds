"use client";

import {
  forwardRef,
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type ReactElement,
  type Ref,
} from "react";
import { Button, type ButtonProps } from "../Button/Button";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import type { ControlWidth } from "../control-width";
import { Field } from "../Field/Field";
import { InputFrame, inputFrameStyles } from "../input-frame/InputFrame";
import type { ControlAppearance } from "../input-frame/control-state";
import {
  calendarDayFromDraft,
  dateDraftFromPastedText,
  dateFormatHint,
  dateIssueMessage,
  dateSegmentOrder,
  draftFromCalendarDay,
  getDateIssue,
  spokenCalendarDay,
  type DateDraft,
  type DateFieldLocale,
  type DateSegment,
} from "./date-value";
import styles from "./DateField.module.css";

export type { DateFieldLocale } from "./date-value";

/** The value is a calendar day in YYYY-MM-DD form, never a timestamp. */
export type DateFieldProps = {
  appearance?: ControlAppearance;
  /** Button slot used when an admitted picker owns the anchored calendar overlay. */
  calendarAction?: ReactElement<ButtonProps>;
  disabled?: boolean;
  error?: ReactNode;
  form?: string;
  hint?: ReactNode;
  id?: string;
  label: ReactNode;
  labelSize?: "base" | "sm";
  locale: DateFieldLocale;
  name?: string;
  onCalendarOpen?: () => void;
  /** Reports every segment edit, including incomplete text, to a composing picker. */
  onDraftChange?: (draft: DateDraft) => void;
  onValueChange?: (day: string | null) => void;
  /** Resets a local incomplete edit after an explicit calendar or preset choice. */
  draftResetKey?: number;
  readOnly?: boolean;
  required?: boolean;
  size?: ControlSize;
  /** Native form validity for a composite control's day-level restriction. */
  validationMessage?: string;
  value: string | null;
  width?: ControlWidth;
};

const segmentCopy = {
  en: { day: "Day", month: "Month", year: "Year", format: "Format", calendar: "Open calendar" },
  pt: { day: "Dia", month: "Mês", year: "Ano", format: "Formato", calendar: "Abrir calendário" },
} as const;

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  function DateField(
    {
      appearance = "outlined",
      calendarAction,
      disabled = false,
      error,
      form,
      hint,
      id,
      label,
      labelSize,
      locale,
      name,
      onCalendarOpen,
      onDraftChange,
      onValueChange,
      draftResetKey,
      readOnly = false,
      required = false,
      size = "md",
      validationMessage,
      value,
      width = "fill",
    },
    ref,
  ) {
    const generatedId = useId();
    const controlId = id ?? `${generatedId}-date`;
    const spokenId = `${controlId}-spoken`;
    const order = dateSegmentOrder(locale);
    const firstSegment = order[0];
    const [draft, setDraft] = useState<DateDraft>(() => draftFromCalendarDay(value));
    const [showIssue, setShowIssue] = useState(false);
    const inputRefs = useRef<Record<DateSegment, HTMLInputElement | null>>({ day: null, month: null, year: null });
    const editingRef = useRef(false);
    const pendingValueEchoRef = useRef<string | null | undefined>(undefined);
    const previousControlledRef = useRef({ value, locale, draftResetKey });
    const issue = getDateIssue(draft, locale, required);
    const message = issue ? dateIssueMessage(issue, locale) : undefined;
    const visibleError = error ?? (showIssue ? message : undefined);
    const invalid = Boolean(visibleError);
    const spoken = spokenCalendarDay(draft, locale);

    useEffect(() => {
      const previous = previousControlledRef.current;
      const valueChanged = previous.value !== value;
      const localeChanged = previous.locale !== locale;
      const resetChanged = previous.draftResetKey !== draftResetKey;
      previousControlledRef.current = { value, locale, draftResetKey };
      if (!valueChanged && !localeChanged && !resetChanged) return;

      if (!resetChanged && valueChanged && editingRef.current && pendingValueEchoRef.current === value) {
        pendingValueEchoRef.current = undefined;
        return;
      }
      pendingValueEchoRef.current = undefined;
      if (valueChanged || resetChanged || !editingRef.current) {
        setDraft(draftFromCalendarDay(value));
        setShowIssue(false);
      }
    }, [value, locale, draftResetKey]);

    useEffect(() => {
      for (const segment of ["day", "month", "year"] as const) {
        inputRefs.current[segment]?.setCustomValidity(
          issue?.segment === segment ? message ?? "" : segment === "day" ? validationMessage ?? "" : "",
        );
      }
    }, [issue?.segment, issue?.kind, message, validationMessage]);

    function acceptDraft(next: DateDraft) {
      setDraft(next);
      setShowIssue(false);
      onDraftChange?.(next);
      if (Object.values(next).every((part) => part === "")) {
        if (value !== null && onValueChange) {
          pendingValueEchoRef.current = null;
          onValueChange(null);
        }
        return;
      }
      if (!getDateIssue(next, locale)) {
        const day = calendarDayFromDraft(next);
        if (day !== value && onValueChange) {
          pendingValueEchoRef.current = day;
          onValueChange(day);
        }
      }
    }

    function focusSegment(segment: DateSegment) {
      const input = inputRefs.current[segment];
      input?.focus();
      input?.select();
    }

    function handleChange(segment: DateSegment, text: string) {
      const next = { ...draft, [segment]: text };
      acceptDraft(next);
      const nextIndex = order.indexOf(segment) + 1;
      const length = segment === "year" ? 4 : 2;
      if (text.length === length && nextIndex < order.length && /^\d+$/.test(text)) {
        focusSegment(order[nextIndex]);
      }
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
      const next = dateDraftFromPastedText(event.clipboardData.getData("text"), locale);
      if (!next) return;
      event.preventDefault();
      acceptDraft(next);
      focusSegment("year");
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, segment: DateSegment) {
      const index = order.indexOf(segment);
      const input = event.currentTarget;
      if (["/", ".", "-", " "].includes(event.key) && index < order.length - 1) {
        event.preventDefault();
        focusSegment(order[index + 1]);
      } else if (
        (event.key === "Backspace" && draft[segment] === "") ||
        (event.key === "ArrowLeft" && input.selectionStart === 0 && input.selectionEnd === 0)
      ) {
        if (index > 0) {
          event.preventDefault();
          focusSegment(order[index - 1]);
        }
      } else if (
        event.key === "ArrowRight" &&
        input.selectionStart === input.value.length &&
        input.selectionEnd === input.value.length &&
        index < order.length - 1
      ) {
        event.preventDefault();
        focusSegment(order[index + 1]);
      }
    }

    function handleBlur(event: FocusEvent<HTMLSpanElement>) {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      editingRef.current = false;
      setShowIssue(true);
      if (!issue && draft.day && draft.month && draft.year) {
        setDraft(draftFromCalendarDay(calendarDayFromDraft(draft)));
      }
    }

    return (
      <Field
        controlId={controlId}
        error={visibleError}
        hint={
          <>
            {segmentCopy[locale].format}: {dateFormatHint(locale)}
            {hint ? <> · {hint}</> : null}
          </>
        }
        label={label}
        labelSize={labelSize}
        required={required}
      >
        {({ controlProps }) => (
          <>
            <InputFrame
              appearance={appearance}
              aria-describedby={classNames(controlProps["aria-describedby"], spoken ? spokenId : undefined)}
              aria-labelledby={controlProps["aria-labelledby"]}
              className={styles.frame}
              disabled={disabled}
              invalid={invalid}
              onBlur={handleBlur}
              onFocus={() => { editingRef.current = true; }}
              readOnly={readOnly}
              role="group"
              size={size}
              width={width}
              trailing={calendarAction ? cloneElement(calendarAction, {
                className: classNames(styles.calendarAction, calendarAction.props.className),
              }) : onCalendarOpen ? (
                <Button
                  aria-label={segmentCopy[locale].calendar}
                  className={styles.calendarAction}
                  disabled={disabled || readOnly}
                  icon="general/calendar"
                  intent="neutral"
                  onClick={onCalendarOpen}
                  size={size}
                  variant="ghost"
                />
              ) : undefined}
            >
              {order.map((segment, index) => {
                const segmentLabelId = `${controlId}-${segment}-label`;
                const segmentId = index === 0 ? controlProps.id : `${controlId}-${segment}`;
                return (
                  <span className={styles.part} key={segment}>
                    {index > 0 ? <span aria-hidden className={styles.separator}>/</span> : null}
                    <span className={styles.visuallyHidden} id={segmentLabelId}>
                      {segmentCopy[locale][segment]}
                    </span>
                    <input
                      aria-describedby={controlProps["aria-describedby"]}
                      aria-errormessage={controlProps["aria-errormessage"]}
                      aria-invalid={Boolean(error) || (showIssue && issue?.segment === segment) || undefined}
                      aria-labelledby={`${controlProps["aria-labelledby"]} ${segmentLabelId}`}
                      aria-required={required || undefined}
                      className={classNames(inputFrameStyles.input, styles.segment, segment === "year" && styles.year)}
                      disabled={disabled}
                      form={form}
                      id={segmentId}
                      inputMode="numeric"
                      onChange={(event) => handleChange(segment, event.target.value)}
                      onInvalid={() => setShowIssue(true)}
                      onKeyDown={(event) => handleKeyDown(event, segment)}
                      onPaste={handlePaste}
                      placeholder={segment === "year" ? (locale === "pt" ? "AAAA" : "YYYY") : segment === "day" ? "DD" : "MM"}
                      readOnly={readOnly}
                      ref={(node) => {
                        inputRefs.current[segment] = node;
                        if (segment === firstSegment) assignRef(ref, node);
                      }}
                      required={required}
                      type="text"
                      value={draft[segment]}
                    />
                  </span>
                );
              })}
            </InputFrame>
            {spoken ? <span className={styles.visuallyHidden} id={spokenId}>{spoken}</span> : null}
            {name ? <input disabled={disabled} form={form} name={name} type="hidden" value={value ?? ""} /> : null}
          </>
        )}
      </Field>
    );
  },
);
