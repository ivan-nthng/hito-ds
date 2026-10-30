import { useId, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import {
  FoundationStoryPage,
  FoundationSpecimen,
  FoundationSpecimenGrid,
} from "../../foundations/FoundationStoryLayout";
import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";
import { Button } from "../Button/Button";
import { Text } from "../Text/Text";
import { Menu } from "../Menu/Menu";
import { Popover } from "../Popover/Popover";
import { Icon } from "../Icon/Icon";
import { Surface } from "../Surface/Surface";
import { resolveConcentricOuterRadius } from "@hito-ds/react/tokens/semantic-radii";
import { Card, CardHeader, cardElevations, cardLayouts, cardSizes, type CardHeaderProps, type CardProps } from "./Card";
import styles from "./Card.stories.module.css";

type StoryArgs = Pick<CardProps, "size" | "layout" | "elevation"> & {
  content: "text" | "header" | "actions";
  headerContent?: HeaderContent;
  headingLevel?: CardHeaderProps["headingLevel"];
};
const headerContents = ["title", "add", "overflow", "both", "none"] as const;
type HeaderContent = typeof headerContents[number];

function getCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const long = resolved.endsWith("long");
  return lang === "en" ? {
    lang,
    title: long ? "Review the preferences saved for your next delivery" : "Delivery preferences",
    body: long ? "Review the address, delivery window and instructions before continuing. You can return to update these preferences whenever your plans change." : "Your address and delivery instructions are saved. You can update them at any time.",
    action: long ? "Review all delivery preferences" : "Review details",
    secondary: "Not now",
    result: "Demo action performed",
  } : {
    lang,
    title: long ? "Confira as preferências salvas para sua próxima entrega" : "Preferências de entrega",
    body: long ? "Confira o endereço, o período de entrega e as instruções antes de continuar. Você pode voltar para atualizar essas preferências sempre que seus planos mudarem." : "Seu endereço e suas instruções de entrega estão salvos. Você pode atualizar essas informações a qualquer momento.",
    action: long ? "Conferir todas as preferências de entrega" : "Conferir detalhes",
    secondary: "Agora não",
    result: "Ação de demonstração executada",
  };
}

function Example({ content, profile, ...args }: StoryArgs & { profile: unknown }) {
  const copy = getCopy(profile);
  const [activated, setActivated] = useState(false);
  return (
    <div className={styles.content} lang={copy.lang}>
      <Card {...args} as="article">
        <div className={styles.content}>
          {content === "text" ? <Text variant="body-base">{copy.body}</Text> : (
            <header className={styles.heading}>
              <CardHeader title={copy.title} headingLevel={2} />
              <Text className={styles.body} variant="body-sm">{copy.body}</Text>
            </header>
          )}
          {content === "actions" ? (
            <footer className={styles.actions}>
              <Button size="md" intent="neutral" variant="soft" onClick={() => setActivated(false)}>{copy.secondary}</Button>
              <Button size="md" intent="accent" variant="primary" onClick={() => setActivated(true)}>{copy.action}</Button>
            </footer>
          ) : null}
        </div>
      </Card>
      <Text className={styles.result} variant="body-sm" role="status">{activated ? copy.result : ""}</Text>
    </div>
  );
}

