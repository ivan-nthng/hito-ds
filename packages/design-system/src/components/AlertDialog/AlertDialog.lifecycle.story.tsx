import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { AlertDialog } from "./AlertDialog";
import styles from "./AlertDialog.story.module.css";

/** Regression consumers, not additional public AlertDialog modes. */
export function AlertDialogLifecycleExample({ mode }: { mode: "hold" | "successor" }) {
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [confirmations, setConfirmations] = useState(0);
  const [cancellations, setCancellations] = useState<string[]>([]);
  const [veto, setVeto] = useState(mode === "hold");
  const successor = useRef<HTMLHeadingElement>(null);
  return <div className={styles.example}>
    {!finished ? <Button variant="secondary" intent="neutral" size="md" onClick={() => setOpen(true)}>Open fixture</Button> : <h2 ref={successor} tabIndex={-1}>Next step</h2>}
    <output aria-label="Confirmations">{confirmations}</output>
    <output aria-label="Cancellations">{cancellations.join(",")}</output>
    {open ? <AlertDialog open title="Continue with this change?" description="This example records one confirmation intent." cancelLabel="Cancel" confirmLabel="Confirm"
      className={styles.dialog} returnFocusRef={mode === "successor" ? successor : undefined}
      onCancel={reason => { setCancellations(values => [...values, reason]); if (!veto) setOpen(false); }}
      onConfirm={() => { setConfirmations(count => count + 1); if (mode === "successor") { setFinished(true); setOpen(false); } }}>
      {veto ? <Button variant="ghost" intent="neutral" size="md" onClick={() => setVeto(false)}>Allow cancellation</Button> : null}
    </AlertDialog> : null}
  </div>;
}
