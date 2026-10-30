import { Message, type MessageProps } from "../message/Message";

export type InlineMessageProps = MessageProps;
export function InlineMessage(props: InlineMessageProps) {
  return <Message {...props} kind="inline"/>;
}