const meta = {
  id: "data-card",
  title: "Components/Collections/Card",
  component: Card,
  tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["size", "layout", "elevation", "content"] } },
  args: { size: "compact", layout: "responsive", elevation: "none", content: "actions" },
  argTypes: {
    size: { control: "select", options: cardSizes },
    layout: { control: "inline-radio", options: cardLayouts },
    elevation: { control: "inline-radio", options: cardElevations },
    content: { control: "select", options: ["text", "header", "actions"] },
  },
  render: (args, { globals }) => (
    <FoundationStoryPage title="Card" description="A content container. Fixed or responsive geometry controls padding and radius together; the parent controls width.">
      <Example {...args} profile={globals.storyContentProfile} />
    </FoundationStoryPage>
  ),
} satisfies Meta<StoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Card in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8815-178",
    },
  },
  tags: ["context-matrix"],
  play: async ({ args, canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("article");
    await expect(card).not.toHaveAttribute("tabindex");
    await expect(card.querySelector("[aria-live], [role=status], [role=alert]")).toBeNull();
    await expect(getComputedStyle(card).overflow).toBe("visible");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    if (args.content === "actions") {
      const copy = getCopy(globals.storyContentProfile);
      const action = canvas.getByRole("button", { name: copy.action });
      action.focus();
      await userEvent.keyboard("{Enter}");
      await expect(canvas.getByRole("status")).toHaveTextContent(copy.result);
      await expect(action).toHaveFocus();
      const secondary = canvas.getByRole("button", { name: copy.secondary });
      await userEvent.click(secondary);
      await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
      secondary.blur();
    }
  },
};

export const Anatomy: Story = {
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => (
    <FoundationStoryPage title="Card anatomy" description="Children provide the content. Heading, body and actions are optional composition, with no empty slots.">
      <FoundationSpecimenGrid minItemWidth="full">
        <FoundationSpecimen label="Content only"><Example content="text" profile={globals.storyContentProfile} /></FoundationSpecimen>
        <FoundationSpecimen label="Heading and body"><Example content="header" profile={globals.storyContentProfile} /></FoundationSpecimen>
        <FoundationSpecimen label="With actions"><Example content="actions" size="comfortable" profile={globals.storyContentProfile} /></FoundationSpecimen>
      </FoundationSpecimenGrid>
    </FoundationStoryPage>
  ),
};

function headerCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const long = resolved.endsWith("long");
  return lang === "en" ? {
    lang, title: long ? "Contact details and instructions for collection" : "Contact",
    add: "Add", more: "More actions", inspect: "Review details", reset: "Clear result",
    body: "The card owns its padding and radius. The header identifies this section.",
    result: "Action performed", cases: ["Title only", "Adjacent Add", "Overflow", "Both actions", "Headerless"],
  } : {
    lang, title: long ? "Dados de contato e instruções para retirada" : "Contato",
    add: "Adicionar", more: "Mais ações", inspect: "Revisar detalhes", reset: "Limpar resultado",
    body: "O cartão define o espaçamento e o raio. O cabeçalho identifica esta seção.",
    result: "Ação realizada", cases: ["Somente título", "Adicionar ao lado", "Mais ações", "Ambas as ações", "Sem cabeçalho"],
  };
}

function HeaderExample({ mode, profile, headingLevel = 2, ...cardProps }: Pick<StoryArgs, "size" | "layout" | "elevation" | "headingLevel"> & { mode: HeaderContent; profile: unknown }) {
  const copy = headerCopy(profile);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [performed, setPerformed] = useState(false);
  return <div className={styles.content} lang={copy.lang} data-header-example={mode}>
    <Card {...cardProps} as="article" aria-labelledby={mode === "none" ? undefined : titleId}>
      <div className={styles.content}>
        {mode !== "none" ? <CardHeader title={copy.title} headingLevel={headingLevel} titleId={titleId}
          action={mode === "add" || mode === "both" ? <Button size="md" variant="secondary" intent="neutral" onClick={() => setPerformed(true)}>{copy.add}</Button> : undefined}
          overflow={mode === "overflow" || mode === "both" ? <Menu label={copy.more} open={open} onOpenChange={setOpen} align="end"
            trigger={<Button size="md" variant="ghost" intent="neutral" icon="controls/more" aria-label={copy.more} />}
            items={[{ id: "inspect", label: copy.inspect }, { id: "reset", label: copy.reset }]}
            onAction={id => setPerformed(id === "inspect")} /> : undefined} /> : null}
        <Text variant="body-sm">{copy.body}</Text>
      </div>
    </Card>
    <Text variant="body-sm" role="status">{performed ? copy.result : ""}</Text>
  </div>;
}

