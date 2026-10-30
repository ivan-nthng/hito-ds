import { useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Alert, type AlertSize } from "../Alert/Alert";
import { InlineMessage } from "../InlineMessage/InlineMessage";
import { type MessageProps } from "./Message";
export type MessageStoryProps = MessageProps & { withIcon: boolean; withAction: boolean; dismissible: boolean };
export function MessageExample({ kind, alertSize, withIcon, withAction, dismissible, ...args }: MessageStoryProps & { kind: "alert" | "inline"; alertSize?: AlertSize }) {
  const [visible, setVisible] = useState(true);
  const [result, setResult] = useState("");
  const restore = useRef<HTMLButtonElement>(null);
  const messageProps = { ...args, icon: withIcon ? undefined : false as const,
    action: withAction ? { label: "Review details", onClick: () => setResult("Demo action performed") } : undefined,
    dismiss: dismissible ? { label: "Dismiss message", onDismiss: () => setVisible(false), returnFocusRef: restore } : undefined };
  return <>
    {visible ? kind === "alert" ? <Alert {...messageProps} size={alertSize}/> : <InlineMessage {...messageProps}/> : null}
    <Button ref={restore} intent="neutral" variant="ghost" onClick={() => { setVisible(true); setResult(""); }}>Restore example</Button>
    <Text as="p" variant="body-sm" role="status">{result}</Text>
  </>;
}
