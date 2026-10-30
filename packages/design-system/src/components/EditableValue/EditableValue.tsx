"use client";

import { useImperativeHandle, type ChangeEvent, type HTMLAttributes, type InputHTMLAttributes, type Ref } from "react";
import { Button } from "../Button/Button";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { EditableTextControl } from "../editable-text/EditableTextControl";
import { useEditableText } from "../editable-text/useEditableText";
import { Icon } from "../Icon/Icon";
import { Text, type TextVariant } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Spinner } from "../Spinner/Spinner";
import styles from "./EditableValue.module.css";

export type EditableValueWidth = "fill" | "hug";
export type EditableValueHandle = {
  edit: () => void;
  apply: () => Promise<boolean>;
  readonly dirty: boolean;
};

type InputAdapter = (draft: { value: string; onChange: (value: string) => void }) =>
  Pick<InputHTMLAttributes<HTMLInputElement>, "placeholder" | "onChange" | "onFocus" | "onBlur" | "onKeyDown" | "onPaste"> & { value?: string };

export type EditableValueProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onCancel" | "onChange" | "prefix"
> & {
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  cancelLabel?: string;
  clearLabel?: string;
  commitErrorMessage?: string;
  /** Change mode keeps editing while valid drafts await persistence; value is the last confirmed value. */
  commitMode?: "explicit" | "change";
  /** Opt in to committing when keyboard focus leaves the whole field. */
  commitOnBlur?: boolean;
  disabled?: boolean;
  editLabel?: string;
  emptyValueLabel?: string;
  label: string;
  /** Input-only formatting/events; the DS retains its native editor, controls and commit lifecycle. */
  inputAdapter?: InputAdapter;
  onCancel?: () => void;
  onCommit: (value: string) => Promise<void> | void;
  /** Draft notification only. Persistence belongs exclusively to onCommit. */
  onDraftChange?: (value: string) => void;
  onEdit?: () => void;
  readOnly?: boolean;
  ref?: Ref<EditableValueHandle>;
  /** Visual affix, separate from the draft and commit payload. */
  prefix?: string;
  saveLabel?: string;
  savedLabel?: string;
  savingLabel?: string;
  size?: ControlSize;
  type?: "text" | "email" | "tel";
  validate?: (value: string) => string | undefined;
  value: string;
  width?: EditableValueWidth;
};

