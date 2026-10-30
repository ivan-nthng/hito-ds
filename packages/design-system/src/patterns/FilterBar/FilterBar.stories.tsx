import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { tableDensities, type TableDensity } from "../../components/Table/Table";
import { FilterBarExample } from "../../storybook/filter-bar.story";
import { filterBarCopy } from "../../storybook/filter-bar-content.story";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";

type Args = { density: TableDensity; initialFilters: boolean; onAction?: (id: "export" | "share") => void };
const meta = {
  id: "patterns-filter-bar",
  title: "Patterns/Search & Filtering/FilterBar",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["density", "initialFilters"] },
    docs: { description: { component: "[FilterBar master in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8940-2312) · [Approved Table interactions](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9648-483) · [Corrected filter search](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9665-1472). Synthetic fields demonstrate caller-owned interactions; product readers define their supported fields." } },
  },
  args: { density: "comfortable", initialFilters: false, onAction: fn() },
  argTypes: {
    density: { control: "inline-radio", options: tableDensities, description: "Table cell spacing on wide screens; narrow screens use compact." },
    initialFilters: { control: "boolean", description: "Start this consumer example with two applied filters." },
    onAction: { control: false, description: "Demo-only Export/Share callback; no transfer or sharing occurs." },
  },
  render: (args, { globals }) => <FilterBarExample key={`${args.initialFilters}:${globals.storyContentProfile}`} {...args} profile={globals.storyContentProfile} />,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

async function toolbarAction(canvasElement: HTMLElement, copy: ReturnType<typeof filterBarCopy>, label: string) {
  const canvas = within(canvasElement);
  const direct = canvas.queryByRole("button", { name: label });
  if (direct) { await userEvent.click(direct); return; }
  await userEvent.click(canvas.getByRole("button", { name: copy.moreActions }));
  await userEvent.click(await canvas.findByRole("menuitem", { name: label }));
}
function narrowMore(canvas: ReturnType<typeof within>, copy: ReturnType<typeof filterBarCopy>) {
  return matchMedia("(max-width: 39.999rem)").matches ? canvas.getByRole("button", { name: copy.moreActions }) : null;
}

