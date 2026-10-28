import { useLayoutEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useArgs } from "storybook/preview-api";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimen, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { getTagChipContent } from "../../storybook/tag-chip.story";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import type { IconName } from "../Icon/icon-catalog";
import { Chip, chipBehaviors, chipElevations, chipSizes, type ChipSize, type ChipElevation } from "./Chip";
import styles from "./Chip.stories.module.css";

type StoryArgs = {
  label: string; leadingIcon?: IconName; size: ChipSize;
  behavior: "selectable" | "removable"; selected: boolean; disabled: boolean; elevation: ChipElevation;
};

function PlaygroundExample({ args, profile, onSelectedChange }: { args: StoryArgs; profile: unknown; onSelectedChange: (value: boolean) => void }) {
  const copy = getTagChipContent(profile);
  const [requests, setRequests] = useState(0);
  const label = args.label || (args.behavior === "selectable" ? copy.choice : copy.values[0]);
  const shared = { label, size: args.size, leadingIcon: args.leadingIcon, disabled: args.disabled };
  return <div className={styles.example} lang={copy.lang}>
    {args.behavior === "selectable"
      ? <Chip {...shared} behavior="selectable" selected={args.selected} onSelectedChange={onSelectedChange} />
      : <Chip {...shared} behavior="removable" elevation={args.elevation} removeLabel={`${copy.remove} ${label}`} onRemove={() => setRequests(value => value + 1)} />}
    {copy.long ? <Text variant="body-sm">{copy.full}: {label}</Text> : null}
    <Text as="span" variant="body-sm" role="status" data-remove-count={requests}>{requests ? `${copy.removed}: ${label} · ${requests}` : ""}</Text>
  </div>;
}

function Collection({ size, elevation, profile }: { size: ChipSize; elevation: ChipElevation; profile: unknown }) {
  const copy = getTagChipContent(profile);
  const [values, setValues] = useState([0, 1, 2]);
  const [announcement, setAnnouncement] = useState("");
  const refs = useRef(new Map<number, HTMLButtonElement>());
  const addRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<number | "add" | null>(null);
  useLayoutEffect(() => {
    if (focusTarget.current === "add") addRef.current?.focus();
    else if (focusTarget.current !== null) refs.current.get(focusTarget.current)?.focus();
    focusTarget.current = null;
  }, [values]);
  function remove(id: number) {
    const position = values.indexOf(id);
    const next = values.filter(value => value !== id);
    focusTarget.current = next[position] ?? next[position - 1] ?? "add";
    setValues(next);
    setAnnouncement(`${copy.removed}: ${copy.values[id]}`);
  }
  function add() {
    const next = [0, 1, 2].find(value => !values.includes(value));
    if (next === undefined) return;
    focusTarget.current = next;
    setValues([...values, next]);
    setAnnouncement(`${copy.restored}: ${copy.values[next]}`);
  }
  return <div className={styles.example} lang={copy.lang}>
    {values.length ? <ul className={styles.values} aria-label={copy.group}>
      {values.map(id => <li key={id}><Chip
        ref={node => { if (node) refs.current.set(id, node); else refs.current.delete(id); }}
        behavior="removable" label={copy.values[id]} removeLabel={`${copy.remove} ${copy.values[id]}`}
        size={size} elevation={elevation} leadingIcon={id === 0 ? "general/location" : undefined}
        onRemove={() => remove(id)} /></li>)}
    </ul> : <Text variant="body-sm">{copy.empty}</Text>}
    {copy.long && values.length ? <div className={styles.fullValues}>
      <Text variant="label-sm">{copy.full}</Text>
      {values.map(id => <Text key={id} variant="body-sm">{copy.values[id]}</Text>)}
    </div> : null}
    <Button ref={addRef} intent="neutral" variant="secondary" leadingIcon="controls/plus-s" aria-disabled={values.length === 3} onClick={add}>{copy.add}</Button>
    <Text as="span" variant="body-sm" role="status">{announcement}</Text>
  </div>;
}

