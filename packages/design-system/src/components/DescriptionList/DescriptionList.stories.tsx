import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";
import { Surface } from "../Surface/Surface";
import { InlineEdit } from "../InlineEdit/InlineEdit";
import { Text } from "../Text/Text";
import { DescriptionList, type DescriptionListProps } from "./DescriptionList";
import styles from "./DescriptionList.stories.module.css";

type StoryArgs = {
  presentation: "plain" | "surface";
  width: "available" | "narrow";
  emptyValue: boolean;
  valueComposition: "plain" | "mixed";
};

function getCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const long = resolved.endsWith("long");
  return lang === "en" ? {
    lang,
    title: "Delivery details",
    terms: long ? ["City and neighborhood", "Person receiving the delivery", "Preferred delivery window", "Additional instructions for arrival", "Delivery reference"] : ["City", "Recipient", "Delivery", "Instructions", "Reference"],
    values: long ? ["São Paulo · Vila Nova Conceição", "Alexandre da Silva Oliveira", "Tomorrow, 09:00–12:00, after reception opens", "Use the entrance on the side street. Ask reception to contact the recipient before leaving the package; please keep the main entrance clear.", "SV2026DELIVERYREFERENCE2048ABCDEFGHIJKLMNOPQRSTUVWXYZ"] : ["São Paulo", "Alex Silva", "Tomorrow, 09:00–12:00", "Leave with reception.", "SV-2048"],
    missing: "Not provided", edit: "Edit", add: "Add", save: "Save", saved: "Saved", saving: "Saving", clear: "Clear", error: "The change could not be saved.",
    newRecipient: "Alexandre Silva", newInstructions: "Leave with reception.\nPlease call when you arrive.",
  } : {
    lang,
    title: "Detalhes da entrega",
    terms: long ? ["Cidade e bairro", "Pessoa responsável pelo recebimento", "Período preferido para a entrega", "Instruções adicionais para a chegada", "Referência da entrega"] : ["Cidade", "Destinatário", "Entrega", "Instruções", "Referência"],
    values: long ? ["São Paulo · Vila Nova Conceição", "Alexandre da Silva Oliveira", "Amanhã, 09:00–12:00, após a abertura da recepção", "Utilize a entrada da rua lateral. Peça à recepção que entre em contato com o destinatário antes de deixar a encomenda e mantenha a entrada principal desobstruída.", "SV2026REFERENCIADAENTREGA2048ABCDEFGHIJKLMNOPQRSTUVWXYZ"] : ["São Paulo", "Alex Silva", "Amanhã, 09:00–12:00", "Deixar na recepção.", "SV-2048"],
    missing: "Não informado", edit: "Editar", add: "Adicionar", save: "Salvar", saved: "Salvo", saving: "Salvando", clear: "Limpar", error: "Não foi possível salvar a alteração.",
    newRecipient: "Alexandre Silva", newInstructions: "Deixar na recepção.\nLigue quando chegar.",
  };
}

function Example({ presentation, width, emptyValue, valueComposition, profile, rejectCommit = false }: StoryArgs & { profile: unknown; rejectCommit?: boolean }) {
  const copy = getCopy(profile);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const ids = ["city", "recipient", "delivery", "instructions", "reference"];
  const items = copy.terms.map((term, index) => {
    const missing = emptyValue && index === 3;
    const key = `${resolveStoryContentProfile(profile)}-${ids[index]}-${missing}`;
    return {
      id: ids[index], term,
      value: valueComposition === "mixed" && (index === 1 || index === 3) ? (
        <InlineEdit
          key={key}
          bodySize="sm" label={term} editLabel={`${copy.edit} ${term}`}
          emptyValueLabel={`${copy.add} ${term}`} saveLabel={copy.save}
          savedLabel={copy.saved} savingLabel={copy.saving} clearLabel={copy.clear}
          commitErrorMessage={copy.error} multiline={index === 3} showSaveAction width="hug"
          value={editedValues[key] ?? (missing ? "" : copy.values[index])}
          onCommit={async value => {
            if (rejectCommit) throw new Error(copy.error);
            setEditedValues(current => ({ ...current, [key]: value }));
          }}
        />
      ) : missing ? <span className={styles.missing}>{copy.missing}</span> : copy.values[index],
    };
  });
  const content = <div className={styles.content}>
    <Text as="h2" variant="heading-sm" id="description-title">{copy.title}</Text>
    <DescriptionList items={items} aria-labelledby="description-title" />
  </div>;
  return <div lang={copy.lang} className={width === "narrow" ? styles.narrow : undefined}>
    <Surface data-description-shell="" data-presentation={presentation} className={styles.shell}>{content}</Surface>
  </div>;
}

