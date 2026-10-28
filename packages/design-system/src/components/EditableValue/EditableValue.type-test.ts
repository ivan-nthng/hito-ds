import type { EditableValueProps } from "./EditableValue";

const automatic: EditableValueProps = { label: "Value", value: "", commitMode: "change", onDraftChange: value => { void value; }, onCommit: async value => { void value; } };
const explicit: EditableValueProps = { label: "Value", value: "", onCommit: () => undefined };
const contact: EditableValueProps = { ...explicit, type: "tel", inputMode: "tel", autoComplete: "tel", commitOnBlur: true,
  inputAdapter: draft => ({ value: draft.value, onChange: event => draft.onChange(event.currentTarget.value) }) };
// @ts-expect-error Only native explicit and change commit policies are admitted.
const invalid: EditableValueProps = { ...explicit, commitMode: "debounced" };
// @ts-expect-error Formatting does not expose another control appearance.
const styledAdapter: EditableValueProps = { ...explicit, inputAdapter: () => ({ className: "replacement-editor" }) };
void [automatic, explicit, contact, invalid, styledAdapter];
