import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";
import { Popover, type PopoverOpenChangeReason } from "./Popover";
import styles from "./Popover.story.module.css";

export function PopoverLifecycleExample({ mode }: { mode: "hold" | "remove" | "hidden" | "scroll" | "position" | "delayed" }) {
  const [open, setOpen] = useState(false);
  const [allowClose, setAllowClose] = useState(mode !== "hold" && mode !== "delayed");
  const [unavailable, setUnavailable] = useState(false);
  const [requests, setRequests] = useState<PopoverOpenChangeReason[]>([]);
  const [count, setCount] = useState(0);
  const [long, setLong] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);
  const onOpenChange = (next: boolean, reason: PopoverOpenChangeReason) => {
    if (!next) setRequests(previous => [...previous, reason]);
    if (next || allowClose) setOpen(next);
  };
  const disappearing = mode === "remove" || mode === "hidden" || mode === "scroll";
  return <div className={styles.fixture}>
    <div data-scroll-container="" className={mode === "scroll" ? styles.scrollBox : undefined}>
      <Popover open={open} onOpenChange={onOpenChange} title="Popover fixture" closeLabel="Close fixture"
        returnFocusRef={disappearing ? nextRef : undefined} className={styles.panel}
        trigger={<Button key={unavailable && mode === "remove" ? "replacement" : "original"} variant="secondary" intent="neutral" size="sm"
          hidden={unavailable && mode === "remove"}
          style={mode === "position" ? { position: "fixed", right: 0, bottom: 16 } : unavailable ? { visibility: "hidden" } : undefined}>Open fixture</Button>}
        footer={<Button variant="ghost" intent="neutral" size="sm" onClick={() => setOpen(false)}>Done</Button>}>
        <div className={styles.content}>
          <TextInput size="sm" aria-label="Fixture value" defaultValue="Draft" />
          <Button variant="ghost" intent="neutral" size="sm" onClick={() => setCount(previous => previous + 1)}>Update content {count}</Button>
          {mode === "hold" ? <Button variant="ghost" intent="neutral" size="sm" onClick={() => setAllowClose(true)}>Allow close</Button> : null}
          {mode === "remove" || mode === "hidden" ? <Button variant="ghost" intent="neutral" size="sm" onClick={() => setUnavailable(true)}>Make trigger unavailable</Button> : null}
          {mode === "position" ? <Button variant="ghost" intent="neutral" size="sm" onClick={() => setLong(true)}>More content</Button> : null}
          {mode === "delayed" ? <Button variant="ghost" intent="neutral" size="sm" onClick={() => setTimeout(() => setOpen(false), 150)}>Close later</Button> : null}
          {long ? Array.from({ length: 12 }, (_, index) => <p key={index}>Long contextual content that can wrap and scroll within the available viewport. {index}</p>) : null}
        </div>
      </Popover>
      {mode === "scroll" ? <div className={styles.spacer} /> : null}
    </div>
    <Button ref={nextRef} className={disappearing ? styles.safeTarget : undefined} variant="secondary" intent="neutral" size="sm" onClick={() => setCount(previous => previous + 1)}>Next action</Button>
    <output aria-label="Requests">{requests.join(",")}</output>
    <output aria-label="Updates">{count}</output>
  </div>;
}
