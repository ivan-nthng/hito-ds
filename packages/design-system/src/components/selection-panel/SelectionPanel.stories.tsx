import { useRef, useState, useSyncExternalStore, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { Button } from "../Button/Button";
import { List } from "../List/List";
import { ListItem, type ListItemSize } from "../ListItem/ListItem";
import { SearchField } from "../SearchField/SearchField";
import { Text } from "../Text/Text";
import { SelectionPanel } from "./SelectionPanel";

const subscribeViewport = (callback: () => void) => {
  const media = window.matchMedia("(max-width: 39.999rem)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};
const readViewport = () => window.matchMedia("(max-width: 39.999rem)").matches;
const serverViewport = () => false;

async function verifyGeometry(panel: HTMLElement, size: ListItemSize) {
  const radius = { sm: 4, md: 6, lg: 8 }[size];
  const css = () => getComputedStyle(panel);
  expect(css().paddingTop).toBe(`${radius}px`);
  expect(css().borderTopLeftRadius).toBe(`${radius * 2}px`);
  expect(getComputedStyle(within(panel).getByRole("button", { name: "Brazil" })).borderTopLeftRadius).toBe(`${radius}px`);
  const root = document.documentElement.style, previous = root.getPropertyValue("--radius-scale"), priority = root.getPropertyPriority("--radius-scale");
  try {
    for (const scale of [0.75, 1, 1.25]) {
      root.setProperty("--radius-scale", String(scale));
      await waitFor(() => expect(parseFloat(css().borderTopLeftRadius)).toBeCloseTo(radius * scale + radius));
      expect(css().paddingTop).toBe(`${radius}px`);
    }
  } finally {
    if (previous) root.setProperty("--radius-scale", previous, priority); else root.removeProperty("--radius-scale");
  }
  if (import.meta.env.MODE !== "test") return;
  const { cdp, page } = await import("vitest/browser"), session = cdp();
  await page.screenshot({ element: panel, path: `__screenshots__/radius-${size}-${innerWidth}.png` });
  const original = [
    { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
    { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
    { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
  ];
  try {
    await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature.name === "prefers-reduced-motion" ? { ...feature, value: "reduce" } : feature) });
    expect(css().borderTopWidth).toBe("1px"); expect(css().animationName).toBe("none");
    expect(parseFloat(css().borderTopLeftRadius)).toBe(radius * 2 + 1);
    if (panel.dataset.presentation === "sheet") expect(css().borderBottomLeftRadius).toBe("0px");
  } finally { await session.send("Emulation.setEmulatedMedia", { features: original }); }
}

function Example({
  size = "md",
  searchable = true,
}: {
  size?: ListItemSize;
  searchable?: boolean;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const brazil = useRef<HTMLLIElement>(null);
  const portugal = useRef<HTMLLIElement>(null);
  const narrow = useSyncExternalStore(
    subscribeViewport,
    readViewport,
    serverViewport,
  );
  const sheet = narrow && size !== "sm";
  const hoverTimer = useRef<number | undefined>(undefined);
  const cancelHover = () => window.clearTimeout(hoverTimer.current);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [childQuery, setChildQuery] = useState("");
  const [country, setCountry] = useState("");
  const [focusChild, setFocusChild] = useState(false);
  const [value, setValue] = useState("");
  const cities =
    country === "Brazil"
      ? ["São Paulo", "Rio de Janeiro", "Curitiba"]
      : ["Lisbon", "Porto"];
  const changeOpen = (next: boolean) => {
    cancelHover();
    setOpen(next);
    if (!next) {
      setQuery("");
      setChildQuery("");
      setCountry("");
    }
  };
  const enter = (label: string, focus: boolean) => {
    cancelHover();
    setCountry(label);
    setFocusChild(focus);
    setChildQuery("");
    if (sheet) setQuery("");
  };
  const commit = (label: string) => {
    setValue(label);
    changeOpen(false);
  };
  const back = () => {
    setCountry("");
    setChildQuery("");
    setQuery("");
  };
  const search = (text: string, onChange: (value: string) => void) =>
    searchable ? (
      <SearchField
        appearance="soft"
        aria-label="Search locations"
        placeholder="Search locations"
        clearLabel="Clear search"
        size={size}
        value={text}
        onValueChange={onChange}
      />
    ) : undefined;
  const renderRows = (labels: string[], text: string, leaf: boolean) => {
    const filtered = labels.filter((label) =>
      label.toLocaleLowerCase().includes(text.trim().toLocaleLowerCase()),
    );
    return (
      <>
        <List role="presentation">
          {filtered.map((label) => (
            <ListItem
              key={label}
              ref={leaf ? undefined : label === "Brazil" ? brazil : portugal}
              role="button"
              tabIndex={0}
              aria-haspopup={leaf ? undefined : "dialog"}
              aria-expanded={leaf ? undefined : country === label}
              size={size}
              label={label}
              leading={leaf ? { selectionMark: value === label } : undefined}
              trailing={leaf ? undefined : { icon: "arrows/compact/right" }}
              selected={leaf && value === label}
              onPointerEnter={(event) => {
                if (!leaf && !sheet && event.pointerType === "mouse") {
                  cancelHover();
                  if (country && country !== label) {
                    const duration = getComputedStyle(event.currentTarget)
                      .getPropertyValue("--motion-duration-feedback")
                      .trim();
                    const delay =
                      parseFloat(duration) *
                      (duration.endsWith("ms") ? 1 : 1000);
                    hoverTimer.current = window.setTimeout(
                      () => enter(label, false),
                      delay,
                    );
                  } else enter(label, false);
                }
              }}
              onPointerLeave={cancelHover}
              onClick={() => (leaf ? commit(label) : enter(label, true))}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " " ||
                  (!leaf && event.key === "ArrowRight")
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  if (leaf) commit(label);
                  else enter(label, true);
                }
              }}
            />
          ))}
        </List>
        {!filtered.length ? (
          <Text role="status" variant="body-sm">
            No matches
          </Text>
        ) : null}
      </>
    );
  };
  return (
    <FoundationStoryPage
      title={`Selection panel · ${size.toUpperCase()}`}
      description="Search in every size. Anchored lists open adjacent submenus; only mobile MD/LG sheets use a header and Back."
    >
      <div>
        <Button
          ref={anchor}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? "location-panel" : undefined}
          intent="neutral"
          variant="secondary"
          size={size}
          trailingIcon="arrows/compact/down"
          onClick={() => changeOpen(!open)}
        >
          {value || "Choose city"}
        </Button>
      </div>
      <SelectionPanel
        id="location-panel"
        anchorRef={anchor}
        open={open}
        onOpenChange={changeOpen}
        size={size}
        title={sheet && country ? country : "Location"}
        closeLabel="Close"
        back={sheet && country ? { label: "Back", onBack: back } : undefined}
        searchRegion={search(query, (next) => {
          setQuery(next);
          if (!sheet) setCountry("");
        })}
      >
        {renderRows(
          sheet && country ? cities : ["Brazil", "Portugal"],
          query,
          Boolean(sheet && country),
        )}
        {!sheet && country ? (
          <SelectionPanel
            id="location-subpanel"
            anchorRef={country === "Brazil" ? brazil : portugal}
            open={open}
            onOpenChange={(next) => {
              if (!next) setCountry("");
            }}
            size={size}
            title={country}
            closeLabel="Close"
            placement="inline-end"
            autoFocus={focusChild}
            searchRegion={search(childQuery, setChildQuery)}
          >
            <div
              onPointerEnter={cancelHover}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  event.stopPropagation();
                  setCountry("");
                  (country === "Brazil" ? brazil : portugal).current?.focus();
                }
              }}
            >
              {renderRows(cities, childQuery, true)}
            </div>
          </SelectionPanel>
        ) : null}
      </SelectionPanel>
      <Button intent="neutral" variant="ghost" size={size}>
        Next field
      </Button>
    </FoundationStoryPage>
  );
}

