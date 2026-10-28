import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimen, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";
import { Button } from "../Button/Button";
import { ProgressBar, type ProgressBarProps } from "./ProgressBar";
import styles from "./ProgressBar.stories.module.css";

function copyFor(profile: unknown) {
  const { lang, locale } = getStoryContent(profile);
  const pt = lang !== "en";
  const long = resolveStoryContentProfile(profile).endsWith("long");
  return {
    lang, locale,
    label: pt ? long ? "Preparando e enviando todos os arquivos selecionados para o espaço de trabalho compartilhado" : "Envio de arquivos" : long ? "Preparing and uploading all selected files to the shared workspace" : "File upload",
    steps: pt ? "Etapas concluídas" : "Completed steps", of: pt ? "de" : "of",
    empty: pt ? "Não iniciado" : "Not started", full: pt ? "Concluído" : "Complete",
    next: pt ? "Próxima etapa" : "Next step", reset: pt ? "Reiniciar" : "Reset",
    longValue: pt ? "3 de 5 etapas concluídas nesta demonstração" : "3 of 5 steps completed in this demonstration",
  };
}

type Args = ProgressBarProps;
const meta = {
  id: "feedback-progress-bar", title: "Components/Feedback/ProgressBar", component: ProgressBar, tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["label", "value", "max", "valueText", "showHeading", "thickness", "tone"] },
    docs: { description: { component: "[ProgressBar component in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8988-62)" } },
  },
  args: { label: "File upload", value: 60, max: 100, valueText: "", showHeading: true, thickness: "default", tone: "neutral" },
  argTypes: {
    label: { control: "text", description: "Required accessible name, also visible when showHeading is true. The default demo label follows the language toolbar." },
    value: { control: { type: "number", min: 0 }, description: "Known completion from zero to max. The demo bounds edits to keep Controls usable." },
    max: { control: { type: "number", min: 1 }, description: "Finite positive total. Defaults to 100." },
    valueText: { control: "text", description: "Caller-localized text, such as 3 of 5. Leave blank here for the demo's automatic percentage." },
    showHeading: { control: "boolean", description: "Show the label/value row. When hidden, the surrounding composition supplies visible progress text." },
    thickness: { control: "select", options: ["default", "thin"], description: "Existing spacing tokens: default 6px, thin 2px. Independent of heading visibility." },
    tone: { control: "select", options: ["neutral", "accent", "info", "destructive"], description: "Contextual semantic fill. Neutral is the existing default; destructive also serves error contexts. Progress values and announcements remain caller-owned." },
  },
  render: (args, { globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    const max = Number.isFinite(args.max) && args.max! > 0 ? args.max! : 100;
    const value = Number.isFinite(args.value) ? Math.min(max, Math.max(0, args.value)) : 0;
    return <FoundationStoryPage title="ProgressBar" description="Known completion with a visible label and value. The application supplies the numbers and their meaning.">
      <div lang={copy.lang}><ProgressBar {...args} label={args.label.trim() && args.label !== "File upload" ? args.label : copy.label} value={value} max={max} valueText={args.valueText.trim() || new Intl.NumberFormat(copy.locale, { style: "percent" }).format(value / max)} /></div>
    </FoundationStoryPage>;
  },
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;

async function checkProgress(canvasElement: HTMLElement, { showHeading = true, thickness = "default" }: Pick<ProgressBarProps, "showHeading" | "thickness"> = {}) {
  for (const bar of within(canvasElement).getAllByRole("progressbar") as HTMLProgressElement[]) {
    await expect(bar.tagName).toBe("PROGRESS");
    await expect(bar).toHaveAccessibleName();
    await expect(bar).toHaveAttribute("value");
    await expect(bar.position).toBeGreaterThanOrEqual(0);
    await expect(bar.position).toBeLessThanOrEqual(1);
    await expect(bar.getBoundingClientRect().height).toBe(thickness === "thin" ? 2 : 6);
    const root = bar.closest("[data-progress-bar]")!;
    if (showHeading) {
      await expect(root.querySelector("span")?.textContent).toBe(bar.getAttribute("aria-valuetext"));
    } else {
      await expect(root.querySelector("span")).toBeNull();
      await expect(root.getBoundingClientRect().height).toBe(bar.getBoundingClientRect().height);
    }
    await expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
    await expect(root.querySelector("[aria-live], [aria-busy], [tabindex]")).toBeNull();
  }
  await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
}

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "ProgressBar component in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8988-62" } },
  play: async ({ canvasElement, args }) => checkProgress(canvasElement, args),
};

