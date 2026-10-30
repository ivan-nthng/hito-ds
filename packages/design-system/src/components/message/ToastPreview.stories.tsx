import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Alert } from "../Alert/Alert";
import { messageIntents, type MessageIntent } from "./Message";
import styles from "./ToastPreview.stories.module.css";

type PreviewProps = { intent: MessageIntent; title: string; body: string; withIcon: boolean; withAction: boolean; dismissible: boolean };
function Preview(args: PreviewProps) {
  const [visible, setVisible] = useState(true);
  const [result, setResult] = useState("");
  const restore = useRef<HTMLButtonElement>(null);
  return <FoundationStoryPage title="Toast appearance" description="Visual exploration only. No delivery API, queue or timer.">
    <div className={styles.stage}>{visible ? <Alert intent={args.intent} title={args.title} body={args.body} icon={args.withIcon ? undefined : false}
      action={args.withAction ? { label: "Review details", onClick: () => setResult("Demo action performed") } : undefined}
      dismiss={args.dismissible ? { label: "Dismiss preview", onDismiss: () => setVisible(false), returnFocusRef: restore } : undefined}/>: null}</div>
    <Button ref={restore} intent="neutral" variant="ghost" onClick={() => { setVisible(true); setResult(""); }}>Restore preview</Button>
    <Text as="p" variant="body-sm" role="status">{result}</Text>
  </FoundationStoryPage>;
}
const meta = {
  id: "internal-toast-preview", title: "Internal/Regression Fixtures/ToastPreview", tags: ["test"], parameters: { layout: "fullscreen" },
  args: { intent: "info", title: "Changes saved", body: "Your changes are available.", withIcon: true, withAction: true, dismissible: true },
  argTypes: { intent: { control: "select", options: messageIntents }, title: { control: "text" }, body: { control: "text" }, withIcon: { control: "boolean" }, withAction: { control: "boolean" }, dismissible: { control: "boolean" } },
  render: args => <Preview {...args}/>,
} satisfies Meta<PreviewProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Appearance: Story = { tags: ["context-matrix"] };
