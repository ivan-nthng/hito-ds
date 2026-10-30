import { forwardRef, useId, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "../class-names";
import type { ControlSize } from "../control-size";
import { Checkbox, type CheckboxProps } from "../Checkbox/Checkbox";
import { Icon } from "../Icon/Icon";
import type { IconName } from "../Icon/icon-catalog";
import { KeyboardShortcut, type KeyboardShortcutKey } from "../KeyboardShortcut/KeyboardShortcut";
import { Text } from "../Text/Text";
import styles from "./ListItem.module.css";

export type ListItemSize = Exclude<ControlSize, "xl">;
type CheckboxLeading = {
  checkbox: Omit<
    CheckboxProps,
    "label" | "description" | "size" | "className" | "id" | "aria-labelledby"
  >;
  icon?: never;
  artwork?: never;
  selectionMark?: never;
  reserved?: never;
};
/** Decorative raster content; visible copy names the row, and the icon slot owns sizing. */
export type ListItemArtwork = { src: string };
export type ListItemLeading =
  | CheckboxLeading
  | { icon: IconName; artwork?: never; selectionMark?: never; reserved?: never }
  | { artwork: ListItemArtwork; icon?: never; selectionMark?: never; reserved?: never }
  | { selectionMark: boolean; icon?: never; artwork?: never; reserved?: never }
  | { reserved: true; icon?: never; artwork?: never; selectionMark?: never };
export type ListItemTrailing = {
  annotation?: ReactNode;
  keyboardShortcut?: string | readonly KeyboardShortcutKey[];
} & (
  | { icon?: IconName; selectionMark?: never }
  | { selectionMark: boolean; icon?: never }
);

type StructuredItem = {
  label: ReactNode;
  description?: ReactNode;
  leading?: ListItemLeading;
  trailing?: ListItemTrailing;
  selected?: boolean;
  size?: ListItemSize;
  children?: never;
};
type ContentItem = {
  children?: ReactNode;
  label?: never;
  description?: never;
  leading?: never;
  trailing?: never;
  selected?: never;
  size?: never;
};
export type ListItemProps = Omit<HTMLAttributes<HTMLLIElement>, "children"> &
  (StructuredItem | ContentItem);

const textBySize = { sm: "ui-sm", md: "ui-md", lg: "ui-lg" } as const;

/** A semantic list item. Visual slots do not add selection or command behavior. */
export const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  function ListItem(
    {
      children,
      className,
      description,
      label,
      leading,
      selected = false,
      size = "md",
      trailing,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const checkboxId = `${generatedId}-checkbox`;
    const labelId = `${generatedId}-label`;
    const descriptionId = `${generatedId}-description`;
    const hasDescription =
      description !== undefined &&
      description !== null &&
      description !== false &&
      description !== "";
    const hasCheckbox = Boolean(leading && "checkbox" in leading);
    const structured = label !== undefined;
    const hasSelectionMark = Boolean(
      leading?.selectionMark || trailing?.selectionMark,
    );
    return (
      <li
        {...props}
        className={classNames(
          styles.root,
          structured ? styles.structured : undefined,
          className,
        )}
        data-size={structured ? size : undefined}
        data-has-trailing-icon={
          structured &&
          (trailing?.icon || trailing?.selectionMark !== undefined)
            ? true
            : undefined
        }
        data-selected={structured && selected ? true : undefined}
        data-has-selection-mark={
          structured && hasSelectionMark ? true : undefined
        }
        data-has-checkbox={hasCheckbox || undefined}
        data-has-leading={structured && leading ? true : undefined}
        ref={ref}
      >
        {structured ? (
          <>
            {leading ? (
              <span
                aria-hidden={hasCheckbox ? undefined : true}
                className={styles.leading}
              >
                {"checkbox" in leading ? (
                  <Checkbox
                    {...leading.checkbox}
                    id={checkboxId}
                    aria-labelledby={labelId}
                    aria-describedby={
                      [
                        leading.checkbox?.["aria-describedby"],
                        hasDescription ? descriptionId : undefined,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    label={null}
                    size={size === "sm" ? "sm" : "base"}
                  />
                ) : leading.icon ? (
                  <Icon
                    className={styles.icon}
                    name={leading.icon}
                    size={size}
                  />
                ) : leading.artwork ? (
                  // eslint-disable-next-line @next/next/no-img-element -- Framework-neutral slot for caller-supplied bounded exports.
                  <img src={leading.artwork.src} alt="" className={styles.artwork} />
                ) : leading.selectionMark ? (
                  <Icon
                    className={styles.icon}
                    name="general/check"
                    size={size}
                  />
                ) : null}
              </span>
            ) : null}
            <span className={styles.copy}>
              <Text
                as="span"
                id={hasCheckbox ? labelId : undefined}
                variant={textBySize[size]}
              >
                {hasCheckbox ? (
                  <label htmlFor={checkboxId}>{label}</label>
                ) : (
                  label
                )}
              </Text>
              {hasDescription ? (
                <Text
                  as="span"
                  id={hasCheckbox ? descriptionId : undefined}
                  className={styles.description}
                  variant="body-sm"
                >
                  {description}
                </Text>
              ) : null}
            </span>
            {trailing ? (
              <span className={styles.trailing}>
                {trailing.annotation !== undefined &&
                trailing.annotation !== null ? (
                  <Text
                    as="span"
                    className={styles.annotation}
                    variant="label-sm"
                  >
                    {trailing.annotation}
                  </Text>
                ) : null}
                {trailing.keyboardShortcut ? (
                  typeof trailing.keyboardShortcut === "string" ? (
                    <KeyboardShortcut>{trailing.keyboardShortcut}</KeyboardShortcut>
                  ) : (
                    <KeyboardShortcut keys={trailing.keyboardShortcut} />
                  )
                ) : null}
                {trailing.icon ? (
                  <Icon
                    className={styles.icon}
                    tone="secondary"
                    name={trailing.icon}
                    size={size}
                  />
                ) : null}
                {trailing.selectionMark !== undefined ? (
                  <span aria-hidden="true" className={styles.mark}>
                    {trailing.selectionMark ? (
                      <Icon
                        className={styles.icon}
                        name="general/check"
                        size={size}
                      />
                    ) : null}
                  </span>
                ) : null}
              </span>
            ) : null}
          </>
        ) : (
          children
        )}
      </li>
    );
  },
);
