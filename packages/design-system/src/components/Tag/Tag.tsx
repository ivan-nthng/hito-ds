import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { classNames } from "../class-names";
import styles from "./Tag.module.css";

export const tagSizes = ["sm", "md"] as const;
export type TagSize = (typeof tagSizes)[number];
export type TagProps = {
  /** Localized category or characteristic. Empty labels render nothing. */
  label: string;
  leadingIcon?: IconName;
  size?: TagSize;
  id?: string;
  className?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
};

/** Passive category. The parent owns list semantics and full-value disclosure if constrained. */
export function Tag({ label, leadingIcon, size = "md", id, className, lang, dir }: TagProps) {
  if (!label.trim()) return null;
  return <span id={id} lang={lang} dir={dir} className={classNames(styles.root, className)} data-tag data-size={size} data-icon={Boolean(leadingIcon)} title={label}>
    {leadingIcon ? <Icon name={leadingIcon} size={size} /> : null}
    <span className={styles.label}>{label}</span>
  </span>;
}
