import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { useState } from "react";
import { Button } from "../Button/Button";
import { Link } from "../Link/Link";
import { PageHeader } from "./PageHeader";
import styles from "./PageHeader.stories.module.css";

const meta = {
  id: "navigation-pageheader",
  title: "Components/Navigation/PageHeader",
  component: PageHeader,
  tags: ["test"],
  args: { title: "" },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const geometryCases = [false, true].flatMap(multiline => [false, true].flatMap(helper =>
  [false, true].flatMap(actions => [false, true].map(leading => ({ multiline, helper, actions, leading,
    id: `${multiline ? "multi" : "single"}-${helper ? "helper" : "plain"}-${actions ? "actions" : "no-actions"}-${leading ? "leading" : "no-leading"}` })))));

export const CompactGeometry: Story = {
  tags: ["context-matrix"],
  render: (_args, { globals }) => {
    const pt = String(globals.storyContentProfile).startsWith("pt");
    return <main className={`${styles.canvas} ${styles.matrix}`}>{geometryCases.map(example => <section key={example.id} data-geometry-case={example.id}>
      <PageHeader size="compact" title={<>{pt ? "Endereço" : "Address"}{example.multiline ? <><br />{pt ? "Detalhes" : "Details"}</> : null}</>}
        description={example.helper ? pt ? "Texto de apoio" : "Helper text" : undefined}
        leading={example.leading ? <Button size="sm" variant="ghost" intent="neutral" icon="arrows/compact/left" aria-label={pt ? "Voltar" : "Back"} /> : undefined}
        actions={example.actions ? <Button variant="soft" intent="neutral">{pt ? "Atualizar" : "Refresh"}</Button> : undefined} />
    </section>)}</main>;
  },
  play: async ({ canvasElement, globals }) => {
    const pt = String(globals.storyContentProfile).startsWith("pt"), narrow = matchMedia("(max-width: 63.999rem)").matches;
    const center = (element: HTMLElement) => { const box = element.getBoundingClientRect(); return box.top + box.height / 2; };
    for (const example of geometryCases) {
      const specimen = canvasElement.querySelector<HTMLElement>(`[data-geometry-case="${example.id}"]`)!, c = within(specimen);
      const title = c.getByRole("heading", { level: 1 }), header = title.closest<HTMLElement>("[data-page-header]")!;
      const back = example.leading ? c.getByRole("button", { name: pt ? "Voltar" : "Back" }) : null;
      const action = example.actions ? c.getByRole("button", { name: pt ? "Atualizar" : "Refresh" }) : null;
      expect(title.getBoundingClientRect().height).toBe(example.multiline ? 48 : 24);
      if (back) { expect(back.getBoundingClientRect().width).toBe(28); expect(back.getBoundingClientRect().height).toBe(28); expect(center(back)).toBeCloseTo(center(title), 1); }
      if (action && !narrow) expect(center(action)).toBeCloseTo(center(title), 1);
      const rowBottom = Math.max(title.getBoundingClientRect().bottom, back?.getBoundingClientRect().bottom ?? 0, !narrow ? action?.getBoundingClientRect().bottom ?? 0 : 0);
      const helper = example.helper ? c.getByText(pt ? "Texto de apoio" : "Helper text") : null;
      if (helper) { expect(helper.getBoundingClientRect().left).toBeCloseTo(header.getBoundingClientRect().left, 1); expect(helper.getBoundingClientRect().top - rowBottom).toBeCloseTo(8, 1); }
      if (action && narrow) expect(action.getBoundingClientRect().top - (helper?.getBoundingClientRect().bottom ?? rowBottom)).toBeCloseTo(16, 1);
      expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth + 1);
      if (example.leading && example.helper && example.actions && import.meta.env.MODE === "test") {
        const { page } = await import("vitest/browser");
        await page.screenshot({ element: specimen, path: `__screenshots__/compact-header-${example.multiline ? "multi" : "single"}-${innerWidth}.png` });
      }
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  },
};

export const InlineActions: Story = {
  tags: ["context-matrix"],
  render: (_args, { globals }) => {
    const pt = String(globals.storyContentProfile).startsWith("pt");
    return <main className={`${styles.canvas} ${styles.matrix}`}>{["Casa Verde", pt ? "Restaurante da família e dos amigos com um nome muito longo" : "Restaurant of family and friends with a very long name"].map(title => <section key={title} data-inline-case="">
      <PageHeader size="compact" actionsLayout="inline" title={title}
        leading={<Button size="sm" variant="soft" intent="neutral" icon="arrows/basic/left" aria-label={pt ? "Voltar" : "Back"} />}
        actions={<Button size="md" variant="primary" intent="neutral">{pt ? "Adicionar prato" : "Add dish"}</Button>} />
    </section>)}</main>;
  },
  play: async ({ canvasElement, globals }) => {
    const pt = String(globals.storyContentProfile).startsWith("pt");
    for (const specimen of canvasElement.querySelectorAll<HTMLElement>("[data-inline-case]")) {
      const c = within(specimen), title = c.getByRole("heading", { level: 1 }), header = title.closest<HTMLElement>("[data-page-header]")!;
      const back = c.getByRole("button", { name: pt ? "Voltar" : "Back" }), add = c.getByRole("button", { name: pt ? "Adicionar prato" : "Add dish" });
      const nameBox = title.getBoundingClientRect(), backBox = back.getBoundingClientRect(), addBox = add.getBoundingClientRect();
      expect(getComputedStyle(header).flexDirection).toBe("row");
      expect(backBox.right).toBeLessThanOrEqual(nameBox.left); expect(nameBox.right).toBeLessThanOrEqual(addBox.left);
      expect(backBox.top + backBox.height / 2).toBeCloseTo(nameBox.top + nameBox.height / 2, 1);
      expect(addBox.top + addBox.height / 2).toBeCloseTo(nameBox.top + nameBox.height / 2, 1);
      expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth + 1);
    }
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  },
};