async function checkHeaders(canvasElement: HTMLElement, profile: unknown) {
  const copy = headerCopy(profile);
  for (const specimen of canvasElement.querySelectorAll<HTMLElement>("[data-header-example]")) {
    const canvas = within(specimen);
    const card = specimen.querySelector<HTMLElement>("[data-card]")!;
    const header = specimen.querySelector<HTMLElement>("[data-card-header]");
    if (specimen.dataset.headerExample === "none") {
      await expect(header).toBeNull();
      await expect(card.firstElementChild?.children).toHaveLength(1);
      continue;
    }
    await expect(header).not.toBeNull();
    const heading = canvas.getByRole("heading", { name: copy.title });
    const style = getComputedStyle(header!);
    await expect(style.paddingTop).toBe("0px");
    await expect(style.borderTopWidth).toBe("0px");
    await expect(style.overflow).toBe("visible");
    await expect(style.columnGap).toBe("16px");
    await expect(getComputedStyle(header!.firstElementChild!).gap).toBe("8px");
    await expect(getComputedStyle(heading).fontSize).toBe("20px");
    await expect(getComputedStyle(heading).lineHeight).toBe("24px");
    await expect(header!.scrollWidth).toBeLessThanOrEqual(header!.clientWidth);
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    for (const button of header!.querySelectorAll<HTMLButtonElement>("button")) {
      await expect(heading.contains(button)).toBe(false);
      await expect(button.getBoundingClientRect().height).toBe(36);
    }
    const add = canvas.queryByRole("button", { name: copy.add });
    if (add) {
      const titleRect = heading.getBoundingClientRect(); const actionRect = add.getBoundingClientRect();
      await expect(actionRect.top >= titleRect.bottom || actionRect.left >= titleRect.right).toBe(true);
      add.focus(); await userEvent.keyboard("{Enter}");
      await expect(canvas.getByRole("status")).toHaveTextContent(copy.result);
    }
    const more = canvas.queryByRole("button", { name: copy.more });
    if (more) {
      const box = more.getBoundingClientRect();
      await expect(box.width).toBe(36);
      await expect(box.top).toBe(header!.getBoundingClientRect().top);
      await expect(heading.getBoundingClientRect().right).toBeLessThanOrEqual(box.left);
      more.focus(); await userEvent.keyboard("{ArrowDown}");
      await expect(more).toHaveAttribute("aria-expanded", "true");
      await expect(canvas.getByRole("menuitem", { name: copy.inspect })).toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect(more).toHaveFocus();
      await expect(more).toHaveAttribute("aria-expanded", "false");
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard("{End}{Enter}");
      await expect(canvas.getByRole("status")).toBeEmptyDOMElement();
      await expect(more).toHaveFocus();
      more.blur();
    }
  }
}

