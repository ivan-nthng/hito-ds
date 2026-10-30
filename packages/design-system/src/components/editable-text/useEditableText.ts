import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

export type EditableTextPhase = "editing" | "rest" | "saving";
export type EditableTextOutcome = "error" | "idle" | "saved";
export type EditableTextEditor = HTMLInputElement | HTMLTextAreaElement;

type UseEditableTextOptions = {
  canEdit: boolean;
  commitErrorMessage: string;
  commitMode?: "explicit" | "change";
  commitOnOutsidePointer?: boolean;
  multiline?: boolean;
  onCancel?: () => void;
  onCommit: (value: string) => Promise<void> | void;
  onDraftChange?: (value: string) => void;
  onEdit?: () => void;
  validate?: (value: string) => string | undefined;
  value: string;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useEditableText({
  canEdit,
  commitErrorMessage,
  commitMode = "explicit",
  commitOnOutsidePointer = false,
  multiline = false,
  onCancel,
  onCommit,
  onDraftChange,
  onEdit,
  validate,
  value,
}: UseEditableTextOptions) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string>();
  const [outcome, setOutcome] = useState<EditableTextOutcome>("idle");
  const [phase, setPhase] = useState<EditableTextPhase>("rest");
  const [failedChange, setFailedChange] = useState<{ draft: string; baseline: string }>();
  const [previousValue, setPreviousValue] = useState(value);
  // Follow confirmed autofill only while this editor has no newer local draft.
  if (value !== previousValue) {
    setPreviousValue(value);
    if (commitMode === "change" && phase === "editing" && !error && draft === previousValue) setDraft(value);
    if (commitMode === "explicit" && outcome === "error" && failedChange?.draft === draft && failedChange.baseline !== value && value === draft) {
      setError(undefined); setOutcome("saved"); setPhase("rest");
    }
  }
  const editorRef = useRef<EditableTextEditor>(null);
  const returnFocusRef = useRef(false);
  const returnFocusTargetRef = useRef<HTMLElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const savingRef = useRef(false);
  const pendingApply = useRef<Promise<boolean> | null>(null);
  const selectEditorRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const isEditing = phase !== "rest";
  const draftRef = useRef(value);
  useEffect(() => { draftRef.current = draft; }, [draft]);
  const revision = useRef(0);
  const session = useRef(0);
  const mounted = useRef(false);
  const composing = useRef(false);
  const submitted = useRef<{ revision: number; session: number; state: "pending" | "saved" | "error" } | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (phase === "rest") {
      if (returnFocusRef.current) {
        returnFocusRef.current = false;
        const returnTarget = returnFocusTargetRef.current;
        returnFocusTargetRef.current = null;
        if (returnTarget?.isConnected) {
          returnTarget.focus();
        } else {
          triggerRef.current?.focus();
        }
      }
      return;
    }

    if (phase === "editing" && (commitMode === "explicit" || selectEditorRef.current)) {
      editorRef.current?.focus();
      if (selectEditorRef.current) {
        selectEditorRef.current = false;
        editorRef.current?.select();
      }
    }
  }, [phase, commitMode]);

  const beginEdit = useCallback(() => {
    if (!canEdit || isEditing) return;
    const activeElement = document.activeElement;
    returnFocusTargetRef.current =
      activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : triggerRef.current;
    setDraft(value);
    draftRef.current = value;
    session.current++;
    revision.current = 0;
    submitted.current = { session: session.current, revision: 0, state: "saved" };
    setError(undefined);
    setOutcome("idle");
    selectEditorRef.current = true;
    setPhase("editing");
    onEdit?.();
  }, [canEdit, isEditing, onEdit, value]);

  function cancel() {
    if (!canEdit) return;
    // Autosave has no rollback action. Keep an incomplete or failed draft visible and editable.
    if (commitMode === "change") { editorRef.current?.blur(); return; }
    if (savingRef.current) return;
    session.current++;
    setDraft(value);
    setError(undefined);
    setOutcome("idle");
    returnFocusRef.current = true;
    setPhase("rest");
    onCancel?.();
  }

  const commitChange = useCallback(async (nextValue: string, nextRevision: number, editSession: number) => {
    if (!canEdit || composing.current) return;
    const previous = submitted.current;
    if (previous?.session === editSession && previous.revision === nextRevision && previous.state !== "error") return;
    if (previous?.state === "error" && failedChange?.draft === nextValue && failedChange.baseline !== value && value === nextValue) {
      previous.state = "saved"; setError(undefined); setOutcome("saved"); return;
    }
    const validationError = validate?.(nextValue);
    if (validationError) { setError(validationError); setOutcome("error"); setPhase("editing"); return; }
    const request = { revision: nextRevision, session: editSession, state: "pending" as "pending" | "saved" | "error" };
    submitted.current = request;
    setError(undefined); setOutcome("idle"); setPhase("saving");
    const isCurrent = () => mounted.current && session.current === editSession && revision.current === nextRevision;
    try {
      await onCommit(nextValue);
      request.state = "saved";
      if (isCurrent()) { setOutcome("saved"); setPhase("editing"); }
    } catch (cause) {
      request.state = "error";
      if (isCurrent()) { setFailedChange({ draft: nextValue, baseline: value }); setError(errorMessage(cause, commitErrorMessage)); setOutcome("error"); setPhase("editing"); }
    }
  }, [canEdit, commitErrorMessage, failedChange, onCommit, validate, value]);

  function clear() {
    if (phase === "saving" && commitMode === "explicit") return;
    changeDraft("");
    editorRef.current?.focus();
  }

  function changeDraft(nextValue: string) {
    if (commitMode === "change" && nextValue === draftRef.current) return;
    draftRef.current = nextValue;
    revision.current++;
    setDraft(nextValue);
    setFailedChange(undefined);
    setError(undefined); setOutcome("idle");
    onDraftChange?.(nextValue);
    if (commitMode === "change") {
      setPhase("editing");
      void commitChange(nextValue, revision.current, session.current);
    }
  }

  const commit = useCallback(
    (restoreTriggerFocus = true, knownValidationError?: string): Promise<boolean> => {
      if (pendingApply.current) return pendingApply.current;
      if (!isEditing) return Promise.resolve(true);
      if (!canEdit || composing.current) return Promise.resolve(false);
      if (commitMode === "change") return commitChange(draftRef.current, revision.current, session.current).then(() => false);
      const nextDraft = draftRef.current;
      const validationError = knownValidationError ?? validate?.(nextDraft);
      if (validationError) {
        setError(validationError);
        setOutcome("error");
        editorRef.current?.focus();
        return Promise.resolve(false);
      }

      setError(undefined);
      savingRef.current = true;
      setPhase("saving");
      const request = (async () => { try {
        await onCommit(nextDraft);
        savingRef.current = false;
        setOutcome("saved");
        returnFocusRef.current = restoreTriggerFocus;
        setPhase("rest");
        return true;
      } catch (commitError) {
        savingRef.current = false;
        setFailedChange({ draft: nextDraft, baseline: value });
        setError(errorMessage(commitError, commitErrorMessage));
        setOutcome("error");
        setPhase("editing");
        return false;
      } })();
      pendingApply.current = request;
      void request.finally(() => { if (pendingApply.current === request) pendingApply.current = null; });
      return request;
    },
    [canEdit, commitChange, commitErrorMessage, commitMode, isEditing, onCommit, validate, value],
  );

  useEffect(() => {
    if (!commitOnOutsidePointer || phase !== "editing" || commitMode === "change") return;

    function handleOutsidePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || rootRef.current?.contains(target))
        return;

      const validationError = validate?.(draft);
      if (validationError) event.preventDefault();
      void commit(false, validationError);
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown,
        true,
      );
    };
  }, [commit, commitMode, commitOnOutsidePointer, draft, phase, validate]);

  function handleEditorKeyDown(event: KeyboardEvent<EditableTextEditor>) {
    if (event.nativeEvent.isComposing || composing.current || phase === "saving" && commitMode === "explicit") return;
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }

    const commitsSingleLine = !multiline && event.key === "Enter";
    const commitsMultiline =
      multiline && event.key === "Enter" && (event.metaKey || event.ctrlKey);
    if (commitsSingleLine || commitsMultiline) {
      event.preventDefault();
      void commit(true);
    }
  }

  // A consumer can recover the exact failed intent outside the field. `value` is confirmed truth.
  const recovered = commitMode === "change" && outcome === "error" && failedChange?.draft === draft
    && failedChange.baseline !== value && value === draft;
  return {
    beginEdit,
    cancel,
    changeDraft,
    clear,
    commit,
    draft,
    editorRef,
    error: recovered ? undefined : error,
    errorId,
    handleEditorKeyDown,
    handleCompositionStart: () => { composing.current = true; },
    handleCompositionEnd: (nextValue: string) => {
      composing.current = false;
      if (nextValue !== draftRef.current) changeDraft(nextValue);
      else if (commitMode === "change") void commitChange(nextValue, revision.current, session.current);
    },
    isEditing,
    outcome: recovered ? "saved" : outcome,
    phase,
    rootRef,
    triggerRef,
  };
}
