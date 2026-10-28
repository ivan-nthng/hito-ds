import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { MouseEvent } from "react";
import { expect, fireEvent, fn, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Breadcrumbs, breadcrumbsSizes, type BreadcrumbsSize } from "./Breadcrumbs";
import { BreadcrumbsExample, breadcrumbsExamplePaths, type BreadcrumbsExamplePath } from "../../storybook/breadcrumbs.story";
import { breadcrumbsCopy } from "../../storybook/breadcrumbs-content.story";

type Args = { size: BreadcrumbsSize; path: BreadcrumbsExamplePath };
const meta = {
  id: "internal-breadcrumbs-preview",
  title: "Components/Navigation/Breadcrumbs",
  tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["size", "path"] } },
  args: { size: "md", path: "deep" },
  argTypes: {
    size: { control: "inline-radio", options: breadcrumbsSizes, description: "MD by default; SM for an explicitly dense context." },
    path: { control: "inline-radio", options: breadcrumbsExamplePaths, description: "Short path, deep hierarchy, or a first-level page." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Breadcrumbs" description="Your location, with a way back to each parent. Earlier levels move into More when the path runs out of room.">
    <BreadcrumbsExample key={`${String(globals.storyContentProfile)}-${args.path}`} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

function checkPage(canvasElement: HTMLElement, currentLabel: string) {
  const current = canvasElement.querySelector('[aria-current="page"]')!;
  expect(current).toHaveTextContent(currentLabel);
  expect(current.closest("a")).toBeNull();
  expect(current).not.toHaveAttribute("tabindex");
  expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  const nav = current.closest("nav")!;
  expect(nav.querySelector("ol")).not.toBeNull();
  const path = nav.querySelector("ol")!;
  const separators = Array.from(path.querySelectorAll("[data-breadcrumb-separator]"));
  separators.forEach(separator => {
    expect(separator).toHaveAttribute("aria-hidden", "true");
    expect(separator).toHaveTextContent("/");
  });
  if (separators.length) {
    expect(getComputedStyle(separators.at(-1)!).color).toBe(getComputedStyle(current).color);
    separators.slice(0, -1).forEach(separator => expect(getComputedStyle(separator).color).not.toBe(getComputedStyle(current).color));
  }
  path.querySelectorAll("a").forEach(link => {
    expect(getComputedStyle(link).textDecorationLine).toBe("none");
    expect(getComputedStyle(link).color).not.toBe(getComputedStyle(current).color);
  });
}

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Breadcrumbs in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8544-52",
    },
  },
  tags: ["context-matrix"],
  play: async ({ canvasElement, globals, args }) => {
    const canvas = within(canvasElement);
    const copy = breadcrumbsCopy(globals.storyContentProfile);
    await expect(canvas.getByRole("navigation", { name: copy.navigation })).toHaveAttribute("data-size", args.size);
    checkPage(canvasElement, copy.labels[4]);
    const more = canvas.queryByRole("button", { name: new RegExp(copy.overflow) });
    if (more) {
      await userEvent.click(more);
      const panel = canvas.getByRole("dialog");
      const links = within(panel).getAllByRole("link");
      await expect(links[0]).toHaveFocus();
      await expect(more).toHaveAttribute("aria-expanded", "true");
      expect(links.some(link => link.textContent === copy.labels[4])).toBe(false);
      for (let index = 1; index < links.length; index++) {
        const before = links[index - 1].getBoundingClientRect();
        const after = links[index].getBoundingClientRect();
        expect(after.top + after.height / 2 - before.top - before.height / 2).toBeGreaterThanOrEqual(44);
      }
      await userEvent.keyboard("{Escape}");
      await expect(canvas.queryByRole("dialog")).toBeNull();
      await expect(more).toHaveFocus();
      checkPage(canvasElement, copy.labels[4]);
    }
  },
};

export const Dense: Story = { tags: ["context-matrix", "!dev", "!autodocs"], args: { size: "sm" }, play: Playground.play };

export const ParentNavigation: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = breadcrumbsCopy(globals.storyContentProfile);
    const more = canvas.queryByRole("button", { name: new RegExp(copy.overflow) });
    if (more) {
      more.focus();
      await userEvent.keyboard("{Enter}");
    }
    const link = more ? within(canvas.getByRole("dialog")).getAllByRole("link")[0] : canvas.getAllByRole("link")[0];
    const parent = link.textContent!;
    const destination = link.getAttribute("href")!;
    // Vitest's iframe has its own base URL: keep its runner mounted during this
    // owner-state test. Native fragment navigation is verified in live Storybook.
    link.addEventListener("click", event => event.preventDefault(), { once: true });
    link.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(canvas.getByRole("heading", { name: parent })).toHaveFocus());
    await expect(canvas.queryByRole("dialog")).toBeNull();
    expect(canvasElement.ownerDocument.getElementById(destination.slice(1))).toHaveFocus();
    checkPage(canvasElement, parent);
    await userEvent.click(canvas.getByRole("button", { name: copy.reset }));
    checkPage(canvasElement, copy.labels[4]);
  },
};

