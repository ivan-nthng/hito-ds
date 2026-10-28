import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppShell } from "./AppShell";
import { AccountTrigger } from "../AccountTrigger/AccountTrigger";
import { Button } from "../Button/Button";
import { Card } from "../Card/Card";
import { PageHeader } from "../PageHeader/PageHeader";
import { ServiceSwitcher } from "../ServiceSwitcher/ServiceSwitcher";
import { TextInput } from "../TextInput/TextInput";
import kitchen from "../../../assets/hub-soft-3d/png-64/hub-kitchen.png";
import styles from "./AppShell.story.module.css";

const src = (asset: string | { src: string }) => typeof asset === "string" ? asset : asset.src;
function Example({ pt }: { pt: boolean }) {
  const [section, setSection] = useState("overview"), [locked, setLocked] = useState(false), [serviceOpen, setServiceOpen] = useState(false), [accountOpen, setAccountOpen] = useState(false);
  const labels = pt ? { overview: "Visão geral", menu: "Cardápio", production: "Produção", navigation: "Navegação", collapse: "Recolher navegação", expand: "Expandir navegação", draft: "Descrição não salva", lock: "Alternar ação pendente" }
    : { overview: "Overview", menu: "Menu", production: "Production", navigation: "Navigation", collapse: "Collapse navigation", expand: "Expand navigation", draft: "Unsaved description", lock: "Toggle pending action" };
  return <AppShell lang={pt ? "pt" : "en"} mainId="shell-example" skipLabel={pt ? "Pular para conteúdo" : "Skip to content"} collapseLabel={labels.collapse} expandLabel={labels.expand} navigationDisabled={locked}
    service={({ compact }) => <ServiceSwitcher compact={compact} label="Kitchen" menuLabel="Services" artwork={{ src: src(kitchen) }} open={serviceOpen} onOpenChange={setServiceOpen} items={[{ id: "hub", label: "Hub" }]} onAction={() => {}} />}
    navigation={{ label: labels.navigation, triggerLabel: labels.navigation, items: [
      { id: "overview", label: labels.overview, icon: "general/dashboard", current: section === "overview" },
      { id: "menu", label: labels.menu, icon: "delivery/food", current: section === "menu" },
      { id: "production", label: labels.production, icon: "general/kitchen", disabled: true, disabledReason: pt ? "Em breve" : "Coming soon" },
    ], onAction: setSection }}
    user={({ compact, mobile }) => <AccountTrigger compact={compact || mobile} label="Alex Silva — restaurant manager" avatar={{ initials: "AS" }} menuLabel="Account" open={accountOpen} onOpenChange={setAccountOpen} items={[{ id: "preferences", label: "Preferences" }]} onAction={() => {}} />}>
    <Card size="comfortable" layout="responsive" className={styles.content}>
      <PageHeader size="compact" title={section === "overview" ? labels.overview : labels.menu} />
      <TextInput aria-label={labels.draft} defaultValue="Retained draft" />
      <Button variant="soft" intent="neutral" onClick={() => setLocked(value => !value)} aria-pressed={locked}>{labels.lock}</Button>
    </Card>
  </AppShell>;
}
const meta = { title: "Components/Navigation/AppShell", id: "navigation-app-shell", tags: ["test", "context-matrix"],
  parameters: { layout: "fullscreen", figma: { label: "Accepted workspace shell", url: "https://github.com/ivan-nthng/hito-ds/blob/main/docs/figma-and-code.md#figma-file-and-mappings" }, docs: { description: { component: "One structural renderer for existing workspaces. Callers own navigation availability, guards, identity and content. Collapse is mounted presentation state; mobile uses the native topbar Menu. Playground intentionally disables Production to demonstrate a disabled item; the actual consumer fixtures use staging-ready availability. No routes, storage or business requests." } } },
  render: (_args, { globals }) => <Example pt={String(globals.storyContentProfile).startsWith("pt")} />,
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const HoverFocusAndPin: Story = { play: async ({ canvasElement, globals }) => {
  if (innerWidth < 1024) return; // Native mobile Menu is covered by the retained-draft and touch cases.
  const c = within(canvasElement), pt = String(globals.storyContentProfile).startsWith("pt");
  const main = c.getByRole("main"), shell = main.parentElement!, sidebar = c.getByRole("complementary"), input = c.getByRole("textbox");
  const collapseName = pt ? "Recolher navegação" : "Collapse navigation", pinName = pt ? "Expandir navegação" : "Expand navigation";
  const expanded = main.getBoundingClientRect();
  await snapshot("expanded");
  await userEvent.click(c.getByRole("button", { name: collapseName }));
  input.focus(); await hover(main);
  await waitFor(() => expect(sidebar.getBoundingClientRect().width, `after collapse: preview=${shell.hasAttribute("data-preview")} focus=${document.activeElement?.getAttribute("aria-label")}`).toBe(52));
  const compact = main.getBoundingClientRect(), serviceTop = c.getByRole("button", { name: "Kitchen" }).getBoundingClientRect().top;
  expect(c.queryByRole("button", { name: pinName })).toBeNull();
  await snapshot("compact");
  await hover(sidebar);
  await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBe(248));
  expect(shell).toHaveAttribute("data-preview");
  expect(main.getBoundingClientRect().left).toBe(compact.left); expect(main.getBoundingClientRect().width).toBe(compact.width);
  expect(c.getByRole("button", { name: "Kitchen" }).getBoundingClientRect().top).toBe(serviceTop);
  await hover(main);
  await waitFor(() => expect(sidebar.getBoundingClientRect().width, `after hover exit: preview=${shell.hasAttribute("data-preview")} focus=${document.activeElement?.getAttribute("aria-label")}`).toBe(52));
  expect(main.getBoundingClientRect().left).toBe(compact.left);
  await hover(sidebar);
  await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBe(248));
  const pin = c.getByRole("button", { name: pinName }), glyph = pin.querySelector<HTMLElement>('[data-icon-name="controls/pin"]')!;
  expect(glyph.getBoundingClientRect().width).toBe(16); expect(getComputedStyle(glyph).maskImage).not.toBe("none");
  expect(pin.parentElement!.getBoundingClientRect().width).toBe(44);
  await snapshot("temporary");
  await userEvent.click(c.getByRole("button", { name: "Kitchen" }));
  await c.findByRole("menu", { name: "Services" });
  await hover(main); expect(shell).toHaveAttribute("data-preview");
  await keyboard("{Escape}"); await waitFor(() => expect(c.queryByRole("menu", { name: "Services" })).toBeNull());
  expect(shell).toHaveAttribute("data-preview");
  await keyboard("{Escape}"); await waitFor(() => expect(shell).not.toHaveAttribute("data-preview"));
  await waitFor(() => expect(sidebar.getBoundingClientRect().width, `after Escape: preview=${shell.hasAttribute("data-preview")} focus=${document.activeElement?.getAttribute("aria-label")}`).toBe(52));
  expect(c.getByRole("button", { name: "Kitchen" })).toHaveFocus();
  input.focus(); await hover(main); await hover(sidebar);
  await waitFor(() => expect(sidebar.getBoundingClientRect().width).toBe(248));
  await userEvent.click(c.getByRole("button", { name: pinName }));
  expect(shell).not.toHaveAttribute("data-compact"); expect(shell).not.toHaveAttribute("data-preview");
  const widths: number[] = [], shadows: number[] = [];
  await new Promise<void>(resolve => {
    const start = performance.now();
    const frame = () => { widths.push(main.getBoundingClientRect().width); shadows.push(Number(getComputedStyle(sidebar, "::before").opacity));
      if (performance.now() - start < 400) requestAnimationFrame(frame); else resolve(); };
    requestAnimationFrame(frame);
  });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    expect(widths.some(width => width > expanded.width && width < compact.width)).toBe(true);
    expect(shadows.some(opacity => opacity > 0 && opacity < 1)).toBe(true);
  }
  await waitFor(() => expect(main.getBoundingClientRect().left).toBe(expanded.left));
  expect(main.getBoundingClientRect().right).toBe(compact.right);
  expect(getComputedStyle(sidebar, "::before").opacity).toBe("0");
  await snapshot("pinned");
  await hover(main); expect(shell).not.toHaveAttribute("data-compact");
  expect(c.getByRole("main")).toBe(main); expect(c.getByRole("textbox")).toBe(input); expect(input).toHaveValue("Retained draft");
  // Reverse an in-flight layout transition; Main and its draft must stay mounted.
  await userEvent.click(c.getByRole("button", { name: collapseName })); input.focus(); await hover(main); await hover(sidebar);
  await c.findByRole("button", { name: pinName }); await userEvent.click(c.getByRole("button", { name: pinName }));
  await userEvent.click(c.getByRole("button", { name: collapseName })); await hover(main);
  await waitFor(() => expect(sidebar.getBoundingClientRect().width, `after interruption: preview=${shell.hasAttribute("data-preview")} focus=${document.activeElement?.getAttribute("aria-label")}`).toBe(52));
  expect(shell).toHaveAttribute("data-compact"); expect(c.getByRole("textbox")).toBe(input);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
} };
async function snapshot(label: string) {
  if (import.meta.env.MODE !== "test") return;
  const { page } = await import("vitest/browser"), scheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  await page.screenshot({ path: `__screenshots__/savi435-${label}-${innerWidth}-${scheme}.png` });
}
async function hover(element: HTMLElement) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.hover(element); }
  else await userEvent.hover(element);
}
async function keyboard(keys: string) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard(keys); }
  else await userEvent.keyboard(keys);
}
export const RetainedDraftAndNavigation: Story = { play: async ({ canvasElement, globals }) => {
  const c = within(canvasElement), pt = String(globals.storyContentProfile).startsWith("pt"), mobile = innerWidth < 1024;
  const input = c.getByRole("textbox"), main = c.getByRole("main"), shell = main.parentElement!;
  const skip = c.getByRole("link", { name: pt ? "Pular para conteúdo" : "Skip to content" });
  if (mobile) await snapshot("mobile");
  skip.focus(); await expect(skip).toHaveFocus(); expect(skip).toHaveAttribute("href", "#shell-example");
  await userEvent.clear(input); await userEvent.type(input, "Still unsaved");
  if (!mobile) {
    expect(c.getByRole("complementary").getBoundingClientRect().width).toBe(248);
    const collapse = c.getByRole("button", { name: pt ? "Recolher navegação" : "Collapse navigation" });
    expect(collapse.getBoundingClientRect().height).toBe(28);
    expect(collapse.parentElement!.getBoundingClientRect().width).toBe(44);
    await userEvent.click(collapse);
    await waitFor(() => expect(c.getByRole("complementary").getBoundingClientRect().width).toBe(52));
    expect(shell).toHaveAttribute("data-compact");
    expect(c.queryByRole("button", { name: pt ? "Expandir navegação" : "Expand navigation" })).toBeNull();
    input.focus();
    c.getByRole("button", { name: pt ? "Cardápio" : "Menu" }).focus();
    await waitFor(() => expect(shell).toHaveAttribute("data-preview"));
    const menu = c.getByRole("button", { name: pt ? "Cardápio" : "Menu" });
    expect(menu.querySelector('[data-icon-name="delivery/food"]')).not.toBeNull();
    await keyboard("{Enter}");
    await expect(menu).toHaveFocus();
    await userEvent.click(c.getByRole("button", { name: pt ? "Expandir navegação" : "Expand navigation" }));
  } else {
    const trigger = c.getByRole("button", { name: pt ? "Navegação" : "Navigation" });
    trigger.focus(); await keyboard("{Enter}");
    const menu = c.getByRole("menu", { name: pt ? "Navegação" : "Navigation" });
    expect(within(menu).getByRole("menuitemradio", { name: pt ? /Produção/ : /Production/ })).toHaveAttribute("aria-disabled", "true");
    await keyboard("{Escape}"); await expect(trigger).toHaveFocus();
    await userEvent.click(trigger); await userEvent.click(c.getByRole("menuitemradio", { name: pt ? "Cardápio" : "Menu" }));
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  }
  expect(c.getByRole("main")).toBe(main); expect(c.getByRole("textbox")).toBe(input); expect(input).toHaveValue("Still unsaved");
  expect(c.getByRole("heading", { level: 1, name: pt ? "Cardápio" : "Menu" })).toBeVisible();
  await userEvent.click(c.getByRole("button", { name: pt ? "Alternar ação pendente" : "Toggle pending action" }));
  expect(c.getByRole("button", { name: mobile ? pt ? "Navegação" : "Navigation" : pt ? "Visão geral" : "Overview" })).toBeDisabled();
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
} };
export const TouchNavigation: Story = { play: async ({ canvasElement, globals }) => {
  if (import.meta.env.MODE !== "test") return;
  const { cdp } = await import("vitest/browser"), session = cdp(), c = within(canvasElement);
  const pt = String(globals.storyContentProfile).startsWith("pt"), mobile = innerWidth < 1024;
  const tap = async (element: HTMLElement, outerEdge = false) => {
    const box = element.getBoundingClientRect(), frame = window.frameElement?.getBoundingClientRect(), scale = frame ? frame.width / innerWidth : 1;
    const x = outerEdge ? box.left + 2 : box.left + box.width / 2;
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x * scale + (frame?.left ?? 0), y: (box.top + box.height / 2) * scale + (frame?.top ?? 0) }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  try {
    await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    if (mobile) {
      const trigger = c.getByRole("button", { name: pt ? "Navegação" : "Navigation" });
      await tap(trigger.parentElement!, true);
      await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "true"));
      await tap(c.getByRole("menuitemradio", { name: pt ? "Cardápio" : "Menu" }));
      await c.findByRole("heading", { level: 1, name: pt ? "Cardápio" : "Menu" });
    } else {
      const collapse = c.getByRole("button", { name: pt ? "Recolher navegação" : "Collapse navigation" });
      await tap(collapse.parentElement!, true);
      await waitFor(() => expect(c.getByRole("main").parentElement!).toHaveAttribute("data-compact"));
    }
  } finally { await session.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
} };
