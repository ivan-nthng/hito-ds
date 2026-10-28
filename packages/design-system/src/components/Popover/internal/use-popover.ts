import type { RefObject } from "react";
import type { PopoverOpenChangeReason, PopoverProps } from "../Popover";
import { useAnchoredPanel } from "../../anchored/use-anchored-panel";
import { initialPopoverFocus } from "./focus";

export function usePopover({ titleId, initialFocus, onOpenChange, ...options }: {
  open: boolean;
  anchorRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
  titleId: string;
  initialFocus: PopoverProps["initialFocus"];
  returnFocusRef: PopoverProps["returnFocusRef"];
  onOpenChange: PopoverProps["onOpenChange"];
  closeReasonRef: RefObject<PopoverOpenChangeReason | null>;
}) {
  useAnchoredPanel({ ...options,
    onDismiss: reason => onOpenChange(false, reason),
    onInitialFocus: panel => {
      const title = panel.ownerDocument.getElementById(titleId);
      if (title) initialPopoverFocus(panel, title, initialFocus === "title" ? "title" : initialFocus?.current);
    },
  });
}
