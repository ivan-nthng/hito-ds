import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../Button/Button";
import { Chip } from "../Chip/Chip";
import { List } from "../List/List";
import { ListItem } from "../ListItem/ListItem";
import { TextInput } from "../TextInput/TextInput";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { PickerPanel } from "./PickerPanel";
import styles from "./PickerPanel.stories.module.css";

type Args = { direct: boolean; edge: "start" | "end" };
function Example({ direct, edge }: Args) {
  const [open, setOpen] = useState(false), [nested, setNested] = useState(false);
  const [query, setQuery] = useState(""), [selected, setSelected] = useState<string[]>([]);
  const tags = useRef<HTMLButtonElement>(null), search = useRef<HTMLInputElement>(null);
  const values = ["Vegetarian", "Vegan", "Cold", "Orgânico"];
  const body = <div className={styles.body}>
    <TextInput ref={search} appearance="soft" size="md" leadingIcon="general/search" placeholder="Search tags" aria-label="Search tags" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }} />
    <List>{values.filter(value => !selected.includes(value) && value.toLowerCase().includes(query.toLowerCase())).map(value => <ListItem key={value} className={styles.row}>
      <Button className={styles.action} width="full" size="md" variant="ghost" intent="neutral" onClick={() => { search.current?.focus(); setSelected([...selected, value]); setQuery(""); }}>{value}</Button>
    </ListItem>)}</List>
  </div>;
  return <div className={styles.body}>
    <div className={styles.chips}>{selected.map(value => <Chip behavior="removable" key={value} size="md" label={value} removeLabel={`Remove ${value}`} onRemove={() => setSelected(selected.filter(item => item !== value))} />)}</div>
    <div className={edge === "end" ? styles.end : undefined}>
      <PickerPanel open={open} onOpenChange={next => { setOpen(next); if (!next) setNested(false); }} label={direct ? "Tags" : "Custom fields"}
        initialFocusRef={direct ? search : undefined}
        trigger={<Button variant="secondary" intent="neutral" leadingIcon="controls/plus">{direct ? "Add tag" : "Add custom field"}</Button>}
        subpanel={!direct && nested ? { label: "Tags", anchorRef: tags, initialFocusRef: search, onDismiss: () => setNested(false), children: body } : undefined}>
        {direct ? body : <List>
          <ListItem className={styles.row}><Button className={styles.action} width="full" size="md" variant="ghost" intent="neutral" onClick={() => setOpen(false)}>Allergens and ingredients</Button></ListItem>
          <ListItem className={styles.row}><Button ref={tags} className={styles.action} width="full" size="md" variant="ghost" intent="neutral" trailingIcon="arrows/compact/right" aria-haspopup="dialog" aria-expanded={nested} onClick={() => setNested(true)}>Tags</Button></ListItem>
        </List>}
      </PickerPanel>
    </div>
  </div>;
}
const meta = {
  id: "internal-picker-panel-preview", title: "Internal/PickerPanel Preview",
  tags: ["context-matrix"], args: { direct: false, edge: "start" },
  parameters: { layout: "fullscreen", controls: { include: ["direct", "edge"] } },
  argTypes: { direct: { control: "boolean" }, edge: { control: "select", options: ["start", "end"] } },
  render: args => <FoundationStoryPage title="PickerPanel" description="A headerless panel for caller-owned search and native actions. Selection can remain open."><Example {...args} /></FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
const select: NonNullable<Story["play"]> = async ({ canvasElement, args }) => {
  await document.fonts.ready;
  const canvas = within(canvasElement), opener = canvas.getByRole("button", { name: args.direct ? "Add tag" : "Add custom field" });
  await userEvent.click(opener);
  const parent = canvas.getByRole("dialog", { name: args.direct ? "Tags" : "Custom fields" });
  if (!args.direct) await userEvent.click(within(parent).getByRole("button", { name: "Tags" }));
  const child = canvas.getByRole("dialog", { name: "Tags" }), search = within(child).getByRole("textbox", { name: "Search tags" });
  await expect(search).toHaveFocus();
  if (!args.direct) {
    await waitFor(() => expect(child).toHaveAttribute("data-positioned", "true"));
    await waitFor(() => expect(child.getBoundingClientRect().width).toBeCloseTo(parent.getBoundingClientRect().width, 0));
    const p = parent.getBoundingClientRect(), c = child.getBoundingClientRect(), row = within(parent).getByRole("button", { name: "Tags" }).getBoundingClientRect();
    if (innerWidth >= 800) {
      const inset = parseFloat(getComputedStyle(child).paddingTop);
      expect(child.dataset.side === "left" ? p.left - c.right : c.left - p.right).toBeCloseTo(-inset, 0);
      expect(search.parentElement!.getBoundingClientRect().top).toBeCloseTo(row.top, 0);
    }
    expect(c.left).toBeGreaterThanOrEqual(0); expect(c.right).toBeLessThanOrEqual(innerWidth);
  }
  await userEvent.click(within(child).getByRole("button", { name: "Cold" }));
  await expect(search).toHaveFocus();
  await expect(child).toBeVisible();
  await expect(canvas.getByRole("button", { name: "Remove Cold" })).toBeVisible();
  await userEvent.type(search, "Vega");
  expect(within(child).queryByRole("button", { name: "Orgânico" })).toBeNull();
  await userEvent.keyboard("{Escape}");
  if (!args.direct) {
    await expect(within(parent).getByRole("button", { name: "Tags" })).toHaveFocus();
    await expect(parent).toBeVisible();
    await userEvent.keyboard("{Escape}");
  }
  await waitFor(() => expect(opener).toHaveFocus());
};
const proof = ["context-matrix", "!dev", "!autodocs"];
export const NestedSelection: Story = { tags: proof, play: select };
export const FlippedSelection: Story = { tags: proof, args: { edge: "end" }, play: select };
export const DirectSelection: Story = { tags: proof, args: { direct: true }, play: select };