function CompactExample({ portuguese, minimal = false }: { portuguese: boolean; minimal?: boolean }) {
  const [returned, setReturned] = useState(false);
  return <main className={styles.canvas}>
    <PageHeader size="compact" title={portuguese ? "Visão geral dos restaurantes e das refeições preparadas para a próxima semana" : "Overview of restaurant preparation and meals for the coming week"}
      description={minimal ? undefined : portuguese ? "Acompanhe o trabalho atual e as informações do restaurante." : "Follow current work and restaurant information."}
      leading={minimal ? undefined : <Button size="lg" variant="ghost" intent="neutral" icon="arrows/compact/left" aria-label={portuguese ? "Voltar à visão geral" : "Back to overview"} onClick={() => setReturned(true)} />}
      actions={minimal ? undefined : <Button variant="soft" intent="neutral">{portuguese ? "Atualizar" : "Refresh"}</Button>} />
    {returned ? <p role="status">{portuguese ? "Ação de voltar recebida" : "Back action received"}</p> : null}
  </main>;
}

export const Compact: Story = {
  tags: ["context-matrix"],
  render: (_args, { globals }) => <CompactExample portuguese={String(globals.storyContentProfile).startsWith("pt")} />,
  play: async ({ canvas, canvasElement, globals }) => {
    const pt = String(globals.storyContentProfile).startsWith("pt");
    const heading = canvas.getByRole("heading", { level: 1 });
    expect(getComputedStyle(heading).fontSize).toBe("20px"); expect(getComputedStyle(heading).lineHeight).toBe("24px");
    const back = canvas.getByRole("button", { name: pt ? "Voltar à visão geral" : "Back to overview" });
    const titleBox = heading.getBoundingClientRect(), backBox = back.getBoundingClientRect();
    expect(backBox.width).toBe(44); expect(backBox.height).toBe(44);
    expect(backBox.top + backBox.height / 2).toBeCloseTo(titleBox.top + titleBox.height / 2, 1);
    back.focus(); await expect(back).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(canvas.getByRole("status")).toHaveTextContent(pt ? "Ação de voltar recebida" : "Back action received");
    expect(canvasElement.querySelectorAll("h1")).toHaveLength(1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  },
};

export const CompactMinimal: Story = {
  name: "Compact minimal", tags: ["context-matrix"],
  render: (_args, { globals }) => <CompactExample portuguese={String(globals.storyContentProfile).startsWith("pt")} minimal />,
  play: async ({ canvas }) => {
    expect(canvas.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(canvas.queryByRole("button")).toBeNull();
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  },
};

export const Default: Story = {
  render: () => (
    <main className={styles.canvas}>
      <PageHeader
        actions={<Link href="#history">View history</Link>}
        description="Review incoming work, current preparation state, and exceptions that need attention."
        title="Today’s operational queue"
      />
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(canvas.getByRole("link")).toBeVisible();
  },
};

export const Narrow: Story = {
  ...Default,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "narrow" },
  },
};

export const Wide: Story = {
  ...Default,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "boundaryXl" },
  },
};
