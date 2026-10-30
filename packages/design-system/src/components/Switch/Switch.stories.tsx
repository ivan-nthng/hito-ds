import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { ChoiceStates } from "../choice-control/choice.story";
import { choiceControlSizes } from "../choice-control/ChoiceControl";
import { Switch } from "./Switch";

const meta = {
  id: "forms-switch",
  title: "Components/Forms/Switch",
  component: Switch,
  tags: ["test"],
  args: {
    label: "Receive delivery updates",
    description: "",
    size: "base",
    disabled: false,
  },
  parameters: {
    figma: { label: "Switch component set in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8445-2" },
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
      title="Switch"
      description="Native control with a visible label."
    >
      <Switch
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
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("switch");
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
    <ChoiceStates kind="Switch" profile={globals.storyContentProfile} />
  ),
  play: async ({ canvas }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      innerWidth,
    );
    const controls = canvas.getAllByRole("switch") as HTMLInputElement[];
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
    await expect(controls[2]).toBeDisabled();
    for (const size of choiceControlSizes) {
      const target = controls.find(control => control.closest("label")?.dataset.size === size)!;
      const track = target.nextElementSibling as HTMLElement;
      const position = track.firstElementChild as HTMLElement;
      const thumb = position.firstElementChild as HTMLElement;
      const baseSize = size === "sm" ? 10 : 12;
      await waitFor(() =>
        expect(thumb.getBoundingClientRect().width).toBe(baseSize),
      );
      const rest = thumb.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      await expect(rest.left - trackRect.left).toBe(3);
      await expect(rest.top - trackRect.top).toBe(
        trackRect.bottom - rest.bottom,
      );
      await userEvent.click(target);
      await waitFor(() => {
        const moved = thumb.getBoundingClientRect();
        expect(moved.width).toBe(baseSize);
        expect(trackRect.right - moved.right).toBe(3);
      });
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        await expect(getComputedStyle(position).transitionDuration).toBe("0s");
        await expect(getComputedStyle(thumb).transitionDuration).toBe("0s");
      }
    }
  },
};
