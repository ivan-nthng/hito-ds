import type { AnchorHTMLAttributes, ReactNode } from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import styles from "./Link.module.css";

export type LinkTone = "neutral" | "accent";
export type LinkSize = ControlSize;

type LinkTextContent = {
  children: ReactNode;
  icon?: never;
  leadingIcon?: IconName;
  trailingIcon?: IconName | null;
};

type LinkIconContent = {
  "aria-label": string;
  children?: never;
  icon: IconName;
  leadingIcon?: never;
  trailingIcon?: never;
};

export type LinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> & {
  external?: boolean;
  size?: LinkSize;
  tone?: LinkTone;
} & (LinkTextContent | LinkIconContent);

export function Link({
  "aria-label": ariaLabel,
  children,
  className,
  external = false,
  icon,
  leadingIcon,
  rel,
  size = "md",
  target,
  tone = "neutral",
  trailingIcon,
  ...props
}: LinkProps) {
  const safeRel =
    target === "_blank"
      ? `noopener noreferrer${rel ? ` ${rel}` : ""}`
      : rel;
  const isExternal = external || target === "_blank";
  const resolvedTrailingIcon =
    trailingIcon === null
      ? undefined
      : trailingIcon ?? (isExternal ? "arrows/complex/up-right" : undefined);
  const iconPosition = icon
    ? "only"
    : leadingIcon && resolvedTrailingIcon
      ? "both"
      : leadingIcon
        ? "leading"
        : resolvedTrailingIcon
          ? "trailing"
          : undefined;

  return (
    <a
      {...props}
      aria-label={ariaLabel}
      className={classNames(styles.root, className)}
      data-icon-position={iconPosition}
      data-size={size}
      data-tone={tone}
      rel={safeRel}
      target={target}
    >
      {icon ? (
        <Icon name={icon} size={size} />
      ) : (
        <>
          {leadingIcon ? <Icon name={leadingIcon} size={size} /> : null}
          <span>{children}</span>
          {resolvedTrailingIcon ? (
            <Icon name={resolvedTrailingIcon} size={size} />
          ) : null}
        </>
      )}
    </a>
  );
}
