import type { AvatarProps } from "./Avatar";

export const named: AvatarProps = { label: "Alex Silva", src: "/photo.jpg", initials: "AS" };
export const decorative: AvatarProps = { decorative: true, size: "xs" };
export const company: AvatarProps = { label: "Casa Verde", fallbackIcon: "map/store", fallbackIconTone: "muted", size: "lg", shape: "rounded" };
// @ts-expect-error Fallbacks use the shared Icon catalogue.
export const unknownIcon: AvatarProps = { label: "Company", fallbackIcon: "company-logo" };
// @ts-expect-error Fallbacks use semantic Icon tones, not custom colors.
export const customColor: AvatarProps = { label: "Company", fallbackIconTone: "#ffffff" };
export const editable: AvatarProps = { label: "Edit profile photo for Alex", editLabel: "Edit", onEdit: () => {}, size: "sm" };
export const persistentEdit: AvatarProps = { label: "Edit restaurant logo", editLabel: "Edit", onEdit: () => {}, size: "lg", editPresentation: "persistent-strip" };
export const disabledEdit: AvatarProps = { ...persistentEdit, disabled: true };
// @ts-expect-error A passive avatar has no action to disable.
export const disabledPassive: AvatarProps = { label: "Alex", disabled: true };
// @ts-expect-error SM retains its icon-only edit presentation.
export const tinyStrip: AvatarProps = { label: "Edit Alex", editLabel: "Edit", onEdit: () => {}, size: "sm", editPresentation: "persistent-strip" };
// @ts-expect-error Passive avatars do not expose an edit presentation.
export const passiveStrip: AvatarProps = { label: "Alex", editPresentation: "persistent-strip" };
// @ts-expect-error XS does not support editing.
export const tinyEdit: AvatarProps = { size: "xs", label: "Edit Alex", editLabel: "Edit", onEdit: () => {} };
// @ts-expect-error Named or explicitly decorative usage is required.
export const unnamed: AvatarProps = { initials: "AS" };
// @ts-expect-error Decorative content cannot be an action.
export const decorativeEdit: AvatarProps = { decorative: true, editLabel: "Edit", onEdit: () => {} };
// @ts-expect-error The action requires a localized short label.
export const unlocalizedEdit: AvatarProps = { label: "Edit Alex", onEdit: () => {} };
// @ts-expect-error Passive avatars cannot become an alternate clickable control.
export const onClick: AvatarProps = { label: "Alex", onClick: () => {} };
