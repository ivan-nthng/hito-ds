import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";
import { getStoryContent } from "../../storybook/story-content";
import { Text } from "../Text/Text";
import { RangeSlider, type RangeSliderProps } from "./RangeSlider";
import layout from "../Slider/Slider.stories.module.css";
import styles from "./RangeSlider.stories.module.css";
const sizes = ["sm", "md", "lg", "xl"] as const;
const base = {
  label: "Interval",
  beginningHandleLabel: "Beginning",
  endHandleLabel: "End",
  min: 0,
  max: 100,
  step: 5,
} as const;
function Updating({
  value: initial,
  defaultValue,
  ...props
}: RangeSliderProps) {
  const [value, setValue] = useState(initial ?? defaultValue);
  return <RangeSlider {...props} value={value} onValueChange={setValue} />;
}
const meta = {
  id: "forms-range-slider",
  title: "Components/Forms/RangeSlider",
  component: RangeSlider,
  tags: ["test"],
  args: { ...base, value: [20, 80] },
  render: (args) => (
    <div className={layout.measure}>
      <Updating {...args} />
    </div>
  ),
} satisfies Meta<typeof RangeSlider>;
export default meta;
type Story = StoryObj<typeof meta>;

function geometry(root: HTMLElement) {
  const inputs = root.querySelectorAll<HTMLInputElement>("input");
  const row = inputs[0].parentElement!;
  const rail = row.querySelector<HTMLElement>("[aria-hidden]")!;
  const fill = rail.firstElementChild as HTMLElement;
  const rect = row.getBoundingClientRect();
  const travel = row
    .querySelector<HTMLElement>("[data-slider-travel]")!
    .getBoundingClientRect();
  const thumb = rect.width - travel.width;
  const rtl = getComputedStyle(root).direction === "rtl";
  const centre = (n: number) =>
    rect.left + thumb / 2 + (rect.width - thumb) * (rtl ? 1 - n : n);
  const points = Array.from(inputs, (n) =>
    centre((Number(n.value) - Number(n.min)) / (Number(n.max) - Number(n.min))),
  );
  return { row, rail, fill, rect, thumb, points, centre };
}
async function assertGeometry(root: HTMLElement) {
  const { fill, points, centre, rail } = geometry(root);
  const box = fill.getBoundingClientRect();
  await expect(box.left).toBeCloseTo(Math.min(...points), 1);
  await expect(box.right).toBeCloseTo(Math.max(...points), 1);
  for (const marker of rail.querySelectorAll<HTMLElement>(
    "[data-marker-value]",
  )) {
    const m = marker.getBoundingClientRect();
    await expect(m.left + m.width / 2).toBeCloseTo(
      centre(Number(marker.dataset.markerValue) / 100),
      1,
    );
  }
}
export const Playground: Story = {
  play: async ({ canvas }) => {
    const [b, e] = canvas.getAllByRole("slider");
    await userEvent.tab();
    await expect(b).toHaveFocus();
    await userEvent.keyboard("{End}{ArrowRight}");
    await expect(b).toHaveValue("80");
    await userEvent.tab();
    await expect(e).toHaveFocus();
    await userEvent.keyboard("{Home}{ArrowLeft}");
    await expect(e).toHaveValue("80");
    await expect(b).toHaveAttribute("aria-valuemax", "80");
    await assertGeometry(b.closest<HTMLElement>("[role=group]")!);
  },
};
export const SizesAndCollisions: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={layout.page}>
      <Text as="h1" variant="heading-lg">
        RangeSlider geometry
      </Text>
      {sizes.map((size) => (
        <section className={layout.stack} key={size}>
          {(
            [
              [20, 80],
              [45, 50],
              [50, 50],
              [0, 0],
              [100, 100],
            ] as const
          ).map((pair) => (
            <Updating
              {...base}
              key={pair.join(":")}
              size={size}
              label={`${size.toUpperCase()} ${pair.join("–")}`}
              value={pair}
              markers={[0, 20, 50, 80, 100].map((value) => ({ value }))}
            />
          ))}
        </section>
      ))}
    </main>
  ),
  play: async ({ canvas }) => {
    for (const root of canvas.getAllByRole("group")) {
      const { row, rail } = geometry(root);
      const i = sizes.indexOf(root.dataset.size as (typeof sizes)[number]);
      await expect(rail.getBoundingClientRect().height).toBe(
        [28, 36, 44, 56][i],
      );
      await expect(row.getBoundingClientRect().height).toBe(
        [44, 44, 44, 56][i],
      );
      await assertGeometry(root);
      const measure = () => {
        const r = row.getBoundingClientRect(),
          p = root.getBoundingClientRect();
        return { x: r.x - p.x, y: r.y - p.y, width: r.width, height: r.height };
      };
      const before = measure();
      root.querySelector<HTMLInputElement>("input")!.focus();
      await userEvent.keyboard("{Home}{End}");
      await expect(measure()).toEqual(before);
      await assertGeometry(root);
    }
  },
};
export const StatesAndLocalizedContent: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    const copy = content.rangeSlider;
    const formatValue = (n: number) =>
      `${new Intl.NumberFormat(content.locale).format(n)} ${content.slider.unit}`;
    return (
      <main className={layout.page} lang={content.lang}>
        <Text as="h1" variant="heading-lg">
          RangeSlider states
        </Text>
        <div className={layout.stack}>
          <Updating
            {...base}
            {...copy}
            value={[20, 80]}
            formatValue={formatValue}
          />
          <RangeSlider
            {...base}
            {...copy}
            label={content.slider.readOnlyLabel}
            value={[20, 80]}
            readOnly
            formatValue={formatValue}
          />
          <RangeSlider
            {...base}
            {...copy}
            label={content.slider.disabledLabel}
            value={[20, 80]}
            disabled
            formatValue={formatValue}
          />
          <div className={styles.narrow}>
            <Updating
              {...base}
              {...copy}
              min={-1000000.5}
              max={1000000.5}
              step={0.5}
              value={[-1000000.5, 1000000.5]}
              formatValue={formatValue}
            />
          </div>
          <div className={styles.reflow}>
            <Updating
              {...base}
              {...copy}
              value={[20, 80]}
              formatValue={formatValue}
            />
          </div>
        </div>
      </main>
    );
  },
  play: async ({ canvas }) => {
    const groups = canvas.getAllByRole("group");
    const all = canvas.getAllByRole("slider");
    await expect(all[2]).toHaveAttribute("aria-readonly", "true");
    await expect(all[4]).toBeDisabled();
    for (const root of [groups[3], groups[4]]) {
      const inputs = root.querySelectorAll<HTMLInputElement>("input");
      const output = root.querySelector("output")!;
      const row = inputs[0].parentElement!;
      const measure = () => {
        const r = row.getBoundingClientRect(),
          p = root.getBoundingClientRect();
        return { x: r.x - p.x, y: r.y - p.y, width: r.width, height: r.height };
      };
      const before = measure();
      for (const input of inputs) {
        input.focus();
        await userEvent.keyboard("{Home}{End}");
        await expect(measure()).toEqual(before);
        await expect(output.scrollWidth).toBeLessThanOrEqual(
          output.clientWidth,
        );
        await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
      }
      await expect(output.textContent).toContain(
        inputs[0].getAttribute("aria-valuetext")!,
      );
    }
  },
};
export const MovementAndRtl: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={layout.page}>
      <Text as="h1" variant="heading-lg">
        Movement and direction
      </Text>
      {(["ltr", "rtl"] as const).map((dir) => (
        <section className={layout.stack} key={dir}>
          <Updating
            {...base}
            label={`Discrete ${dir}`}
            dir={dir}
            value={[20, 80]}
          />
          <Updating
            {...base}
            step={undefined}
            mode="continuous"
            label={`Continuous ${dir}`}
            dir={dir}
            value={[20, 80]}
          />
        </section>
      ))}
    </main>
  ),
  play: async ({ canvas }) => {
    for (const [i, root] of canvas.getAllByRole("group").entries()) {
      const input = root.querySelector<HTMLInputElement>("input")!;
      input.focus();
      await userEvent.keyboard("{Home}{ArrowUp}");
      await expect(input).toHaveValue(i % 2 === 0 ? "5" : "1");
      await assertGeometry(root);
    }
  },
};
export const MarkersAndBaseline: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={layout.page}>
      <Text as="h1" variant="heading-lg">
        Passive scale context
      </Text>
      <Updating
        {...base}
        value={[20, 80]}
        markers={[
          { value: 0 },
          { value: 20, label: "Low" },
          { value: 35 },
          { value: 80, label: "High" },
          { value: 100 },
        ]}
        baseline={{ value: 50, label: "Reference" }}
      />
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("slider")).toHaveLength(2);
    await assertGeometry(canvas.getByRole("group"));
  },
};
export const PointerGestures: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={layout.page}>
      <Text as="h1" variant="heading-lg">
        Pointer gestures
      </Text>
      <Updating {...base} value={[20, 80]} />
    </main>
  ),
  play: async ({ canvas }) => {
    const root = canvas.getByRole("group");
    const { row, centre } = geometry(root);
    const [b, e] = canvas.getAllByRole("slider");
    const dispatch = (type: string, x: number) =>
      row.dispatchEvent(
        new PointerEvent(type, {
          bubbles: true,
          pointerId: 1,
          button: 0,
          clientX: centre(x),
          clientY: row.getBoundingClientRect().top + 22,
        }),
      );
    // Synthetic dispatch cannot claim browser pointer capture; real capture is checked separately.
    const inputs = root.querySelectorAll<HTMLInputElement>("input");
    const original = inputs[0].setPointerCapture;
    inputs.forEach((input) => {
      input.setPointerCapture = () => {};
    });
    try {
      dispatch("pointerdown", 0.25);
      dispatch("pointermove", 0.9);
      await waitFor(() => expect(b).toHaveValue("80"));
      await expect(e).toHaveValue("80");
      dispatch("pointercancel", 0.9);
      await waitFor(() => expect(b).toHaveValue("20"));
      await expect(e).toHaveValue("80");
    } finally {
      inputs.forEach((input) => {
        input.setPointerCapture = original;
      });
    }
  },
};
