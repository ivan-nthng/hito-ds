"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { List } from "../List/List";
import type { ListItemSize } from "../ListItem/ListItem";
import { Option, type OptionData } from "./Option";
import { classNames } from "../class-names";
import styles from "./Listbox.module.css";

export function Listbox({
  id,
  label,
  options,
  value,
  size,
  focusRef,
  onCommit,
  className,
}: {
  id: string;
  label: string;
  options: readonly OptionData[];
  value: string;
  size: ListItemSize;
  focusRef: RefObject<HTMLUListElement | null>;
  onCommit: (value: string) => void;
  className?: string;
}) {
  const enabled = options.filter((option) => !option.disabled);
  const initial =
    enabled.find((option) => option.value === value)?.value ??
    enabled[0]?.value;
  const [active, setActive] = useState(initial);
  const current = enabled.some((option) => option.value === active)
    ? active
    : initial;
  const prefix = useRef({ text: "", time: 0 });
  const optionId = (key: string) => `${id}-${encodeURIComponent(key)}`;
  useEffect(() => {
    if (current)
      document
        .getElementById(`${id}-${encodeURIComponent(current)}`)
        ?.scrollIntoView?.({ block: "nearest" });
  }, [current, id]);
  return (
    <List
      id={id}
      ref={focusRef}
      role="listbox"
      className={classNames(styles.list, className)}
      aria-label={label}
      tabIndex={0}
      aria-activedescendant={current ? optionId(current) : undefined}
      onKeyDown={(event) => {
        if (
          event.nativeEvent.isComposing ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        let next: string | undefined;
        const index = enabled.findIndex((option) => option.value === current);
        if (event.key === "ArrowDown")
          next = enabled[Math.min(index + 1, enabled.length - 1)]?.value;
        else if (event.key === "ArrowUp")
          next = enabled[Math.max(index - 1, 0)]?.value;
        else if (event.key === "Home") next = enabled[0]?.value;
        else if (event.key === "End") next = enabled.at(-1)?.value;
        else if (
          event.key === "Enter" ||
          (event.key === " " &&
            (!prefix.current.text || Date.now() - prefix.current.time >= 700))
        ) {
          event.preventDefault();
          event.stopPropagation();
          if (current) onCommit(current);
          return;
        } else if (event.key.length === 1) {
          const now = Date.now();
          const text =
            (now - prefix.current.time < 700 ? prefix.current.text : "") +
            event.key.toLocaleLowerCase();
          prefix.current = { text, time: now };
          const repeated = [...text].every(
            (character) => character === text[0],
          );
          const query = repeated ? text[0] : text;
          const start = text.length === 1 || repeated ? index + 1 : index;
          for (let offset = 0; offset < enabled.length; offset++) {
            const candidate =
              enabled[(Math.max(0, start) + offset) % enabled.length];
            if (candidate.label.toLocaleLowerCase().startsWith(query)) {
              next = candidate.value;
              break;
            }
          }
        } else return;
        event.preventDefault();
        event.stopPropagation();
        if (next) setActive(next);
      }}
    >
      {options.map((option) => (
        <Option
          key={option.value}
          id={optionId(option.value)}
          option={option}
          active={current === option.value}
          selected={value === option.value}
          size={size}
          onActivate={() => setActive(option.value)}
          onCommit={() => { setActive(option.value); onCommit(option.value); }}
        />
      ))}
    </List>
  );
}