const meta = {
  id: "data-chip", title: "Components/Collections/Chip", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["behavior", "label", "leadingIcon", "size", "selected", "disabled", "elevation"] } },
  args: { behavior: "selectable", label: "", leadingIcon: undefined, size: "md", selected: false, disabled: false, elevation: "flat" },
  argTypes: {
    behavior: { control: "inline-radio", options: chipBehaviors },
    label: { control: "text", description: "Optional custom label; empty uses the toolbar's localized sample." },
    leadingIcon: { control: "select", options: ["none", "general/star", "general/location"], mapping: { none: undefined } },
    size: { control: "inline-radio", options: chipSizes },
    selected: { control: "boolean", if: { arg: "behavior", eq: "selectable" } },
    disabled: { control: "boolean" },
    elevation: { control: "inline-radio", options: chipElevations, if: { arg: "behavior", eq: "removable" } },
  },
  render: function Render(args, { globals }) {
    const [, updateArgs] = useArgs<StoryArgs>();
    return <FoundationStoryPage title="Chip" description="One action: select a choice or remove a value. Removal here reports a callback; Selected values demonstrates changing the list and returning focus.">
      <PlaygroundExample key={`${args.behavior}-${globals.storyContentProfile}`} args={args} profile={globals.storyContentProfile} onSelectedChange={selected => updateArgs({ selected })} />
    </FoundationStoryPage>;
  },
} satisfies Meta<StoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "Selectable Chip in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8921-117",
    },
  },
  play: async ({ canvasElement, args, globals }) => {
    const chip = canvasElement.querySelector<HTMLElement>("[data-chip]")!;
    await expect(chip).toBeVisible();
    await expect(chip.getBoundingClientRect().height).toBe(args.size === "sm" ? 28 : 36);
    await expect(chip.querySelector("button")).toBeNull();
    if (!getTagChipContent(globals.storyContentProfile).long && !args.label) {
      await expect(chip.getBoundingClientRect().width).toBeLessThan(chip.parentElement!.getBoundingClientRect().width);
    }
    await expect(getComputedStyle(chip).borderRadius).toBe(args.behavior === "selectable" ? "9999px" : args.size === "sm" ? "4px" : "6px");
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const SelectedValues: Story = {
  name: "Selected values", tags: ["context-matrix"],
  parameters: {
    controls: { include: ["size", "elevation"] },
    figma: {
      label: "Removable Chip in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8921-244",
    },
  },
  args: { behavior: "removable" },
  render: (args, { globals }) => <FoundationStoryPage title="Selected values" description="The whole chip removes its value. The collection owns focus recovery, additions and announcements.">
    <Collection key={`${args.size}-${globals.storyContentProfile}`} size={args.size} elevation={args.elevation} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = getTagChipContent(globals.storyContentProfile);
    const action = (id: number) => canvas.getByRole("button", { name: `${copy.remove} ${copy.values[id]}` });
    await userEvent.click(action(1));
    await expect(action(2)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(action(0)).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(canvas.getByRole("button", { name: copy.add })).toHaveFocus();
    await expect(canvas.queryByRole("list")).toBeNull();
    await userEvent.keyboard("{Enter}");
    await expect(action(0)).toHaveFocus();
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.restored);
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

function ToggleProof({ size, label, leadingIcon }: { size: ChipSize; label: string; leadingIcon?: IconName }) {
  const [selected, setSelected] = useState(false);
  return <Chip size={size} label={label} behavior="selectable" selected={selected} onSelectedChange={setSelected} leadingIcon={leadingIcon} />;
}

/** Full state/size evidence stays out of the Storybook navigation. */
export const GeometryAndInteraction: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: {
    controls: { disable: true },
    figma: {
      label: "Chip overview in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8921-257",
    },
  },
  render: (_, { globals }) => {
    const copy = getTagChipContent(globals.storyContentProfile);
    const shortChoice = copy.lang === "pt-BR" ? "Opção" : "Option";
    const locationChoice = copy.lang === "pt-BR" ? "Terraço" : "Terrace";
    return <FoundationStoryPage title="Chip regression" description="Compact unselected choices, one-line values and native actions.">
      <FoundationSpecimenGrid minItemWidth="full">
        {chipSizes.map(size => <FoundationSpecimen key={size} label={size} layout="row">
          <ToggleProof size={size} label={shortChoice} />
          <ToggleProof size={size} label={locationChoice} leadingIcon="general/location" />
          <ToggleProof size={size} label={copy.choice} leadingIcon="general/star" />
          <Chip behavior="selectable" size={size} label={copy.choice} selected disabled onSelectedChange={() => {}} />
          {chipElevations.map(elevation => <Chip key={elevation} behavior="removable" size={size} elevation={elevation} label={copy.values[1]} removeLabel={`${copy.remove} ${copy.values[1]}`} onRemove={() => {}} />)}
        </FoundationSpecimen>)}
      </FoundationSpecimenGrid>
    </FoundationStoryPage>;
  },
  play: async ({ canvasElement, globals }) => {
    // Compare selection geometry only after the actual UI font has replaced its fallback.
    await canvasElement.ownerDocument.fonts.ready;
    const shortChoice = getTagChipContent(globals.storyContentProfile).lang === "pt-BR" ? "Opção" : "Option";
    const locationChoice = getTagChipContent(globals.storyContentProfile).lang === "pt-BR" ? "Terraço" : "Terrace";
    for (const chip of canvasElement.querySelectorAll<HTMLButtonElement>("[data-chip]")) {
      const style = getComputedStyle(chip);
      const rect = chip.getBoundingClientRect();
      const selectable = chip.dataset.behavior === "selectable";
      await expect(rect.height).toBe(chip.dataset.size === "sm" ? 28 : 36);
      await expect(style.borderRadius).toBe(selectable ? "9999px" : chip.dataset.size === "sm" ? "4px" : "6px");
      if (selectable) {
        await expect(style.boxShadow).toBe("none");
        await expect(style.borderTopColor).toBe("rgba(0, 0, 0, 0)");
      } else if (chip.dataset.elevation === "raised") await expect(style.boxShadow).not.toBe("none");
      const label = chip.querySelector<HTMLElement>("span > span > span:not([data-icon-name])")!;
      await expect(getComputedStyle(label).whiteSpace).toBe("nowrap");
      if (selectable && !chip.disabled) {
        const content = chip.querySelector<HTMLElement>("span > span")!;
        const leading = content.querySelector<HTMLElement>('[data-icon-name="general/star"], [data-icon-name="general/location"]');
        const gap = parseFloat(getComputedStyle(content).gap);
        await expect(chip.querySelector('[data-icon-name="general/check"]')).toBeNull();
        await expect(content.childElementCount).toBe(leading ? 2 : 1);
        const occupiedWidth = label.getBoundingClientRect().width + (leading ? leading.getBoundingClientRect().width + gap : 0);
        await expect(Math.abs(content.getBoundingClientRect().width - occupiedWidth)).toBeLessThan(1.1);
        await userEvent.click(chip);
        await expect(chip).toHaveAttribute("aria-pressed", "true");
        const check = chip.querySelector<HTMLElement>('[data-icon-name="general/check"]')!;
        await expect(check).not.toBeNull();
        if (chip.title === shortChoice || chip.title === locationChoice) {
          await expect(Math.abs(chip.getBoundingClientRect().width - rect.width - check.getBoundingClientRect().width - gap)).toBeLessThan(1.1);
        }
        await userEvent.keyboard("{Enter}");
        await expect(chip).toHaveAttribute("aria-pressed", "false");
        await expect(chip.querySelector('[data-icon-name="general/check"]')).toBeNull();
        await userEvent.keyboard(" ");
        await expect(chip).toHaveAttribute("aria-pressed", "true");
        await expect(chip.querySelector('[data-icon-name="general/check"]')).not.toBeNull();
        await waitFor(() => expect(getComputedStyle(chip).outlineStyle).toBe("solid"));
      }
    }
    await expect(canvasElement.scrollWidth).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};
