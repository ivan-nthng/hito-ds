import type { ChipProps } from "./Chip";
import type { TagProps } from "../Tag/Tag";

export const selectable: ChipProps = { label: "Choice", behavior: "selectable", selected: true, onSelectedChange: () => {} };
export const removable: ChipProps = { label: "Value", behavior: "removable", removeLabel: "Remove Value", onRemove: () => {}, elevation: "raised" };
// @ts-expect-error Selection is controlled.
export const uncontrolled: ChipProps = { label: "Choice", behavior: "selectable", onSelectedChange: () => {} };
// @ts-expect-error Removal needs its localized action name.
export const unnamed: ChipProps = { label: "Value", behavior: "removable", onRemove: () => {} };
// @ts-expect-error One chip cannot toggle and remove.
export const hybrid: ChipProps = { ...selectable, onRemove: () => {} };
// @ts-expect-error Selectable chips are background-only.
export const raisedSelection: ChipProps = { ...selectable, elevation: "raised" };
// @ts-expect-error No alternate click action.
export const click: ChipProps = { ...removable, onClick: () => {} };
// @ts-expect-error Tags are passive.
export const interactiveTag: TagProps = { label: "Category", onClick: () => {} };
// @ts-expect-error Only SM and MD are admitted.
export const largeTag: TagProps = { label: "Category", size: "lg" };
