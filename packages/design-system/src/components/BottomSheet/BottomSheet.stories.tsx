import { StrictMode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { BottomSheetExample, bottomSheetCopy, type BottomSheetStoryArgs } from "./BottomSheet.example.story";
import { BottomSheet } from "./BottomSheet";
import { Button } from "../Button/Button";

const meta = {
  id: "overlays-bottom-sheet", title: "Components/Overlays/BottomSheet", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["scenario", "dismissOnBackdrop", "headerVariant"] } },
  args: { scenario: "form", dismissOnBackdrop: false, headerVariant: "default" },
  argTypes: {
    scenario: { control: "select", options: ["form", "long-content", "dirty-guard"] },
    dismissOnBackdrop: { control: "boolean", description: "Off by default. Enable only for safe-to-discard content." },
    headerVariant: { control: { type: "inline-radio", labels: { default: "Default", compact: "Compact" } }, options: ["default", "compact"], description: "Default Heading/SM or compact Label/Base title; Close and touch targets are unchanged." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="BottomSheet" description="A modal panel anchored to the bottom. Content scrolls while the title and actions stay visible."><BottomSheetExample key={`${args.scenario}-${String(globals.storyContentProfile)}`} {...args} profile={globals.storyContentProfile} /></FoundationStoryPage>,
} satisfies Meta<BottomSheetStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
const internal = ["context-matrix", "!dev", "!autodocs"];
async function escape(sheet: HTMLElement) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.keyboard("{Escape}"); }
  else fireEvent(sheet, new Event("cancel", { cancelable: true }));
}
async function tab(shift = false) {
  if (import.meta.env.MODE === "test") { const { userEvent: input } = await import("vitest/browser"); await input.tab({ shift }); }
  else await userEvent.tab({ shift });
}
async function geometry(sheet: HTMLElement) {
  await Promise.all(sheet.getAnimations().map(animation => animation.finished.catch(() => {})));
  const box = sheet.getBoundingClientRect(); const css = getComputedStyle(sheet);
  expect(box.left).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(innerWidth);
  expect(box.top).toBeGreaterThanOrEqual(11); expect(box.bottom).toBeCloseTo(innerHeight, 0);
  expect([css.borderTopLeftRadius, css.borderTopRightRadius, css.borderBottomLeftRadius, css.borderBottomRightRadius]).toEqual(["16px", "16px", "0px", "0px"]);
  const header = sheet.querySelector("header")!; const headerCss = getComputedStyle(header);
  expect(headerCss.paddingTop).toBe("12px"); expect(headerCss.columnGap).toBe("16px");
  const close = header.querySelector("button")!; const closeBox = close.getBoundingClientRect(); const hit = getComputedStyle(close, "::after");
  expect(close).toHaveAttribute("data-size", "sm"); expect(closeBox.height).toBe(28); expect(closeBox.width).toBe(28);
  expect(hit.width).toBe("44px"); expect(hit.height).toBe("44px");
  const closeCss = getComputedStyle(close);
  const targetRight = closeBox.right - parseFloat(closeCss.borderRightWidth) - parseFloat(hit.right);
  expect(targetRight).toBeLessThanOrEqual(box.right - parseFloat(css.getPropertyValue("--bottom-sheet-safe-right")));
  expect(targetRight - parseFloat(hit.width)).toBeGreaterThanOrEqual(box.left);
  expect(close.querySelector("[data-icon-name]")).toHaveAttribute("data-icon-name", "controls/close-s");
  const icon = close.querySelector("[data-icon-name]")!.getBoundingClientRect(); const title = header.querySelector("h2")!;
  expect(icon.width).toBe(16); expect(icon.top + icon.height / 2).toBeCloseTo(title.getBoundingClientRect().top + parseFloat(getComputedStyle(title).lineHeight) / 2, 1);
  expect(box.right - icon.right).toBeCloseTo(parseFloat(headerCss.paddingRight) + parseFloat(css.borderRightWidth), 1);
  for (const button of sheet.querySelectorAll("footer button")) {
    expect(button).toHaveAttribute("data-size", "md"); expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(36);
    expect(getComputedStyle(button).borderTopLeftRadius).toBe("6px");
  }
  expect(sheet.scrollWidth).toBeLessThanOrEqual(sheet.clientWidth);
  const footer = sheet.querySelector("footer"); if (footer) expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
}
function backdrop(sheet: HTMLElement, startOutside: boolean, endOutside: boolean, cancel = false) {
  const box = sheet.getBoundingClientRect(); const point = (outside: boolean) => ({ pointerId: 1, isPrimary: true, button: 0, clientX: box.left + 20, clientY: outside ? box.top - 8 : box.top + 20 });
  fireEvent.pointerDown(sheet, point(startOutside)); if (cancel) fireEvent.pointerCancel(sheet, point(startOutside)); fireEvent.pointerUp(sheet, point(endOutside));
}
export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: {
      label: "BottomSheet in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8580-5",
    },
  },
};
export const WrappedTitleClose: Story = {
  tags: internal, args: { headerVariant: "compact" },
  render: (args, { globals }) => {
    const copy = bottomSheetCopy(globals.storyContentProfile);
    return <BottomSheet open headerVariant={args.headerVariant} title={`${copy.title}: ${Array(4).fill(copy.description).join(" ")}`} description={copy.description} closeLabel={copy.close} onDismiss={() => {}}
      footer={<><Button size="md" variant="ghost" intent="neutral">{copy.cancel}</Button><Button size="md" variant="primary" intent="accent">{copy.save}</Button></>}>
      {copy.initial}
    </BottomSheet>;
  },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { page } = await import("vitest/browser");
    const original = { width: innerWidth, height: innerHeight };
    const sheet = within(canvasElement).getByRole("dialog");
    try {
      for (const width of [320, 1024]) {
        await page.viewport(width, 720);
        const title = sheet.querySelector("h2")!;
        expect(title.getBoundingClientRect().height).toBeGreaterThan(parseFloat(getComputedStyle(title).lineHeight));
        const close = within(sheet).getByRole("button", { name: bottomSheetCopy(globals.storyContentProfile).close });
        close.focus(); await expect(close).toHaveFocus();
        await geometry(sheet);
        const ring = parseFloat(getComputedStyle(close).outlineWidth) + parseFloat(getComputedStyle(close).outlineOffset);
        expect(close.getBoundingClientRect().right + ring).toBeLessThanOrEqual(sheet.getBoundingClientRect().right);
        expect(close.getBoundingClientRect().top - ring).toBeGreaterThanOrEqual(sheet.getBoundingClientRect().top);
      }
    } finally { await page.viewport(original.width, original.height); }
  },
};
export const FormAndFocus: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = bottomSheetCopy(globals.storyContentProfile);
    const opener = canvas.getByRole("button", { name: copy.open }); const overflow = document.documentElement.style.overflow;
    await userEvent.click(opener); const sheet = canvas.getByRole("dialog", { name: copy.title }); const contents = within(sheet);
    const input = contents.getByRole("textbox", { name: copy.name }); const close = contents.getByRole("button", { name: copy.close }); const save = contents.getByRole("button", { name: copy.save });
    expect(sheet.matches(":modal")).toBe(true); await expect(sheet).toHaveAccessibleDescription(copy.description); await expect(input).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("hidden"); opener.focus(); await expect(input).toHaveFocus();
    close.focus(); await tab(true); await expect(save).toHaveFocus(); await tab(); await expect(close).toHaveFocus(); await geometry(sheet);
    backdrop(sheet, true, true); await expect(sheet).toBeVisible();
    await userEvent.clear(input); await userEvent.click(save); await expect(input).toHaveAttribute("aria-invalid", "true"); await expect(input).toHaveFocus();
    await userEvent.type(input, "Updated draft"); await userEvent.click(save);
    await waitFor(() => expect(opener).toHaveFocus()); expect(document.documentElement.style.overflow).toBe(overflow); await expect(canvas.getByRole("status")).toHaveTextContent(copy.saved);
    for (const dismissal of [copy.close, copy.cancel, "escape"]) {
      await userEvent.click(opener);
      if (dismissal === "escape") await escape(sheet); else await userEvent.click(contents.getByRole("button", { name: dismissal }));
      await waitFor(() => expect(opener).toHaveFocus()); expect(sheet).not.toHaveAttribute("open");
    }
  },
};
export const SafeBackdrop: Story = {
  tags: internal, args: { dismissOnBackdrop: true },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const opener = canvas.getByRole("button", { name: bottomSheetCopy(globals.storyContentProfile).open });
    await userEvent.click(opener); const sheet = canvas.getByRole("dialog"); await geometry(sheet);
    for (const [start, end, cancel] of [[false, true, false], [true, false, false], [true, true, true]]) { backdrop(sheet, start, end, cancel); await expect(sheet).toBeVisible(); }
    backdrop(sheet, true, true); await waitFor(() => expect(opener).toHaveFocus());
  },
};
export const DirtyGuard: Story = {
  tags: internal, args: { scenario: "dirty-guard", dismissOnBackdrop: true },
  render: (args, { globals }) => <BottomSheetExample {...args} profile={globals.storyContentProfile} recordRequests />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = bottomSheetCopy(globals.storyContentProfile); const opener = canvas.getByRole("button", { name: copy.open });
    await userEvent.click(opener); const sheet = canvas.getByRole("dialog"); const contents = within(sheet);
    await userEvent.type(contents.getByRole("textbox", { name: copy.name }), " changed"); await geometry(sheet);
    for (const action of [copy.close, copy.cancel, "escape", "backdrop"]) {
      if (action === "escape") await escape(sheet); else if (action === "backdrop") backdrop(sheet, true, true); else await userEvent.click(contents.getByRole("button", { name: action }));
      await expect(sheet).toBeVisible(); await expect(sheet).toHaveTextContent(copy.guard); expect(sheet.contains(document.activeElement)).toBe(true);
      await expect(contents.getByRole("button", { name: copy.discard })).toBeVisible(); await geometry(sheet);
      if (action !== "backdrop") { await userEvent.click(contents.getByRole("button", { name: copy.keep })); await expect(contents.getByRole("textbox", { name: copy.name })).toHaveFocus(); }
    }
    expect(canvas.getByLabelText("Dismissal requests")).toHaveTextContent("close,cancel,escape,backdrop");
    await userEvent.click(contents.getByRole("button", { name: copy.discard })); await waitFor(() => expect(opener).toHaveFocus());
  },
};
const longBody: NonNullable<Story["play"]> = async ({ canvasElement, globals }) => {
  const canvas = within(canvasElement); const copy = bottomSheetCopy(globals.storyContentProfile); const opener = canvas.getByRole("button", { name: copy.open });
  await userEvent.click(opener); const sheet = canvas.getByRole("dialog"); await geometry(sheet);
  const body = sheet.querySelector<HTMLElement>("[data-bottom-sheet-body]")!; const header = sheet.querySelector("header")!; const footer = sheet.querySelector("footer");
  const input = within(sheet).queryByRole("textbox");
  if (input) { await expect(input).toHaveFocus(); expect(input.getBoundingClientRect().bottom).toBeLessThanOrEqual(body.getBoundingClientRect().bottom); }
  else await expect(within(sheet).getByRole("heading", { name: copy.readTitle })).toHaveFocus();
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight); const headerTop = header.getBoundingClientRect().top; const footerTop = footer?.getBoundingClientRect().top;
  body.scrollTop = body.scrollHeight; expect(header.getBoundingClientRect().top).toBe(headerTop); expect(footer?.getBoundingClientRect().top).toBe(footerTop); expect(sheet.scrollTop).toBe(0);
  // Synthetic safe-area values exercise the same private CSS seam used by env().
  sheet.style.setProperty("--bottom-sheet-safe-top", "28px"); sheet.style.setProperty("--bottom-sheet-safe-bottom", "24px");
  await waitFor(() => expect(sheet.getBoundingClientRect().top).toBeGreaterThanOrEqual(39));
  expect(getComputedStyle(sheet).paddingBottom).toBe("24px"); await geometry(sheet);
  await escape(sheet); await waitFor(() => expect(opener).toHaveFocus());
};
export const LongBodyAndSafeArea: Story = { tags: internal, args: { scenario: "long-content" }, play: longBody };
export const DeepInitialFocus: Story = { tags: internal, args: { scenario: "long-content" }, render: (args, { globals }) => <BottomSheetExample {...args} profile={globals.storyContentProfile} deepFocus />, play: longBody };
export const WithoutFooter: Story = { tags: internal, args: { scenario: "long-content" }, render: (args, { globals }) => <BottomSheetExample {...args} profile={globals.storyContentProfile} noFooter />, play: longBody };
export const RemovedOpener: Story = {
  tags: internal, render: (args, { globals }) => <StrictMode><BottomSheetExample {...args} profile={globals.storyContentProfile} removeOpener /></StrictMode>,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement); const copy = bottomSheetCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: copy.open })); await userEvent.click(canvas.getByRole("button", { name: copy.save }));
    await waitFor(() => expect(canvas.getByRole("button", { name: copy.next })).toHaveFocus()); expect(canvas.queryByRole("button", { name: copy.open })).toBeNull();
  },
};
export const ForcedColorsAndResize: Story = {
  tags: internal, args: { scenario: "long-content" },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp, page } = await import("vitest/browser"); const session = cdp(); const originalSize = { width: innerWidth, height: innerHeight };
    const original = [{ name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" }, { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" }, { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" }];
    const canvas = within(canvasElement); const copy = bottomSheetCopy(globals.storyContentProfile);
    try {
      await session.send("Emulation.setEmulatedMedia", { features: original.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature.name === "prefers-reduced-motion" ? { ...feature, value: "reduce" } : feature) });
      await userEvent.click(canvas.getByRole("button", { name: copy.open })); const sheet = canvas.getByRole("dialog");
      expect(getComputedStyle(sheet).animationName).toBe("none"); expect(getComputedStyle(sheet).borderTopWidth).toBe("1px");
      for (const width of [320, 1024]) { await page.viewport(width, 600); await geometry(sheet); expect(sheet.matches(":modal")).toBe(true); }
      await escape(sheet); await waitFor(() => expect(canvas.getByRole("button", { name: copy.open })).toHaveFocus());
    } finally { await page.viewport(originalSize.width, originalSize.height); await session.send("Emulation.setEmulatedMedia", { features: original }); }
  },
};
export const TouchScrollAndClose: Story = {
  tags: internal, args: { scenario: "long-content", headerVariant: "compact" },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser"); const session = cdp();
    const canvas = within(canvasElement); const copy = bottomSheetCopy(globals.storyContentProfile);
    const point = (x: number, y: number) => {
      const frame = window.frameElement?.getBoundingClientRect(); const scale = frame ? frame.width / innerWidth : 1;
      return { x: x * scale + (frame?.left ?? 0), y: y * scale + (frame?.top ?? 0) };
    };
    const tap = async (element: HTMLElement) => {
      const box = element.getBoundingClientRect();
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(box.left + box.width / 2, box.top + box.height / 2)] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    };
    try {
      await session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      const opener = canvas.getByRole("button", { name: copy.open }); await tap(opener);
      const sheet = await canvas.findByRole("dialog"); await geometry(sheet);
      const body = sheet.querySelector<HTMLElement>("[data-bottom-sheet-body]")!; const box = body.getBoundingClientRect();
      const x = box.left + box.width / 2; const y = box.top + box.height * 0.75;
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(x, y)] });
      for (const distance of [30, 60, 90, 120]) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point(x, y - distance)] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await waitFor(() => expect(body.scrollTop).toBeGreaterThan(0)); await expect(sheet).toBeVisible(); expect(sheet.scrollTop).toBe(0);
      // The transparent target must work outside the smaller visible Button, including its corner.
      const close = within(sheet).getByRole("button", { name: copy.close }).getBoundingClientRect();
      await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point(close.right + 3, close.top - 3)] });
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await waitFor(() => expect(opener).toHaveFocus());
    } finally { await session.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
  },
};
