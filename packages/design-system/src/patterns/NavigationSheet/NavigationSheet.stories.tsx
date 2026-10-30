import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { Button, Chip, List, ListItem, TextInput } from "../../components";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { NavigationSheet } from "./NavigationSheet";
import styles from "./NavigationSheet.stories.module.css";

type Args = { entry: "root" | "nested"; longTitle: boolean };
function copy(profile: unknown) {
  return String(profile).startsWith("pt") ? {
    open: "Abrir campos", title: "Adicionar campo personalizado", tags: "Tags", text: "Texto", back: "Voltar", close: "Fechar", search: "Pesquisar tags", label: "Texto do campo", long: "Adicionar campos personalizados e informações adicionais",
  } : {
    open: "Open fields", title: "Add custom field", tags: "Tags", text: "Text", back: "Back", close: "Close", search: "Search tags", label: "Field text", long: "Add custom fields and additional information",
  };
}
function Example({ entry, longTitle, profile }: Args & { profile: unknown }) {
  const m = copy(profile), [open, setOpen] = useState(false), [level, setLevel] = useState<"tags" | "text" | null>(null);
  const [query, setQuery] = useState(""), [text, setText] = useState(""), [selected, setSelected] = useState<string[]>([]);
  const opener = useRef<HTMLButtonElement>(null), tags = useRef<HTMLButtonElement>(null), textAction = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null), textInput = useRef<HTMLInputElement>(null);
  const values = ["Vegetarian", "Vegan", "Cold", "Orgânico"];
  return <div className={styles.body}>
    <Button ref={opener} variant="secondary" intent="neutral" onClick={() => { setLevel(entry === "nested" ? "tags" : null); setOpen(true); }}>{m.open}</Button>
    <NavigationSheet open={open} onDismiss={() => setOpen(false)} title={longTitle ? m.long : m.title}
      closeLabel={m.close} backLabel={m.back} returnFocusRef={opener} onBack={() => setLevel(null)}
      nested={level ? { id: level, title: level === "tags" ? m.tags : m.text,
        initialFocusRef: level === "tags" ? search : textInput, returnFocusRef: level === "tags" ? tags : textAction,
        children: level === "text" ? <TextInput ref={textInput} size="lg" appearance="soft" aria-label={m.label} value={text} onChange={event => setText(event.target.value)} />
          : <div className={styles.body}>
            {selected.length > 0 ? <div className={styles.chips}>{selected.map(value => <Chip key={value} size="md" behavior="removable" label={value} removeLabel={`${m.close}: ${value}`} onRemove={() => { search.current?.focus(); setSelected(selected.filter(item => item !== value)); }} />)}</div> : null}
            <TextInput ref={search} size="lg" appearance="soft" leadingIcon="general/search" aria-label={m.search} placeholder={m.search} value={query}
              onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === "Enter") event.preventDefault(); }} />
            <List>{values.filter(value => !selected.includes(value) && value.toLocaleLowerCase().includes(query.toLocaleLowerCase())).map(value => <ListItem className={styles.row} key={value}>
              <Button className={styles.action} width="full" size="lg" variant="ghost" intent="neutral" onClick={() => { search.current?.focus(); setSelected([...selected, value]); setQuery(""); }}>{value}</Button>
            </ListItem>)}</List>
          </div> } : undefined}>
      <List>
        <ListItem className={styles.row}><Button ref={tags} className={styles.action} width="full" size="lg" variant="ghost" intent="neutral" trailingIcon="arrows/compact/right" onClick={() => setLevel("tags")}>{m.tags}</Button></ListItem>
        <ListItem className={styles.row}><Button ref={textAction} className={styles.action} width="full" size="lg" variant="ghost" intent="neutral" trailingIcon="arrows/compact/right" onClick={() => setLevel("text")}>{m.text}</Button></ListItem>
      </List>
    </NavigationSheet>
  </div>;
}
const meta = {
  id: "patterns-navigation-sheet", title: "Patterns/NavigationSheet",
  tags: ["context-matrix"], args: { entry: "root", longTitle: false },
  parameters: { layout: "fullscreen", controls: { include: ["entry", "longTitle"] }, figma: {
    label: "NavigationSheet in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9300-26507",
  } },
  argTypes: { entry: { control: "select", options: ["root", "nested"] }, longTitle: { control: "boolean" } },
  render: (args, { globals }) => <FoundationStoryPage title="NavigationSheet" description="One modal with a root and one nested view. The caller retains query, selection and form data."><Example {...args} profile={globals.storyContentProfile} /></FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
async function escape(sheet: HTMLElement) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard("{Escape}"); }
  else fireEvent(sheet, new Event("cancel", { cancelable: true }));
}
const navigation: NonNullable<Story["play"]> = async ({ canvasElement, globals, args }) => {
  const canvas = within(canvasElement), m = copy(globals.storyContentProfile);
  const opener = canvas.getByRole("button", { name: m.open });
  await userEvent.click(opener);
  const sheet = canvas.getByRole("dialog"), content = within(sheet);
  expect(sheet.matches(":modal")).toBe(true);
  if (args.entry === "nested") {
    await expect(content.getByRole("textbox", { name: m.search })).toHaveFocus();
    await escape(sheet); await waitFor(() => expect(opener).toHaveFocus());
    await userEvent.click(opener);
    await userEvent.click(content.getByRole("button", { name: m.back }));
  } else await expect(content.getByRole("heading")).toHaveFocus();
  await userEvent.click(content.getByRole("button", { name: m.tags }));
  const search = content.getByRole("textbox", { name: m.search });
  await expect(search).toHaveFocus();
  await userEvent.click(content.getByRole("button", { name: "Cold" }));
  await expect(search).toHaveFocus();
  await userEvent.type(search, "Vega");
  await escape(sheet);
  await expect(content.getByRole("button", { name: m.tags })).toHaveFocus();
  expect(sheet.matches(":modal")).toBe(true);
  await userEvent.click(content.getByRole("button", { name: m.text }));
  await userEvent.type(content.getByRole("textbox", { name: m.label }), "Retained text");
  await userEvent.click(content.getByRole("button", { name: m.back }));
  await expect(content.getByRole("button", { name: m.text })).toHaveFocus();
  await userEvent.click(content.getByRole("button", { name: m.text }));
  await expect(content.getByRole("textbox", { name: m.label })).toHaveValue("Retained text");
  await userEvent.click(content.getByRole("button", { name: m.back }));
  await userEvent.click(content.getByRole("button", { name: m.tags }));
  await expect(content.getByRole("textbox", { name: m.search })).toHaveValue("Vega");
  await expect(content.getByRole("button", { name: `${m.close}: Cold` })).toBeVisible();
  await userEvent.click(content.getByRole("button", { name: m.close }));
  await waitFor(() => expect(opener).toHaveFocus());
  await userEvent.click(opener);
  await escape(sheet); await waitFor(() => expect(opener).toHaveFocus());
};
const proof = ["context-matrix", "!dev", "!autodocs"];
export const RootAndNested: Story = { tags: proof, play: navigation };
export const DirectEntry: Story = { tags: proof, args: { entry: "nested" }, play: navigation };
export const LongTitle: Story = {
  tags: proof,
  args: { longTitle: true },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement), m = copy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: m.open }));
    const sheet = canvas.getByRole("dialog"), header = sheet.querySelector("header")!;
    await Promise.all(sheet.getAnimations().map(animation => animation.finished.catch(() => {})));
    const title = within(sheet).getByRole("heading"), box = sheet.getBoundingClientRect(), titleBox = title.getBoundingClientRect();
    expect(titleBox.left + titleBox.width / 2).toBeCloseTo(box.left + box.width / 2, 0);
    expect(sheet.scrollWidth).toBeLessThanOrEqual(sheet.clientWidth);
    const close = within(sheet).getByRole("button", { name: m.close });
    const icon = close.querySelector("[data-icon-name]")!;
    const edge = (close.getBoundingClientRect().width + icon.getBoundingClientRect().width) / 2;
    const columns = getComputedStyle(header).gridTemplateColumns.split(" ").map(parseFloat);
    expect(columns[0]).toBe(edge); expect(columns[2]).toBe(edge);
    expect(getComputedStyle(close, "::before").width).toBe("44px");
    expect(titleBox.right).toBeLessThanOrEqual(icon.getBoundingClientRect().left);
    await userEvent.click(within(sheet).getByRole("button", { name: m.close }));
  },
};
