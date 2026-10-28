import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId, useState, type ReactNode } from "react";
import { expect, userEvent } from "storybook/test";
import { fixedUiRadii } from "../../../tokens/semantic-radii.mjs";
import {
  getStoryContent,
  type StoryContent,
} from "../../storybook/story-content";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Slider, type SliderProps, type SliderSize } from "./Slider";
import styles from "./Slider.stories.module.css";

const sizes: SliderSize[] = ["sm", "md", "lg", "xl"];
type StoryState = "disabled" | "editable" | "readOnly";
type SliderStoryProps = SliderProps & { storyState?: StoryState };

type StorySliderProps = SliderProps & { hint?: ReactNode; error?: ReactNode };

function StoryIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <header className={styles.stack}>
      <Text as="h1" variant="heading-lg">
        {title}
      </Text>
      <Text className={styles.secondary} variant="body-base">
        {children}
      </Text>
    </header>
  );
}

function StorySlider({ hint, error, ...props }: StorySliderProps) {
  const id = useId();
  const descriptionId = `${id}-description`;
  return (
    <div className={styles.stack}>
      <Slider
        {...props}
        aria-describedby={
          hint || error ? descriptionId : props["aria-describedby"]
        }
        aria-invalid={error ? true : props["aria-invalid"]}
      />
      {hint || error ? (
        <Text id={descriptionId} variant="body-sm">
          {error ?? hint}
        </Text>
      ) : null}
    </div>
  );
}

function StatefulSlider({
  defaultValue,
  onValueChange,
  value: initialValue,
  ...props
}: StorySliderProps) {
  const [value, setValue] = useState(initialValue ?? defaultValue);

  return (
    <StorySlider
      {...props}
      onValueChange={(nextValue, details) => {
        setValue(nextValue);
        onValueChange?.(nextValue, details);
      }}
      value={value}
    />
  );
}

function ControlledSlider(props: StorySliderProps) {
  const key =
    props.value === undefined
      ? `default:${props.defaultValue}`
      : `value:${props.value}`;
  return <StatefulSlider key={key} {...props} />;
}

function BaselineExample({ content }: { content: StoryContent }) {
  const [value, setValue] = useState(75);
  const baseline = 60;
  return (
    <div className={styles.stack} lang={content.lang}>
      <StorySlider
        label={content.slider.label}
        baseline={{ label: content.slider.baselineLabel, value: baseline }}
        formatValue={(nextValue) =>
          `${new Intl.NumberFormat(content.locale).format(nextValue)} ${content.slider.unit}`
        }
        markers={[
          { value: 30 },
          { label: content.slider.markerLabel, value: 45 },
        ]}
        max={90}
        min={0}
        onValueChange={setValue}
        step={5}
        value={value}
      />
      <div className={styles.actions}>
        <Button
          aria-disabled={value === baseline || undefined}
          intent="neutral"
          onClick={() => setValue(baseline)}
          size="md"
          variant="secondary"
        >
          {content.slider.resetLabel}
        </Button>
      </div>
    </div>
  );
}

const meta = {
  id: "forms-slider",
  title: "Components/Forms/Slider",
  component: Slider,
  tags: ["test"],
  args: {
    disabled: false,
    max: 90,
    min: 10,
    readOnly: false,
    size: "md",
    step: 5,
    storyState: "editable",
    value: 30,
  },
  argTypes: {
    disabled: { control: false },
    readOnly: { control: false },
    size: { control: "inline-radio", options: sizes },
    storyState: {
      control: "inline-radio",
      options: ["editable", "readOnly", "disabled"],
    },
  },
  parameters: {
    controls: {
      include: ["max", "min", "size", "step", "storyState", "value"],
    },
  },
  render: ({ storyState = "editable", ...args }) => (
    <div className={styles.measure}>
      <ControlledSlider
        hint="Arrow keys adjust one step."
        label="Preparation time"
        {...args}
        disabled={storyState === "disabled"}
        formatValue={(value) => `${value} min`}
        readOnly={storyState === "readOnly"}
      />
    </div>
  ),
} satisfies Meta<SliderStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    const slider = canvas.getByRole("slider", { name: "Preparation time" });
    await expect(slider).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{PageUp}{End}");
    await expect(slider).toHaveValue("90");
    await expect(slider).toHaveAttribute("aria-valuetext", "90 min");
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <StoryIntro title="Slider sizes">
        The visible geometry follows the shared control scale while the
        interaction row stays at least 44 pixels.
      </StoryIntro>
      <section className={styles.stack}>
        {sizes.map((size, index) => (
          <StorySlider
            key={size}
            label={`${size.toUpperCase()} preparation time`}
            formatValue={(value) => `${value} min`}
            max={60}
            min={0}
            size={size}
            step={5}
            value={(index + 1) * 10}
          />
        ))}
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    const controls = canvas.getAllByRole("slider");
    await expect(controls).toHaveLength(4);
    for (const [index, control] of controls.entries()) {
      const expectedHeight = index === 3 ? 56 : 44;
      await expect(control.getBoundingClientRect().height).toBeCloseTo(
        expectedHeight,
      );
      const root = control.closest<HTMLElement>("[data-size]")!;
      const rail = root.querySelector<HTMLElement>("[aria-hidden]")!;
      await expect(rail.getBoundingClientRect().height).toBe(
        [28, 36, 44, 56][index],
      );
      const radius = fixedUiRadii.find(role => role.id === `radius/ui/${sizes[index]}`)!;
      await expect(getComputedStyle(rail).borderRadius).toBe(
        `${radius.resolvedSourcePx}px`,
      );
      const label = root.querySelector("label")!;
      const output = root.querySelector("output")!;
      await expect(label.parentElement).toBe(output.parentElement);
      await expect(
        root.querySelector("[data-position='minimum']")!.getBoundingClientRect()
          .top,
      ).toBeGreaterThanOrEqual(rail.getBoundingClientRect().bottom);
    }
  },
};

