import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import {
  FoundationStoryPage,
  FoundationStorySection,
  FoundationSpecimenGrid,
} from "../../foundations/FoundationStoryLayout";
import { controlSizes } from "../control-size";
import { Button } from "../Button/Button";
import { List } from "../List/List";
import { Surface } from "../Surface/Surface";
import { Text } from "../Text/Text";
import { ListItem } from "./ListItem";

const meta = {
  id: "data-listitem",
  title: "Components/Collections/ListItem",
  component: ListItem,
  tags: ["test"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: {
      control: "select",
      options: controlSizes.filter((size) => size !== "xl"),
    },
    label: { control: "text" },
    description: { control: "text" },
    selected: { control: "boolean" },
    leading: { control: false },
    trailing: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof ListItem>;
export default meta;
type Story = StoryObj<typeof meta>;

function StateRows({ portuguese }: { portuguese: boolean }) {
  const [pressed, setPressed] = useState(false);
  const copy = portuguese
    ? {
        passive: "Preferências de entrega e notificações da equipa",
        child: "Abrir detalhes",
        implicit: "Apresentação selecionada sem marca explícita",
        explicit: "Apresentação selecionada com marca",
      }
    : {
        passive: "Delivery preferences and team notifications",
        child: "Open details",
        implicit: "Selected presentation without an explicit mark",
        explicit: "Selected presentation with a mark",
      };
  const toggle = () => setPressed((value) => !value);
  return (
    <List lang={portuguese ? "pt-BR" : "en"}>
      <ListItem data-case="passive" size="sm" label={copy.passive} />
      <ListItem
        data-case="nested"
        size="sm"
        label={<Button size="sm" intent="neutral" variant="ghost" aria-pressed={pressed} onClick={toggle}>{copy.child}</Button>}
      />
      <ListItem data-case="implicit" size="sm" label={copy.implicit} selected />
      <ListItem
        data-case="explicit"
        size="sm"
        label={copy.explicit}
        leading={{ selectionMark: true }}
        selected
      />
    </List>
  );
}

export const States: Story = {
  tags: ["context-matrix"],
  render: (_, { globals }) => (
    <FoundationStoryPage
      title="ListItem states"
      description="Passive content stays passive; selected content keeps a visible shape cue."
    >
      <Surface>
        <StateRows portuguese={globals.storyContentProfile === "pt-long"} />
      </Surface>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    const row = (name: string) => canvasElement.querySelector<HTMLElement>(`[data-case="${name}"]`)!;
    const passive = row("passive");
    const nested = row("nested");
    const implicit = row("implicit");
    const explicit = row("explicit");
    await expect(passive).not.toHaveAttribute("tabindex");
    await expect(implicit).toHaveAttribute("data-selected", "true");
    await expect(implicit).not.toHaveAttribute("data-has-selection-mark");
    await expect(explicit).toHaveAttribute("data-has-selection-mark", "true");
    await expect(getComputedStyle(implicit, "::before").width).toBe("2px");
    await expect(implicit.scrollWidth).toBeLessThanOrEqual(implicit.clientWidth);

    if (import.meta.env.MODE === "test") {
      const { cdp } = await import("vitest/browser");
      const session = cdp();
      const moveTo = async (element: HTMLElement) => {
        element.scrollIntoView({ block: "center" });
        const rect = element.getBoundingClientRect();
        const frame = window.frameElement?.getBoundingClientRect();
        const scale = frame ? frame.width / innerWidth : 1;
        await session.send("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: (rect.left + rect.width / 2) * scale + (frame?.left ?? 0),
          y: (rect.top + rect.height / 2) * scale + (frame?.top ?? 0),
        });
      };
      await moveTo(passive);
      await expect(getComputedStyle(passive).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      const child = nested.querySelector<HTMLElement>("button")!;
      await moveTo(child);
      await expect(getComputedStyle(nested).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      await expect(getComputedStyle(child).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");

      const original = [
        { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
        { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
        { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
      ];
      try {
        await session.send("Emulation.setEmulatedMedia", {
          features: original.map((feature) => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature),
        });
        await expect(matchMedia("(forced-colors: active)").matches).toBe(true);
        await expect(getComputedStyle(implicit, "::before").width).toBe("2px");
        await expect(getComputedStyle(implicit, "::before").backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
        await expect(explicit.querySelector('[data-icon-name="general/check"]')).toBeVisible();
      } finally {
        await session.send("Emulation.setEmulatedMedia", { features: original });
      }
    }

    const child = nested.querySelector("button")!;
    child.focus();
    await expect(child).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(child).toHaveAttribute("aria-pressed", "true");
    await expect(nested).not.toHaveAttribute("tabindex");
  },
};

export const Neutral: Story = {
  render: () => (
    <FoundationStoryPage
      title="ListItem"
      description="General list content retains its own semantics."
    >
      <Surface>
        <List>
          <ListItem>
            <Text as="span" variant="label-base">
              Customer request
            </Text>
            <Text variant="body-sm">
              A non-interactive item has no hover or fake click target.
            </Text>
          </ListItem>
        </List>
      </Surface>
    </FoundationStoryPage>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("listitem")).toBeVisible();
    await expect(canvas.queryByRole("button")).toBeNull();
    await expect(canvas.queryByRole("link")).toBeNull();
  },
};

export const Playground: Story = {
  parameters: {
    figma: {
      label: "ListItem in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8837-133",
    },
  },
  args: {
    label: "Move to workspace",
    size: "md",
    leading: { icon: "general/coffee" },
    trailing: { keyboardShortcut: "⌘ ⇧ M", icon: "arrows/compact/right" },
  },
  render: (args) => (
    <FoundationStoryPage
      title="ListItem anatomy"
      description="Size controls the row, icon lane and typography independently from its container."
    >
      <Surface>
        <List>
          <ListItem {...args} />
        </List>
      </Surface>
    </FoundationStoryPage>
  ),
  play: async ({ canvas }) => {
    const row = canvas.getByRole("listitem");
    await expect(row.querySelector("kbd")).toBeVisible();
    await expect(row).not.toHaveAttribute("tabindex");
    const key = row.querySelector("kbd")!.getBoundingClientRect();
    const text = row
      .querySelector("[class*='copy'] > span")!
      .getBoundingClientRect();
    await expect(key.height).toBe(16);
    await expect(Math.abs((key.y + key.height / 2) - (text.y + text.height / 2))).toBeLessThan(0.1);
  },
};

export const Anatomy: Story = {
  args: { size: "md", label: "List item" },
  render: ({ size = "md" }) => (
    <FoundationStoryPage
      title="List row anatomy"
      width="wide"
      description="Reserved icon lanes, descriptions and structured trailing content. Native Checkbox keeps its 44 px target, including in smaller rows."
    >
      <FoundationSpecimenGrid minItemWidth="wide">
        <FoundationStorySection title="Leading">
          <Surface>
            <List>
              <ListItem
                size={size}
                label="Kitchen operations"
                leading={{ icon: "general/coffee" }}
                trailing={{ icon: "arrows/compact/right" }}
              />
              <ListItem
                size={size}
                label="Low stock alerts"
                description="18 ingredients below threshold"
                leading={{
                  checkbox: {
                    defaultChecked: true,
                    name: "alerts",
                    value: "stock",
                  },
                }}
                trailing={{ annotation: "18" }}
              />
              <ListItem
                size={size}
                label="Delivery exceptions"
                leading={{ checkbox: { name: "alerts", value: "delivery" } }}
                trailing={{ annotation: "New" }}
              />
            </List>
          </Surface>
        </FoundationStorySection>
        <FoundationStorySection title="Reserved selection marks">
          <Surface>
            <List>
              <ListItem
                size={size}
                label="Compact presentation"
                leading={{ selectionMark: false }}
              />
              <ListItem
                size={size}
                label="Comfortable presentation"
                description="Supporting content grows below the primary line."
                leading={{ selectionMark: true }}
                selected
                aria-current="true"
              />
              <ListItem
                size={size}
                label="Automatic presentation"
                leading={{ reserved: true }}
              />
            </List>
          </Surface>
        </FoundationStorySection>
        <FoundationStorySection title="Trailing">
          <Surface>
            <List>
              <ListItem
                size={size}
                label="Status annotation"
                trailing={{ annotation: "Ready" }}
              />
              <ListItem
                size={size}
                label="Open command palette"
                trailing={{ keyboardShortcut: "⌘ K" }}
              />
              <ListItem
                size={size}
                label="Current workspace"
                trailing={{ selectionMark: true }}
                aria-current="true"
              />
              <ListItem
                size={size}
                label="Move to workspace"
                trailing={{
                  keyboardShortcut: "⌘ ⇧ M",
                  icon: "arrows/compact/right",
                }}
              />
            </List>
          </Surface>
        </FoundationStorySection>
        <FoundationStorySection title="No leading lane">
          <Surface>
            <List>
              <ListItem size={size} label="Plain one-line item" />
              <ListItem
                lang="pt-BR"
                size={size}
                label="Preferências de entrega e notificações da equipa"
                description="Informações adicionais permanecem abaixo do nome, sem deslocar os indicadores da primeira linha."
              />
              <ListItem
                size={size}
                label="Trailing indicator"
                trailing={{ icon: "arrows/compact/right" }}
              />
            </List>
          </Surface>
        </FoundationStorySection>
      </FoundationSpecimenGrid>
    </FoundationStoryPage>
  ),
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole("checkbox", {
      name: "Delivery exceptions",
    });
    await expect(checkbox).not.toBeChecked();
    await userEvent.click(canvas.getByText("Delivery exceptions"));
    await expect(checkbox).toBeChecked();
    await expect(
      checkbox.getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
    const a = canvas.getByText("Compact presentation").getBoundingClientRect();
    const b = canvas
      .getByText("Automatic presentation")
      .getBoundingClientRect();
    await expect(Math.abs(a.x - b.x)).toBeLessThan(0.1);
    const mark = canvas.getByText("Comfortable presentation").closest("li")!;
    await expect(mark).toHaveAttribute("aria-current", "true");
    const arrowRow = canvas.getByText("Kitchen operations").closest("li")!;
    const rowStyle = getComputedStyle(arrowRow);
    const expectedRadius = { sm: "4px", md: "6px", lg: "8px" }[arrowRow.dataset.size as "sm" | "md" | "lg"];
    await expect(rowStyle.borderTopLeftRadius).toBe(expectedRadius);
    await expect(rowStyle.borderBottomRightRadius).toBe(expectedRadius);
    const shortcutRow = canvas.getByText("Open command palette").closest("li")!;
    await expect(shortcutRow.querySelector("kbd")!.getBoundingClientRect().height).toBe(16);
    if (shortcutRow.dataset.size === "sm") {
      const separatorWidth = parseFloat(getComputedStyle(shortcutRow).borderTopWidth);
      await expect(shortcutRow.getBoundingClientRect().height).toBe(28 + separatorWidth);
    }
    await expect(rowStyle.getPropertyValue("corner-shape")).not.toBe("superellipse(2)");
    const rowRect = arrowRow.getBoundingClientRect();
    const arrow = arrowRow.querySelector('[data-icon-name="arrows/compact/right"]')!;
    const arrowRect = arrow.getBoundingClientRect();
    const top = arrowRect.top - rowRect.top - parseFloat(rowStyle.borderTopWidth);
    const bottom = rowRect.bottom - arrowRect.bottom - parseFloat(rowStyle.borderBottomWidth);
    const end = rowRect.right - arrowRect.right - parseFloat(rowStyle.borderRightWidth);
    await expect(Math.abs(top - end)).toBeLessThan(0.1);
    await expect(Math.abs(bottom - end)).toBeLessThan(0.1);
    await expect(arrow).toHaveAttribute("data-tone", "secondary");
  },
};

export const Small: Story = {
  ...Anatomy,
  args: { label: "List item", size: "sm" },
};

export const Large: Story = {
  ...Anatomy,
  args: { label: "List item", size: "lg" },
};