const meta = {
  id: "data-description-list",
  title: "Components/Collections/DescriptionList",
  component: DescriptionList,
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["presentation", "width", "emptyValue", "valueComposition"] },
    docs: { description: { component: "[DescriptionList component in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8996-49)" } },
  },
  args: { items: [], presentation: "surface", width: "available", emptyValue: false, valueComposition: "mixed" },
  argTypes: {
    items: { control: false, table: { disable: true } },
    presentation: { control: "inline-radio", options: ["plain", "surface"], description: "Demo only: a composed Surface or transparent shell with the same whole-block inset. Stock Card is a separate recipe." },
    width: { control: "inline-radio", options: ["available", "narrow"], description: "Demo only: constrain available width to inspect reflow." },
    emptyValue: { control: "boolean", description: "Demo only: the consumer supplies localized missing-value text." },
    valueComposition: { control: "inline-radio", options: ["plain", "mixed"], description: "Demo only: plain values or two values composed with existing InlineEdit. DescriptionList has no editing mode." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="DescriptionList" description="Name–value pairs that stack in narrow containers. Use the toolbar for language and text length.">
    <Example {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<DescriptionListProps & StoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

async function checkGeometry(canvasElement: HTMLElement) {
  await document.fonts.ready;
  const list = canvasElement.querySelector("dl")!;
  const shell = canvasElement.querySelector<HTMLElement>("[data-description-shell]")!;
  const shellCss = getComputedStyle(shell);
  const inset = parseFloat(shellCss.paddingInlineStart);
  await expect(shellCss.paddingBlockStart).toBe(shellCss.paddingInlineStart);
  await expect(shellCss.paddingBlockEnd).toBe(shellCss.paddingInlineStart);
  await expect(shellCss.paddingInlineEnd).toBe(shellCss.paddingInlineStart);
  const shellRect = shell.getBoundingClientRect();
  const contentRect = shell.firstElementChild!.getBoundingClientRect();
  for (const edge of [contentRect.left - shellRect.left, shellRect.right - contentRect.right, contentRect.top - shellRect.top, shellRect.bottom - contentRect.bottom]) {
    await expect(edge).toBeCloseTo(inset, 1);
  }
  const pairs = [...list.children] as HTMLElement[];
  const narrow = getComputedStyle(pairs[0]).display === "grid";
  await expect(list).not.toHaveAttribute("tabindex");
  await expect(shell.scrollWidth).toBeLessThanOrEqual(shell.clientWidth);
  const valueStart = pairs[0].querySelector("dd")!.getBoundingClientRect().left;
  for (const pair of pairs) {
    const term = pair.querySelector("dt")!;
    const value = pair.querySelector("dd")!;
    await expect([...pair.children].map(child => child.tagName)).toEqual(["DT", "DD"]);
    await expect(value.scrollWidth).toBeLessThanOrEqual(value.clientWidth + inset);
    await expect(term.scrollWidth).toBeLessThanOrEqual(term.clientWidth);
    if (narrow) {
      await expect(value.getBoundingClientRect().top).toBeGreaterThanOrEqual(term.getBoundingClientRect().bottom);
      await expect(value.firstElementChild!.getBoundingClientRect().left).toBe(term.firstElementChild!.getBoundingClientRect().left);
    } else {
      await expect(value.getBoundingClientRect().left).toBe(valueStart);
    }
  }
}

/** Include out-of-flow paint and hit targets; scrollWidth cannot catch negative outsets. */
async function checkValueBounds(canvasElement: HTMLElement) {
  const list = canvasElement.querySelector("dl")!;
  const shell = canvasElement.querySelector<HTMLElement>("[data-description-shell]")!;
  const shellRect = shell.getBoundingClientRect();
  const hostRect = canvasElement.querySelector("main")!.getBoundingClientRect();
  await expect(getComputedStyle(shell).overflow).toBe("visible");
  const pairs = [...list.children];
  for (const [index, pair] of pairs.entries()) {
    const value = pair.querySelector("dd")!;
    for (const button of value.querySelectorAll("button")) {
      if (getComputedStyle(button).visibility === "hidden") continue;
      const rect = button.getBoundingClientRect();
      const css = getComputedStyle(button);
      const outline = parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset);
      // At the smallest inset the normal focus ring may cross the Surface edge;
      // it must remain visible in the outer host's neutral clearance.
      await expect(rect.left - outline).toBeGreaterThanOrEqual(hostRect.left);
      await expect(rect.right + outline).toBeLessThanOrEqual(hostRect.right);
      const target = getComputedStyle(button, "::before");
      const height = Math.max(rect.height, parseFloat(target.blockSize) || 0);
      const width = Math.max(rect.width, parseFloat(target.inlineSize) || 0);
      await expect(rect.left - (width - rect.width) / 2).toBeGreaterThanOrEqual(shellRect.left);
      await expect(rect.right + (width - rect.width) / 2).toBeLessThanOrEqual(shellRect.right);
      const targetTop = rect.top - (height - rect.height) / 2;
      const targetBottom = rect.bottom + (height - rect.height) / 2;
      await expect(targetTop).toBeGreaterThanOrEqual(shellRect.top);
      await expect(targetBottom).toBeLessThanOrEqual(shellRect.bottom);
      if (index + 1 < pairs.length) {
        const next = pairs[index + 1];
        const nextTop = Math.min(...[...next.children].map(cell => cell.getBoundingClientRect().top));
        await expect(targetBottom).toBeLessThanOrEqual(nextTop);
      }
    }
    for (const editor of value.querySelectorAll("input, textarea, [role=alert]")) {
      const rect = editor.getBoundingClientRect();
      await expect(rect.left).toBeGreaterThanOrEqual(shellRect.left);
      await expect(rect.right).toBeLessThanOrEqual(shellRect.right);
    }
  }
}

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "DescriptionList examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8998-66" } },
  play: async ({ canvasElement, args, globals }) => {
    await checkGeometry(canvasElement);
    const list = canvasElement.querySelector("dl")!;
    if (args.valueComposition === "mixed") {
      await checkValueBounds(canvasElement);
      await expect(list.querySelectorAll('[data-width="hug"]')).toHaveLength(2);
    } else {
      await expect(list.querySelector("button, input, textarea, [tabindex]")).toBeNull();
      if (args.emptyValue) await expect(within(list).getByText(getCopy(globals.storyContentProfile).missing)).toBeVisible();
    }
  },
};

