import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage, FoundationStorySection, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { StatusBadge, type StatusBadgeProps } from "./StatusBadge";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";

const samples: StatusBadgeProps[] = [
  { label: "Not started", icon: "general/status-dashed-circle", intent: "neutral" },
  { label: "Needs attention", icon: "general/status-exclamation-circle", intent: "warning" },
  { label: "In progress", icon: "general/status-progress-half", intent: "info" },
  { label: "In review", icon: "general/status-progress-three-quarter", intent: "info" },
  { label: "Completed", icon: "general/status-check-circle", intent: "success" },
  { label: "Cancelled", icon: "general/status-cross-circle", intent: "destructive" },
];
const meta = {
  id: "feedback-status-badge", title: "Components/Feedback/StatusBadge", component: StatusBadge,
  tags: ["test"], parameters: { layout: "fullscreen", controls: { include: ["label", "icon", "variant", "intent", "size", "collapsed"] } },
  args: { ...samples[0], size: "md", variant: "soft", collapsed: false },
  argTypes: {
    label: { control: "text", description: "Visible status text, retained when collapsed." },
    icon: { control: "select", options: samples.map(sample => sample.icon), description: "Status icon." },
    collapsed: { control: "boolean", description: "Show the icon circle while retaining accessible text." },
    variant: { control: "inline-radio", options: ["solid", "soft"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    intent: { control: "select", options: ["neutral", "info", "success", "warning", "destructive"] },
  },
  render: args => <FoundationStoryPage title="StatusBadge" description="Use Controls to change the label, icon, appearance, size and collapsed state."><StatusBadge {...args}/></FoundationStoryPage>,
} satisfies Meta<typeof StatusBadge>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  parameters: {
    figma: {
      label: "StatusBadge in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8919-15214",
    },
  },
};
export const Variants: Story = {
  parameters: {
    controls: { include: ["label", "icon", "intent", "size", "collapsed"] },
    figma: {
      label: "StatusBadge overview in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8919-15215",
    },
  },
  render: args => <FoundationStoryPage title="Appearances" description="Compare Solid and Soft. Controls apply to both examples.">
    <FoundationSpecimenGrid>
      {(["solid", "soft"] as const).map(variant => <FoundationStorySection key={variant} title={variant === "solid" ? "Solid" : "Soft"}>
        <StatusBadge {...args} variant={variant}/>
      </FoundationStorySection>)}
    </FoundationSpecimenGrid>
  </FoundationStoryPage>,
};
/** Full regression matrix is test-only; the browsing experience uses Controls. */
export const RegressionMatrix: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => <FoundationStoryPage title="StatusBadge variants" description="Synthetic examples; icons do not define business states.">{(["sm", "md"] as const).map(size => <FoundationStorySection key={size} title={size.toUpperCase()}>{(["solid", "soft"] as const).map(variant => <FoundationSpecimenGrid key={variant}>{samples.map(sample => <StatusBadge key={sample.label} {...sample} size={size} variant={variant}/>)}{samples.map(sample => <StatusBadge key={`${sample.label}-circle`} {...sample} size={size} variant={variant} collapsed/>)}</FoundationSpecimenGrid>)}</FoundationStorySection>)}</FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    for (const badge of canvasElement.querySelectorAll<HTMLElement>("[data-collapsed]")) {
      const bounds = badge.getBoundingClientRect();
      const icon = badge.querySelector<HTMLElement>("[data-icon-name]")!;
      const iconBounds = icon.getBoundingClientRect();
      const padding = iconBounds.left - bounds.left;
      await expect(Math.abs(padding - (iconBounds.top - bounds.top))).toBeLessThan(1);
      await expect(Math.abs(padding - (bounds.bottom - iconBounds.bottom))).toBeLessThan(1);
      if (badge.dataset.collapsed === "true") await expect(Math.abs(bounds.width - bounds.height)).toBeLessThan(1);
      await expect(getComputedStyle(icon).maskImage).not.toBe("none");
    }
  },
};
function CollapseExample(args: StatusBadgeProps) {
  const [collapsed, setCollapsed] = useState(false);
  return <FoundationStoryPage title="Controlled presentation" description="The badge itself has no interaction. Its text remains accessible when collapsed."><Button intent="neutral" variant="secondary" onClick={() => setCollapsed(!collapsed)}>Toggle labels</Button><StatusBadge {...args} collapsed={collapsed}/></FoundationStoryPage>;
}
export const Collapse: Story = {
  parameters: { controls: { include: ["label", "icon", "variant", "intent", "size"] } },
  tags: ["context-matrix"], args: { ...samples[4], variant: "solid" },
  render: args => <CollapseExample {...args}/>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const label = c.getByText("Completed");
    const badge = label.closest<HTMLElement>("[data-collapsed]")!;
    await userEvent.click(c.getByRole("button", { name: "Toggle labels" }));
    await waitFor(() => expect(Math.abs(badge.getBoundingClientRect().width - badge.getBoundingClientRect().height)).toBeLessThan(1));
    await expect(label.closest('[aria-hidden="true"]')).toBeNull();
    await expect(badge).not.toHaveAttribute("tabindex");
    await userEvent.click(c.getByRole("button", { name: "Toggle labels" }));
    await waitFor(() => expect(badge.getBoundingClientRect().width).toBeGreaterThan(badge.getBoundingClientRect().height));
  },
};
export const LongLabels: Story = {
  tags: ["context-matrix"],
  args: { label: "Aguardando confirmação da revisão e aprovação da documentação internacional", icon: "general/status-progress-three-quarter", intent: "info" },
};
export const InteractiveSolid: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <FoundationStoryPage title="Interactive solid states" description="Existing status surfaces retain their corresponding foreground.">
    <StatusBadge as="button" label="Default solid" icon="general/status-progress-half" intent="info" variant="solid" />
    <StatusBadge as="button" label="Expanded solid" icon="general/status-progress-half" intent="info" variant="solid" aria-expanded="true" />
    <StatusBadge as="button" label="Pending solid" icon="general/status-progress-half" intent="info" variant="solid" pending />
    <StatusBadge label="Passive solid" icon="general/status-progress-half" intent="info" variant="solid" />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement), button = c.getByRole("button", { name: "Default solid" });
    if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.hover(button); }
    else await userEvent.hover(button);
    const foreground = resolvedBackground(button, "--color-foreground-on-info-strong");
    await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe(resolvedBackground(button, "--color-surface-info-strong-hover")));
    expect(getComputedStyle(button).color).toBe(foreground);
    const expanded = c.getByRole("button", { name: "Expanded solid" }), pending = c.getByRole("button", { name: "Pending solid" });
    expect(getComputedStyle(expanded).backgroundColor).toBe(resolvedBackground(expanded, "--color-surface-info-strong-pressed"));
    expect(getComputedStyle(expanded).color).toBe(foreground);
    const passive = c.getByText("Passive solid").closest<HTMLElement>("[data-status-badge]")!;
    expect(getComputedStyle(pending).backgroundColor).toBe(getComputedStyle(passive).backgroundColor);
    expect(getComputedStyle(pending).color).toBe(getComputedStyle(passive).color);
    expect(pending).toBeDisabled();
    expect(passive.querySelector("button,[tabindex]")).toBeNull();
  },
};
