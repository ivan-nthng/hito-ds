import { useEffect, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { AlertDialog, type AlertDialogProps } from "./AlertDialog";
import { alertDialogCopy } from "./AlertDialog.content.story";
import styles from "./AlertDialog.story.module.css";

export type AlertDialogStoryArgs = { scenario: "confirmation" | "pending-error" | "long-content"; confirmIntent: NonNullable<AlertDialogProps["confirmIntent"]> };
export function AlertDialogExample({ scenario, confirmIntent, profile }: AlertDialogStoryArgs & { profile: unknown }) {
  const copy = alertDialogCopy(profile);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [result, setResult] = useState("");
  const [attempts, setAttempts] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  return <div className={styles.example} lang={copy.lang}>
    <Button variant="secondary" intent="neutral" size="md" aria-haspopup="dialog" onClick={() => { setPending(false); setError(false); setOpen(true); }}>{copy.open}</Button>
    {scenario === "pending-error" ? <Text variant="body-sm" className={styles.muted}>{copy.policy}</Text> : null}
    <Text variant="body-sm" role="status">{result}</Text>
    <output data-confirm-count="" hidden>{attempts}</output>
    <AlertDialog open={open} title={copy.title} description={copy.description} cancelLabel={copy.cancel} confirmLabel={copy.confirm}
      confirmIntent={confirmIntent} confirmLoading={pending} className={styles.dialog}
      onCancel={() => {
        // This example permits cancellation; the shell leaves that policy with the caller.
        clearTimeout(timer.current); setPending(false); setError(false); setResult(copy.cancelled); setOpen(false);
      }}
      onConfirm={() => {
        setAttempts(count => count + 1);
        if (scenario === "pending-error") {
          setPending(true);
          timer.current = setTimeout(() => { setPending(false); setError(true); }, 1000);
        } else { setResult(copy.confirmed); setOpen(false); }
      }}>
      {pending ? <Text variant="body-sm" role="status">{copy.pending}</Text> : null}
      {error ? <div ref={errorRef} tabIndex={-1} role="alert"><Text variant="body-sm">{copy.error}</Text></div> : null}
      {scenario === "long-content" ? <div className={styles.content}>{Array.from({ length: 8 }, (_, index) => <section key={index}>
        <Text as="h3" variant="label-base">{copy.section} {index + 1}</Text><Text variant="body-sm">{copy.paragraph}</Text>
      </section>)}</div> : null}
    </AlertDialog>
  </div>;
}
