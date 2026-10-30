"use client";

import { Fragment, isValidElement, useCallback, useId, useRef, type ButtonHTMLAttributes, type CSSProperties, type ReactElement, type ReactNode, type RefAttributes, type RefObject } from "react";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { classNames } from "../class-names";
import { usePopover } from "./internal/use-popover";
import { assignTriggerRef } from "../anchored/compose-trigger-ref";
import { AnchoredTrigger } from "../anchored/AnchoredTrigger";
import layerStyles from "../anchored/anchored.module.css";
import styles from "./Popover.module.css";

export type PopoverOpenChangeReason = "trigger" | "close" | "escape" | "outside-pointer" | "focus-exit" | "anchor-hidden";
type PopoverBaseProps = {
  /** Stable panel id when an external composite trigger supplies aria-controls. */
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean, reason: PopoverOpenChangeReason) => void;
  title: string;
  /** Body/footer must provide dismissal when the title is visually hidden. The dialog stays named. */
  headerVisibility?: "visible" | "hidden";
  /** Optional action next to the visible title, before the separate close control. */
  headerAction?: ReactNode;
  description?: string;
  closeLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Default: first eligible Body control, otherwise Title. Reading content can request Title. */
  initialFocus?: "title" | RefObject<HTMLElement | null>;
  /** Logical successor when the trigger can disappear or become unavailable. */
  returnFocusRef?: RefObject<HTMLElement | null>;
  className?: string;
  style?: CSSProperties;
};
export type PopoverProps = PopoverBaseProps & (
  | {
      /** One labelled button that forwards its ref and button props; normally the shared Button. */
      trigger: ReactElement<ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>>;
      anchorRef?: never;
    }
  | {
      /** For a trigger already rendered inside a composite control such as DateField. */
      anchorRef: RefObject<HTMLButtonElement | null>;
      trigger?: never;
    }
);

/** Safe-to-discard contextual content. Caller owns drafts, actions and outcomes. */
export function Popover({ id: suppliedId, open, onOpenChange, trigger, anchorRef: externalAnchorRef, title, headerVisibility = "visible", headerAction, description, closeLabel, children, footer, initialFocus, returnFocusRef, className, style }: PopoverProps) {
  if (!title.trim()) throw new Error("Popover requires a non-empty title.");
  if (trigger && (!isValidElement(trigger) || trigger.type === Fragment)) throw new Error("Popover requires one labelled button trigger.");
  if (closeLabel !== undefined && !closeLabel.trim()) throw new Error("Popover closeLabel must be non-empty when supplied.");
  const internalAnchorRef = useRef<HTMLButtonElement>(null);
  const anchorRef = externalAnchorRef ?? internalAnchorRef;
  const panelRef = useRef<HTMLDivElement>(null);
  const closeReasonRef = useRef<PopoverOpenChangeReason | null>(null);
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const callerRef = trigger?.props.ref;
  const mergedRef = useCallback((node: HTMLButtonElement | null) => {
    internalAnchorRef.current = node;
    const cleanup = assignTriggerRef(callerRef, node);
    return () => {
      internalAnchorRef.current = null;
      if (typeof cleanup === "function") cleanup();
      else assignTriggerRef(callerRef, null);
    };
  }, [callerRef]);
  usePopover({ open, anchorRef, panelRef, titleId, initialFocus, returnFocusRef, onOpenChange, closeReasonRef });
  const request = (next: boolean, reason: PopoverOpenChangeReason) => {
    closeReasonRef.current = next ? null : reason;
    onOpenChange(next, reason);
  };
  return <>
    {trigger ? <AnchoredTrigger popup="dialog" element={trigger} ref={mergedRef} open={open} panelId={id} onActivate={() => request(!open, "trigger")} /> : null}
    <div ref={panelRef} id={id} popover="manual" role="dialog" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}
      className={classNames(layerStyles.panel, styles.panel, className)} style={style}>
      <div className={styles.content} data-popover-content="">
        {headerVisibility === "hidden" ? <Text as="h2" variant="label-base" className={styles.hiddenTitle} id={titleId} tabIndex={-1}>{title}</Text> : <header className={classNames(styles.header, headerAction ? styles.headerWithAction : undefined)}>
          <Text as="h2" variant="label-base" id={titleId} tabIndex={-1}>{title}</Text>
          {headerAction ? <div className={styles.headerAction}>{headerAction}</div> : null}
          {closeLabel ? <Button className={styles.close} variant="ghost" intent="neutral" size="sm" icon="controls/close-s" aria-label={closeLabel} onClick={() => request(false, "close")} /> : null}
        </header>}
        {description ? <Text variant="body-sm" className={styles.description} id={descriptionId}>{description}</Text> : null}
        <div data-popover-body="">{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  </>;
}