export const Header: Story = {
  args: { headerContent: "both", headingLevel: 2 },
  parameters: { controls: { include: ["size", "layout", "elevation", "headerContent", "headingLevel"] },
    figma: { label: "Shared CardHeader", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9228-446" } },
  argTypes: { headerContent: { control: "select", options: headerContents }, headingLevel: { control: "select", options: [1, 2, 3] } },
  render: ({ headerContent = "both", headingLevel, size, layout, elevation }, { globals }) => <FoundationStoryPage title="CardHeader" description="An optional section title with adjacent and overflow actions. Card owns its geometry; callers own native controls, copy and permissions.">
    <HeaderExample headingLevel={headingLevel} size={size} layout={layout} elevation={elevation} mode={headerContent} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: ({ canvasElement, globals }) => checkHeaders(canvasElement, globals.storyContentProfile),
};

export const HeaderContexts: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => <FoundationStoryPage title="CardHeader combinations" description="Optional controls, headerless content and long section titles retain native behavior at narrow widths.">
    <FoundationSpecimenGrid minItemWidth="full">
      {headerContents.map((mode, index) => <FoundationSpecimen key={mode} label={headerCopy(globals.storyContentProfile).cases[index]}>
        <HeaderExample mode={mode} profile={globals.storyContentProfile} size="comfortable" layout="fixed" />
      </FoundationSpecimen>)}
    </FoundationSpecimenGrid>
  </FoundationStoryPage>,
  play: ({ canvasElement, globals }) => checkHeaders(canvasElement, globals.storyContentProfile),
};

const feedbackStates = ["idle", "pending", "saving", "saved", "invalid", "uncertain", "conflict", "review"] as const;
function feedbackCopy(profile: unknown) {
  const { lang } = getStoryContent(resolveStoryContentProfile(profile));
  return lang === "en" ? {
    lang, title: "Restaurant profile", next: "Next save state", close: "Close", actions: ["Check save", "Reload saved profile", "Save my edits"],
    labels: ["", "Unsaved changes", "Saving…", "Saved", "Check this value.", "Save not confirmed", "Profile changed", "Review edits"],
    details: ["We couldn’t confirm this save. Check the same request before making more changes.", "This profile changed elsewhere. Your edits have been kept. Reload the saved profile before trying again.", "The latest profile is loaded. Review your edits before saving them."],
    body: "Casa Verde — a long restaurant name whose position must stay unchanged during saving.",
  } : {
    lang, title: "Perfil do restaurante", next: "Próximo estado de salvamento", close: "Fechar", actions: ["Verificar salvamento", "Recarregar perfil salvo", "Salvar minhas edições"],
    labels: ["", "Alterações pendentes", "Salvando…", "Salvo", "Verifique este valor.", "Salvamento não confirmado", "Perfil alterado", "Revisar edições"],
    details: ["Não foi possível confirmar o salvamento. Verifique a mesma solicitação antes de fazer mais alterações.", "Este perfil foi alterado em outro lugar. Suas edições foram mantidas. Recarregue o perfil salvo antes de tentar novamente.", "O perfil mais recente foi carregado. Revise suas edições antes de salvá-las."],
    body: "Casa Verde — um nome de restaurante longo que deve permanecer no mesmo lugar durante o salvamento.",
  };
}
function HeaderFeedbackExample({ profile }: { profile: unknown }) {
  const copy = feedbackCopy(profile), [index, setIndex] = useState(0), [open, setOpen] = useState(false);
  const status = useRef<HTMLDivElement>(null), recoveryReturn = useRef<HTMLElement>(null);
  const state = feedbackStates[index], recovery = index >= 5;
  return <div className={styles.content} lang={copy.lang}>
    <Card size="comfortable" layout="fixed" data-feedback-example="">
      <div className={styles.content}>
        <header className={styles.feedbackHeader}>
          <CardHeader title={copy.title} headingLevel={2} />
          <div className={styles.feedbackStatus} data-state={state} ref={status} tabIndex={-1}>
            <Text as="span" className={styles.feedbackAnnouncement} role="status" aria-atomic="true">{recovery ? copy.details[index - 5] : copy.labels[index]}</Text>
            {recovery ? <Popover title={copy.labels[index]} open={open} onOpenChange={next => { if (next) recoveryReturn.current = null; setOpen(next); }} closeLabel={copy.close}
              initialFocus="title" returnFocusRef={recoveryReturn}
              trigger={<Button size="sm" variant="ghost" intent="neutral" trailingIcon="arrows/compact/down">{copy.labels[index]}</Button>}
              footer={<Button size="sm" variant="soft" intent="neutral" onClick={() => { recoveryReturn.current = status.current; setOpen(false); setIndex(index === 6 ? 7 : 2); }}>{copy.actions[index - 5]}</Button>}>
              <Text variant="body-sm">{copy.details[index - 5]}</Text>
            </Popover> : <span className={styles.feedbackLabel} aria-hidden="true">
              {state === "saved" ? <Icon name="general/check" size="sm" tone="success" /> : null}<Text as="span" variant="body-sm">{copy.labels[index]}</Text>
            </span>}
          </div>
        </header>
        <Text data-feedback-body="">{copy.body}</Text>
      </div>
    </Card>
    <div><Button variant="secondary" intent="neutral" onClick={() => setIndex(value => (value + 1) % feedbackStates.length)}>{copy.next}</Button></div>
  </div>;
}
export const HeaderSaveFeedback: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true }, figma: { label: "Reused CardHeader primitive · caller owns save feedback", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9228-446" } },
  render: (_, { globals }) => <FoundationStoryPage title="CardHeader · Save feedback" description="Caller-owned status beside CardHeader. A reserved row prevents layout shifts; the standard Popover holds recovery details. The caller owns persistence and confirmed-save truth.">
    <HeaderFeedbackExample profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement), copy = feedbackCopy(globals.storyContentProfile);
    await canvasElement.ownerDocument.fonts.ready;
    const card = canvasElement.querySelector<HTMLElement>("[data-feedback-example]")!;
    const heading = within(card).getByRole("heading", { name: copy.title });
    const body = card.querySelector<HTMLElement>("[data-feedback-body]")!;
    const start = { heading: heading.getBoundingClientRect().toJSON(), body: body.getBoundingClientRect().toJSON() };
    for (let index = 1; index < feedbackStates.length; index++) {
      await userEvent.click(canvas.getByRole("button", { name: copy.next }));
      await expect(heading.getBoundingClientRect().toJSON()).toEqual(start.heading);
      await expect(body.getBoundingClientRect().toJSON()).toEqual(start.body);
      await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    }
    const trigger = within(card).getByRole("button", { name: copy.labels[7] });
    await userEvent.click(trigger);
    const panel = canvas.getByRole("dialog", { name: copy.labels[7] });
    await expect(within(panel).getByText(copy.details[2])).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
    await userEvent.click(trigger);
    await userEvent.click(within(panel).getByRole("button", { name: copy.actions[2] }));
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.labels[2]);
    await expect(card.querySelector("[data-state=saving]")).toHaveFocus();
    await expect(body.getBoundingClientRect().toJSON()).toEqual(start.body);
    await userEvent.click(canvas.getByRole("button", { name: copy.next }));
  },
};

