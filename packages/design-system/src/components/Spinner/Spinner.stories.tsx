import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimen, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { getLoadingStateContent } from "../../storybook/loading-state.story";
import { Button, type ButtonVariant } from "../Button/Button";
import { controlSizes } from "../control-size";
import { Text } from "../Text/Text";
import { Spinner } from "./Spinner";
import styles from "./Spinner.stories.module.css";

const meta = {
  id: "feedback-spinner", title: "Components/Feedback/Spinner", component: Spinner, tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["size"] } },
  args: { size: "md" },
  argTypes: { size: { control: "select", options: controlSizes } },
  render: (args, { globals }) => {
    const copy = getLoadingStateContent(globals.storyContentProfile);
    return <FoundationStoryPage title="Spinner" description="Indeterminate waiting. The owning region provides the loading text and busy state.">
      <div className={styles.loadingRow} role="status" aria-busy="true" lang={copy.lang}><Spinner {...args} /><Text as="span" variant="body-sm">{copy.loading}</Text></div>
    </FoundationStoryPage>;
  },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Spinner in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8659-3",
    },
  },
  tags: ["context-matrix"],
  play: async ({ canvasElement }) => {
    const spinner = canvasElement.querySelector<HTMLElement>("[data-spinner]")!;
    await expect(spinner).toHaveAttribute("aria-hidden", "true");
    await expect(spinner).not.toHaveAttribute("role");
    await expect(spinner.getBoundingClientRect().width).toBe(parseFloat(getComputedStyle(spinner).getPropertyValue(`--ui-icon-size-${spinner.dataset.size}`)) * parseFloat(getComputedStyle(document.documentElement).fontSize));
    const arc = getComputedStyle(spinner, "::after");
    await expect(arc.maskImage).toContain("conic-gradient");
    await expect(arc.borderTopWidth).toBe("2px");
    await expect(getComputedStyle(spinner, "::before").opacity).toBe("0.16");
    await expect(arc.animationName === "none").toBe(matchMedia("(prefers-reduced-motion: reduce)").matches);
  },
};

const variants: ButtonVariant[] = ["primary", "secondary", "soft", "ghost"];
export const ButtonParity: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"], parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const copy = getLoadingStateContent(globals.storyContentProfile);
    return <FoundationStoryPage title="Button loading parity" description="Loading preserves geometry and inherits each Button foreground."><FoundationSpecimenGrid lang={copy.lang}>
    {controlSizes.flatMap(size => variants.map(variant => <FoundationSpecimen key={`${size}-${variant}`} label={`${size} · ${variant}`}>
      <div data-pair=""><Button intent="accent" variant={variant} size={size}>{copy.save}</Button><Button intent="accent" variant={variant} size={size} loading>{copy.save}</Button></div>
    </FoundationSpecimen>))}
  </FoundationSpecimenGrid></FoundationStoryPage>;
  },
  play: async ({ canvasElement }) => {
    for (const pair of canvasElement.querySelectorAll("[data-pair]")) {
      const [normal, loading] = Array.from(pair.querySelectorAll("button"));
      const a = normal.getBoundingClientRect(), b = loading.getBoundingClientRect();
      await expect(a.width).toBe(b.width);
      await expect(a.height).toBe(b.height);
      const spinner = loading.querySelector<HTMLElement>("[data-spinner]")!;
      await expect(loading).toHaveAccessibleName(normal.textContent!);
      await expect(getComputedStyle(loading.firstElementChild!).opacity).toBe("0");
      await expect(getComputedStyle(spinner).color).toBe(getComputedStyle(loading).color);
      const box = spinner.getBoundingClientRect();
      await expect(Math.abs(box.top + box.height / 2 - b.top - b.height / 2)).toBeLessThan(1);
      await expect(Math.abs(box.left + box.width / 2 - b.left - b.width / 2)).toBeLessThan(1);
    }
  },
};
