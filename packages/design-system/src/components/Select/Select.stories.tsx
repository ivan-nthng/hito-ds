import { useArgs } from "storybook/preview-api";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import {
  FoundationStoryPage,
  FoundationStorySection,
  FoundationSpecimenGrid,
} from "../../foundations/FoundationStoryLayout";
import { Field } from "../Field/Field";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";
import { SearchField } from "../SearchField/SearchField";
import { NumberField } from "../NumberField/NumberField";
import { Textarea } from "../Textarea/Textarea";
import { Select, type SelectProps } from "./Select";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";
const options = [
  { value: "morning", label: "Morning", description: "09:00–12:00" },
  { value: "afternoon", label: "Afternoon", description: "12:00–16:00" },
  { value: "evening", label: "Evening", description: "16:00–20:00" },
  { value: "night", label: "Night", disabled: true },
];
function SelectExample(args: SelectProps) {
  return (
    <FoundationStoryPage
      title="Select"
      description="Choose one delivery window."
    >
      <Field
        label={args.label}
        required={args.required}
        hint="You can change this before checkout."
      >
        {({ controlProps }) => <Select {...args} {...controlProps} />}
      </Field>
    </FoundationStoryPage>
  );
}

const meta = {
  title: "Components/Forms/Select",
  id: "fields-select",
  component: Select,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: {
      include: [
        "size",
        "appearance",
        "width",
        "value",
        "placeholder",
        "label",
        "disabled",
        "readOnly",
        "loading",
        "required",
        "validationState",
      ],
    },
  },
  args: {
    options,
    label: "Delivery window",
    closeLabel: "Close",
    placeholder: "Choose a window",
    size: "md",
    appearance: "outlined",
    disabled: false,
    readOnly: false,
    loading: false,
    required: false,
    validationState: "none",
  },
  argTypes: {
    width: { control: "inline-radio", options: ["hug", "fill"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    appearance: { control: "select", options: ["outlined", "soft", "ghost"] },
    value: {
      control: {
        type: "select",
        labels: {
          "": "None (placeholder)",
          ...Object.fromEntries(options.map((option) => [option.value, option.label])),
        },
      },
      options: [
        "",
        ...options.filter((option) => !option.disabled).map((option) => option.value),
      ],
      description: "Committed value. Selecting an option in the preview updates this control.",
    },
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    loading: { control: "boolean" },
    required: { control: "boolean" },
    validationState: {
      control: "select",
      options: ["none", "invalid", "success"],
    },
    onValueChange: { control: false },
  },
  render: (args) => <SelectExample {...args} />,
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TrailingText: Story = {
  name: "Trailing text",
  tags: ["context-matrix"],
  render: (_args, { globals }) => {
    const pt = globals.storyContentProfile === "pt-long";
    return <FoundationStoryPage title="Select — trailing text" description="Synthetic amounts demonstrate the shared presentation slot.">
      <Field label={pt ? "Número de semanas" : "Number of weeks"} hint={pt ? "Para todo o carrinho." : "For the whole cart."}>
        {({ controlProps }) => <Select {...controlProps} label={pt ? "Número de semanas" : "Number of weeks"} closeLabel={pt ? "Fechar" : "Close"} appearance="soft" defaultValue="2"
          options={[
            { value: "1", label: pt ? "1 semana" : "1 week", trailingText: "R$ 32,50" },
            { value: "2", label: pt ? "2 semanas" : "2 weeks", trailingText: "R$ 65,00" },
            { value: "3", label: pt ? "3 semanas" : "3 weeks", trailingText: "R$ 1.234.567.890,12" },
            { value: "4", label: pt ? "4 semanas" : "4 weeks", trailingText: "R$ 130,00", disabled: true },
            { value: "more", label: pt ? "Mais" : "More" },
          ]} />}
      </Field>
    </FoundationStoryPage>;
  },
  play: async ({ canvasElement, globals }) => {
    const pt = globals.storyContentProfile === "pt-long", c = within(canvasElement), body = within(document.body);
    const trigger = c.getByRole("combobox", { name: pt ? "Número de semanas" : "Number of weeks" });
    await expect(trigger).toHaveTextContent(pt ? "2 semanas" : "2 weeks");
    await expect(trigger).toHaveAccessibleDescription(`${pt ? "Para todo o carrinho." : "For the whole cart."} R$ 65,00`);
    trigger.focus(); await userEvent.keyboard("{ArrowDown}");
    const selected = await body.findByRole("option", { name: `${pt ? "2 semanas" : "2 weeks"} R$ 65,00` });
    await expect(selected).toHaveAttribute("aria-selected", "true");
    const long = body.getByRole("option", { name: `${pt ? "3 semanas" : "3 weeks"} R$ 1.234.567.890,12` });
    const label = within(long).getByText(pt ? "3 semanas" : "3 weeks");
    const amount = within(long).getByText("R$ 1.234.567.890,12");
    expect(amount.getBoundingClientRect().left).toBeGreaterThanOrEqual(label.getBoundingClientRect().right);
    expect(getComputedStyle(amount).color).toBe(getComputedStyle(label).color);
    expect(long.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    expect(long.scrollWidth).toBeLessThanOrEqual(long.clientWidth);
    await userEvent.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent(pt ? "Mais" : "More");
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAccessibleDescription(pt ? "Para todo o carrinho." : "For the whole cart.");
  },
};
export const Playground: Story = {
  parameters: {
    figma: {
      label: "Select in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8459-111",
    },
  },
  args: { value: "" },
  render: function Render(args) {
    const [, updateArgs] = useArgs<SelectProps>();
    return <SelectExample {...args} onValueChange={(value) => updateArgs({ value })} />;
  },
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    await expect(trigger).toHaveAccessibleName(args.label);
    await expect(trigger).toHaveTextContent(
      args.options.find((option) => option.value === args.value)?.label ??
        args.placeholder ?? "",
    );
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

// Keep saved routes and regression coverage without size/state branches in navigation.
export const KeyboardSelection: Story = {
  tags: ["!dev", "!autodocs", "context-matrix"],
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    const frame = trigger.parentElement as HTMLElement;
    const restPaint = getComputedStyle(frame).backgroundColor;
    const openPaint = resolvedBackground(frame, "--color-surface-neutral-subtle-pressed");
    await userEvent.click(trigger);
    const list = canvas.getByRole("listbox");
    await waitFor(() => expect(list).toHaveFocus());
    await userEvent.hover(list);
    await waitFor(() => expect(getComputedStyle(frame).backgroundColor).toBe(openPaint));
    const panel = canvas.getByRole("dialog");
    if (panel.dataset.presentation === "anchored") {
      const frame = trigger.parentElement!.getBoundingClientRect();
      const overlay = panel.getBoundingClientRect();
      await expect(Math.abs(frame.left - overlay.left)).toBeLessThan(1);
      await expect(overlay.width).toBeGreaterThanOrEqual(frame.width - 1);
    }
    await userEvent.keyboard("{End}{Enter}");
    await expect(trigger).toHaveTextContent("Evening");
    await expect(trigger).toHaveFocus();
    await userEvent.click(canvas.getByRole("heading", { name: "Select" }));
    await userEvent.unhover(frame);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).not.toHaveFocus();
    await waitFor(() => expect(frame.matches(":hover")).toBe(false));
    await waitFor(() => expect(getComputedStyle(frame).backgroundColor).toBe(restPaint));
    await userEvent.click(trigger);
    await userEvent.keyboard("{Home}{Escape}");
    await expect(trigger).toHaveTextContent("Evening");
    await expect(trigger).toHaveFocus();
    canvasElement.dataset.selectVerified = "true";
  },
};
export const Small: Story = {
  ...KeyboardSelection,
  tags: ["!dev", "!autodocs", "context-matrix"],
  args: { size: "sm" },
};
export const Large: Story = {
  ...KeyboardSelection,
  tags: ["!dev", "!autodocs", "context-matrix"],
  args: { size: "lg" },
};
export const Appearances: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <FoundationStoryPage
      title="Select appearances"
      description="Shared input geometry in every size."
    >
      <FoundationSpecimenGrid>
        {(["sm", "md", "lg"] as const).flatMap((size) =>
          (["outlined", "soft", "ghost"] as const).map((appearance) => (
            <FoundationStorySection
              key={`${size}-${appearance}`}
              title={`${size.toUpperCase()} · ${appearance}`}
            >
              <Select
                {...args}
                size={size}
                appearance={appearance}
                defaultValue="morning"
              />
            </FoundationStorySection>
          )),
        )}
      </FoundationSpecimenGrid>
    </FoundationStoryPage>
  ),
};
export const States: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <FoundationStoryPage
      title="Select states"
      description="Loading, read-only, disabled and validation use the shared input contract."
    >
      <FoundationSpecimenGrid>
        <FoundationStorySection title="Disabled">
          <Select {...args} disabled defaultValue="morning" />
        </FoundationStorySection>
        <FoundationStorySection title="Read-only">
          <Select {...args} readOnly defaultValue="morning" />
        </FoundationStorySection>
        <FoundationStorySection title="Loading">
          <Select {...args} loading />
        </FoundationStorySection>
        <FoundationStorySection title="Empty">
          <Select {...args} options={[]} />
        </FoundationStorySection>
        <FoundationStorySection title="Required">
          <Field label="Delivery window" required error="Choose a window.">
            {({ controlProps }) => <Select {...args} {...controlProps} />}
          </Field>
        </FoundationStorySection>
      </FoundationSpecimenGrid>
    </FoundationStoryPage>
  ),
};
export const LongCopy: Story = {
  tags: ["!dev", "!autodocs", "context-matrix"],
  parameters: { controls: { disable: true } },
  args: {
    label: "Janela de entrega",
    closeLabel: "Fechar",
    defaultValue: "long",
    options: [
      {
        value: "long",
        label:
          "Entrega na região metropolitana de São Paulo durante o período da manhã",
        description:
          "Confira o endereço e as instruções de acesso antes de confirmar sua entrega.",
      },
      {
        value: "other",
        label: "Delivery throughout the metropolitan area in the afternoon",
        description:
          "A long option wraps while the committed trigger value remains on one line.",
      },
    ],
  },
};
export const Form: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <FoundationStoryPage
      title="Select in a form"
      description="Native submission and reset."
    >
      <form>
        <Field label="Delivery window" required>
          {({ controlProps }) => (
            <Select
              {...args}
              {...controlProps}
              name="window"
              defaultValue="morning"
            />
          )}
        </Field>
        <Button type="reset" intent="neutral" variant="ghost">
          Reset
        </Button>
      </form>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.keyboard("{End}{Enter}");
    await expect(
      new FormData(canvasElement.querySelector("form")!).get("window"),
    ).toBe("evening");
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await waitFor(() =>
      expect(canvas.getByRole("combobox")).toHaveTextContent("Morning"),
    );
    await expect(
      new FormData(canvasElement.querySelector("form")!).get("window"),
    ).toBe("morning");
  },
};

