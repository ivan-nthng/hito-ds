import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage, FoundationStorySection, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { ValuePicker, type ValuePickerProps } from "./ValuePicker";

const options = [
  { value: "four", label: "4 px" },
  { value: "six", label: "6 px" },
  { value: "eight", label: "8 px" },
  { value: "twelve", label: "12 px" },
  { value: "blocked", label: "Unavailable", disabled: true },
];

const figmaUrl = "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9149-23463";
const meta = {
  id: "fields-value-picker",
  title: "Components/Fields/ValuePicker",
  component: ValuePicker,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    figma: { label: "ValuePicker in Figma", url: figmaUrl },
    controls: { include: ["source", "value", "placeholder", "label", "disabled"] },
  },
  args: {
    source: "token",
    options,
    label: "Padding value",
    closeLabel: "Close values",
    value: "six",
    placeholder: "Choose value",
    disabled: false,
  },
  argTypes: {
    source: { control: "inline-radio", options: ["token", "inferred", "custom"] },
    value: { control: "select", options: options.filter(option => !option.disabled).map(option => option.value) },
    options: { control: false },
    onValueChange: { control: false },
    disabled: { control: "boolean" },
  },
  render: args => <FoundationStoryPage title="ValuePicker" description="A 20 px value selector for dense controls. Source distinguishes proven tokens, numeric matches with unverified binding, and custom values; form fields use Select.">
    <ValuePicker {...args} />
  </FoundationStoryPage>,
} satisfies Meta<ValuePickerProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<ValuePickerProps>();
    return <FoundationStoryPage title="ValuePicker" description="Choose a dense value. Inferred means the number matches a token; token means its binding is verified or explicitly requested.">
      <ValuePicker {...args} onValueChange={value => updateArgs({ value })} />
    </FoundationStoryPage>;
  },
  play: async ({ canvasElement, args }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: args.label });
    const selectedLabel = args.options.find(option => option.value === args.value)?.label ?? args.placeholder;
    await expect(trigger).toHaveTextContent(selectedLabel ?? "");
    await expect(trigger).toHaveAttribute("data-source", args.source);
    await expect(trigger.getBoundingClientRect().height).toBe(20);
    await expect(getComputedStyle(trigger.querySelector("span")!).borderRadius).toBe("4px");
  },
};

export const Appearances: Story = {
  render: args => <FoundationStoryPage title="ValuePicker appearances" description="Proven, inferred and custom origins share compact geometry; only the first proves a binding.">
    <FoundationSpecimenGrid>
      <FoundationStorySection title="Token"><ValuePicker {...args} source="token" /></FoundationStorySection>
      <FoundationStorySection title="Inferred match"><ValuePicker {...args} source="inferred" title="Numeric match; binding unverified" /></FoundationStorySection>
      <FoundationStorySection title="Custom"><ValuePicker {...args} source="custom" /></FoundationStorySection>
      <FoundationStorySection title="Disabled"><ValuePicker {...args} source="token" disabled /></FoundationStorySection>
    </FoundationSpecimenGrid>
  </FoundationStoryPage>,
};

const hidden = ["!dev", "!autodocs", "context-matrix"];
const hover = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const trigger = within(canvasElement).getByRole("combobox");
  await userEvent.hover(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
};
const open = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
  const trigger = within(canvasElement).getByRole("combobox");
  await userEvent.click(trigger);
  await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
  await waitFor(() => expect(within(canvasElement).getByRole("listbox")).toBeVisible());
  const panel = within(canvasElement).getByRole("listbox").closest<HTMLElement>("[data-presentation]")!;
  expect(getComputedStyle(panel).borderTopLeftRadius).toBe("12px"); expect(getComputedStyle(panel).paddingTop).toBe("6px");
};

export const TokenDefault: Story = { tags: hidden };
export const TokenHover: Story = { tags: hidden, play: hover };
export const TokenOpen: Story = { tags: hidden, play: open };
export const TokenDisabled: Story = { tags: hidden, args: { disabled: true } };
export const CustomDefault: Story = { tags: hidden, args: { source: "custom" } };
export const CustomHover: Story = { tags: hidden, args: { source: "custom" }, play: hover };
export const CustomOpen: Story = { tags: hidden, args: { source: "custom" }, play: open };
export const CustomDisabled: Story = { tags: hidden, args: { source: "custom", disabled: true } };

export const KeyboardSelection: Story = {
  tags: hidden,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    const list = within(canvasElement).getByRole("listbox");
    await waitFor(() => expect(list).toHaveFocus());
    await userEvent.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("12 px");
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};
