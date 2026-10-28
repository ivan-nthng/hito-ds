"use client";

import {
  useImperativeHandle,
  type ChangeEvent,
  type HTMLAttributes,
  type Ref,
} from "react";
import { Button, type ButtonSize } from "../Button/Button";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { EditableTextControl } from "../editable-text/EditableTextControl";
import { useEditableText } from "../editable-text/useEditableText";
import { Icon } from "../Icon/Icon";
import { NumberInputControl } from "../NumberField/NumberInputControl";
import {
  formatNumberValue,
  getNumberConstraintIssue,
  parseNumberDraft,
  stepNumberValue,
  type NumberFieldMode,
  type NumberFieldStep,
} from "../NumberField/number-value";
import { Text, type TextElement, type TextVariant } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Textarea } from "../Textarea/Textarea";
import styles from "./InlineEdit.module.css";

export type InlineEditBodySize = ControlSize;
export type InlineEditHeadingSize = "sm" | "lg";
export type InlineEditWidth = "fill" | "hug";
export type InlineEditHandle = {
  edit: () => void;
  /** Validate/apply the current field before an enclosing form command. */
  apply: () => Promise<boolean>;
  readonly dirty: boolean;
};

type InlineEditCommonProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onCancel" | "onChange"
> & {
  cancelLabel?: string;
  clearLabel?: string;
  commitErrorMessage?: string;
  disabled?: boolean;
  editLabel?: string;
  /** Opt into a ghost Add button for an empty committed value. */
  emptyActionLabel?: string;
  emptyValueLabel?: string;
  label: string;
  onCancel?: () => void;
  onEdit?: () => void;
  readOnly?: boolean;
  ref?: Ref<InlineEditHandle>;
  saveLabel?: string;
  savedLabel?: string;
  savingLabel?: string;
  showSaveAction?: boolean;
  showCancelAction?: boolean;
  width?: InlineEditWidth;
};

type InlineEditBodyProps = {
  bodySize?: InlineEditBodySize;
  headingLevel?: never;
  headingSize?: never;
  kind?: "body";
  multiline?: boolean;
};

type InlineEditHeadingProps = {
  bodySize?: never;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  headingSize?: InlineEditHeadingSize;
  kind: "heading";
  multiline?: never;
};

type InlineEditTextValueProps = {
  onCommit: (value: string) => Promise<void> | void;
  validate?: (value: string) => string | undefined;
  value: string;
  valueType?: "text";
};

type InlineEditNumberValueProps = {
  invalidNumberMessage?: string;
  locale?: string;
  max?: number;
  min?: number;
  mode?: NumberFieldMode;
  onCommit: (value: number | null) => Promise<void> | void;
  prefix?: string;
  required?: boolean;
  step?: NumberFieldStep;
  suffix?: string;
  validate?: (value: number | null) => string | undefined;
  value: number | null;
  valueType: "number";
};

type InlineEditNumberBodyProps = Omit<
  InlineEditBodyProps,
  "multiline"
> & {
  multiline?: never;
};

export type InlineEditProps = InlineEditCommonProps &
  (
    | (InlineEditTextValueProps &
        (InlineEditBodyProps | InlineEditHeadingProps))
    | (InlineEditNumberValueProps & InlineEditNumberBodyProps)
  );

type InlineEditInternalProps = InlineEditCommonProps & {
  bodySize?: InlineEditBodySize;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  headingSize?: InlineEditHeadingSize;
  invalidNumberMessage?: string;
  kind?: "body" | "heading";
  locale?: string;
  max?: number;
  min?: number;
  mode?: NumberFieldMode;
  multiline?: boolean;
  onCommit:
    | InlineEditTextValueProps["onCommit"]
    | InlineEditNumberValueProps["onCommit"];
  prefix?: string;
  required?: boolean;
  step?: NumberFieldStep;
  suffix?: string;
  validate?:
    | InlineEditTextValueProps["validate"]
    | InlineEditNumberValueProps["validate"];
  value: number | string | null;
  valueType?: "number" | "text";
};

