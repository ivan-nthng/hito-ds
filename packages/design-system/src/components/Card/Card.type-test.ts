import type { CardHeaderProps, CardProps } from "./Card";
import type { FieldsetProps } from "../Fieldset/Fieldset";

const acceptedSizes: NonNullable<FieldsetProps["size"]>[] = ["compact", "comfortable"];
export const reusedSizes: NonNullable<CardProps["size"]>[] = acceptedSizes;
// @ts-expect-error Card uses container density, not the fixed control-size scale.
export const controlSize: CardProps["size"] = "sm";
// @ts-expect-error An ordinary Card is not a button or a link.
export const interactiveElement: CardProps["as"] = "button";

export const sectionHeader: CardHeaderProps = { title: "Contact", headingLevel: 3, titleId: "contact" };
// @ts-expect-error Header hierarchy is explicitly limited to the admitted document levels.
export const invalidHeaderLevel: CardHeaderProps["headingLevel"] = 4;
// @ts-expect-error Restaurant identity belongs to the profile's dedicated InlineEdit.
export const identityHeader: CardHeaderProps = { title: "Contact", restaurantName: "Restaurant" };
// @ts-expect-error A visual menu state is not a header API; pass the native Menu composition.
export const fakeOpenHeader: CardHeaderProps = { title: "Contact", overflowState: "open" };