export const NestedRadius: Story = {
  parameters: { controls: { disable: true } },
  render: () => <FoundationStoryPage title="Card nested radius" description="For a directly visible inner Surface, fixed Card geometry follows the next admitted outer radius above the inner radius plus Card padding. Ordinary Card content remains independent.">
    <FoundationSpecimenGrid minItemWidth="full">
      {(["compact", "comfortable"] as const).map((size) => {
        const insetSpacingId = size === "compact" ? "space/2" : "space/4";
        const resolution = resolveConcentricOuterRadius({ innerRadiusId: "radius/layout/fixed/xs", insetSpacingId });
        return <FoundationSpecimen key={size} label={`${size}: ${resolution.strictSourcePx}px strict → ${resolution.outerReferenceId} (${resolution.resolvedOuterSourcePx}px)`}>
          <Card as="article" layout="fixed" size={size} data-nested-card={size}>
            <Surface className={styles.nestedSurface}><Text variant="body-sm">Nested surface</Text></Surface>
          </Card>
        </FoundationSpecimen>;
      })}
    </FoundationSpecimenGrid>
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    for (const [size, outer, inset] of [["compact", 16, 8], ["comfortable", 24, 16]] as const) {
      const card = canvasElement.querySelector<HTMLElement>(`[data-nested-card="${size}"]`);
      const inner = card?.querySelector<HTMLElement>(`.${styles.nestedSurface}`);
      await expect(card).not.toBeNull();
      await expect(inner).not.toBeNull();
      await expect(parseFloat(getComputedStyle(card!).borderTopLeftRadius)).toBe(outer);
      await expect(parseFloat(getComputedStyle(card!).paddingTop)).toBe(inset);
      await expect(parseFloat(getComputedStyle(inner!).borderTopLeftRadius)).toBe(6);
    }
  },
};

