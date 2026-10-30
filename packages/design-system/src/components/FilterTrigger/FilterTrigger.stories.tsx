import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage, FoundationStorySection, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { List } from "../List/List";
import { ListItem } from "../ListItem/ListItem";
import { Text } from "../Text/Text";
import { FilterTrigger, type FilterTriggerProps } from "./FilterTrigger";

const cities = ["São Paulo", "Lisbon", "Rio de Janeiro"];
function Example({ explicit = false, ...args }: Partial<FilterTriggerProps> & { explicit?: boolean }) {
  const [value, setValue] = useState(args.value ?? null);
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const commit = (next: string | null) => { setValue(next); setOpen(false); };
  const changeOpen = (next: boolean) => { setDraft(value); setOpen(next); };
  const selected = explicit ? draft : value;
  return <>
    <FilterTrigger addLabel="Add city" label="City:" title="Filter by city" closeLabel="Close filter" {...args} value={value} open={open} onOpenChange={changeOpen}>
      <List>
        {cities.map(city => <ListItem key={city}><Button intent="neutral" variant="ghost" size={args.size} width="full" trailingIcon={selected === city ? "general/check" : undefined} onClick={() => explicit ? setDraft(city) : commit(city)}>{city}</Button></ListItem>)}
        <ListItem><Button intent="neutral" variant="ghost" size={args.size} disabled={!selected} onClick={() => explicit ? setDraft(null) : commit(null)}>Clear filter</Button></ListItem>
        {explicit ? <ListItem><Button intent="neutral" variant="ghost" size={args.size} onClick={() => changeOpen(false)}>Cancel</Button><Button intent="accent" variant="primary" size={args.size} onClick={() => commit(draft)}>Apply</Button></ListItem> : null}
      </List>
    </FilterTrigger>
    <Text as="p" variant="body-sm" role="status">{value ? `Applied: ${value}` : "No filter applied"}</Text>
  </>;
}
const meta = {
  id: "actions-filter-trigger", title: "Components/Actions/FilterTrigger", component: FilterTrigger,
  tags: ["test"], parameters: { layout: "fullscreen" },
  args: { open: false, onOpenChange: fn(), children: null, addLabel: "Add city", label: "City:", title: "Filter by city", closeLabel: "Close filter", size: "md" },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md"] }, children: { control: false }, onOpenChange: { control: false }, open: { control: false }, searchRegion: { control: false } },
  render: args => <FoundationStoryPage title="FilterTrigger" description="Add becomes a filled filter in place. Selection and confirmation belong to the caller."><Example {...args}/></FoundationStoryPage>,
} satisfies Meta<typeof FilterTrigger>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  tags: ["context-matrix"],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByRole("button", { name: "Add city" });
    await userEvent.click(trigger);
    await waitFor(() => expect(c.getByRole("dialog")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Lisbon" }));
    await expect(trigger).toHaveTextContent("City: Lisbon");
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await waitFor(() => expect(c.getByRole("dialog")).toBeVisible());
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveTextContent("City: Lisbon");
    await userEvent.click(trigger);
    await waitFor(() => expect(c.getByRole("dialog")).toBeVisible());
    await userEvent.click(c.getByRole("button", { name: "Clear filter" }));
    await expect(trigger).toHaveTextContent("Add city");
    await expect(trigger).toHaveFocus();
  },
};
export const Small: Story = { ...Playground, args: { size: "sm" } };
export const SizesAndIcons: Story = { render: args => <FoundationStoryPage title="Sizes and icons" description="Neutral soft Button geometry, with an optional leading icon."><FoundationSpecimenGrid>{(["sm", "md"] as const).map(size => <FoundationStorySection key={size} title={size.toUpperCase()}><Example {...args} size={size}/><Example {...args} size={size} value="Lisbon"/><Example {...args} size={size} value="Lisbon" leadingIcon="general/location"/></FoundationStorySection>)}</FoundationSpecimenGrid></FoundationStoryPage> };
export const Disabled: Story = { args: { value: "Lisbon", disabled: true, leadingIcon: "general/location" } };
export const LongCopy: Story = { args: { addLabel: "Adicionar cidade de atendimento", label: "Cidade de atendimento:", value: "São José do Vale do Rio Preto — Região Metropolitana", leadingIcon: "general/location" } };
export const ExplicitApply: Story = {
  render: args => <FoundationStoryPage title="Explicit Apply" description="This composition keeps a temporary choice until Apply. Dismiss discards it."><Example {...args} value="São Paulo" explicit/></FoundationStoryPage>,
  play: async ({canvasElement}) => {
    const c = within(canvasElement); const trigger = c.getByRole("button", {name: "City: São Paulo"});
    await userEvent.click(trigger); await waitFor(() => expect(c.getByRole("dialog")).toBeVisible());
    await userEvent.click(c.getByRole("button", {name:"Lisbon"}));
    await expect(c.getByRole("status")).toHaveTextContent("Applied: São Paulo");
    await userEvent.click(c.getByRole("button", {name:"Cancel"}));
    await expect(trigger).toHaveTextContent("City: São Paulo");
    await userEvent.click(trigger); await waitFor(() => expect(c.getByRole("dialog")).toBeVisible());
    await userEvent.click(c.getByRole("button", {name:"Clear filter"}));
    await userEvent.click(c.getByRole("button", {name:"Apply"}));
    await expect(trigger).toHaveTextContent("Add city");
  },
};
