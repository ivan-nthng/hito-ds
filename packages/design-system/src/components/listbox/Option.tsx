import { ListItem, type ListItemSize } from "../ListItem/ListItem";
import styles from "./Listbox.module.css";

export type OptionData = {
  value: string;
  label: string;
  description?: string;
  trailingText?: string;
  disabled?: boolean;
};
export function Option({
  option,
  id,
  active,
  selected,
  size,
  onActivate,
  onCommit,
}: {
  option: OptionData;
  id: string;
  active: boolean;
  selected: boolean;
  size: ListItemSize;
  onActivate: () => void;
  onCommit: () => void;
}) {
  return (
    <ListItem
      id={id}
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled || undefined}
      aria-label={
        option.trailingText
          ? `${option.label} ${option.trailingText}`
          : option.label
      }
      aria-describedby={option.description ? `${id}-description` : undefined}
      className={styles.option}
      data-active={active || undefined}
      size={size}
      label={
        <span className={option.disabled ? styles.disabledCopy : undefined}>
          {option.label}
        </span>
      }
      description={
        option.description ? (
          <span
            id={`${id}-description`}
            className={option.disabled ? styles.disabledCopy : undefined}
          >
            {option.description}
          </span>
        ) : undefined
      }
      leading={{ selectionMark: selected }}
      trailing={
        option.trailingText
          ? {
              annotation: (
                <span className={option.disabled ? styles.disabledCopy : styles.trailingText}>
                  {option.trailingText}
                </span>
              ),
            }
          : undefined
      }
      selected={selected}
      onPointerMove={() => {
        if (!option.disabled) onActivate();
      }}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => {
        if (!option.disabled) onCommit();
      }}
    />
  );
}
