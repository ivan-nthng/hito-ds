import { useId, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Dialog } from "./Dialog";
import { dialogCopy } from "./Dialog.content.story";
import styles from "./Dialog.story.module.css";

export type DialogStoryArgs = { scenario: "form" | "long-content"; dismissOnBackdrop: boolean };

export function DialogExample({ scenario, dismissOnBackdrop, profile }: DialogStoryArgs & { profile: unknown }) {
  const copy = dialogCopy(profile);
  const inputId = useId();
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(copy.initial);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);
  const [result, setResult] = useState("");
  const long = scenario === "long-content";
  const dismiss = () => { setResult(copy.cancelled); setOpen(false); };
  return <div className={styles.example} lang={copy.lang}>
    <Button variant="primary" intent="accent" size="md" aria-haspopup="dialog" onClick={() => { setDraft(value); setError(false); setOpen(true); }}>{copy.open}</Button>
    {!long ? <Text variant="body-sm" className={styles.muted}>{copy.field}: {value}</Text> : null}
    <Text variant="body-sm" role="status">{result}</Text>
    <Dialog open={open} title={long ? copy.longTitle : copy.title} description={long ? undefined : copy.description} onDismiss={dismiss} dismissOnBackdrop={dismissOnBackdrop} className={styles.dialog}>
      <Dialog.Header closeLabel={copy.close} />
      <Dialog.Body>
        {long ? <div className={styles.sections}>{copy.paragraphs.map((paragraph, index) => <section className={styles.section} key={paragraph}>
          <Text as="h3" variant="label-base">{copy.section} {index + 1}</Text><Text variant="body-sm">{paragraph}</Text>
        </section>)}</div> : <form id={formId} noValidate onSubmit={event => {
          event.preventDefault();
          if (!draft.trim()) { setError(true); inputRef.current?.focus(); return; }
          setValue(draft.trim()); setResult(copy.saved); setOpen(false);
        }}>
          <Field label={copy.field} controlId={inputId} error={error ? copy.required : undefined}>{({ controlProps }) =>
            <TextInput {...controlProps} ref={inputRef} size="md" value={draft} onChange={event => { setDraft(event.target.value); setError(false); }} />}
          </Field>
        </form>}
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="ghost" intent="neutral" size="md" onClick={dismiss}>{copy.cancel}</Button>
        {long ? <Button variant="primary" intent="accent" size="md" onClick={() => { setResult(copy.confirmed); setOpen(false); }}>{copy.continue}</Button> :
          <Button variant="primary" intent="accent" size="md" type="submit" form={formId}>{copy.save}</Button>}
      </Dialog.Footer>
    </Dialog>
  </div>;
}
