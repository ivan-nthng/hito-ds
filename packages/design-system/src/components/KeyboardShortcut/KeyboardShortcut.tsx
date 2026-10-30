import { forwardRef, type HTMLAttributes } from "react";
import { classNames } from "../class-names";
import { Icon } from "../Icon/Icon";
import styles from "./KeyboardShortcut.module.css";

export type KeyboardShortcutGlyph =
  | "command"
  | "shift"
  | "option"
  | "control"
  | "return"
  | "backspace";
export type KeyboardShortcutKey = KeyboardShortcutGlyph | { text: string };

export type KeyboardShortcutProps = Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> &
  (
    | { children: string; keys?: never }
    | { children?: never; keys: readonly KeyboardShortcutKey[] }
  );

const glyphLabels: Record<KeyboardShortcutGlyph, string> = {
  command: "Command",
  shift: "Shift",
  option: "Option",
  control: "Control",
  return: "Return",
  backspace: "Backspace",
};

const legacyGlyphs: Record<string, KeyboardShortcutGlyph> = {
  "⌘": "command",
  "⇧": "shift",
  "⌥": "option",
  "⌃": "control",
  "↵": "return",
  "⌫": "backspace",
  Ctrl: "control",
};

function parseLegacyNotation(value: string): KeyboardShortcutKey[] {
  return value.trim().split(/\s+/u).filter(Boolean).map((part) =>
    legacyGlyphs[part] ?? { text: part },
  );
}

/** Displays an existing shortcut without registering a keyboard command. */
export const KeyboardShortcut = forwardRef<HTMLElement, KeyboardShortcutProps>(
  function KeyboardShortcut(
    { children, className, keys, "aria-label": ariaLabel, ...props },
    ref,
  ) {
    const parts = keys ?? parseLegacyNotation(children ?? "");
    const accessibleName = parts.map((part) =>
      typeof part === "string" ? glyphLabels[part] : part.text,
    ).join(" ");

    return (
      <kbd
        {...props}
        className={classNames(styles.root, className)}
        ref={ref}
      >
        <span className={styles.screenReaderText}>{ariaLabel ?? accessibleName}</span>
        {parts.map((part, index) =>
          typeof part === "string" ? (
            <Icon
              className={styles.glyph}
              key={`${part}-${index}`}
              name={`keyboard/${part}`}
              size="sm"
            />
          ) : (
            <span aria-hidden="true" className={styles.keyText} key={`${part.text}-${index}`}>{part.text}</span>
          ),
        )}
      </kbd>
    );
  },
);