function tokenPixels(element: Element, variable: string) {
  // Resolve CSS math in the test browser; custom-property strings can now contain calc().
  const probe = document.createElement("span");
  probe.style.borderRadius = `var(${variable})`;
  element.append(probe);
  const value = parseFloat(getComputedStyle(probe).borderTopLeftRadius);
  probe.remove();
  return value;
}

/** The geometry matrix is test evidence; the default Canvas stays a single adjustable Card. */
export const Geometry: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const copy = getCopy(globals.storyContentProfile);
    return (
      <FoundationStoryPage title="Card geometry" description="Size, responsive geometry and elevation remain independent.">
        <FoundationSpecimenGrid lang={copy.lang}>
          {cardLayouts.flatMap(layout => cardSizes.flatMap(size => cardElevations.map(elevation => (
            <FoundationSpecimen key={`${layout}-${size}-${elevation}`} label={`${size} · ${layout} · ${elevation}`}>
              <Example size={size} layout={layout} elevation={elevation} content="actions" profile={globals.storyContentProfile} />
            </FoundationSpecimen>
          ))))}
        </FoundationSpecimenGrid>
      </FoundationStoryPage>
    );
  },
  play: async ({ canvasElement }) => {
    for (const card of canvasElement.querySelectorAll<HTMLElement>("[data-card]")) {
      const { size, layout, elevation } = card.dataset;
      const style = getComputedStyle(card);
      const paddingToken = `--layout-space-${layout}-${size === "compact" ? "sm" : "lg"}`;
      const radiusToken = layout === "fixed"
        ? `--radius-layout-fixed-${size === "compact" ? "lg" : "xl"}`
        : `--card-radius-responsive-${size}`;
      await expect(parseFloat(style.paddingTop)).toBe(tokenPixels(card, paddingToken));
      await expect(parseFloat(style.paddingRight)).toBe(parseFloat(style.paddingTop));
      await expect(parseFloat(style.borderTopLeftRadius)).toBe(tokenPixels(card, radiusToken));
      await expect(style.borderTopWidth).toBe("0px");
      await expect(style.boxShadow === "none").toBe(elevation === "none");
      await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
      await expect(style.overflow).toBe("visible");
    }
  },
};

export const ResponsiveRadiusSeams: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <>{cardSizes.map(size => <Card key={size} size={size} layout="responsive"><Text>{size}</Text></Card>)}</>,
  play: async ({ canvasElement }) => {
    if (import.meta.env.MODE !== "test") return;
    const { page } = await import("vitest/browser");
    const original = { width: innerWidth, height: innerHeight };
    const root = document.documentElement;
    const scale = root.style.getPropertyValue("--radius-scale");
    const priority = root.style.getPropertyPriority("--radius-scale");
    try {
      for (const factor of [1, 1.5]) {
        root.style.setProperty("--radius-scale", String(factor));
        for (const width of [320, 639, 640, 1023, 1024, 1279, 1280]) {
          await page.viewport(width, 720);
          const mode = width < 640 ? 0 : width < 1024 ? 1 : width < 1280 ? 2 : 3;
          for (const card of canvasElement.querySelectorAll<HTMLElement>("[data-card]")) {
            const compact = card.dataset.size === "compact";
            const expected = (compact ? [12, 16, 20, 24] : [24, 24, 28, 32])[mode] * factor;
            const css = getComputedStyle(card);
            expect(parseFloat(css.borderTopLeftRadius)).toBe(expected);
            expect(parseFloat(css.paddingTop)).toBe((compact ? [12, 16, 16, 20] : [16, 20, 24, 32])[mode]);
          }
        }
      }
    } finally {
      if (scale) root.style.setProperty("--radius-scale", scale, priority); else root.style.removeProperty("--radius-scale");
      await page.viewport(original.width, original.height);
    }
  },
};