export const Widths: Story = {
  tags: ["!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (args) => (
    <FoundationStoryPage
      title="Hug / Fill"
      description="Content width or container width, independent of control size and appearance."
    >
      <FoundationSpecimenGrid>
        {(["hug", "fill"] as const).map((width) => (
          <FoundationStorySection key={width} title={width}>
            <Select
              {...args}
              width={width}
              appearance="ghost"
              defaultValue="morning"
            />
            <TextInput
              width={width}
              aria-label={`Text ${width}`}
              defaultValue="São Paulo"
            />
            <SearchField
              width={width}
              aria-label={`Search ${width}`}
              clearLabel="Clear"
              placeholder="Search city"
            />
            <NumberField
              width={width}
              aria-label={`Number ${width}`}
              defaultValue={12}
              suffix="kg"
            />
            <Textarea
              width={width}
              aria-label={`Notes ${width}`}
              defaultValue="Delivery notes"
              rows={3}
            />
            <Textarea
              width={width}
              aria-label={`Five rows ${width}`}
              defaultValue="Five rows of notes"
              rows={5}
            />
          </FoundationStorySection>
        ))}
      </FoundationSpecimenGrid>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hug = canvas.getByRole("textbox", { name: "Text hug" });
    const fill = canvas.getByRole("textbox", { name: "Text fill" });
    const before = hug.parentElement!.getBoundingClientRect().width;
    await expect(before).toBeLessThan(
      fill.parentElement!.getBoundingClientRect().width,
    );
    await userEvent.clear(hug);
    await userEvent.type(hug, "A much longer city name");
    await expect(
      hug.parentElement!.getBoundingClientRect().width,
    ).toBeGreaterThan(before);
    canvasElement.dataset.widthVerified = "true";
  },
};
