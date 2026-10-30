import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";
import { getStoryContent } from "../../storybook/story-content";
import {
  CompoundRangeField,
  type CompoundRangeFieldProps,
} from "./CompoundRangeField";
import layout from "../Slider/Slider.stories.module.css";

const base = {
  label: "Interval",
  beginningLabel: "Beginning",
  endLabel: "End",
  min: 0,
  max: 1,
  step: 0.3,
} as const;
function Updating({
  value: initial,
  defaultValue,
  ...props
}: CompoundRangeFieldProps) {
  const [value, setValue] = useState(initial ?? defaultValue);
  return (
    <CompoundRangeField {...props} value={value} onValueChange={setValue} />
  );
}
const meta = {
  id: "forms-compound-range-field",
  title: "Components/Forms/CompoundRangeField",
  component: CompoundRangeField,
  tags: ["test"],
  args: { ...base, value: [0, 0.9] },
  render: (args) => (
    <div className={layout.page}>
      <Updating {...args} />
    </div>
  ),
} satisfies Meta<typeof CompoundRangeField>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvas }) => {
    const [b, e] = canvas.getAllByRole("spinbutton");
    const [bs, es] = canvas.getAllByRole("slider");
    await userEvent.click(e);
    await userEvent.clear(e);
    await userEvent.type(e, "1");
    await expect(es).toHaveValue("0.9");
    await userEvent.keyboard("{Enter}");
    await expect(es).toHaveValue("1");
    await userEvent.clear(e);
    await userEvent.type(e, "0.95{Enter}");
    await expect(es).toHaveValue("1");
    await expect(e).toHaveAttribute("aria-invalid", "true");
    await userEvent.keyboard("{Escape}");
    await expect(e).toHaveValue("1");
    await userEvent.click(b);
    await userEvent.clear(b);
    await userEvent.type(b, "0.3{Enter}");
    await expect(bs).toHaveValue("0.3");
    bs.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(b).toHaveValue("0.6");
    await expect(canvas.getAllByRole("group")).toHaveLength(1);
  },
};
export const StatesAndLocalizedContent: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    const props = {
      ...base,
      label: content.rangeSlider.label,
      beginningLabel: content.rangeSlider.beginningHandleLabel,
      endLabel: content.rangeSlider.endHandleLabel,
      locale: content.locale,
      suffix: content.slider.unit,
      formatValue: (n: number) =>
        `${new Intl.NumberFormat(content.locale).format(n)} ${content.slider.unit}`,
      formatIssue: () => content.slider.error,
    };
    return (
      <main className={layout.page} lang={content.lang}>
        {(["sm", "md", "lg", "xl"] as const).map((size) => (
          <Updating key={size} {...props} size={size} value={[0, 1]} />
        ))}
        <CompoundRangeField
          {...props}
          label={content.slider.readOnlyLabel}
          value={[0, 1]}
          readOnly
        />
        <CompoundRangeField
          {...props}
          label={content.slider.disabledLabel}
          value={[0, 1]}
          disabled
        />
        <CompoundRangeField
          {...props}
          value={[0, 1]}
          error={content.slider.error}
        />
        <div className={layout.narrow}>
          <Updating {...props} value={[0, 1]} />
        </div>
      </main>
    );
  },
  play: async ({ canvas, globals }) => {
    const groups = canvas.getAllByRole("group");
    for (const root of groups) {
      await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      await expect(root.querySelectorAll("input")).toHaveLength(4);
      await expect(root.querySelector("output")).toBeNull();
      for (const editor of root.querySelectorAll<HTMLInputElement>(
        'input[role="spinbutton"]',
      )) {
        await expect(editor.getBoundingClientRect().width).toBeGreaterThan(0);
        await expect(editor.closest("[data-appearance]")).toHaveAttribute(
          "data-appearance",
          "soft",
        );
      }
    }
    const firstSlider = groups[0]
      .querySelector('input[type="range"]')!
      .getBoundingClientRect();
    const firstEditor = groups[0]
      .querySelector('input[role="spinbutton"]')!
      .getBoundingClientRect();
    if (globals.proofContext === "matrix") {
      await expect(firstEditor.top).toBeGreaterThan(firstSlider.bottom);
    } else {
      await expect(firstEditor.left).toBeGreaterThan(firstSlider.right);
      for (const root of groups.slice(0, 7)) {
        const rail = root
          .querySelector('input[type="range"]')!
          .parentElement!.querySelector("[aria-hidden]")!
          .getBoundingClientRect();
        for (const editor of root.querySelectorAll(
          'input[role="spinbutton"]',
        )) {
          const frame = editor
            .closest("[data-appearance]")!
            .getBoundingClientRect();
          await expect(frame.top).toBeCloseTo(rail.top, 1);
          await expect(frame.height).toBeCloseTo(rail.height, 1);
        }
      }
    }
    const editors = groups[7].querySelectorAll<HTMLInputElement>(
      'input[role="spinbutton"]',
    );
    await expect(editors[1].getBoundingClientRect().top).toBeGreaterThan(
      editors[0].getBoundingClientRect().top,
    );
  },
};
export const ContinuousAndRtl: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={layout.page}>
      <Updating
        {...base}
        mode="continuous"
        step={undefined}
        min={-1}
        max={1}
        value={[-0.5, 0.5]}
      />
      <Updating {...base} dir="rtl" value={[0, 1]} />
    </main>
  ),
};
