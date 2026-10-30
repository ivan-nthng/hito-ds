import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Popover } from "./Popover";
import { popoverCopy } from "./Popover.content.story";
import styles from "./Popover.story.module.css";

export type PopoverStoryArgs = { scenario: "form" | "reading" | "touch"; anchor: "start" | "end" };
export function PopoverExample({ scenario, anchor, profile }: PopoverStoryArgs & { profile: unknown }) {
  const copy = popoverCopy(profile);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(copy.initial);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const size = scenario === "touch" ? "lg" : "sm";
  const save = () => {
    if (!draft.trim()) { setError(true); inputRef.current?.focus(); return; }
    setValue(draft.trim()); setResult(copy.saved); setOpen(false);
  };
  return <div className={styles.example} lang={copy.lang}>
    <Button variant="ghost" intent="neutral" size={size}>{copy.previous}</Button>
    <div className={styles.stage} data-edge={anchor}>
      <Popover open={open} onOpenChange={next => { if (next) { setDraft(value); setError(false); } setOpen(next); }}
        title={copy.title} description={copy.description} closeLabel={scenario === "touch" ? undefined : copy.close}
        initialFocus={scenario === "reading" ? "title" : undefined} className={styles.panel}
        trigger={<Button size={size} variant="secondary" intent="neutral" leadingIcon="controls/edit">{copy.open}</Button>}
        footer={<><Button size={size} variant="ghost" intent="neutral" onClick={() => setOpen(false)}>{copy.cancel}</Button><Button size={size} variant="primary" intent="accent" onClick={save}>{copy.save}</Button></>}>
        <div className={styles.content}>
          {scenario === "reading" ? Array.from({ length: 5 }, (_, index) => <section key={index}><Text as="h3" variant="label-sm">{copy.more} {index + 1}</Text><Text variant="body-sm">{copy.paragraph}</Text></section>) : null}
          <Field label={copy.field} error={error ? copy.required : undefined}>{({ controlProps }) => <TextInput {...controlProps} ref={inputRef} size={size} value={draft} onChange={event => { setDraft(event.target.value); setError(false); }} />}</Field>
        </div>
      </Popover>
    </div>
    <Text variant="body-sm">{copy.field}: {value}</Text>
    <Text variant="body-sm" className={styles.muted}>{copy.outside}</Text>
    <Button variant="ghost" intent="neutral" size={size}>{copy.next}</Button>
    <Text variant="body-sm" role="status">{result}</Text>
  </div>;
}