export const Thin: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    return <FoundationStoryPage title="Thin progress" description="A 2px track with the visible value supplied by its surrounding composition. The bar retains its accessible name and value.">
      <FoundationSpecimenGrid minItemWidth="full" lang={copy.lang}>
        {[0, 2, 4].map(value => <FoundationSpecimen key={value} label={`${value} ${copy.of} 4`}>
          <ProgressBar label={copy.steps} value={value} max={4} valueText={`${value} ${copy.of} 4`} showHeading={false} thickness="thin" />
        </FoundationSpecimen>)}
      </FoundationSpecimenGrid>
    </FoundationStoryPage>;
  },
  play: async ({ canvasElement, globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    for (const [index, bar] of (within(canvasElement).getAllByRole("progressbar", { name: copy.steps }) as HTMLProgressElement[]).entries()) {
      await expect(bar.position).toBe(index / 2);
      await expect(bar).toHaveAttribute("aria-valuetext", `${index * 2} ${copy.of} 4`);
    }
    await checkProgress(canvasElement, { showHeading: false, thickness: "thin" });
  },
};

export const Examples: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true }, figma: { label: "ProgressBar examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8985-6" } },
  render: (_, { globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    return <FoundationStoryPage title="Progress examples" description="Zero and full are explicit values. Percentage and step text are supplied by the consumer.">
      <FoundationSpecimenGrid minItemWidth="full" lang={copy.lang}>
        <FoundationSpecimen label={copy.empty}><ProgressBar label={copy.label} value={0} valueText="0%" /></FoundationSpecimen>
        <FoundationSpecimen label={copy.full}><ProgressBar label={copy.label} value={100} valueText="100%" /></FoundationSpecimen>
        <FoundationSpecimen label={copy.steps}><ProgressBar label={copy.steps} value={3} max={5} valueText={`3 ${copy.of} 5`} /></FoundationSpecimen>
        <FoundationSpecimen label={copy.label}><ProgressBar label={copy.label} value={3} max={5} valueText={copy.longValue} /></FoundationSpecimen>
      </FoundationSpecimenGrid>
    </FoundationStoryPage>;
  },
  play: async ({ canvasElement }) => checkProgress(canvasElement),
};

function UpdatingExample({ profile }: { profile: unknown }) {
  const copy = copyFor(profile);
  const [value, setValue] = useState(3);
  return <div className={styles.example} lang={copy.lang}>
    <ProgressBar label={copy.steps} value={value} max={5} valueText={`${value} ${copy.of} 5`} />
    <div className={styles.actions}><Button variant="secondary" intent="neutral" size="sm" disabled={value === 5} onClick={() => setValue(current => Math.min(current + 1, 5))}>{copy.next}</Button><Button variant="ghost" intent="neutral" size="sm" onClick={() => setValue(0)}>{copy.reset}</Button></div>
  </div>;
}
export const Updating: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true }, figma: { label: "ProgressBar examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8985-6" } },
  render: (_, { globals }) => <FoundationStoryPage title="Caller-owned progress" description="The application changes the value. Completion does not infer a success state or move focus."><UpdatingExample profile={globals.storyContentProfile} /></FoundationStoryPage>,
  play: async ({ canvasElement, globals }) => {
    const copy = copyFor(globals.storyContentProfile);
    const canvas = within(canvasElement);
    const next = canvas.getByRole("button", { name: copy.next });
    await userEvent.click(next);
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("value", "4");
    await expect(next).toHaveFocus();
    await userEvent.click(next);
    await expect(next).toBeDisabled();
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("aria-valuetext", `5 ${copy.of} 5`);
    await userEvent.click(canvas.getByRole("button", { name: copy.reset }));
    await expect(canvas.getByRole("progressbar")).toHaveAttribute("value", "0");
    await checkProgress(canvasElement);
  },
};
