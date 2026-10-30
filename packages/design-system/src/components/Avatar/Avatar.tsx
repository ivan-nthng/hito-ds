"use client";

import { forwardRef, useState, type MouseEventHandler } from "react";
import { Button } from "../Button/Button";
import { Icon, type IconTone } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { Text, type TextVariant } from "../Text/Text";
import { classNames } from "../class-names";
import styles from "./Avatar.module.css";

export const avatarSizes = ["xs", "sm", "md", "lg"] as const;
export const avatarShapes = ["circle", "rounded"] as const;
export type AvatarSize = (typeof avatarSizes)[number];
export type AvatarShape = (typeof avatarShapes)[number];

type Identity = { decorative: true; label?: never } | { decorative?: false; label: string };
type PassiveAvatar = Identity & { size?: AvatarSize; onEdit?: never; editLabel?: never; editPresentation?: never; disabled?: never };
type EditableAvatar = {
  decorative?: false;
  /** Complete localized action name, including the entity when useful. */
  label: string;
  /** Short visible action label, e.g. Edit or Editar. Not rendered at SM. */
  editLabel: string;
  onEdit: MouseEventHandler<HTMLButtonElement>;
  /** Disables only the edit action, preserving the mounted image and its fallback state. */
  disabled?: boolean;
} & ({ size?: Exclude<AvatarSize, "xs">; editPresentation?: "adaptive" }
  | { size?: "md" | "lg"; editPresentation: "persistent-strip" });
export type AvatarProps = (PassiveAvatar | EditableAvatar) & {
  src?: string;
  /** One or two caller-supplied graphemes; invalid content falls back to the configured icon. */
  initials?: string;
  /** Shared glyph used when a photo and valid initials are unavailable. */
  fallbackIcon?: IconName;
  /** Semantic tone for fallback artwork only. */
  fallbackIconTone?: IconTone;
  shape?: AvatarShape;
  className?: string;
  id?: string;
};

const initialsRoles: Record<AvatarSize, TextVariant> = {
  xs: "label-sm", sm: "label-base", md: "heading-sm", lg: "heading-xl",
};
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

function Photo({ src }: { src: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");
  if (status === "failed") return null;
  // The shared package owns fallback; image optimization and delivery belong to its consumer.
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={styles.photo} data-loaded={status === "loaded"} src={src} alt=""
    draggable={false} onLoad={() => setStatus("loaded")} onError={() => setStatus("failed")} />;
}

/** Identity display with optional caller-owned editing access. Never uploads or edits media. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({
  size = "md", shape = "circle", src, initials, label, decorative = false,
  onEdit, editLabel, editPresentation = "adaptive", disabled, className, id, fallbackIcon = "general/user-filled", fallbackIconTone = "secondary",
}, ref) {
  if (!decorative && !label?.trim()) throw new Error("Avatar requires a nonempty accessible label or decorative=true.");
  if (onEdit && (size === "xs" || decorative || !editLabel?.trim())) {
    throw new Error("Editable Avatar requires SM/MD/LG, a label and an editLabel; it cannot be decorative.");
  }
  if (editPresentation === "persistent-strip" && (!onEdit || size === "sm" || size === "xs")) {
    throw new Error("Avatar persistent-strip requires an editable MD/LG avatar.");
  }
  const trimmed = initials?.trim() ?? "";
  const letters = [...segmenter.segment(trimmed)].length <= 2 ? trimmed : "";
  const imageSrc = src?.trim();
  const visual = <span className={styles.visual} aria-hidden="true" data-avatar-visual="">
    {imageSrc ? <Photo key={imageSrc} src={imageSrc} /> : null}
    {letters ? <Text as="span" variant={initialsRoles[size]} className={styles.initials}>{letters}</Text>
      : <Icon name={fallbackIcon} tone={fallbackIconTone} className={styles.fallbackIcon} />}
    {onEdit ? <span className={styles.overlay}>
      <span className={styles.editContent}>
        <Icon name="controls/edit" size={size === "lg" ? "md" : "sm"} />
        {size !== "sm" ? <Text as="span" variant={size === "lg" ? "ui-md" : "ui-sm"}>{editLabel}</Text> : null}
      </span>
    </span> : null}
  </span>;
  return <span ref={ref} id={id} className={classNames(styles.root, className)} data-avatar=""
    data-size={size} data-shape={shape} data-editable={onEdit ? true : undefined}
    data-edit-presentation={onEdit ? editPresentation : undefined}
    role={onEdit || decorative ? undefined : "img"} aria-label={onEdit || decorative ? undefined : label}
    aria-hidden={decorative || undefined}>
    {onEdit ? <Button intent="neutral" variant="ghost" className={styles.editButton}
      aria-label={label} disabled={disabled} onClick={onEdit}>{visual}</Button> : visual}
  </span>;
});
