import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { ChoiceStates } from "../choice-control/choice.story";
import { choiceControlSizes } from "../choice-control/ChoiceControl";
import { Checkbox } from "./Checkbox";

const meta = {
  id: "forms-checkbox",
  title: "Components/Forms/Checkbox",
  component: Checkbox,
  tags: ["test"],
  args: {
    label: "Receive delivery updates",
    description: "",
    size: "base",
    disabled: false,
  },
  parameters: {
    controls: {
      include: [
        "label",
        "description",
        "size",
        "disabled",
        "defaultChecked",
        "indeterminate",
      ],
    },
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "inline-radio", options: choiceControlSizes },
    disabled: { control: "boolean" },
    defaultChecked: { control: "boolean" },
  },
  render: (args) => (
    <FoundationStoryPage
      title="Checkbox"
      description="Native control with a visible label."
    >
      <Checkbox
        {...args}
        label={
          typeof args.label === "string"
            ? args.label
            : "Receive delivery updates"
        }
        description={
          typeof args.description === "string" ? args.description : undefined
        }
      />
    </FoundationStoryPage>
  ),
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    figma: {
      label: "Checkbox in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8424-7",
    },
  },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("checkbox");
    if (args.disabled) {
      await expect(input).toBeDisabled();
      return;
    }
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  },
};
export const SizesAndStates: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => (
    <ChoiceStates kind="Checkbox" profile={globals.storyContentProfile} />
  ),
  play: async ({ canvas }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      innerWidth,
    );
    const controls = canvas.getAllByRole("checkbox") as HTMLInputElement[];
    for (const input of controls) {
      const label = input.closest("label")!;
      await expect(label.getBoundingClientRect().height).toBeGreaterThanOrEqual(
        44,
      );
      await expect(input.getBoundingClientRect().width).toBeGreaterThanOrEqual(
        44,
      );
    }
    const input = controls[0];
    await userEvent.click(input);
    await expect(input).toBeChecked();
    await expect(input).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(input).not.toBeChecked();
    await expect(controls[3]).toBeDisabled();
  },
};