export function InlineEdit(inputProps: InlineEditProps) {
  const {
    bodySize = "md",
    cancelLabel = "Cancel",
    className,
    clearLabel = "Clear",
    commitErrorMessage = "The change could not be saved.",
    disabled = false,
    editLabel,
    emptyActionLabel,
    emptyValueLabel = "Add value",
    headingLevel = 2,
    headingSize = "lg",
    invalidNumberMessage = "Enter a valid number.",
    kind = "body",
    label,
    locale,
    max,
    min,
    mode = "decimal",
    multiline = false,
    onCancel,
    onCommit,
    onEdit,
    prefix,
    readOnly = false,
    ref,
    required = false,
    saveLabel = "Save",
    savedLabel = "Saved",
    savingLabel = "Saving",
    showSaveAction = false,
    showCancelAction = false,
    step = "any",
    suffix,
    validate,
    value,
    valueType = "text",
    width = "hug",
    ...props
  } = inputProps as InlineEditInternalProps;
  const isNumber = valueType === "number";
  const numberValue = isNumber ? (value as number | null) : null;
  const editableValue = isNumber
    ? formatNumberValue(numberValue, { locale, mode })
    : (value as string);
  const displayedValue =
    isNumber && numberValue !== null
      ? `${prefix ?? ""}${editableValue}${suffix ?? ""}`
      : editableValue;
  const canEdit = !disabled && !readOnly;
  const isEmpty = isNumber ? numberValue === null : editableValue.length === 0;
  const isHeading = kind === "heading";
  const controlSize: ButtonSize = isHeading
    ? headingSize === "sm"
      ? "lg"
      : "xl"
    : bodySize;
  const actionSize: ButtonSize = isHeading ? "md" : controlSize;
  const isMultiline = !isHeading && multiline;
  const semanticElement: TextElement = isHeading
    ? `h${headingLevel}`
    : isMultiline
      ? "p"
      : "span";
  const textVariant: TextVariant = isHeading
    ? headingSize === "sm"
      ? "heading-base"
      : "heading-lg"
    : bodySize === "sm"
      ? "body-sm"
      : bodySize === "lg"
        ? "body-md"
        : bodySize === "xl"
          ? "body-lg"
          : "body-base";
  const validateDraft = (draftValue: string) => {
    if (!isNumber) {
      return (validate as ((value: string) => string | undefined) | undefined)?.(
        draftValue,
      );
    }

    const issue = getNumberConstraintIssue(draftValue, {
      locale,
      max,
      min,
      mode,
      required,
      step,
    });
    if (issue) return invalidNumberMessage;

    const parsed = parseNumberDraft(draftValue, { locale, mode });
    if (parsed.kind !== "empty" && parsed.kind !== "valid") {
      return invalidNumberMessage;
    }
    return (
      validate as
        | ((value: number | null) => string | undefined)
        | undefined
    )?.(parsed.value);
  };
  const commitDraft = (draftValue: string) => {
    if (!isNumber) {
      return (onCommit as (value: string) => Promise<void> | void)(draftValue);
    }

    const parsed = parseNumberDraft(draftValue, { locale, mode });
    if (parsed.kind !== "empty" && parsed.kind !== "valid") return;
    return (onCommit as (value: number | null) => Promise<void> | void)(
      parsed.value,
    );
  };
  const {
    beginEdit,
    cancel,
    changeDraft,
    clear,
    commit,
    draft,
    editorRef,
    error,
    errorId,
    handleEditorKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    isEditing,
    outcome,
    phase,
    rootRef,
    triggerRef,
  } = useEditableText({
    canEdit,
    commitErrorMessage,
    commitOnOutsidePointer: true,
    multiline: isMultiline,
    onCancel,
    onCommit: commitDraft,
    onEdit,
    validate: validateDraft,
    value: editableValue,
  });

  useImperativeHandle(ref, () => ({ edit: beginEdit, apply: () => commit(false), dirty: isEditing && draft !== editableValue }), [beginEdit, commit, isEditing, draft, editableValue]);

  const editorProps = {
    "aria-busy": phase === "saving" || undefined,
    "aria-describedby": error ? errorId : undefined,
    "aria-errormessage": error ? errorId : undefined,
    "aria-invalid": error ? true : undefined,
    "aria-label": label,
    className: styles.editor,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      changeDraft(event.currentTarget.value);
    },
    onKeyDown: handleEditorKeyDown,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: (event: React.CompositionEvent<HTMLInputElement | HTMLTextAreaElement>) => handleCompositionEnd(event.currentTarget.value),
    readOnly: phase === "saving",
    value: draft,
  };

  function handleNumberStep(direction: -1 | 1) {
    if (typeof step !== "number" || step <= 0) return;
    const parsed = parseNumberDraft(draft, { locale, mode });
    const nextValue = stepNumberValue(
      parsed.kind === "valid" ? parsed.value : numberValue,
      direction,
      { max, min, step },
    );
    changeDraft(formatNumberValue(nextValue, { locale, mode }));
  }

  return (
    <div
      {...props}
      className={classNames(styles.root, className)}
      data-disabled={disabled || undefined}
      data-empty={isEmpty || undefined}
      data-empty-action={(!readOnly && isEmpty && Boolean(emptyActionLabel)) || undefined}
      data-heading-size={isHeading ? headingSize : undefined}
      data-kind={kind}
      data-multiline={isMultiline || undefined}
      data-outcome={outcome}
      data-phase={phase}
      data-read-only={readOnly || undefined}
      data-save-action={(canEdit && showSaveAction) || undefined}
      data-cancel-action={(canEdit && showCancelAction) || undefined}
      data-size={controlSize}
      data-value-type={valueType}
      data-width={width}
      ref={rootRef}
    >
      <div
        className={styles.field}
        data-auto-size-text={
          width === "hug" || isMultiline
            ? isEditing && isNumber
              ? `${prefix ?? ""}${draft || emptyValueLabel}${suffix ?? ""}`
              : (isEditing ? draft : displayedValue) || emptyValueLabel
            : undefined
        }
        data-auto-size-type={
          width === "hug" || isMultiline
            ? isMultiline
              ? "multiline"
              : "single-line"
            : undefined
        }
      >
        {!readOnly && isEmpty && emptyActionLabel ? (
          <Button
            aria-hidden={isEditing || undefined}
            aria-label={editLabel ?? emptyActionLabel}
            className={classNames(styles.emptyAction, styles.stationaryAction)}
            disabled={disabled}
            hitArea="minimum"
            intent="neutral"
            leadingIcon="controls/plus-s"
            onClick={beginEdit}
            onKeyDown={(event) => {
              if (event.key === "F2") {
                event.preventDefault();
                beginEdit();
              }
            }}
            ref={triggerRef}
            size={actionSize}
            tabIndex={isEditing ? -1 : 0}
            variant="ghost"
          >{emptyActionLabel}</Button>
        ) : !readOnly ? (
          <button
            aria-hidden={isEditing || undefined}
            aria-label={editLabel ?? `Edit ${label}`}
            className={styles.trigger}
            disabled={disabled}
            onClick={beginEdit}
            onKeyDown={(event) => {
              if (event.key === "F2") {
                event.preventDefault();
                beginEdit();
              }
            }}
            ref={triggerRef}
            tabIndex={isEditing ? -1 : 0}
            type="button"
          />
        ) : null}

        <div className={styles.restContent}>
          <Text
            aria-hidden={isEditing || (!readOnly && isEmpty && Boolean(emptyActionLabel)) || undefined}
            as={semanticElement}
            className={styles.restText}
            variant={textVariant}
          >
            {displayedValue || emptyValueLabel}
          </Text>

          {!isEditing && canEdit ? (
            <Icon className={styles.restIcon} name="controls/edit" size="sm" />
          ) : null}
        </div>

        {isEditing ? (
          <EditableTextControl
            className={styles.editorLayer}
            clearLabel={clearLabel}
            disabled={phase === "saving"}
            onClear={clear}
          >
            {isNumber ? (
              <NumberInputControl
                aria-busy={phase === "saving" || undefined}
                aria-describedby={error ? errorId : undefined}
                aria-errormessage={error ? errorId : undefined}
                aria-invalid={error ? true : undefined}
                aria-label={label}
                appearance="soft"
                className={styles.editor}
                data-editable-text-editor="true"
                draft={draft}
                locale={locale}
                max={max}
                min={min}
                mode={mode}
                onDraftChange={changeDraft}
                onKeyDown={handleEditorKeyDown}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={event => handleCompositionEnd(event.currentTarget.value)}
                onStep={handleNumberStep}
                placeholder={emptyValueLabel}
                prefix={prefix}
                readOnly={phase === "saving"}
                ref={(node) => {
                  editorRef.current = node;
                }}
                required={required}
                size={controlSize}
                step={step}
                suffix={suffix}
                validationState={error ? "invalid" : "none"}
              />
            ) : isMultiline ? (
              <Textarea
                {...editorProps}
                appearance="soft"
                className={classNames(styles.editor, styles.multilineEditor)}
                data-editable-text-editor="true"
                placeholder={emptyValueLabel}
                ref={(node) => {
                  editorRef.current = node;
                }}
                rows={1}
                size={bodySize}
                validationState={error ? "invalid" : "none"}
              />
            ) : (
              <TextInput
                {...editorProps}
                appearance="soft"
                data-editable-text-editor="true"
                placeholder={emptyValueLabel}
                ref={(node) => {
                  editorRef.current = node;
                }}
                size={controlSize}
                type="text"
                validationState={error ? "invalid" : "none"}
              />
            )}
          </EditableTextControl>
        ) : null}
      </div>

      {canEdit && (showSaveAction || showCancelAction) ? <div className={styles.actions}>
      {showSaveAction ? (
        <Button
          aria-hidden={!isEditing || undefined}
          aria-label={saveLabel}
          className={classNames(styles.saveAction, styles.stationaryAction)}
          icon="general/check"
          intent="success"
          loading={phase === "saving"}
          onClick={() => void commit(true)}
          size={actionSize}
          tabIndex={isEditing ? undefined : -1}
          variant="primary"
        />
      ) : null}
      {showCancelAction ? <Button
        aria-hidden={!isEditing || undefined}
        aria-label={cancelLabel}
        className={classNames(styles.saveAction, styles.stationaryAction)}
        disabled={phase === "saving"}
        icon="controls/close-s"
        intent="neutral"
        onClick={cancel}
        size={actionSize}
        tabIndex={isEditing ? undefined : -1}
        variant="soft"
      /> : null}
      </div> : null}
      {error ? (
        <p className={styles.error} id={errorId} role="alert">
          {error}
        </p>
      ) : null}
      <span aria-live="polite" className={styles.liveStatus}>
        {phase === "saving"
          ? savingLabel
          : outcome === "saved"
            ? savedLabel
            : ""}
      </span>
    </div>
  );
}