async function checkStructure(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await expect(canvas.getByRole("table")).toHaveAccessibleName();
  await expect(canvasElement.querySelector("[data-table-scroll]")).toHaveAttribute("tabindex", "0");
  await expect(canvasElement.querySelectorAll("thead th")).toHaveLength(4);
  await expect(canvasElement.querySelectorAll("thead th[aria-sort]").length).toBeLessThanOrEqual(1);
  await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
}
async function checkFilterAction(canvasElement: HTMLElement, copy: ReturnType<typeof filterBarCopy>, count: number) {
  const canvas = within(canvasElement);
  const bar = canvas.getByRole("region", { name: copy.title });
  const filters = within(bar).queryByRole("button", { name: copy.filters });
  if (narrowMore(canvas, copy)) {
    await expect(filters).toBeNull();
    return;
  }
  await expect(filters).toHaveAttribute("data-size", "sm");
  await expect(filters).toHaveAttribute("title", copy.filters);
  await expect(filters).toHaveAccessibleDescription(`${copy.filters}: ${count}`);
  await expect(filters?.querySelector("[data-icon-name]")).toHaveAttribute("data-icon-name", "controls/filter");
  await expect(filters).toHaveAttribute("data-variant", count ? "soft" : "ghost");
}
export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "FilterBar playground in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-2311" } },
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    await checkFilterAction(canvasElement, filterBarCopy(globals.storyContentProfile), 0);
  },
};
export const AppliedFilters: Story = {
  args: { initialFilters: true },
  tags: ["context-matrix"],
  parameters: { figma: { label: "Applied filters in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-2685" } },
  play: async ({ canvasElement, globals }) => {
    await checkStructure(canvasElement);
    await checkFilterAction(canvasElement, filterBarCopy(globals.storyContentProfile), 2);
    await expect(canvasElement.querySelectorAll("tbody [data-record-id]")).toHaveLength(2);
    await expect(within(canvasElement).getByText(filterBarCopy(globals.storyContentProfile).matchAll)).toBeVisible();
  },
};
export const MultipleSorts: Story = {
  tags: ["context-matrix"],
  parameters: {
    controls: { include: ["density"] },
    figma: { label: "Multiple sorts in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-2996" },
  },
  render: (args, { globals }) => <FilterBarExample {...args} initialFilters={false} initialSorts profile={globals.storyContentProfile} />,
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const MobileActions: Story = {
  name: "Mobile actions",
  args: { initialFilters: true },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    figma: { label: "Mobile actions in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-3581" },
  },
  play: async ({ canvasElement }) => checkStructure(canvasElement),
};
export const NoMatches: Story = {
  name: "No matches",
  tags: ["context-matrix"],
  parameters: { figma: { label: "No matches in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8941-3371" } },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    await toolbarAction(canvasElement, copy, copy.search);
    await userEvent.type(canvas.getByRole("searchbox", { name: copy.search }), "zzzz-no-match");
    await expect(canvasElement.querySelectorAll("tbody [data-record-id]")).toHaveLength(0);
    await expect(canvas.getByText(copy.empty)).toBeVisible();
  },
};
export const MoreActions: Story = {
  name: "More actions",
  tags: ["context-matrix"],
  parameters: { figma: { label: "Table More menu in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8952-6420" } },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.moreActions });
    const tableTop = canvas.getByRole("table").getBoundingClientRect().top;
    await userEvent.click(trigger);
    const menu = canvas.getByRole("menu", { name: copy.moreActions });
    await expect(menu.parentElement).toHaveAttribute("data-size", "sm");
    await expect(menu).toBeVisible();
    await expect(menu.parentElement!.getBoundingClientRect().width).toBeCloseTo(216, 1);
    await expect(Math.abs(menu.parentElement!.getBoundingClientRect().right - trigger.getBoundingClientRect().right)).toBeLessThanOrEqual(1);
    await expect(canvas.getByRole("table").getBoundingClientRect().top).toBeCloseTo(tableTop, 1);
    const labels = within(menu).getAllByRole("menuitem").map(item => item.textContent?.trim());
    await expect(labels).toEqual(narrowMore(canvas, copy)
      ? [copy.search, copy.filters, copy.sort, copy.exportAction, copy.shareAction]
      : [copy.exportAction, copy.shareAction]);
  },
};
export const MoreActionsRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals, args }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.moreActions });
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("heading", { name: copy.title }));
    await expect(canvas.queryByRole("menu")).toBeNull();
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("menuitem", { name: copy.exportAction }));
    await expect(args.onAction).toHaveBeenCalledWith("export");
    await expect(canvas.getByText(copy.exportDemoOnly)).toBeVisible();
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByRole("menuitem", { name: copy.shareAction }));
    await expect(args.onAction).toHaveBeenCalledWith("share");
    await expect(canvas.getByText(copy.shareDemoOnly)).toBeVisible();
    await userEvent.click(trigger);
    await expect(canvas.getByRole("menu", { name: copy.moreActions })).toBeVisible();
  },
};
export const OpenTriggerAppearance: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { initialFilters: true },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const paint = (trigger: HTMLElement) => getComputedStyle(trigger).backgroundColor;
    const more = canvas.getByRole("button", { name: copy.moreActions });
    const moreRest = paint(more);
    const pressed = resolvedBackground(more, "--color-surface-neutral-subtle-pressed");
    await userEvent.click(more);
    await userEvent.hover(canvas.getByRole("menuitem", { name: narrowMore(canvas, copy) ? copy.filters : copy.exportAction }));
    await waitFor(() => expect(paint(more)).toBe(pressed));
    if (narrowMore(canvas, copy)) {
      await userEvent.click(canvas.getByRole("menuitem", { name: copy.filters }));
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await expect(more).toHaveAttribute("data-open", "true");
      await userEvent.hover(canvas.getByRole("searchbox", { name: copy.findFilter }));
      await waitFor(() => expect(paint(more)).toBe(pressed));
      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(more).not.toHaveAttribute("data-open"));
      await waitFor(() => expect(paint(more)).toBe(moreRest));
      return;
    }
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(paint(more), "More returns to its closed paint").toBe(moreRest));

    const filters = canvas.getByRole("button", { name: copy.filters });
    const filterRest = paint(filters); // Applied filter is soft even while closed.
    await expect(filterRest).not.toBe(pressed);
    await userEvent.click(filters);
    await expect(filters).toHaveAttribute("aria-expanded", "true");
    await userEvent.hover(canvas.getByRole("searchbox", { name: copy.findFilter }));
    await waitFor(() => expect(paint(filters)).toBe(pressed));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(filters).toHaveFocus());
    await expect(filters).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(paint(filters)).toBe(filterRest));

    const sorting = canvas.getByRole("button", { name: copy.sort });
    const sortRest = paint(sorting);
    await userEvent.click(sorting);
    await userEvent.hover(canvas.getByRole("dialog", { name: copy.sort }));
    await waitFor(() => expect(paint(sorting)).toBe(pressed));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(sorting).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() => expect(paint(sorting), "Sorting returns to its closed paint").toBe(sortRest));

    const addFilter = canvas.getByRole("button", { name: copy.addFilter });
    await userEvent.click(addFilter);
    await expect(addFilter).toHaveAttribute("aria-expanded", "true");
    await expect(filters).toHaveAttribute("aria-expanded", "false");
    await userEvent.hover(canvas.getByRole("searchbox", { name: copy.findFilter }));
    await waitFor(() => expect(paint(addFilter)).toBe(pressed));
    await userEvent.keyboard("{Escape}");
    await expect(addFilter).toHaveAttribute("aria-expanded", "false");
  },
};
export const MobileActionsRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const more = narrowMore(canvas, copy);
    if (!more) return;
    const bar = canvas.getByRole("region", { name: copy.title });
    await expect(within(bar).getAllByRole("button")).toHaveLength(1);
    await expect(more.querySelector("[data-icon-name]")).toHaveAttribute("data-icon-name", "controls/more");
    await expect(canvasElement.querySelector("[data-table-scroll]")).toHaveAttribute("data-density", "compact");
    const heading = canvas.getByRole("heading", { name: copy.title });
    await userEvent.click(more);
    await expect(canvas.getByRole("menu", { name: copy.moreActions })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(more).toHaveFocus();
    await toolbarAction(canvasElement, copy, copy.search);
    const search = canvas.getByRole("searchbox", { name: copy.search });
    await waitFor(() => expect(search).toHaveFocus());
    await expect(heading).toHaveAccessibleName(copy.title);
    // Keyboard users can open More without the pointer's outside-dismissal closing Search.
    more.focus();
    await userEvent.keyboard("{Enter}");
    const searchCommand = await canvas.findByRole("menuitem", { name: copy.search });
    searchCommand.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(search).toHaveFocus());
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await userEvent.type(search, copy.names[1]);
    await userEvent.keyboard("{Escape}");
    await expect(more).toHaveFocus();
    await expect(canvas.queryByRole("searchbox", { name: copy.search })).toBeNull();
    await expect(canvasElement.querySelectorAll("tbody [data-record-id]")).toHaveLength(1);
    await expect(more).toHaveAttribute("data-variant", "soft");
    await toolbarAction(canvasElement, copy, copy.search);
    await expect(canvas.getByRole("searchbox", { name: copy.search })).toHaveValue(copy.names[1]);
    await userEvent.click(canvas.getByRole("button", { name: copy.clearSearch }));
    await userEvent.click(canvas.getByRole("button", { name: copy.closeSearch }));
    await expect(more).toHaveFocus();
    await expect(within(bar).getAllByRole("button")).toHaveLength(1);
    await expect(canvasElement.querySelectorAll("tbody [data-record-id]")).toHaveLength(4);
    const { page } = await import("vitest/browser");
    const originalViewport = { width: window.innerWidth, height: window.innerHeight };
    try {
      await page.viewport(1024, originalViewport.height);
      await waitFor(() => expect(canvas.getByRole("button", { name: copy.filters })).toBeVisible());
      await expect(canvas.getByRole("button", { name: copy.moreActions })).toHaveFocus();
      await page.viewport(originalViewport.width, originalViewport.height);
      await waitFor(() => expect(canvas.getByRole("button", { name: copy.moreActions })).toHaveFocus());
    } finally {
      await page.viewport(originalViewport.width, originalViewport.height);
    }
    await checkStructure(canvasElement);
  },
};
export const FilteringRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const records = () => canvasElement.querySelectorAll("tbody [data-record-id]");
    const more = narrowMore(canvas, copy);
    const filter = more ?? canvas.getByRole("button", { name: copy.filters });
    const openField = async (field: string) => {
      await toolbarAction(canvasElement, copy, copy.filters);
      const choice = await canvas.findByRole("button", { name: field });
      await userEvent.hover(choice);
      await waitFor(() => expect(canvas.getByRole("dialog", { name: field })).toBeVisible());
      await expect(canvas.getByRole("dialog", { name: field })).toHaveAttribute("data-presentation", "anchored");
      await expect(canvas.getByRole("dialog", { name: field })).toHaveAttribute("data-size", "sm");
      await expect(canvas.getByRole("searchbox", { name: copy.findFilter })).toHaveFocus();
      await userEvent.click(choice);
    };
    const beforeSearchY = filter.getBoundingClientRect().top;
    const beforeTableY = canvas.getByRole("table").getBoundingClientRect().top;
    await toolbarAction(canvasElement, copy, copy.search);
    const search = canvas.getByRole("searchbox", { name: copy.search });
    await waitFor(() => expect(search).toHaveFocus());
    const closeSearch = canvas.getByRole("button", { name: copy.closeSearch });
    const sortAction = more ?? canvas.getByRole("button", { name: copy.sort });
    await expect(closeSearch).toHaveAttribute("data-variant", "ghost");
    await expect(closeSearch).toHaveAttribute("data-size", "sm");
    await waitFor(() => {
      const center = (element: HTMLElement) => { const rect = element.getBoundingClientRect(); return rect.top + rect.height / 2; };
      expect(Math.abs(center(closeSearch) - center(filter)), "Search close and Filter stay aligned").toBeLessThanOrEqual(1);
      expect(Math.abs(center(filter) - center(sortAction)), "Filter and Sort stay aligned").toBeLessThanOrEqual(1);
      expect(Math.abs(center(search) - center(closeSearch)), "Search field and close stay aligned").toBeLessThanOrEqual(1);
      expect(Math.abs(filter.getBoundingClientRect().top - beforeSearchY), "Filter keeps its vertical position").toBeLessThanOrEqual(1);
      expect(Math.abs(canvas.getByRole("table").getBoundingClientRect().top - beforeTableY), "Table keeps its vertical position").toBeLessThanOrEqual(1);
    });
    await userEvent.type(search, copy.names[1]);
    await expect(records()).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: copy.clearSearch }));
    await expect(records()).toHaveLength(4);

    await openField(copy.owner);
    await expect((await canvas.findByRole("checkbox", { name: "Alex Silva" })).closest("li")).toHaveAttribute("data-size", "sm");
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Alex Silva" }));
    await expect(records()).toHaveLength(4); // A draft must not alter applied results.
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(records()).toHaveLength(2);
    await expect(filter).toHaveFocus();
    const ownerChip = canvas.getByRole("button", { name: `${copy.owner}: Alex Silva` });
    await userEvent.click(ownerChip);
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Marina Costa" }));
    await userEvent.click(canvas.getByRole("button", { name: copy.cancel }));
    await waitFor(() => expect(ownerChip).toHaveFocus());
    await expect(records()).toHaveLength(2);
    await userEvent.click(ownerChip);
    await expect(await canvas.findByRole("checkbox", { name: "Marina Costa" })).not.toBeChecked();
    await userEvent.keyboard("{Escape}");

    const statusColumn = canvas.getByRole("button", { name: `${copy.columnMenu}: ${copy.status}` });
    await userEvent.click(statusColumn);
    await userEvent.click(await canvas.findByRole("button", { name: copy.filterColumn }));
    await userEvent.click(await canvas.findByRole("button", { name: copy.statusLabels.review }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(statusColumn).toHaveFocus();
    await expect(canvas.getByText(copy.matchAll)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `${copy.status}: ${copy.statusLabels.review}` }));
    await expect(canvas.queryByRole("button", { name: copy.apply })).toBeNull();
    await userEvent.click(await canvas.findByRole("button", { name: copy.clear }));
    await expect(canvas.getByRole("button", { name: `${copy.add} ${copy.status}` })).toHaveFocus();
    await toolbarAction(canvasElement, copy, copy.clearAll);
    await expect(filter).toHaveFocus();
    await expect(canvas.queryByRole("button", { name: `${copy.add} ${copy.status}` })).toBeNull();
    await expect(records()).toHaveLength(4);

    await openField(copy.name);
    await expect(canvas.getByRole("button", { name: copy.apply })).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: copy.value }), copy.names[1]);
    await expect(records()).toHaveLength(4);
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(records()).toHaveLength(1);
    const textChip = canvas.getByRole("button", { name: `${copy.name}: ${copy.contains} ${copy.names[1]}` });
    await userEvent.click(textChip);
    await userEvent.clear(canvas.getByRole("textbox", { name: copy.value }));
    await userEvent.type(canvas.getByRole("textbox", { name: copy.value }), "zzzz-no-matching-record");
    await userEvent.keyboard("{Escape}");
    await expect(records()).toHaveLength(1);
    await userEvent.click(textChip);
    await expect(canvas.getByRole("textbox", { name: copy.value })).toHaveValue(copy.names[1]);
    await userEvent.clear(canvas.getByRole("textbox", { name: copy.value }));
    await userEvent.type(canvas.getByRole("textbox", { name: copy.value }), "zzzz-no-matching-record");
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await expect(canvas.getByText(copy.empty)).toBeVisible();
    await toolbarAction(canvasElement, copy, copy.clearAll);
    await expect(records()).toHaveLength(4);
    await checkStructure(canvasElement);
  },
};
export const TextConditionsRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const records = () => canvasElement.querySelectorAll("tbody [data-record-id]");
    const chooseCondition = async (label: string) => {
      await userEvent.click(canvas.getByRole("combobox", { name: copy.operator }));
      await userEvent.click(await canvas.findByRole("option", { name: label }));
    };
    await toolbarAction(canvasElement, copy, copy.filters);
    await userEvent.click(await canvas.findByRole("button", { name: copy.name }));
    const condition = await canvas.findByRole("combobox", { name: copy.operator });
    await expect(condition.closest("[data-size]")).toHaveAttribute("data-size", "sm");
    await chooseCondition(copy.notContains);
    await expect(canvas.getByRole("button", { name: copy.apply })).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: copy.value }), copy.names[1]);
    await expect(records()).toHaveLength(4);
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(records()).toHaveLength(3);
    const negativeChip = canvas.getByRole("button", { name: `${copy.name}: ${copy.notContains} ${copy.names[1]}` });
    await userEvent.click(negativeChip);
    await chooseCondition(copy.emptyOperator);
    await expect(canvas.queryByRole("textbox", { name: copy.value })).toBeNull();
    await expect(canvas.getByRole("button", { name: copy.apply })).toBeEnabled();
    await expect(records()).toHaveLength(3);
    await chooseCondition(copy.contains);
    await expect(canvas.getByRole("textbox", { name: copy.value })).toHaveValue(copy.names[1]);
    await userEvent.click(canvas.getByRole("button", { name: copy.cancel }));
    await expect(negativeChip).toHaveFocus();
    await expect(records()).toHaveLength(3);

    await userEvent.click(negativeChip);
    await expect(canvas.getByRole("combobox", { name: copy.operator })).toHaveTextContent(copy.notContains);
    await chooseCondition(copy.emptyOperator);
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await expect(records()).toHaveLength(0);
    await expect(canvas.getByText(copy.empty)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `${copy.name}: ${copy.emptyOperator}` }));
    await chooseCondition(copy.notEmpty);
    await expect(canvas.queryByRole("textbox", { name: copy.value })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await expect(records()).toHaveLength(4);
    await userEvent.click(canvas.getByRole("button", { name: `${copy.name}: ${copy.notEmpty}` }));
    await chooseCondition(copy.equals);
    await expect(canvas.getByRole("textbox", { name: copy.value })).toHaveValue("");
    await expect(canvas.getByRole("button", { name: copy.apply })).toBeDisabled();
    await userEvent.type(canvas.getByRole("textbox", { name: copy.value }), copy.names[1]);
    await userEvent.click(canvas.getByRole("button", { name: copy.apply }));
    await expect(records()).toHaveLength(1);
    await toolbarAction(canvasElement, copy, copy.clearAll);
    await expect(records()).toHaveLength(4);
    await checkStructure(canvasElement);
  },
};
export const SortingRegression: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const sortButton = narrowMore(canvas, copy) ?? canvas.getByRole("button", { name: copy.sort });
    const header = (name: string) => canvas.getByRole("button", { name: `${copy.columnMenu}: ${name}` }).closest("th");
    const directionIcon = (name: string) => header(name)?.querySelector("[data-icon-name]");
    await expect(canvasElement.querySelectorAll("thead [data-icon-name]")).toHaveLength(0);
    await toolbarAction(canvasElement, copy, copy.filters);
    const filterRow = await canvas.findByRole("button", { name: copy.owner });
    const rowStyle = getComputedStyle(filterRow);
    const filterSpacing = [rowStyle.paddingTop, rowStyle.paddingBottom, rowStyle.paddingLeft, rowStyle.minHeight];
    await userEvent.keyboard("{Escape}");
    await toolbarAction(canvasElement, copy, copy.sort);
    const sortPanel = canvas.getByRole("dialog", { name: copy.sort });
    const addSorting = canvas.getByRole("button", { name: copy.addSort });
    const sortField = canvas.getByRole("button", { name: copy.updated });
    for (const row of [addSorting, sortField]) {
      const style = getComputedStyle(row);
      await expect([style.paddingTop, style.paddingBottom, style.paddingLeft, style.minHeight]).toEqual(filterSpacing);
    }
    await waitFor(() => {
      const panel = sortPanel.getBoundingClientRect();
      const row = addSorting.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(sortPanel).paddingLeft);
      expect(Math.abs(row.left - panel.left - inset), "No additional sorting wrapper inset").toBeLessThanOrEqual(1);
      expect(Math.abs(panel.right - row.right - inset)).toBeLessThanOrEqual(1);
      expect(Math.abs(row.top - panel.top - inset)).toBeLessThanOrEqual(1);
    });
    await userEvent.click(await canvas.findByRole("button", { name: copy.updated }));
    await expect(header(copy.updated)).toHaveAttribute("aria-sort", "descending");
    await expect(directionIcon(copy.updated)).toHaveAttribute("data-icon-name", "arrows/compact/down");
    await expect(addSorting).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    canvas.getByRole("button", { name: copy.name }).focus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("table")).toHaveAccessibleDescription(expect.stringContaining(`${copy.priority} 2: ${copy.name}`));
    await expect(directionIcon(copy.name)).toHaveAttribute("data-icon-name", "arrows/compact/up");
    await expect(header(copy.name)).not.toHaveAttribute("aria-sort");
    await userEvent.click(canvas.getByRole("button", { name: `${copy.moveUp}: ${copy.name}` }));
    await expect(header(copy.name)).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getByRole("button", { name: `${copy.moveDown}: ${copy.name}` })).toHaveFocus();
    await userEvent.click(canvas.getByRole("combobox", { name: `${copy.direction}: ${copy.name}` }));
    await userEvent.click(await canvas.findByRole("option", { name: copy.descending }));
    await expect(header(copy.name)).toHaveAttribute("aria-sort", "descending");
    await expect(directionIcon(copy.name)).toHaveAttribute("data-icon-name", "arrows/compact/down");
    await userEvent.click(canvas.getByRole("button", { name: `${copy.remove}: ${copy.updated}` }));
    await expect(canvas.getByRole("button", { name: copy.addSort })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(sortButton).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: `${copy.columnMenu}: ${copy.updated}` }));
    await userEvent.click(await canvas.findByRole("button", { name: copy.ascending }));
    await expect(header(copy.updated)).toHaveAttribute("aria-sort", "ascending");
    await expect(canvas.getByRole("table")).toHaveAccessibleDescription(expect.stringContaining(`${copy.priority} 2: ${copy.name}`));
    await toolbarAction(canvasElement, copy, copy.sort);
    canvas.getByRole("button", { name: copy.clearSort }).focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvasElement.querySelectorAll("thead th[aria-sort]")).toHaveLength(0);
    await expect(canvasElement.querySelectorAll("thead [data-icon-name]")).toHaveLength(0);
    await expect(canvas.getByRole("button", { name: copy.addSort })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(sortButton).toHaveFocus();
    await checkStructure(canvasElement);
  },
};

