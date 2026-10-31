import type { HTMLAttributes } from "react";
import { Button, type ButtonProps } from "../Button/Button";
import { Link, type LinkProps } from "../Link/Link";
import { Separator } from "../Separator/Separator";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import styles from "./Media.module.css";

/** Decorative punctuation. Meaning belongs to the surrounding metadata. */
export function Dot({ className, ...props }: Omit<HTMLAttributes<HTMLSpanElement>, "children">) {
  return <span {...props} aria-hidden="true" className={classNames(styles.dot, className)} />;
}
/** Only the dot pulses; reduced-motion leaves a static, readable status. */
export function Live({ children = "Live", className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} data-hito-live="" data-hito-color-scheme="dark" className={classNames(styles.live, className)}><span aria-hidden="true" data-live-dot="" className={styles.liveDot} /><Text as="span" variant="ui-sm">{children}</Text></span>;
}
/** Bounded, static six-object artwork; no foreign runtime or theme/canvas mutation. */
export function MediaBackdrop({ className }: { className?: string }) {
  return <div aria-hidden="true" data-media-backdrop="" className={classNames(styles.backdrop, className)}><div className={styles.field}>{[1,2,3,4,5,6].map(index => <span key={index} data-media-object={index} className={styles.object} />)}</div><div className={styles.grain} /></div>;
}
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type RoundPlayButtonProps = DistributiveOmit<ButtonProps, "icon" | "children" | "size" | "variant" | "intent" | "leadingIcon" | "trailingIcon"> & { playing?: boolean; "aria-label": string };
export function RoundPlayButton({ playing = false, className, ...props }: RoundPlayButtonProps) {
  return <Button {...props} className={classNames(styles.play, className)} size="xl" variant="primary" intent="accent" icon={playing ? "controls/pause" : "controls/play"} />;
}
/** Native Link semantics with the bounded primary-neutral action appearance. */
export function MediaActionLink({ className, ...props }: LinkProps) {
  return <Link {...props} className={classNames(styles.actionLink, className)} size="md" />;
}
/** Normal-flow full bleed within a fixed compact Card (8px native inset). */
export function MediaFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames(styles.footer, className)}><Separator decorative /><div className={styles.actions}>{children}</div></div>;
}
