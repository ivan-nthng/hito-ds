import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";
import { Dialog } from "./Dialog";
import styles from "./Dialog.story.module.css";

/** Internal consumer fixtures; these are not additional Dialog variants. */
export function DialogLifecycleExample({ mode }: { mode: "veto" | "removed-opener" | "unmount" | "focus" }) {
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [veto, setVeto] = useState(mode === "veto");
  const [requests, setRequests] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);
  const successorRef = useRef<HTMLHeadingElement>(null);
  const initialRef = useRef<HTMLInputElement>(null);
  const advances = mode === "removed-opener" || mode === "unmount";
  const finish = () => { setFinished(true); setOpen(false); };
  return <div className={styles.example}>
    {!finished ? <Button variant="secondary" intent="neutral" size="md" onClick={() => setOpen(true)} aria-haspopup="dialog">Open fixture</Button> : <h2 ref={successorRef} tabIndex={-1}>Next step</h2>}
    <output aria-label="Dismissal requests">{requests.join(",")}</output>
    {mode !== "unmount" || open ? <Dialog open={open} title="Lifecycle example" className={styles.dialog}
      returnFocusRef={advances ? successorRef : undefined} initialFocusRef={mode === "focus" ? initialRef : undefined}
      onDismiss={reason => { setRequests(current => [...current, reason]); if (!veto) setOpen(false); }}>
      <Dialog.Header closeLabel="Close fixture" />
      <Dialog.Body>
        <div className={styles.example}>
          <TextInput aria-label="First field" size="md" />
          {mode === "focus" ? <>
            <TextInput aria-label="Initial field" ref={initialRef} size="md" />
            <fieldset disabled><input aria-label="Disabled field" /></fieldset>
            <button hidden>Hidden control</button>
            <fieldset><legend>Radio options</legend>
              <label><input type="radio" name="dialog-radio" value="first" />First</label>
              <label><input type="radio" name="dialog-radio" value="second" />Second</label>
            </fieldset>
            {!removed ? <Button variant="secondary" intent="neutral" size="md" onClick={() => setRemoved(true)}>Remove focused control</Button> : null}
          </> : null}
          <Button variant="secondary" intent="neutral" size="md" onClick={() => setRevision(value => value + 1)}>Refresh {revision}</Button>
          {veto ? <Button variant="secondary" intent="neutral" size="md" onClick={() => setVeto(false)}>Allow dismissal</Button> : null}
        </div>
      </Dialog.Body>
      <Dialog.Footer><Button variant="secondary" intent="neutral" size="md" onClick={advances ? finish : () => setOpen(false)}>Finish</Button></Dialog.Footer>
    </Dialog> : null}
  </div>;
}

export function DeepBodyExample({ explicit }: { explicit: boolean }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return <>
    <Button variant="secondary" intent="neutral" size="md" onClick={() => setOpen(true)}>Open deep content</Button>
    <Dialog open={open} title="Deep content" onDismiss={() => setOpen(false)} initialFocusRef={explicit ? inputRef : undefined} className={styles.dialog}>
      <Dialog.Header closeLabel="Close deep content" />
      <Dialog.Body>
        {explicit ? <TextInput aria-label="Earlier field" size="md" /> : null}
        <p className={styles.deepContent}>Structured content before the editable field.</p>
        <TextInput ref={inputRef} aria-label="Deep field" size="md" />
      </Dialog.Body>
    </Dialog>
  </>;
}
