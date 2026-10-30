"use client";

import {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ButtonHTMLAttributes,
} from "react";
import { classNames } from "../class-names";
import { Icon } from "../Icon/Icon";
import { Listbox } from "../listbox/Listbox";
import type { OptionData } from "../listbox/Option";
import { SelectionPanel } from "../selection-panel/SelectionPanel";
import styles from "./ValuePicker.module.css";

export type ValuePickerOption = OptionData;
export type ValuePickerSource = "token" | "inferred" | "custom";

export type ValuePickerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "defaultValue" | "onChange" | "children"
> & {
  /** Token is caller-proven; inferred is only a numeric match, never token provenance. */
  source: ValuePickerSource;
  options: readonly ValuePickerOption[];
  label: string;
  closeLabel: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
};

/** Dense value trigger. Form Select remains the semantic control for form fields. */
export const ValuePicker = forwardRef<HTMLButtonElement, ValuePickerProps>(
  function ValuePicker(
    {
      source,
      options,
      label,
      closeLabel,
      value,
      defaultValue = "",
      placeholder = "",
      onValueChange,
      disabled,
      id,
      className,
      onClick,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const triggerId = id ?? `${generatedId}-value-picker`;
    const listId = `${triggerId}-listbox`;
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    useImperativeHandle(ref, () => triggerRef.current!, []);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const selectedValue = value ?? internalValue;
    const selected = options.find((option) => option.value === selectedValue);
    const unavailable = disabled || !options.some((option) => !option.disabled);
    const visibleOpen = open && !unavailable;

    useEffect(() => {
      if (unavailable) setOpen(false);
    }, [unavailable]);

    if (
      new Set(options.map((option) => option.value)).size !== options.length ||
      options.some((option) => !option.value)
    )
      throw new Error("ValuePicker options require unique, non-empty values.");

    const commit = (next: string) => {
      if (unavailable || !options.some((option) => option.value === next && !option.disabled)) return;
      if (value === undefined) setInternalValue(next);
      if (next !== selectedValue) onValueChange?.(next);
      setOpen(false);
      triggerRef.current?.focus();
    };

    return <>
      <button
        {...props}
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-label={props["aria-labelledby"] ? undefined : label}
        aria-haspopup="listbox"
        aria-expanded={visibleOpen}
        aria-controls={visibleOpen ? listId : undefined}
        aria-disabled={unavailable || undefined}
        disabled={unavailable}
        className={classNames(styles.trigger, className)}
        data-source={source}
        data-open={visibleOpen || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !unavailable) setOpen(!visibleOpen);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && !unavailable && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={styles.visual}>
          <span className={styles.value}>{selected?.label ?? placeholder}</span>
          <Icon name="arrows/compact/down" size="sm" tone={source === "custom" ? "secondary" : "info"} state={unavailable ? "disabled" : "default"} />
        </span>
      </button>
      <SelectionPanel
        id={`${triggerId}-panel`}
        open={visibleOpen}
        onOpenChange={setOpen}
        anchorRef={triggerRef}
        initialFocusRef={listRef}
        closeOnTab
        size="md"
        title={label}
        closeLabel={closeLabel}
      >
        <div className={styles.optionScroll}>
          <Listbox id={listId} label={label} options={options} value={selectedValue} size="sm" focusRef={listRef} onCommit={commit} />
        </div>
      </SelectionPanel>
    </>;
  },
);
