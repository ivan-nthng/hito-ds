"use client";

import type { ControlWidth } from "../control-width";
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
import {
  InputFrame,
  inputFrameStyles,
  type InputFrameAppearance,
} from "../input-frame/InputFrame";
import {
  resolveControlState,
  type ControlValidationState,
} from "../input-frame/control-state";
import { Listbox } from "../listbox/Listbox";
import type { OptionData } from "../listbox/Option";
import { SelectionPanel } from "../selection-panel/SelectionPanel";
import type { ListItemSize } from "../ListItem/ListItem";
import styles from "./Select.module.css";

export type SelectOption = OptionData;
export type SelectProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "defaultValue" | "onChange" | "children" | "name"
> & {
  options: readonly SelectOption[];
  label: string;
  closeLabel: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  placeholder?: string;
  size?: ListItemSize;
  width?: ControlWidth;
  appearance?: InputFrameAppearance;
  required?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  validationState?: ControlValidationState;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  function Select(
    {
      options,
      label,
      closeLabel,
      value,
      defaultValue = "",
      onValueChange,
      name,
      form,
      placeholder = "",
      size = "md",
      appearance = "outlined",
      width = appearance === "ghost" ? "hug" : "fill",
      required,
      readOnly,
      loading,
      disabled,
      validationState,
      id,
      className,
      onClick,
      onKeyDown,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref,
  ) {
    const generated = useId();
    const controlId = id ?? `${generated}-select`;
    const listId = `${controlId}-listbox`;
    const frameRef = useRef<HTMLSpanElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const nativeRef = useRef<HTMLSelectElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    useImperativeHandle(ref, () => triggerRef.current!, []);
    const [internal, setInternal] = useState(defaultValue);
    const [open, setOpen] = useState(false);
    const selectedValue = value ?? internal;
    const selected = options.find((option) => option.value === selectedValue);
    const state = resolveControlState({
      ariaInvalid,
      disabled,
      readOnly,
      loading,
      validationState,
    });
    const unavailable =
      disabled ||
      state.isReadOnly ||
      !options.some((option) => !option.disabled);
    const visibleOpen = open && !unavailable;
    const latest = useRef({ value, defaultValue });
    useEffect(() => {
      latest.current = { value, defaultValue };
    }, [value, defaultValue]);
    useEffect(() => {
      const owner = nativeRef.current?.form;
      const reset = (event: Event) => {
        queueMicrotask(() => {
          if (event.defaultPrevented) return;
          if (latest.current.value === undefined)
            setInternal(latest.current.defaultValue);
          if (nativeRef.current)
            nativeRef.current.value =
              latest.current.value ?? latest.current.defaultValue;
          setOpen(false);
        });
      };
      owner?.addEventListener("reset", reset);
      return () => owner?.removeEventListener("reset", reset);
    }, [form]);
    // State restrictions also dismiss an already-open picker.
    useEffect(() => {
      if (unavailable) setOpen(false);
    }, [unavailable]);
    if (
      new Set(options.map((option) => option.value)).size !== options.length ||
      options.some((option) => !option.value)
    )
      throw new Error("Select options require unique, non-empty values.");
    const commit = (next: string) => {
      if (
        unavailable ||
        !options.some((option) => option.value === next && !option.disabled)
      )
        return;
      if (value === undefined) setInternal(next);
      if (next !== selectedValue) onValueChange?.(next);
      setOpen(false);
      triggerRef.current?.focus();
    };
    return (
      <>
        <InputFrame
          ref={frameRef}
          className={styles.frame}
          onClick={(event) => {
            if (triggerRef.current?.contains(event.target as Node)) return;
            if (unavailable) return;
            triggerRef.current?.focus();
            setOpen(!visibleOpen);
          }}
          width={width}
          appearance={appearance}
          size={size}
          disabled={disabled}
          readOnly={state.isReadOnly}
          loading={state.isLoading}
          invalid={state.invalid}
          validationState={state.resolvedValidationState}
          trailing={
            <Icon name="arrows/compact/down" size={size} tone="secondary" />
          }
        >
          <button
            {...props}
            id={controlId}
            ref={triggerRef}
            type="button"
            role="combobox"
            aria-label={props["aria-labelledby"] ? undefined : label}
            aria-haspopup="listbox"
            aria-expanded={visibleOpen}
            aria-controls={visibleOpen ? listId : undefined}
            aria-readonly={state.isReadOnly || undefined}
            aria-required={required || undefined}
            aria-invalid={state.invalid || ariaInvalid}
            aria-describedby={
              [ariaDescribedby, selected?.trailingText ? `${controlId}-trailing-description` : undefined]
                .filter(Boolean).join(" ") || undefined
            }
            aria-busy={state.isLoading || undefined}
            aria-disabled={unavailable || undefined}
            disabled={disabled}
            className={classNames(
              inputFrameStyles.input,
              styles.trigger,
              className,
            )}
            data-placeholder={!selected || undefined}
            onClick={(event) => {
              onClick?.(event);
              if (!event.defaultPrevented && !unavailable)
                setOpen(!visibleOpen);
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (
                !event.defaultPrevented &&
                !unavailable &&
                ["ArrowDown", "ArrowUp"].includes(event.key)
              ) {
                event.preventDefault();
                setOpen(true);
              }
            }}
          >
            {selected?.label ?? placeholder}
          </button>
        </InputFrame>
        {selected?.trailingText ? (
          <span id={`${controlId}-trailing-description`} hidden>
            {selected.trailingText}
          </span>
        ) : null}
        <select
          ref={nativeRef}
          className={styles.native}
          aria-hidden="true"
          tabIndex={-1}
          name={name}
          form={form}
          value={selected?.value ?? ""}
          required={required}
          disabled={disabled}
          onChange={(event) => commit(event.target.value)}
          onInvalid={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
          }}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <SelectionPanel
          id={`${controlId}-panel`}
          open={visibleOpen}
          onOpenChange={setOpen}
          anchorRef={triggerRef}
          positioningRef={frameRef}
          initialFocusRef={listRef}
          closeOnTab
          size={size}
          title={label}
          closeLabel={closeLabel}
        >
          <Listbox
            id={listId}
            label={label}
            options={options}
            value={selectedValue}
            size={size}
            focusRef={listRef}
            onCommit={commit}
          />
        </SelectionPanel>
      </>
    );
  },
);
