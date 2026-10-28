import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { ChoiceStates } from "../choice-control/choice.story";
import { choiceControlSizes } from "../choice-control/ChoiceControl";
import { Radio } from "./Radio";

const meta = {
  id: "forms-radio",
  title: "Components/Forms/Radio",
  component: Radio,
  tags: ["test"],
  args: {
    label: "Receive delivery updates",
    description: "",
    size: "base",
    disabled: false,
  },
  parameters: {
    controls: {
      include: ["label", "description", "size", "disabled", "defaultChecked"],
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
      title="Radio"
      description="Native control with a visible label."
    >
      <Radio
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
} satisfies Meta<typeof Radio>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    figma: {
      label: "Radio in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8438-2",
    },
  },
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("radio");
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
    <ChoiceStates kind="Radio" profile={globals.storyContentProfile} />
  ),
  play: async ({ canvas }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      innerWidth,
    );
    const controls = canvas.getAllByRole("radio") as HTMLInputElement[];
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
    await userEvent.keyboard("{ArrowRight}");
    await expect(controls[1]).toBeChecked();
    await expect(input).not.toBeChecked();
    await expect(controls[2]).toBeDisabled();
  },
};
