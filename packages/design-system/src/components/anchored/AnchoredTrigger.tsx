import { cloneElement, type ButtonHTMLAttributes, type ReactElement, type Ref, type RefAttributes } from "react";
export type AnchoredTriggerElement = ReactElement<ButtonHTMLAttributes<HTMLButtonElement> & RefAttributes<HTMLButtonElement>>;

/** Preserve the existing button; attach only the controlled overlay relationship. */
export function AnchoredTrigger({ element, ref, open, panelId, popup, onActivate, onKeyDown }: {
  element: AnchoredTriggerElement;
  popup: "dialog" | "menu";
  onKeyDown?: ButtonHTMLAttributes<HTMLButtonElement>["onKeyDown"];
  ref: Ref<HTMLButtonElement>;
  open: boolean;
  panelId: string;
  onActivate: () => void;
}) {
  return cloneElement(element, {
    ref,
    type: element.props.type ?? "button",
    "aria-haspopup": popup, "aria-controls": panelId, "aria-expanded": open,
    // Avoid a second native toggle competing with controlled activation.
    popoverTarget: undefined, popoverTargetAction: undefined,
    onKeyDown: event => {
      element.props.onKeyDown?.(event);
      if (!event.defaultPrevented) onKeyDown?.(event);
    },
    onClick: event => {
      element.props.onClick?.(event);
      if (!event.defaultPrevented) onActivate();
    },
  });
}