export function EditableValue({
  autoComplete,
  cancelLabel = "Cancel",
  className,
  clearLabel = "Clear",
  commitErrorMessage = "The change could not be saved.",
  commitMode = "explicit",
  commitOnBlur = false,
  disabled = false,
  editLabel,
  emptyValueLabel,
  inputMode,
  inputAdapter,
  label,
  onCancel,
  onCommit,
  onDraftChange,
  onEdit,
  readOnly = false,
  ref,
  prefix,
  saveLabel = "Save",
  savedLabel = "Saved",
  savingLabel = "Saving",
  size = "md",
  type = "text",
  validate,
  value,
  width = "hug",
  ...props
}: EditableValueProps) {
  const canEdit = !disabled && !readOnly;
  const isEmpty = value.length === 0;
  const resolvedEmptyLabel = emptyValueLabel ?? `Add ${label}`;
  const valueVariant = `ui-${size}` as TextVariant;
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
    commitMode,
    commitOnOutsidePointer: true,
    onCancel,
    onCommit,
    onDraftChange,
    onEdit,
    validate,
    value,
  });
  useImperativeHandle(ref, () => ({ edit: beginEdit, apply: () => commitMode === "explicit" ? commit(false) : Promise.resolve(false), dirty: isEditing && draft !== value }), [beginEdit, commit, commitMode, isEditing, draft, value]);
  const input = inputAdapter?.({ value: draft, onChange: changeDraft });

  const restContent = (
    <>
      <Text as="span" className={styles.label} variant="label-eyebrow">
        {label}
      </Text>
      <Text as="span" className={styles.value} variant={valueVariant}>
        {!isEmpty && prefix ? <span className={styles.prefix}>{prefix}</span> : null}
        {value || "—"}
      </Text>
    </>
  );

  return (
    <div
      {...props}
      onBlur={event => {
        props.onBlur?.(event);
        if (!event.defaultPrevented && commitOnBlur && commitMode === "explicit" && canEdit && phase === "editing"
          && !event.currentTarget.contains(event.relatedTarget)) void commit(false);
      }}
      className={classNames(styles.root, className)}
      data-disabled={disabled || undefined}
      data-commit-mode={commitMode}
      data-empty={isEmpty || undefined}
      data-outcome={outcome}
      data-phase={phase}
      data-read-only={readOnly || undefined}
      data-size={size}
      data-width={width}
      ref={rootRef}
    >
      {!isEditing && isEmpty && canEdit ? (
        <Button
          aria-label={editLabel}
          className={styles.emptyAction}
          intent="neutral"
          leadingIcon="controls/plus-s"
          onClick={beginEdit}
          ref={triggerRef}
          size={size}
          variant="soft"
          width={width === "fill" ? "full" : "content"}
        >
          {resolvedEmptyLabel}
        </Button>
      ) : null}

      {!isEditing && !(isEmpty && canEdit) ? (
        <>
          {canEdit ? (
            <button
              aria-label={editLabel ?? `Edit ${label}`}
              className={classNames(styles.surface, styles.restTrigger)}
              data-editable-value-surface="true"
              onClick={beginEdit}
              onKeyDown={(event) => {
                if (event.key === "F2") {
                  event.preventDefault();
                  beginEdit();
                }
              }}
              ref={triggerRef}
              type="button"
            >
              {restContent}
            </button>
          ) : (
            <div className={styles.surface} data-editable-value-surface="true">
              {restContent}
            </div>
          )}

          {canEdit ? (
            <Icon
              className={styles.restHint}
              name={outcome === "saved" ? "general/check" : "controls/edit"}
              size="sm"
            />
          ) : null}
        </>
      ) : null}

      {isEditing ? (
        <div className={styles.editorLayout}>
          <EditableTextControl
            autoSizeText={
              width === "hug" ? `${prefix ?? ""}${input?.value ?? (draft || resolvedEmptyLabel)}` : undefined
            }
            className={styles.editorControl}
            data-prefix={prefix || undefined}
            clearLabel={clearLabel}
            disabled={!canEdit || phase === "saving" && commitMode === "explicit"}
            onClear={clear}
          >
            <TextInput
              aria-busy={phase === "saving" || undefined}
              aria-describedby={[props["aria-describedby"], error ? errorId : undefined].filter(Boolean).join(" ") || undefined}
              aria-errormessage={error ? errorId : undefined}
              aria-invalid={error ? true : undefined}
              aria-label={label}
              appearance="soft"
              className={styles.editor}
              data-editable-text-editor="true"
              onChange={input?.onChange ?? ((event: ChangeEvent<HTMLInputElement>) => changeDraft(event.currentTarget.value))}
              onFocus={input?.onFocus}
              onBlur={input?.onBlur}
              onPaste={input?.onPaste}
              onKeyDown={event => { input?.onKeyDown?.(event); if (!event.defaultPrevented) handleEditorKeyDown(event); }}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={event => handleCompositionEnd(event.currentTarget.value)}
              placeholder={input?.placeholder ?? resolvedEmptyLabel}
              inputMode={inputMode}
              autoComplete={autoComplete}
              readOnly={!canEdit || phase === "saving" && commitMode === "explicit"}
              ref={(node) => {
                editorRef.current = node;
              }}
              size={size}
              type={type}
              prefix={prefix}
              validationState={error ? "invalid" : "none"}
              value={input?.value ?? draft}
            />
          </EditableTextControl>

          {commitMode === "explicit" ? <div className={styles.actions}><Button
            aria-label={saveLabel}
            className={classNames(styles.saveAction, styles.stationaryAction)}
            icon="general/check"
            intent="success"
            {...(canEdit ? { loading: phase === "saving" } : { disabled: true })}
            onClick={() => void commit(true)}
            size={size}
            variant="primary"
          /><Button
            aria-label={cancelLabel}
            className={styles.stationaryAction}
            disabled={!canEdit || phase === "saving"}
            icon="controls/close-s"
            intent="neutral"
            onClick={cancel}
            size={size}
            variant="soft"
          /></div> : null}
        </div>
      ) : null}

      {commitMode === "change" && (phase === "saving" || outcome === "saved") ?
        <Text as="span" variant="body-sm" className={styles.autoStatus} aria-hidden="true">
          {phase === "saving" ? <Spinner size="sm" /> : <Icon name="general/check" size="sm" tone="success" />}
          {phase === "saving" ? savingLabel : savedLabel}
        </Text> : null}

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