const meta = {
  id: "internal-selection-panel",
  title: "Internal/Test Harnesses/SelectionPanel",
  component: Example,
  tags: ["test"],
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    searchable: { control: "boolean" },
  },
} satisfies Meta<typeof Example>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Medium: Story = {
  tags: ["context-matrix"],
  args: { size: "md", searchable: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Choose city" });
    await userEvent.click(trigger);
    const panel = canvas.getByRole("dialog");
    await waitFor(() => expect(panel).toBeVisible());
    const search = within(panel).getByRole("searchbox");
    await expect(search).toHaveFocus();
    await verifyGeometry(panel, args.size ?? "md");
    await userEvent.type(search, "Portugal");
    await expect(
      within(panel).queryByRole("button", { name: "Brazil" }),
    ).toBeNull();
    await userEvent.click(
      within(panel).getByRole("button", { name: "Portugal" }),
    );
    const modal = panel.dataset.presentation === "sheet";
    const child = modal
      ? panel
      : canvas.getByRole("dialog", { name: "Portugal" });
    await waitFor(() => expect(child).toBeVisible());
    if (!modal) await expect(child.querySelector("header")).toBeNull();
    await expect(panel).toBeVisible();
    await userEvent.click(
      within(child).getByRole("button", { name: "Lisbon" }),
    );
    await expect(trigger).toHaveTextContent("Lisbon");
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("dialog")).toBeNull();
    await expect(trigger).toHaveFocus();
    canvasElement.dataset.selectionPanelVerified = "true";
  },
};
export const Small: Story = {
  ...Medium,
  tags: ["context-matrix"],
  args: { size: "sm", searchable: true },
};
export const Large: Story = {
  ...Medium,
  tags: ["context-matrix"],
  args: { size: "lg", searchable: true },
};
export const WithoutSearch: Story = { args: { size: "md", searchable: false } };