export const FirstLevel: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { path: "current" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    checkPage(canvasElement, breadcrumbsCopy(globals.storyContentProfile).labels[4]);
    await expect(canvas.queryByRole("link")).toBeNull();
    await expect(canvas.queryByRole("button")).toBeNull();
    expect(canvasElement.querySelector("nav > ol")?.children.length).toBe(1);
  },
};

export const ResizeAndDirection: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole("navigation");
    const copy = breadcrumbsCopy(globals.storyContentProfile);
    const visibleParent = within(nav).queryAllByRole("link")[0];
    visibleParent?.focus();
    nav.style.inlineSize = "120px";
    await waitFor(() => expect(nav).toHaveAttribute("data-trail-mode", "current"));
    const more = canvas.getByRole("button", { name: new RegExp(copy.overflow) });
    if (visibleParent) await expect(more).toHaveFocus();
    const current = nav.querySelector('[aria-current="page"]')!;
    expect(current.getBoundingClientRect().right).toBeLessThanOrEqual(nav.getBoundingClientRect().right + 1);
    nav.dir = "rtl";
    const separator = nav.querySelector("ol [data-breadcrumb-separator]")!;
    await expect(separator).toHaveTextContent("/");
    await expect(getComputedStyle(separator).transform).toBe("none");
    await userEvent.click(more);
    const panel = canvas.getByRole("dialog");
    const links = within(panel).getAllByRole("link");
    expect(links.map(link => link.textContent)).toEqual(copy.labels.slice(0, -1));
    await userEvent.keyboard("{Escape}");
    await expect(more).toHaveFocus();
    await userEvent.click(more);
    nav.style.inlineSize = "100%";
    nav.dir = "ltr";
    await waitFor(() => expect(nav.getBoundingClientRect().width).toBeGreaterThan(120));
    await waitFor(() => expect(nav.contains(document.activeElement)).toBe(true));
    if (canvas.queryByRole("dialog")) await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(nav.contains(document.activeElement)).toBe(true);
    checkPage(canvasElement, copy.labels[4]);
  },
};

export const EmptyPath: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <Breadcrumbs items={[]} currentPage="" label="Page location" overflowLabel={count => `Show earlier levels (${count})`} closeLabel="Close" />,
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("navigation")).toBeNull();
  },
};

const contractItems = [{ id: "home", label: "Home", href: "#home" }, { id: "team", label: "Team", href: "#team" }];
const contractLabels = { currentPage: "Page", overflowLabel: (count: number) => `Earlier levels (${count})`, closeLabel: "Close" };

export const InstanceIsolation: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <FoundationStoryPage title="Focus ownership" description="Independent paths retain their own focus.">
    <Breadcrumbs {...contractLabels} items={contractItems} label="First location" />
    <Breadcrumbs {...contractLabels} items={contractItems} label="Second location" />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("navigation", { name: "First location" });
    const second = canvas.getByRole("navigation", { name: "Second location" });
    await waitFor(() => expect(first).toHaveAttribute("data-trail-mode", "full"));
    const focused = within(first).getByRole("link", { name: "Home" });
    focused.focus();
    second.style.inlineSize = "96px";
    await waitFor(() => expect(second).toHaveAttribute("data-trail-mode", "current"));
    await expect(focused).toHaveFocus();
    // Padding belongs to the caller; fit decisions use the path's content width.
    second.style.inlineSize = "240px";
    second.style.paddingInline = "72px";
    await waitFor(() => expect(second.querySelector("ol")!.getBoundingClientRect().width).toBe(96));
    await expect(second).toHaveAttribute("data-trail-mode", "current");
    await expect(focused).toHaveFocus();
  },
};

const overflowClick = fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
export const OverflowNativeNavigation: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <FoundationStoryPage title="Native ancestor links" description="The caller receives native anchor events in the overflow too.">
    <Breadcrumbs {...contractLabels} label="Page location" style={{ inlineSize: "96px" }} items={contractItems.map(item => ({ ...item, onClick: overflowClick }))} />
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    overflowClick.mockClear();
    const canvas = within(canvasElement);
    const more = await canvas.findByRole("button", { name: "Earlier levels (2)" });
    await userEvent.click(more);
    const link = within(canvas.getByRole("dialog")).getByRole("link", { name: "Home" });
    await expect(link).toHaveAttribute("href", "#home");
    const native = new window.MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true });
    fireEvent(link, native);
    expect(overflowClick).toHaveBeenCalledTimes(1);
    expect(overflowClick.mock.calls[0][0].nativeEvent).toBe(native);
    expect(native.defaultPrevented).toBe(true);
    await waitFor(() => expect(canvas.getByRole("dialog")).toBeVisible());
    await userEvent.click(link);
    expect(overflowClick).toHaveBeenCalledTimes(2);
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(more).toHaveFocus();
  },
};
