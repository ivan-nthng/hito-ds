import type { HTMLAttributes, ReactNode, Ref, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { Button, type ButtonProps } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import styles from "./Table.module.css";

export const tableDensities = ["compact", "comfortable"] as const;
export type TableDensity = (typeof tableDensities)[number];
export type TableAlignment = "start" | "center" | "end";
/** Text aligns to native action content; rich content retains that inline origin with natural height. */
export type TableCellContent = "text" | "control" | "rich";

type TableName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type TableProps = Omit<TableHTMLAttributes<HTMLTableElement>, "aria-label" | "aria-labelledby"> & TableName & {
  density?: TableDensity;
  ref?: Ref<HTMLTableElement>;
};

/** Native table in a named, keyboard-scrollable region. Data and interaction stay with the caller. */
export function Table({ density = "compact", className, ref, ...props }: TableProps) {
  return <div
    className={styles.scroll}
    data-table-scroll=""
    data-density={density}
    role="region"
    aria-label={props["aria-label"]}
    aria-labelledby={props["aria-labelledby"]}
    aria-describedby={props["aria-describedby"]}
    tabIndex={0}
  >
    <table {...props} ref={ref} className={classNames(styles.table, className)} />
  </div>;
}

export type TableCaptionProps = HTMLAttributes<HTMLTableCaptionElement> & { ref?: Ref<HTMLTableCaptionElement> };
export function TableCaption({ className, ...props }: TableCaptionProps) {
  return <caption {...props} className={classNames(styles.caption, className)} />;
}

export type TableHeaderProps = HTMLAttributes<HTMLTableSectionElement> & { ref?: Ref<HTMLTableSectionElement> };
export function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead {...props} className={classNames(styles.header, className)} />;
}

export type TableBodyProps = HTMLAttributes<HTMLTableSectionElement> & { ref?: Ref<HTMLTableSectionElement> };
export function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody {...props} className={classNames(styles.body, className)} />;
}

export type TableRowProps = HTMLAttributes<HTMLTableRowElement> & {
  /** Contextual emphasis for a row containing real links/actions; does not add row interaction. */
  highlightOnHover?: boolean;
  /** Reflect caller-owned selection; compose a named Checkbox for its accessible control. */
  selected?: boolean;
  ref?: Ref<HTMLTableRowElement>;
};
export function TableRow({ highlightOnHover = false, selected = false, className, ...props }: TableRowProps) {
  return <tr {...props} className={classNames(styles.row, className)} data-highlight={highlightOnHover || undefined} data-selected={selected || undefined} />;
}

export type TableHeaderCellProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "align" | "content"> & {
  align?: TableAlignment;
  content?: TableCellContent;
  ref?: Ref<HTMLTableCellElement>;
};
export function TableHeaderCell({ align = "start", content = "text", scope = "col", className, ...props }: TableHeaderCellProps) {
  return <th {...props} scope={scope} data-align={align} data-content={content} className={classNames(styles.headerCell, className)} />;
}

export type TableCellProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, "align" | "content"> & {
  align?: TableAlignment;
  content?: TableCellContent;
  /** Semantic numeric typography and end alignment. Formatting remains caller-owned. */
  numeric?: boolean;
  ref?: Ref<HTMLTableCellElement>;
};
export function TableCell({ align, content = "text", numeric = false, className, ...props }: TableCellProps) {
  return <td {...props} data-align={align ?? (numeric ? "end" : "start")} data-content={content} data-numeric={numeric || undefined} className={classNames(styles.cell, className)} />;
}

export type TableHeaderContentProps = HTMLAttributes<HTMLDivElement> & {
  /** Match the containing Table; real controls keep their public SM/MD size contracts. */
  density: TableDensity;
  leadingIcon?: IconName;
  trailingIcon?: IconName;
  onAction?: ButtonProps["onClick"];
  actionLabel?: string;
  disabled?: boolean;
  /** An independently labelled native help control, optionally composed with Tooltip/Popover. */
  help?: ReactNode;
  ref?: Ref<HTMLDivElement>;
};

/** Compose inside HeaderCell content="control"; sorting and help state remain caller-owned. */
export function TableHeaderContent({ density, leadingIcon, trailingIcon, onAction, actionLabel, disabled, help, children, className, ...props }: TableHeaderContentProps) {
  const label = <span className={styles.headerLabel}>
    {leadingIcon ? <Icon name={leadingIcon} size="sm" /> : null}
    <Text as="span" variant="label-sm">{children}</Text>
    {trailingIcon ? <Icon name={trailingIcon} size="sm" /> : null}
  </span>;
  return <div {...props} data-table-header-content="" data-density={density} className={classNames(styles.headerContent, className)}>
    {onAction ? <Button variant="ghost" intent="neutral" size={density === "compact" ? "sm" : "md"}
      className={styles.headerAction} data-has-help={!!help || undefined} aria-label={actionLabel} disabled={disabled} onClick={onAction}>{label}</Button>
      : <span className={styles.headerStatic} data-has-help={!!help || undefined}>{label}</span>}
    {help ? <span className={styles.headerHelp}>{help}</span> : null}
  </div>;
}