export const MarkerAlignment: Story = {
  name: "Marker alignment",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <StoryIntro title="Marker alignment">
        Passive markers share the native thumb-centre interval at normal and
        narrow widths.
      </StoryIntro>
      <section className={styles.stack}>
        {sizes.map((size) => (
          <div className={styles.alignmentRow} key={size}>
            {["normal", "narrow"].map((width) => (
              <div className={styles.alignmentItem} key={width}>
                <Text variant="technical-sm">
                  {`${size.toUpperCase()} ${width}`}
                </Text>
                <Slider
                  aria-label={`${size} ${width} marker alignment`}
                  markers={[{ value: 0 }, { value: 37 }, { value: 100 }]}
                  max={100}
                  min={0}
                  size={size}
                  step={1}
                  value={37}
                />
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  ),
  play: async ({ canvasElement }) => {
    const thumbSizes: Record<SliderSize, number> = {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28,
    };
    const controls = Array.from(
      canvasElement.querySelectorAll<HTMLInputElement>("input[type='range']"),
    );
    await expect(controls).toHaveLength(8);

    for (const control of controls) {
      const root = control.closest<HTMLElement>("[data-size]");
      const track = root?.querySelector<HTMLElement>(
        "[data-marker-value]",
      )?.parentElement;
      const markers = Array.from(
        root?.querySelectorAll<HTMLElement>("[data-marker-value]") ?? [],
      );
      if (!root || !track)
        throw new Error("Slider geometry fixture is incomplete.");

      const controlRect = control.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const size = root.dataset.size as SliderSize;
      const thumbSize = thumbSizes[size];

      await expect(trackRect.left).toBeCloseTo(
        controlRect.left + thumbSize / 2,
        1,
      );
      await expect(trackRect.right).toBeCloseTo(
        controlRect.right - thumbSize / 2,
        1,
      );

      await expect(markers).toHaveLength(3);
      for (const marker of markers) {
        const value = Number(marker.dataset.markerValue);
        const expectedCenter = trackRect.left + (value / 100) * trackRect.width;
        const markerRect = marker.getBoundingClientRect();
        await expect(markerRect.left + markerRect.width / 2).toBeCloseTo(
          expectedCenter,
          1,
        );
      }

      const parentRect = control.parentElement?.getBoundingClientRect();
      if (!parentRect) throw new Error("Slider control fixture is incomplete.");
      await expect(controlRect.left).toBeGreaterThanOrEqual(parentRect.left);
      await expect(controlRect.right).toBeLessThanOrEqual(parentRect.right);
    }
  },
};

export const StatesAndResponsiveContent: Story = {
  name: "States & responsive content",
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);
    const formatter = (value: number) =>
      `${new Intl.NumberFormat(content.locale).format(value)} ${content.slider.unit}`;

    return (
      <main className={styles.page} lang={content.lang}>
        <StoryIntro title="Slider states">
          Labels wrap independently while the track, target and focus remain
          inside the parent width.
        </StoryIntro>
        <section className={styles.grid}>
          <StatefulSlider
            hint={content.slider.markerLabel}
            label={content.slider.label}
            formatValue={formatter}
            max={90}
            min={10}
            step={5}
            value={45}
          />
          <StorySlider
            label={content.slider.readOnlyLabel}
            formatValue={formatter}
            max={90}
            min={10}
            readOnly
            step={5}
            value={60}
          />
          <StorySlider
            label={content.slider.disabledLabel}
            disabled
            formatValue={formatter}
            max={90}
            min={10}
            step={5}
            value={35}
          />
          <div className={styles.narrow}>
            <StatefulSlider
              error={content.slider.error}
              label={content.slider.label}
              formatValue={formatter}
              max={1000000.5}
              min={-1000000.5}
              step={0.5}
              value={-0.5}
            />
          </div>
        </section>
      </main>
    );
  },
  play: async ({ canvas }) => {
    const controls = canvas.getAllByRole("slider");
    await expect(controls).toHaveLength(4);
    await expect(controls[1]).toHaveAttribute("aria-readonly", "true");
    await expect(controls[2]).toBeDisabled();
    await expect(controls[3]).toHaveAttribute("aria-invalid", "true");
    const root = controls[3].closest<HTMLElement>("[data-size]")!;
    const rail = root.querySelector<HTMLElement>("[aria-hidden]")!;
    const output = root.querySelector("output")!;
    const geometry = () =>
      [rail, output].map((element) => {
        const rect = element.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        return {
          x: rect.x - rootRect.x,
          y: rect.y - rootRect.y,
          width: rect.width,
          height: rect.height,
        };
      });
    const before = geometry();
    controls[3].focus();
    for (const key of ["{Home}", "{End}"]) {
      await userEvent.keyboard(key);
      await expect(geometry()).toEqual(before);
      const visibleValue = output.querySelector("span")!;
      await expect(visibleValue.textContent).toBe(
        controls[3].getAttribute("aria-valuetext"),
      );
      await expect(output.scrollWidth).toBeLessThanOrEqual(output.clientWidth);
      await expect(output.scrollHeight).toBeLessThanOrEqual(
        output.clientHeight,
      );
      await expect(getComputedStyle(output).overflow).toBe("visible");
    }
    await expect(controls[3]).toHaveValue("1000000.5");
    await expect(controls[3].parentElement).toBeVisible();
  },
};

export const MarkersAndBaseline: Story = {
  name: "Markers & baseline",
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const content = getStoryContent(globals.storyContentProfile);

    return (
      <main className={styles.page}>
        <StoryIntro title="Passive scale context">
          Markers never become controls. Reset remains a separately labelled
          existing Button.
        </StoryIntro>
        <BaselineExample content={content} />
      </main>
    );
  },
  play: async ({ canvas }) => {
    const slider = canvas.getByRole("slider");
    const reset = canvas.getByRole("button");
    await expect(
      canvas.getAllByText(/Usual|Habitual|Tempo habitual/).length,
    ).toBeGreaterThan(0);
    await expect(reset).toBeEnabled();
    await userEvent.click(reset);
    await expect(slider).toHaveValue("60");
    await expect(reset).toHaveFocus();
    await expect(reset).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.queryAllByRole("slider")).toHaveLength(1);
  },
};

export const MovementModes: Story = {
  name: "Discrete and continuous movement",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <Text as="h1" variant="heading-lg">
        Slider movement
      </Text>
      <Text variant="body-sm">
        Discrete snaps to step 5. Continuous follows the native pointer
        immediately, reporting six decimal places. Arrows move 1% and Page keys
        10% of the range.
      </Text>
      <StatefulSlider
        label="Discrete"
        min={0}
        max={100}
        step={5}
        value={25}
        markers={[0, 25, 50, 75, 100].map((value) => ({ value }))}
      />
      <StatefulSlider
        label="Continuous"
        min={0}
        max={100}
        mode="continuous"
        value={25}
        markers={[0, 25, 50, 75, 100].map((value) => ({ value }))}
      />
    </main>
  ),
  play: async ({ canvas }) => {
    for (const [index, control] of canvas.getAllByRole("slider").entries()) {
      control.focus();
      await userEvent.keyboard("{Home}{ArrowRight}");
      await expect(control).toHaveValue(index === 0 ? "5" : "1");
      const root = control.closest<HTMLElement>("[data-size]")!;
      const markers = Array.from(
        root.querySelectorAll<HTMLElement>("[data-marker-value]"),
      );
      const inputRect = control.getBoundingClientRect();
      const centers = markers.map((marker) => {
        const box = marker.getBoundingClientRect();
        return box.x + box.width / 2;
      });
      await expect(centers[0]).toBeCloseTo(inputRect.left + 10, 1);
      await expect(centers[4]).toBeCloseTo(inputRect.right - 10, 1);
      for (let i = 1; i < centers.length; i++) {
        await expect(centers[i] - centers[i - 1]).toBeCloseTo(
          (centers[4] - centers[0]) / 4,
          1,
        );
      }
      const label = root.querySelector("label")!;
      const output = root.querySelector("output")!;
      await expect(getComputedStyle(label).fontSize).toBe("12px");
      await expect(
        Math.abs(
          label.getBoundingClientRect().top -
            output.getBoundingClientRect().top,
        ),
      ).toBeLessThanOrEqual(1);
    }
  },
};