export const IndependentQueryState: Story = {
  name: "Search, filters & sorting stay independent",
  tags: ["context-matrix"],
  args: { initialFilters: true },
  render: (args, { globals }) => <FilterBarExample {...args} initialSorts profile={globals.storyContentProfile} />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = filterBarCopy(globals.storyContentProfile);
    const records = () => canvasElement.querySelectorAll("tbody [data-record-id]");
    const header = (label: string) => canvas.getByRole("button", { name: `${copy.columnMenu}: ${label}` }).closest("th");
    const expectRetainedQuery = async () => {
      if (!canvas.queryByRole("searchbox", { name: copy.search })) await toolbarAction(canvasElement, copy, copy.search);
      await expect(canvas.getByRole("searchbox", { name: copy.search })).toHaveValue(copy.names[1]);
    };
    const owner = canvas.getByRole("button", { name: `${copy.owner}: Alex Silva` });
    await expect(records()).toHaveLength(2);
    await expect(header(copy.status)).toHaveAttribute("aria-sort", "ascending");
    await toolbarAction(canvasElement, copy, copy.search);
    const input = canvas.getByRole("searchbox", { name: copy.search });
    await waitFor(() => expect(input).toHaveFocus());
    await waitFor(() => expect(input.closest("[data-hito-input-frame]")!.getBoundingClientRect().height).toBeCloseTo(28, 1));
    await userEvent.type(input, copy.names[1]);
    await expect(records()).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: copy.closeSearch }));
    const searchAnchor = narrowMore(canvas, copy) ?? canvas.getByRole("button", { name: copy.search });
    await waitFor(() => expect(searchAnchor).toHaveFocus());
    await expect(records()).toHaveLength(1);
    await toolbarAction(canvasElement, copy, copy.search);
    await expect(canvas.getByRole("searchbox", { name: copy.search })).toHaveValue(copy.names[1]);
    await userEvent.click(canvas.getByRole("button", { name: copy.clearSearch }));
    await expect(records()).toHaveLength(2);
    await expect(owner).toBeVisible();
    await expect(header(copy.status)).toHaveAttribute("aria-sort", "ascending");

    await userEvent.type(canvas.getByRole("searchbox", { name: copy.search }), copy.names[1]);
    await userEvent.click(owner);
    await expect(canvas.getByRole("checkbox", { name: "Alex Silva" })).toBeChecked();
    await userEvent.click(canvas.getByRole("button", { name: copy.clear }));
    await expectRetainedQuery();
    await expect(header(copy.status)).toHaveAttribute("aria-sort", "ascending");
    await toolbarAction(canvasElement, copy, copy.clearAll);
    await expectRetainedQuery();
    await expect(header(copy.status)).toHaveAttribute("aria-sort", "ascending");
    await toolbarAction(canvasElement, copy, copy.sort);
    await userEvent.click(canvas.getByRole("button", { name: copy.clearSort }));
    await userEvent.keyboard("{Escape}");
    await expect(canvasElement.querySelectorAll("thead th[aria-sort]")).toHaveLength(0);
    await expectRetainedQuery();
    await expect(records()).toHaveLength(1);
    await checkStructure(canvasElement);
  },
};
