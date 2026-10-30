import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { Text } from "../../components/Text/Text";
import storyStyles from "../../components/SearchField/SearchField.stories.module.css";
import { ExpandableSearch } from "./ExpandableSearch";

const meta = {
  id: "patterns-expandable-search",
  title: "Patterns/Search & Filtering/ExpandableSearch",
  component: ExpandableSearch,
  tags: ["test"],
  args: {
    appearance: "outlined",
    collapseVariant: "secondary",
    clearLabel: "Clear search",
    closeLabel: "Close search",
    defaultExpanded: false,
    defaultValue: "",
    disabled: false,
    openLabel: "Open search",
    placeholder: "Search orders",
    size: "md",
    validationState: "none",
    "aria-label": "Search orders",
  },
  parameters: {
    controls: {
      include: [
        "appearance",
        "collapseVariant",
        "defaultExpanded",
        "defaultValue",
        "disabled",
        "placeholder",
        "size",
        "validationState",
      ],
    },
  },
  argTypes: {
    appearance: {
      control: "inline-radio",
      options: ["outlined", "soft", "ghost"],
    },
    collapseVariant: { control: "inline-radio", options: ["secondary", "ghost"] },
    defaultExpanded: { control: "boolean" },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "xl"] },
    validationState: {
      control: "inline-radio",
      options: ["none", "invalid", "success"],
    },
  },
} satisfies Meta<typeof ExpandableSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <main className={storyStyles.page}>
      <div className={storyStyles.measure}>
        <ExpandableSearch {...args} key={String(args.defaultValue)} />
      </div>
    </main>
  ),
};

export const ClearAndCollapse: Story = {
  name: "Clear & collapse",
  args: {
    defaultExpanded: true,
    defaultValue: "Morning orders",
  },
  parameters: { controls: { disable: true } },
  render: (args) => (
    <main className={storyStyles.page}>
      <div className={storyStyles.stack}>
        <Text variant="body-base">
          Clear empties the query; the external secondary button collapses it.
        </Text>
        <ExpandableSearch {...args} />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Search orders" });
    const clear = canvas.getByRole("button", { name: "Clear search" });

    await userEvent.click(clear);
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await userEvent.type(input, "Fresh menu");
    await userEvent.click(canvas.getByRole("button", { name: "Close search" }));
    await expect(
      canvas.getByRole("button", { name: "Open search" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.queryByRole("searchbox", { name: "Search orders" }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "Open search" }));
    await expect(
      canvas.getByRole("searchbox", { name: "Search orders" }),
    ).toHaveValue("Fresh menu");
  },
};

export const NarrowPtGhost: Story = {
  name: "Narrow · PT · ghost",
  args: {
    appearance: "ghost",
    clearLabel: "Limpar pesquisa",
    closeLabel: "Fechar pesquisa",
    defaultExpanded: true,
    defaultValue: "Pedido fresco",
    openLabel: "Abrir pesquisa",
    placeholder: "Pesquisar pedidos",
    "aria-label": "Pesquisar pedidos",
  },
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
  },
  render: (args) => (
    <main className={storyStyles.page} lang="pt-BR">
      <div className={storyStyles.narrow}>
        <ExpandableSearch {...args} />
      </div>
    </main>
  ),
};

export const FocusAndSmallGeometry: Story = {
  name: "Focus & SM geometry",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={storyStyles.page}>
      <div className={storyStyles.stack}>
        <label htmlFor="fixture-search">Search inventory</label>
        <ExpandableSearch
          clearLabel="Clear inventory search"
          closeLabel="Close inventory search"
          id="fixture-search"
          openLabel="Open inventory search"
          placeholder="Search inventory"
          required
          size="sm"
        />
        <ExpandableSearch
          aria-label="Read-only search"
          clearLabel="Clear read-only search"
          closeLabel="Close read-only search"
          defaultExpanded
          defaultValue="Morning"
          openLabel="Open read-only search"
          readOnly
          size="sm"
        />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const readOnly = canvas.getByRole("searchbox", {
      name: "Read-only search",
    });
    await userEvent.click(readOnly);
    await expect(readOnly).toHaveFocus();
    await expect(readOnly).toHaveAttribute("readonly");
    await expect(getComputedStyle(readOnly.parentElement!).outlineStyle).toBe(
      "solid",
    );
    await expect(
      getComputedStyle(readOnly.parentElement!.parentElement!).overflow,
    ).toBe("visible");

    await userEvent.click(canvas.getByText("Search inventory"));
    const input = canvas.getByRole("searchbox", { name: "Search inventory" });
    await expect(input).toHaveFocus();

    const close = canvas.getByRole("button", {
      name: "Close inventory search",
    });
    const field = input.parentElement!;
    await expect(close.getBoundingClientRect().height).toBeCloseTo(
      field.getBoundingClientRect().height,
    );
  },
};

export const CollapsedTabOrder: Story = {
  name: "Collapsed tab order",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={storyStyles.page}>
      <div className={storyStyles.stack}>
        <button type="button">Before search</button>
        <ExpandableSearch
          aria-label="Search orders"
          clearLabel="Clear search"
          closeLabel="Close search"
          defaultValue="Morning"
          openLabel="Open search"
          size="sm"
        />
        <button type="button">After search</button>
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const before = canvas.getByRole("button", { name: "Before search" });
    const after = canvas.getByRole("button", { name: "After search" });

    await userEvent.click(before);
    await userEvent.tab();
    const trigger = canvas.getByRole("button", { name: "Open search" });
    await expect(trigger).toHaveFocus();
    await userEvent.tab();
    await expect(after).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(trigger).toHaveFocus();

    await userEvent.click(trigger);
    const input = canvas.getByRole("searchbox", { name: "Search orders" });
    const clear = canvas.getByRole("button", { name: "Clear search" });
    await expect(input).toHaveFocus();
    await userEvent.tab();
    await expect(clear).toHaveFocus();

    await userEvent.click(input);
    await userEvent.clear(input);
    await userEvent.type(input, "Fresh");
    await userEvent.click(canvas.getByRole("button", { name: "Close search" }));
    const restoredTrigger = canvas.getByRole("button", { name: "Open search" });
    await expect(restoredTrigger).toHaveFocus();
    await userEvent.tab();
    await expect(after).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(restoredTrigger).toHaveFocus();

    await userEvent.click(restoredTrigger);
    await expect(input).toHaveValue("Fresh");
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Clear search" })).toHaveFocus();
  },
};
