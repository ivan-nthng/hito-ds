import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import type { ButtonProps } from "../Button/Button";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import styles from "./PageHeader.module.css";

export type PageHeaderProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  /** Regular preserves the original page recipe; compact reuses workspace headings. */
  size?: "regular" | "compact";
  /** Optional native navigation Button. The caller owns its label, ref and action. */
  leading?: ReactElement<ButtonProps>;
  actions?: ReactNode;
  /** Keep compact title and actions on one row, letting the title wrap in its remaining width. */
  actionsLayout?: "responsive" | "inline";
  description?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  actions,
  actionsLayout = "responsive",
  className,
  description,
  leading,
  size = "regular",
  title,
  ...props
}: PageHeaderProps) {
  return (
    <header {...props} className={classNames(styles.root, className)} data-page-header="" data-size={size} data-actions-layout={actionsLayout}>
      <div className={styles.heading}>
        {leading ? <div className={styles.leading}>{leading}</div> : null}
        <div className={styles.copy}>
          <Text as="h1" variant={size === "compact" ? "heading-sm" : "heading-lg"}>
            {title}
          </Text>
          {description && size === "regular" ? (
            <Text className={styles.description} variant="body-base">
              {description}
            </Text>
          ) : null}
        </div>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
      {description && size === "compact" ? (
        <div className={styles.helper}>
          <Text className={styles.description} variant="body-sm">
            {description}
          </Text>
        </div>
      ) : null}
    </header>
  );
}
