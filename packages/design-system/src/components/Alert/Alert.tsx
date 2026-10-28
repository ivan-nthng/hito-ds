import { Message, type MessageProps } from "../message/Message";

export const alertSizes = ["sm", "md"] as const;
export type AlertSize = (typeof alertSizes)[number];
export type AlertProps = MessageProps & { size?: AlertSize };
export function Alert({ size = "md", ...props }: AlertProps) {
  return <Message {...props} kind="alert" size={size}/>;
}