async function checkEditing(canvasElement: HTMLElement, profile: unknown) {
    const canvas = within(canvasElement);
    const copy = getCopy(profile);
    const editName = `${copy.edit} ${copy.terms[1]}`;
    await userEvent.click(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: editName })).toHaveFocus();
    await checkValueBounds(canvasElement);
    const trigger = canvas.getByRole("button", { name: editName });
    const root = trigger.closest<HTMLElement>("[data-width]")!;
    await expect(root).toHaveAttribute("data-width", "hug");
    const beforeHover = root.getBoundingClientRect();
    await userEvent.hover(trigger);
    await expect(root.getBoundingClientRect().left).toBe(beforeHover.left);
    await expect(root.getBoundingClientRect().width).toBe(beforeHover.width);
    await userEvent.click(canvas.getByRole("button", { name: editName }));
    await checkValueBounds(canvasElement);
    const input = canvas.getByRole("textbox", { name: copy.terms[1] });
    await userEvent.clear(input);
    await userEvent.type(input, copy.newRecipient);
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await waitFor(() => expect(canvas.getByRole("button", { name: editName })).toHaveFocus());
    await expect(canvas.getByText(copy.newRecipient)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: editName }));
    await userEvent.clear(canvas.getByRole("textbox", { name: copy.terms[1] }));
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByText(copy.newRecipient)).toBeVisible();
    const editInstructions = `${copy.edit} ${copy.terms[3]}`;
    await userEvent.click(canvas.getByRole("button", { name: editInstructions }));
    const textarea = canvas.getByRole("textbox", { name: copy.terms[3] });
    await userEvent.clear(textarea);
    await userEvent.type(textarea, copy.newInstructions);
    await checkValueBounds(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await waitFor(() => expect(canvas.getByRole("button", { name: editInstructions })).toHaveFocus());
    await expect(canvasElement.querySelectorAll("dd")[3]).toHaveTextContent(copy.newInstructions.replace(/\s+/g, " "));
    await checkGeometry(canvasElement);
    canvas.getByRole("button", { name: editInstructions }).blur();
}

/** Keep existing review links working without a second visible component presentation. */
export const EditableValues: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { valueComposition: "mixed" },
  parameters: { figma: { label: "DescriptionList editing examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9000-271" } },
  play: async ({ canvasElement, globals }) => {
    await checkGeometry(canvasElement);
    await checkEditing(canvasElement, globals.storyContentProfile);
  },
};

/** Regression evidence stays out of the browsing UI; Controls cover these examples. */
export const NarrowMissingValue: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { width: "narrow", emptyValue: true, presentation: "plain", valueComposition: "plain" },
  parameters: { figma: { label: "DescriptionList narrow and missing-value examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8998-66" } },
  play: Playground.play,
};

/** Exercise error growth at the exposed list edge without adding a user-facing mode. */
export const FailedCommit: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  args: { width: "narrow", emptyValue: true, valueComposition: "mixed", presentation: "plain" },
  parameters: { figma: { label: "DescriptionList failed-commit example in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9000-431" } },
  render: (args, { globals }) => <FoundationStoryPage title="DescriptionList" description="Failed value commit regression.">
    <Example {...args} profile={globals.storyContentProfile} rejectCommit />
  </FoundationStoryPage>,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = getCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: `${copy.edit} ${copy.terms[3]}` }));
    await userEvent.type(canvas.getByRole("textbox", { name: copy.terms[3] }), copy.newInstructions);
    await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await expect(canvas.getByRole("alert")).toHaveTextContent(copy.error);
    await checkGeometry(canvasElement);
    await checkValueBounds(canvasElement);
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: `${copy.edit} ${copy.terms[3]}` })).toHaveFocus();
  },
};
