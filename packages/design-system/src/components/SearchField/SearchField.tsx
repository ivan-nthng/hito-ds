"use client";

import type { ControlWidth } from "../control-width";

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type InputHTMLAttributes,
} from "react";
import type { ControlSize } from "../control-size";
import { Icon } from "../Icon/Icon";
import { ControlClearAction } from "../input-frame/ControlClearAction";
import {
  InputFrame,
  inputFrameStyles,
  type InputFrameAppearance,
} from "../input-frame/InputFrame";
import {
  resolveControlState,
  type ControlValidationState,
} from "../input-frame/control-state";
import { classNames } from "../class-names";
import styles from "./SearchField.module.css";

export type SearchFieldAppearance = InputFrameAppearance;
export type SearchFieldSize = ControlSize;
export type SearchFieldValidationState = ControlValidationState;

type SearchFieldValueProps =
  | {
      defaultValue?: never;
      onValueChange: (value: string) => void;
      value: string;
    }
  | {
      defaultValue?: string;
      onValueChange?: (value: string) => void;
      value?: never;
    };

type SearchFieldBaseProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "defaultValue" | "onChange" | "size" | "type" | "value" | "width"
> & {
  width?: ControlWidth;
  appearance?: SearchFieldAppearance;
  clearLabel: string;
  loading?: boolean;
  onClear?: () => void;
  size?: SearchFieldSize;
  validationState?: SearchFieldValidationState;
};

export type SearchFieldProps = SearchFieldBaseProps & SearchFieldValueProps;

function setForwardedRef(
  ref: ForwardedRef<HTMLInputElement>,
  node: HTMLInputElement | null,
) {
  if (typeof ref === "function") {
    ref(node);
  } else if (ref) {
    ref.current = node;
  }
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  function SearchField(
    {
      appearance = "outlined",
      width = "fill",
      "aria-busy": ariaBusy,
      "aria-invalid": ariaInvalid,
      className,
      clearLabel,
      defaultValue = "",
      disabled,
      form,
      loading = false,
      onClear,
      onValueChange,
      readOnly,
      size = "md",
      tabIndex,
      validationState = "none",
      value,
      ...props
    },
    ref,
  ) {
    const controlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const currentValue = controlled ? value : uncontrolledValue;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const state = resolveControlState({
      ariaInvalid,
      disabled,
      loading,
      readOnly,
      validationState,
    });
    const showClear =
      currentValue.length > 0 && !disabled && !state.isLoading && !readOnly;

    const setInputRef = useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        setForwardedRef(ref, node);
      },
      [ref],
    );

    useEffect(() => {
      if (controlled) return;

      const owningForm = inputRef.current?.form;
      if (!owningForm) return;

      function handleReset(event: Event) {
        queueMicrotask(() => {
          if (!event.defaultPrevented) setUncontrolledValue(defaultValue);
        });
      }

      owningForm.addEventListener("reset", handleReset);
      return () => owningForm.removeEventListener("reset", handleReset);
    }, [controlled, defaultValue, form]);

    function setValue(nextValue: string) {
      if (!controlled) setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
      setValue(event.currentTarget.value);
    }

    function handleClear() {
      if (!showClear) return;

      setValue("");
      onClear?.();
      inputRef.current?.focus();
    }

    return (
      <InputFrame
        width={width}
        appearance={appearance}
        className={styles.root}
        data-search-clear={showClear || undefined}
        disabled={disabled}
        invalid={state.invalid}
        loading={state.isLoading}
        readOnly={readOnly}
        size={size}
        trailing={
          showClear ? (
            <ControlClearAction
              className={styles.clearButton}
              label={clearLabel}
              onClick={handleClear}
              tabIndex={tabIndex === -1 ? -1 : undefined}
            />
          ) : undefined
        }
        validationState={state.resolvedValidationState}
      >
        <Icon name="general/search" size={size} tone="secondary" />
        <input
          {...props}
          aria-busy={state.isLoading || ariaBusy || undefined}
          aria-invalid={state.invalid ? true : ariaInvalid}
          className={classNames(
            inputFrameStyles.input,
            styles.input,
            className,
          )}
          disabled={disabled}
          form={form}
          onChange={handleChange}
          readOnly={state.isReadOnly}
          ref={setInputRef}
          tabIndex={tabIndex}
          type="search"
          value={currentValue}
        />
      </InputFrame>
    );
  },
);
