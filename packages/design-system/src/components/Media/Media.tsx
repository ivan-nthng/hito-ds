import { forwardRef, type CSSProperties, type ForwardedRef, type HTMLAttributes } from "react";
import type { IconName } from "../Icon/icon-catalog";
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
/** Document paint carrier; the site adapter owns anchoring and parent document extent. */
export function MediaBackdrop({ className }: { className?: string }) {
  return <div aria-hidden="true" data-media-backdrop="" className={classNames(styles.backdrop, className)}><div data-media-anchor="" className={styles.anchor}><div data-media-viewport="" className={styles.viewport}><div className={styles.field}>{[1,2,3,4,5,6].map(index => <span key={index} data-media-object={index} className={styles.object} />)}</div></div></div><div className={styles.grain} /></div>;
}
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
type RoundProgress = { value: number; max?: number; valueText: string; label?: string };
export type RoundControlProps = DistributiveOmit<ButtonProps, "children" | "icon" | "leadingIcon" | "trailingIcon" | "width" | "variant" | "intent"> & {
  icon: IconName;
  "aria-label": string;
  variant?: ButtonProps["variant"];
  intent?: ButtonProps["intent"];
  progress?: RoundProgress;
};
/** Circular icon action; numerical progress is a separate native semantic, never the button role. */
function renderRoundControl({
  progress, "aria-label": label, className, style,
  size = "md", variant = "primary", intent = "neutral", hitArea = "minimum", ...props
}: RoundControlProps & Pick<ButtonProps, "width">, ref: ForwardedRef<HTMLButtonElement>) {
  if (!label.trim()) throw new Error("RoundControl requires a non-empty aria-label.");
  const { value, max = 100, valueText, label: progressLabel } = progress ?? {};
  const hasProgress = progress !== undefined;
  if (hasProgress && (typeof value !== "number" || !Number.isFinite(max) || max <= 0 || !Number.isFinite(value) || value < 0 || value > max || !valueText?.trim() || (progressLabel !== undefined && !progressLabel.trim()))) {
    throw new Error("RoundControl progress requires finite value between zero and positive max, and non-empty valueText/label.");
  }
  return <span className={styles.roundFrame} data-round-control="">
    <Button {...props} ref={ref} aria-label={label} size={size} variant={variant} intent={intent} hitArea={hitArea}
      data-round-progress={hasProgress ? "" : undefined} className={classNames(styles.round, className)}
      style={hasProgress ? { ...style, "--round-control-progress": Number(value) / max } as CSSProperties : style} />
    {hasProgress && <progress className={styles.progressSemantic} aria-label={progressLabel ?? label} value={Number(value)} max={max} aria-valuetext={valueText}>{valueText}</progress>}
  </span>;
}
export const RoundControl = forwardRef<HTMLButtonElement, RoundControlProps>(renderRoundControl);
RoundControl.displayName = "RoundControl";
export type RoundPlayButtonProps = DistributiveOmit<RoundControlProps, "icon" | "variant" | "intent"> & { playing?: boolean; width?: ButtonProps["width"] };
/** Backwards-compatible xl/accent Play/Pause convenience action. */
export const RoundPlayButton = forwardRef<HTMLButtonElement, RoundPlayButtonProps>(function RoundPlayButton({ playing = false, size = "xl", ...props }, ref) {
  return renderRoundControl({ ...props, size, variant: "primary", intent: "accent", icon: playing ? "controls/pause" : "controls/play" }, ref);
});
/** Native Link semantics with the bounded primary-neutral action appearance. */
export function MediaActionLink({ className, ...props }: LinkProps) {
  return <Link {...props} className={classNames(styles.actionLink, className)} size="md" />;
}
/** Normal-flow full bleed within a fixed compact Card (8px native inset). */
export function MediaFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={classNames(styles.footer, className)}><Separator decorative /><div className={styles.actions}>{children}</div></div>;
}
