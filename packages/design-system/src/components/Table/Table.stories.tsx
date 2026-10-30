import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { commentActionName, getTableCopy, TableCellPatterns, TableExample, type TableExampleArgs, type TableExampleState } from "../../storybook/table.story";
import { Table, TableBody, TableCaption, TableCell, TableHeader, TableHeaderCell, TableRow, tableDensities } from "./Table";
import { StatusBadge } from "../StatusBadge/StatusBadge";
import { FilterBarExample } from "../../storybook/filter-bar.story";
import { filterBarCopy } from "../../storybook/filter-bar-content.story";
import { TableBasicRecipes, TableInteractiveRecipes, TableRichRecipes } from "../../storybook/table-recipes.story";

type Args = TableExampleArgs & { state: TableExampleState };
const meta = {
  id: "data-table",
  title: "Components/Collections/Table",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["density", "rowHighlight", "selection", "editableComments"] },
    docs: { description: { component: "[Table toolbar and states composition in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8940-2230)" } },
  },
  args: { density: "compact", rowHighlight: true, selection: true, editableComments: true, state: "loading" },
  argTypes: {
    density: { control: "inline-radio", options: tableDensities, description: "Cell spacing. The parent controls the available width." },
    rowHighlight: { control: "boolean", description: "Compose TableRow highlightOnHover. The row remains a native row; links and buttons perform actions." },
    selection: { control: "boolean", description: "Demo composition: existing Checkbox with selection owned by the consumer." },
    editableComments: { control: "boolean", description: "Demo composition: public InlineEdit owns ordinary text, the ghost Add action and editing controls." },
    state: { control: "inline-radio", options: ["loading", "empty", "error"], description: "Demo composition: loading, empty or retryable error content spanning the columns." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Table" width="wide" description="Native table structure. Existing components supply cell content and actions; the consumer owns sorting, selection and editing.">
    <TableExample {...args} state="data" profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

async function checkStructure(canvasElement: HTMLElement) {
  const table = within(canvasElement).getByRole("table");
  const region = canvasElement.querySelector<HTMLElement>("[data-table-scroll]")!;
  await expect(getComputedStyle(region).borderRadius).toBe("12px");
  await expect(getComputedStyle(region).overflowX).toBe("auto");
  await expect(table.tagName).toBe("TABLE");
  await expect(region).toHaveAttribute("tabindex", "0");
  await expect(table).toHaveAccessibleName();
  await expect(region).toHaveAccessibleName();
  await expect(table.querySelector('[role="grid"], tr[tabindex], tr[role="button"]')).toBeNull();
  await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  for (const cell of table.querySelectorAll("thead th")) await expect(cell).toHaveAttribute("scope", "col");
  await expect(region.scrollWidth).toBeGreaterThanOrEqual(region.clientWidth);
  for (const cell of table.querySelectorAll('[data-numeric="true"]')) await expect(getComputedStyle(cell).fontVariantNumeric).toBe("tabular-nums");
}

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Compact data table in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-18213",
    },
    docs: { description: { story: "[Table master in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8876-128)" } },
  },
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const ComfortableData: Story = {
  name: "Comfortable data",
  tags: ["context-matrix"],
  args: { density: "comfortable" },
  parameters: { figma: { label: "Comfortable data table in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-18651" } },
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const WithFilters: Story = {
  name: "With filters",
  tags: ["context-matrix"],
  parameters: {
    controls: { include: ["density"] },
    figma: { label: "Table with applied filters in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-2685" },
  },
  render: (args, { globals }) => <FilterBarExample density={args.density} initialFilters selection profile={globals.storyContentProfile} />,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const VisibleSelectionRegression: Story = {
  name: "Visible selection regression",
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: (args, { globals }) => <FilterBarExample density={args.density} initialFilters selection profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const header = canvas.getByRole("checkbox", { name: copy.selectVisible }) as HTMLInputElement;
    const records = () => [...canvasElement.querySelectorAll<HTMLElement>("tbody [data-record-id]")];
    await expect(records()).toHaveLength(2);
    await userEvent.click(within(records()[0]).getByRole("checkbox"));
    await expect(header.indeterminate).toBe(true);
    const openSearch = async () => {
      const direct = canvas.queryByRole("button", { name: copy.search });
      if (direct) await userEvent.click(direct);
      else {
        await userEvent.click(canvas.getByRole("button", { name: copy.moreActions }));
        await userEvent.click(canvas.getByRole("menuitem", { name: copy.search }));
      }
      return canvas.getByRole("searchbox", { name: copy.search });
    };
    let search = await openSearch();
    await userEvent.type(search, copy.lang === "en" ? "photography" : "Fotografias");
    await waitFor(() => expect(records()).toHaveLength(1));
    await expect(records()[0]).toHaveAttribute("data-record-id", "SA-101");
    await expect(header).not.toBeChecked();
    await userEvent.click(header);
    await expect(header).toBeChecked();
    search = await openSearch();
    await userEvent.clear(search);
    await waitFor(() => expect(records()).toHaveLength(2));
    await expect(header).toBeChecked();
    await userEvent.type(search, copy.lang === "en" ? "Seasonal" : "sazonal");
    await waitFor(() => expect(records()).toHaveLength(1));
    await expect(records()[0]).toHaveAttribute("data-record-id", "SA-103");
    await userEvent.click(header);
    await expect(header).not.toBeChecked();
    search = await openSearch();
    await userEvent.clear(search);
    await waitFor(() => expect(records()).toHaveLength(2));
    await expect(header.indeterminate).toBe(true);
    header.focus();
    await userEvent.keyboard(" ");
    await expect(header).toBeChecked();
    await checkStructure(canvasElement);
  },
};
export const CellPatterns: Story = {
  name: "Cell patterns",
  tags: ["context-matrix"],
  parameters: {
    controls: { include: ["density"] },
    figma: { label: "Basic Table cells in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8886-222" },
    docs: { description: { story: "[ProgressBar component in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8988-62)" } },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Table cell patterns" description="Plain and stacked text, real contact links, localized numbers, missing values and the public ProgressBar. Status, avatar, primary link, selection and actions are in Playground." width="wide">
    <TableCellPatterns density={args.density} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    const bars = within(canvasElement).getAllByRole("progressbar", { name: copy.steps });
    await expect(bars).toHaveLength(2);
    for (const [index, bar] of bars.entries()) {
      await expect(bar.tagName).toBe("PROGRESS");
      await expect(bar).toHaveAttribute("max", "5");
      await expect(bar).toHaveAttribute("value", index === 0 ? "3" : "0");
      await expect(bar).toHaveAttribute("aria-valuetext", `${index === 0 ? 3 : 0} ${copy.of} 5`);
    }
  },
};
export const HeaderAndBasicRecipes: Story = {
  name: "Header & basic recipes",
  tags: ["context-matrix"],
  parameters: { controls: { include: ["density"] }, figma: { label: "T1/T2 Table catalogue in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9569-3" } },
  render: (args, { globals }) => <FoundationStoryPage title="Table header & basic cells" width="wide" description="Start, center and end alignment; column menu, settings and information; icon-only and icon-plus-text actions.">
    <TableBasicRecipes density={args.density} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const HeaderBasicRegression: Story = {
  ...HeaderAndBasicRecipes,
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals, args }) => {
    await checkStructure(canvasElement);
    const canvas = within(canvasElement), copy = getTableCopy(globals.storyContentProfile), pt = copy.lang !== "en";
    const header = canvas.getByRole("columnheader", { name: new RegExp(`^${copy.name}(?:\\s|$)`) });
    const sort = within(header).getByRole("button", { name: pt ? "Nome: Ordenar por nome" : "Name: Sort by name" });
    const help = within(header).getByRole("button", { name: `${copy.name}: ${pt ? "Informações da coluna" : "Column information"}` });
    sort.focus(); await userEvent.keyboard("{Enter}");
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await expect(canvasElement.querySelector("tbody tr")).toHaveAttribute("data-record-id", "SA-103");
    await userEvent.click(help);
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    const menuLabel = pt ? "Opções da coluna Nome" : "Name column options", menuTrigger = canvas.getByRole("button", { name: menuLabel });
    await userEvent.click(menuTrigger);
    await expect(canvas.getByRole("menu", { name: menuLabel })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(canvasElement.querySelector("tbody tr")).toHaveAttribute("data-record-id", "SA-102");
    await expect(menuTrigger).toHaveFocus();
    const statusHelp = canvas.getByRole("button", { name: `Status: ${pt ? "Informações da coluna" : "Column information"}` });
    await userEvent.click(statusHelp);
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(canvas.getByRole("status")).toHaveTextContent(pt ? "Informações da coluna" : "Column information");

    const inset = args.density === "comfortable" ? 21 : 17;
    const sortLabel = within(sort).getByText(copy.name), firstRow = canvasElement.querySelector("tbody tr")!;
    const nameCell = firstRow.querySelector<HTMLElement>('[scope="row"]')!, nameText = nameCell.querySelector("p")!;
    await expect(sortLabel.getBoundingClientRect().left - header.getBoundingClientRect().left).toBeCloseTo(inset, 0);
    await expect(nameText.getBoundingClientRect().left - nameCell.getBoundingClientRect().left).toBeCloseTo(inset, 0);
    const action = within(firstRow as HTMLElement).getByRole("button", { name: copy.view }), actionCell = action.closest("td")!;
    await expect(within(action).getByText(copy.view).getBoundingClientRect().left - actionCell.getBoundingClientRect().left).toBeCloseTo(inset, 0);
    await expect(getComputedStyle(actionCell).paddingInlineStart).toBe("4px");
    const naturalMinimum = args.density === "comfortable" ? 44 : 38;
    await expect(firstRow.getBoundingClientRect().height).toBeGreaterThanOrEqual(naturalMinimum);
    if (String(globals.storyContentProfile) === "en-short") await expect(firstRow.getBoundingClientRect().height).toBeCloseTo(naturalMinimum, 0);
    await expect(help.getBoundingClientRect().left - sort.getBoundingClientRect().right).toBeCloseTo(4, 0);
    const sortIcons = sort.querySelectorAll("[data-icon-name]"), helpIcon = help.querySelector("[data-icon-name]")!;
    await expect(helpIcon.getBoundingClientRect().left - sortIcons[sortIcons.length - 1].getBoundingClientRect().right).toBeCloseTo(11, 0);
    const statusHeader = statusHelp.closest("th")!, statusLabel = within(statusHeader).getByText("Status");
    await expect(statusHelp.querySelector("[data-icon-name]")!.getBoundingClientRect().left - statusLabel.getBoundingClientRect().right).toBeCloseTo(10, 0);
    await expect(getComputedStyle(header).borderBottomWidth).toBe("1px");
    await expect(getComputedStyle(nameCell).borderTopWidth).toBe("0px");
  },
};
export const ComfortableHeaderRegression: Story = { ...HeaderBasicRegression, tags: ["context-matrix", "!dev", "!autodocs"], args: { density: "comfortable" } };
export const InteractiveCells: Story = {
  name: "Interactive cells",
  tags: ["context-matrix"],
  parameters: { controls: { include: ["density"] }, figma: { label: "T2 interactive Table cells in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8886-222" } },
  render: (args, { globals }) => <FoundationStoryPage title="Table interactive cells" width="wide" description="Header and row selection, Select and Combobox values, plus one or two independent icon actions.">
    <TableInteractiveRecipes density={args.density} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const InteractiveCellsRegression: Story = {
  ...InteractiveCells,
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    const canvas = within(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    const header = canvas.getByRole("checkbox", { name: copy.selectVisible }) as HTMLInputElement;
    await userEvent.click(within(canvasElement.querySelector('[data-record-id="SA-104"]') as HTMLElement).getByRole("checkbox"));
    await expect(header.indeterminate).toBe(true);
    await userEvent.click(header);
    await expect(header).toBeChecked();
    const status = canvas.getByRole("combobox", { name: `${copy.status}: ${copy.names[0]}` });
    status.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(status).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("listbox", { name: `${copy.status}: ${copy.names[0]}` })).toHaveFocus();
    await userEvent.keyboard("{End}{Enter}");
    await expect(status).toHaveTextContent(copy.statuses[2]);
    await expect(status).toHaveFocus();
    const owner = canvas.getByRole("combobox", { name: `${copy.owner}: ${copy.names[0]}` });
    await userEvent.click(owner);
    await userEvent.click(canvas.getByRole("option", { name: "João Santos" }));
    await expect(owner).toHaveValue("João Santos");
    await expect(owner).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: `${copy.lang !== "en" ? "Editar" : "Edit"}: ${copy.names[0]}` }));
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.names[0]);
  },
};
export const RichCells: Story = {
  name: "Rich cells",
  tags: ["context-matrix"],
  parameters: { controls: { include: ["density"] }, figma: { label: "T3 rich Table cells in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8923-1818" } },
  render: (args, { globals }) => <FoundationStoryPage title="Table rich cells" width="wide" description="Avatar, StatusBadge and passive Tag alongside a selectable Chip.">
    <TableRichRecipes density={args.density} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const RichCellsRegression: Story = {
  ...RichCells,
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    const canvas = within(canvasElement);
    const chip = canvas.getAllByRole("button", { name: getTableCopy(globals.storyContentProfile).lang !== "en" ? "Em destaque" : "Featured" })[0];
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(chip);
    await expect(chip).toHaveAttribute("aria-pressed", "false");
  },
};
export const States: Story = {
  tags: ["context-matrix"],
  parameters: {
    controls: { include: ["density", "state"] },
    figma: { label: "Loading table in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-19084" },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Table states" description="Keep the native headers and caption while loading, empty, or unable to load. Change the state using Controls." width="wide">
    <TableExample key={args.state} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const Empty: Story = {
  ...States,
  args: { state: "empty" },
  parameters: { ...States.parameters, figma: { label: "Empty table in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-19224" } },
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    await expect(within(canvasElement).getByRole("status")).toHaveTextContent(getTableCopy(globals.storyContentProfile).empty);
  },
};
export const ErrorRetry: Story = {
  ...States,
  name: "Error & retry",
  args: { state: "error" },
  parameters: { ...States.parameters, figma: { label: "Error and retry in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-19360" } },
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    const canvas = within(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    await expect(canvas.getByRole("alert")).toHaveTextContent(copy.error);
    await expect(canvas.getByRole("button", { name: copy.retry })).toBeVisible();
  },
};
export const NarrowLong: Story = {
  name: "Narrow · long copy",
  tags: ["context-matrix"],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    figma: { label: "Narrow long-copy table in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-19505" },
  },
  render: args => <FoundationStoryPage title="Table · narrow long copy" width="wide" description="Long Portuguese content in a constrained viewport; columns remain scrollable.">
    <TableExample {...args} state="data" profile="pt-long" />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const InteractionRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    await checkStructure(canvasElement);
    const firstRow = () => canvasElement.querySelector<HTMLTableRowElement>('[data-record-id="SA-104"]')!;
    const checkbox = within(firstRow()).getByRole("checkbox");
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect((canvas.getByRole("checkbox", { name: copy.selectVisible }) as HTMLInputElement).indeterminate).toBe(true);
    const sort = canvas.getByRole("button", { name: copy.sort });
    await userEvent.click(sort);
    await expect(sort.closest("th")).toHaveAttribute("aria-sort", "ascending");
    await expect(canvasElement.querySelector("tbody tr")).toHaveAttribute("data-record-id", "SA-102");
    await expect(checkbox).toBeChecked();
    await userEvent.click(sort);
    await expect(sort.closest("th")).toHaveAttribute("aria-sort", "descending");
    await userEvent.click(sort);
    await expect(sort.closest("th")).toHaveAttribute("aria-sort", "none");

    const editName = (name: string) => name.startsWith(`${copy.edit}: ${copy.names[0]}. `);
    const edit = canvas.getByRole("button", { name: editName });
    await userEvent.unhover(edit);
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      await waitFor(() => expect(getComputedStyle(edit.closest('[data-comment]')!.querySelector('[data-icon-name="controls/edit"]')!).opacity).toBe("0"));
      // CSS hover is verified with a real pointer; userEvent.hover dispatches synthetic events.
    }
    const comment = edit.closest<HTMLElement>("[data-comment]")!;
    const text = comment.querySelector("p")!;
    const before = comment.getBoundingClientRect();
    const textBefore = text.getBoundingClientRect();
    const rowBefore = firstRow().getBoundingClientRect();
    await userEvent.click(edit);
    let input = canvas.getByRole("textbox", { name: `${copy.comment}: ${copy.names[0]}` });
    await expect(input.tagName).toBe("TEXTAREA");
    await expect(input).toHaveAttribute("data-appearance", "soft");
    await expect(input).toHaveAttribute("data-size", "md");
    await expect(comment.getBoundingClientRect().width).toBeCloseTo(before.width, 1);
    await expect(comment.getBoundingClientRect().height).toBeCloseTo(before.height, 1);
    await expect(firstRow().getBoundingClientRect().height).toBeCloseTo(rowBefore.height, 1);
    const field = input.closest<HTMLElement>("[data-auto-size-text]")!;
    const inputCss = getComputedStyle(input);
    await expect(inputCss.fontSize).toBe("16px");
    await expect(inputCss.lineHeight).toBe("24px");
    const tokenProbe = document.createElement("span");
    tokenProbe.style.borderRadius = "var(--radius-ui-md)";
    field.append(tokenProbe);
    await expect(getComputedStyle(field, "::before").borderRadius).toBe(getComputedStyle(tokenProbe).borderRadius);
    tokenProbe.remove();
    await expect(input.getBoundingClientRect().left + parseFloat(inputCss.paddingLeft) - comment.getBoundingClientRect().left).toBeCloseTo(textBefore.left - before.left, 1);
    await expect(input.getBoundingClientRect().top + parseFloat(inputCss.paddingTop) - comment.getBoundingClientRect().top).toBeCloseTo(textBefore.top - before.top, 1);
    await userEvent.clear(input);
    await userEvent.type(input, "Discard this draft");
    await userEvent.click(canvas.getByRole("button", { name: copy.cancel }));
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await expect(canvas.getByRole("button", { name: editName })).toHaveAccessibleName(commentActionName(copy.comments[0], copy.names[0], copy));
    await expect(canvas.getByRole("button", { name: editName })).toHaveFocus();
    await userEvent.keyboard("{F2}");
    input = canvas.getByRole("textbox");
    await userEvent.clear(input);
    await userEvent.type(input, "Updated comment{Enter}Second line");
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await expect(canvas.getByRole("button", { name: editName })).toHaveAccessibleName(commentActionName("Updated comment\nSecond line", copy.names[0], copy));
    await userEvent.click(sort);
    await expect(within(firstRow()).getByRole("button", { name: editName })).toHaveAccessibleName(commentActionName("Updated comment\nSecond line", copy.names[0], copy));
    const emptyTrigger = canvas.getByRole("button", { name: `${copy.add}: ${copy.names[2]}` });
    const emptyRoot = emptyTrigger.closest<HTMLElement>("[data-comment]")!;
    const emptyBefore = emptyRoot.getBoundingClientRect();
    await userEvent.click(emptyTrigger);
    await expect(emptyRoot.getBoundingClientRect().width).toBeCloseTo(emptyBefore.width, 1);
    await expect(emptyRoot.getBoundingClientRect().height).toBeCloseTo(emptyBefore.height, 1);
    await userEvent.click(canvas.getByRole("button", { name: copy.cancel }));
    await expect(emptyTrigger).toHaveFocus();
    await userEvent.click(emptyTrigger);
    await userEvent.type(canvas.getByRole("textbox"), "New comment");
    await userEvent.keyboard("{Control>}{Enter}{/Control}");
    await expect(canvas.getByRole("button", { name: commentActionName("New comment", copy.names[2], copy) })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: commentActionName("New comment", copy.names[2], copy) }));
    await userEvent.click(canvas.getByRole("button", { name: copy.clear }));
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await expect(canvas.getByRole("button", { name: `${copy.add}: ${copy.names[2]}` })).toBeVisible();
    const hash = window.location.hash;
    await userEvent.click(within(firstRow()).getByRole("button", { name: `${copy.view}: ${copy.names[0]}` }));
    await expect(window.location.hash).toBe(hash);
    await expect(canvas.getByRole("button", { name: copy.close })).toBeVisible();
    await expect(within(firstRow()).getByRole("link")).toHaveAttribute("href");
    await checkStructure(canvasElement);
  },
};
export const SaveFailureRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: (args, { globals }) => <FoundationStoryPage title="Comment recovery" description="An unsuccessful save preserves the draft for retry or cancellation." width="wide">
    <TableExample {...args} state="data" profile={globals.storyContentProfile} rejectCommit />
  </FoundationStoryPage>,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: commentActionName(copy.comments[0], copy.names[0], copy) }));
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "Recovery draft");
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(copy.failed);
    await expect(canvas.getByRole("textbox")).toHaveValue("Recovery draft");
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("textbox")).toBeNull();
    await expect(canvas.getByRole("button", { name: commentActionName(copy.comments[0], copy.names[0], copy) })).toBeVisible();
  },
};
export const SaveFailure: Story = {
  ...SaveFailureRegression,
  name: "Save failure",
  tags: ["context-matrix"],
  parameters: { figma: { label: "Table save failure in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-19937" } },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: commentActionName(copy.comments[0], copy.names[0], copy) }));
    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "Recovery draft");
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(copy.failed);
    await expect(canvas.getByRole("textbox")).toHaveValue("Recovery draft");
  },
};
export const RetryRegression: Story = {
  ...States,
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { state: "error" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = getTableCopy(globals.storyContentProfile);
    await expect(canvas.getByRole("alert")).toHaveTextContent(copy.error);
    await userEvent.click(canvas.getByRole("button", { name: copy.retry }));
    await expect(canvas.queryByRole("alert")).toBeNull();
    await expect(canvas.getAllByRole("checkbox")).toHaveLength(4);
  },
};

export const HighlightContrastRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: args => <FoundationStoryPage title="Table status contrast" description="Existing soft statuses remain readable on the row emphasis surface." width="wide">
    <Table density={args.density} aria-label="Status contrast">
      <TableCaption>Status contrast</TableCaption>
      <TableHeader><TableRow><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHeader>
      <TableBody>{(["neutral", "info", "success", "warning", "destructive"] as const).map(intent => <TableRow key={intent} selected highlightOnHover><TableCell><StatusBadge variant="soft" size="sm" label={intent} intent={intent} icon="general/info-filled" /></TableCell></TableRow>)}</TableBody>
    </Table>
  </FoundationStoryPage>,
};

export const ComfortableInteractiveCellsRegression: Story = { ...InteractiveCellsRegression, tags: ["context-matrix", "!dev", "!autodocs"], args: { density: "comfortable" } };
export const ComfortableInteractionRegression: Story = { ...InteractionRegression, tags: ["context-matrix", "!dev", "!autodocs"], args: { density: "comfortable" } };
export const ComfortableSaveFailureRegression: Story = { ...SaveFailureRegression, tags: ["context-matrix", "!dev", "!autodocs"], args: { density: "comfortable" } };
