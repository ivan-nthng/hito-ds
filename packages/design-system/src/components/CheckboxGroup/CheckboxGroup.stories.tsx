import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import {
  GroupExamples,
  groupStoryOptions,
} from "../choice-control/choice-groups.story";
import { choiceControlSizes } from "../choice-control/ChoiceControl";
import { CheckboxGroup } from "./CheckboxGroup";
const meta = {
  id: "forms-checkbox-group",
  title: "Components/Forms/CheckboxGroup",
  component: CheckboxGroup,
  tags: ["test"],
  args: {
    legend: "Delivery preferences",
    name: "preferences",
    options: groupStoryOptions,
    appearance: "inline",
    controlSize: "base",
    description: "",
    error: "",
    disabled: false,
  },
  parameters: {
    controls: {
      include: [
        "legend",
        "description",
        "error",
        "appearance",
        "cardSize",
        "controlSize",
        "disabled",
      ],
    },
  },
  argTypes: {
    legend: { control: "text" },
    description: { control: "text" },
    error: { control: "text" },
    appearance: { control: "inline-radio", options: ["inline", "card"] },
    cardSize: {
      control: "inline-radio",
      options: ["compact", "comfortable"],
      if: { arg: "appearance", eq: "card" },
    },
    controlSize: { control: "inline-radio", options: choiceControlSizes },
    disabled: { control: "boolean" },
    options: { control: false, table: { disable: true } },
  },
  render: ({ cardSize, ...args }) => (
    <FoundationStoryPage
      title="CheckboxGroup"
      description="Shared naming and native selection."
    >
      <CheckboxGroup
        {...args}
        {...(args.appearance === "card"
          ? { appearance: "card", cardSize }
          : { appearance: "inline" })}
        legend={
          typeof args.legend === "string" ? args.legend : "Delivery preferences"
        }
        description={
          typeof args.description === "string" ? args.description : undefined
        }
        error={typeof args.error === "string" ? args.error : undefined}
      />
    </FoundationStoryPage>
  ),
} satisfies Meta<typeof CheckboxGroup>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getAllByRole("checkbox")[0];
    if (args.disabled) {
      await expect(input).toBeDisabled();
      return;
    }
    await userEvent.click(input);
    await expect(input).toBeChecked();
    await expect(input).toHaveFocus();
  },
};
export const LayoutsAndStates: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => (
    <GroupExamples kind="checkbox" profile={globals.storyContentProfile} />
  ),
  play: async ({ canvas }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      innerWidth,
    );
    const groups = canvas.getAllByRole("group");
    for (const group of groups) {
      await expect(group.tagName).toBe("FIELDSET");
      await expect(group.firstElementChild?.tagName).toBe("LEGEND");
      await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
    }
    const inputs = Array.from(groups[0].querySelectorAll("input"));
    await userEvent.click(inputs[0]);
    await userEvent.click(inputs[1]);
    await expect(inputs[0]).not.toBeChecked();
    await expect(inputs[1]).toBeChecked();
    const invalid = groups[2].querySelector("input")!;
    await expect(invalid).toHaveAttribute("aria-invalid", "true");
    await expect(invalid.getAttribute("aria-errormessage")).toBe(
      groups[2].getAttribute("aria-errormessage"),
    );
    await expect(groups[3].querySelector("input")).toBeDisabled();
    await expect(groups[1]).toHaveAttribute("data-size", "compact");
    await expect(groups[1].querySelector("label")).toHaveAttribute(
      "data-size",
      "sm",
    );
  },
};
