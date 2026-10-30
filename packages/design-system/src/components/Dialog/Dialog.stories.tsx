import { StrictMode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { DialogExample, type DialogStoryArgs } from "./Dialog.example.story";
import { dialogCopy } from "./Dialog.content.story";
import { DeepBodyExample, DialogLifecycleExample } from "./Dialog.lifecycle.story";
import { Dialog } from "./Dialog";
import { Button } from "../Button/Button";
import { PanelExample } from "./Dialog.panel.story";

const meta = {
  id: "overlays-dialog", title: "Components/Overlays/Dialog", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["scenario", "dismissOnBackdrop"] } },
  args: { scenario: "form", dismissOnBackdrop: false },
  argTypes: {
    scenario: { control: "inline-radio", options: ["form", "long-content"], description: "Caller-owned form or structured reading content. Fields and footer actions use MD; Close stays SM." },
    dismissOnBackdrop: { control: "boolean", description: "Off by default. Enable only for content safe to discard." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="Dialog" description="A focused task with a title, content and contextual actions.">
    <DialogExample key={`${args.scenario}-${String(globals.storyContentProfile)}`} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<DialogStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SidePanel: Story = {
  parameters: { figma: { label: "Dialog side panel in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9316-909" } },
  tags: ["context-matrix"],
  render: () => <PanelExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const opener = canvas.getByRole("button", { name: "Open panel" });
    await userEvent.click(opener);
    const panel = canvas.getByRole("dialog", { name: "Details" });
    await waitFor(() => expect(Math.abs(panel.getBoundingClientRect().right - (innerWidth >= 1024 ? innerWidth - 12 : innerWidth))).toBeLessThan(1));
    expect(panel.getAttribute("data-presentation")).toBe("side-panel");
    expect(document.documentElement.style.overflow).toBe("hidden");
    const nestedOpener = canvas.getByRole("button", { name: "Nested actions" });
    await userEvent.click(nestedOpener);
    await userEvent.click(canvas.getByRole("menuitem", { name: "Open nested dialog" }));
    const nested = canvas.getByRole("dialog", { name: "Nested details" });
    await escape(nested);
    await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Nested details" })).toBeNull());
    expect(canvas.getByRole("dialog", { name: "Details" })).toBeVisible();
    await waitFor(() => expect(nestedOpener).toHaveFocus());
    await userEvent.click(canvas.getByRole("button", { name: "Reopen during exit" }));
    await waitFor(() => expect(panel).toHaveAttribute("data-state", "open"));
    await userEvent.click(canvas.getByRole("button", { name: "Close panel" }));
    await waitFor(() => expect(canvas.queryByRole("dialog", { name: "Details" })).toBeNull());
    await waitFor(() => expect(opener).toHaveFocus());
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  },
};
const internal = ["context-matrix", "!dev", "!autodocs"];

async function escape(dialog: HTMLElement) {
  if (import.meta.env.MODE === "test") {
    const { userEvent: browserInput } = await import("vitest/browser");
    await browserInput.keyboard("{Escape}");
  } else fireEvent(dialog, new Event("cancel", { cancelable: true }));
}
async function tab(shift = false) {
  if (import.meta.env.MODE === "test") {
    const { userEvent: browserInput } = await import("vitest/browser");
    await browserInput.tab({ shift });
  } else await userEvent.tab({ shift });
}
function geometry(dialog: HTMLElement) {
  const shell = dialog.getBoundingClientRect();
  const header = dialog.querySelector("header")!;
  const body = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
  const footer = dialog.querySelector("footer")!;
  const buttons = [...footer.querySelectorAll("button")];
  const [cancel, confirm] = buttons.map(button => button.getBoundingClientRect());
  const mode = innerWidth < 640 ? 0 : innerWidth < 1024 ? 1 : innerWidth < 1280 ? 2 : 3;
  const inset = [12, 16, 16, 16][mode];
  const radius = [12, 20, 20, 20][mode];
  const dialogCss = getComputedStyle(dialog);
  for (const corner of [dialogCss.borderTopLeftRadius, dialogCss.borderTopRightRadius, dialogCss.borderBottomLeftRadius, dialogCss.borderBottomRightRadius]) expect(corner).toBe(`${radius}px`);
  expect(dialogCss.borderTopWidth).toBe("1px");
  expect(header.getBoundingClientRect().left - shell.left).toBe(1);
  expect(header.getBoundingClientRect().width).toBe(shell.width - 2);
  const headerCss = getComputedStyle(header), bodyCss = getComputedStyle(body), footerCss = getComputedStyle(footer);
  expect([headerCss.paddingTop, headerCss.paddingRight, headerCss.paddingBottom, headerCss.paddingLeft]).toEqual([`${inset}px`, `${inset}px`, "0px", `${inset}px`]);
  expect([bodyCss.paddingTop, bodyCss.paddingRight, bodyCss.paddingBottom, bodyCss.paddingLeft]).toEqual(Array(4).fill(`${inset}px`));
  expect([footerCss.paddingTop, footerCss.paddingRight, footerCss.paddingBottom, footerCss.paddingLeft]).toEqual(["0px", `${inset}px`, `${inset}px`, `${inset}px`]);
  // This component-local mapping must not alter Card/Fieldset/Hub's spacing role.
  expect(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--layout-space-responsive-sm")) * 16).toBe([12, 16, 16, 20][mode]);
  const focusGutter = parseFloat(dialogCss.getPropertyValue("--focus-indicator-width")) + parseFloat(dialogCss.getPropertyValue("--focus-indicator-offset"));
  const close = header.querySelector("button")!;
  for (const button of dialog.querySelectorAll("button")) {
    expect(button).toHaveAttribute("data-size", button === close ? "sm" : "md");
    expect(button.getBoundingClientRect().height).toBe(button === close ? 28 : 36);
    expect(getComputedStyle(button).borderTopLeftRadius).toBe(button === close ? "4px" : "6px");
    const bounds = button.getBoundingClientRect();
    expect(bounds.left - focusGutter).toBeGreaterThanOrEqual(shell.left);
    expect(bounds.right + focusGutter).toBeLessThanOrEqual(shell.right);
    expect(bounds.top - focusGutter).toBeGreaterThanOrEqual(shell.top);
    expect(bounds.bottom + focusGutter).toBeLessThanOrEqual(shell.bottom);
  }
  expect(cancel.top).toBeCloseTo(confirm.top, 1);
  expect(cancel.right).toBeLessThanOrEqual(confirm.left);
  expect(confirm.right).toBeLessThan(shell.right);
  expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
  expect(close.querySelector("[data-icon-name]")).toHaveAttribute("data-icon-name", "controls/close-s");
  const icon = close.querySelector("[data-icon-name]")!.getBoundingClientRect();
  expect(icon.width).toBe(16);
  const title = header.querySelector("h2")!;
  expect(icon.top + icon.height / 2).toBeCloseTo(title.getBoundingClientRect().top + parseFloat(getComputedStyle(title).lineHeight) / 2, 1);
  expect(close.getBoundingClientRect().width).toBe(28);
  expect(getComputedStyle(close).marginBlockStart).toBe("0px");
  expect(getComputedStyle(close).marginInlineEnd).toBe("0px");
  expect(shell.right - close.getBoundingClientRect().right).toBeCloseTo(inset + 1, 1);
  expect(shell.left).toBeGreaterThanOrEqual(0);
  expect(shell.right).toBeLessThanOrEqual(innerWidth);
  expect(shell.top).toBeGreaterThanOrEqual(0);
  expect(shell.bottom).toBeLessThanOrEqual(innerHeight);
}

export const Playground: Story = {
  parameters: {
    figma: {
      label: "Dialog in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8560-11",
    },
  },
  tags: ["context-matrix"],
};
export const FormBehavior: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = dialogCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    const previousOverflow = document.documentElement.style.overflow;
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: copy.title });
    const contents = within(dialog);
    const input = contents.getByRole("textbox", { name: copy.field });
    await expect(dialog.matches(":modal")).toBe(true);
    await expect(dialog).toHaveAccessibleDescription(copy.description);
    await expect(input).toHaveFocus();
    geometry(dialog);
    trigger.focus();
    await expect(input).toHaveFocus();
    const close = contents.getByRole("button", { name: copy.close });
    const save = contents.getByRole("button", { name: copy.save });
    close.focus(); await tab(true); await expect(save).toHaveFocus();
    await tab(); await expect(close).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.click(save);
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(contents.getByText(copy.required)).toBeVisible();
    await escape(dialog);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
    await expect(document.documentElement.style.overflow).toBe(previousOverflow);
    await userEvent.click(trigger);
    await expect(input).toHaveValue(copy.initial);
    await userEvent.clear(input); await userEvent.type(input, "Updated example"); await userEvent.click(save);
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.saved);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const LongBodyBehavior: Story = {
  tags: internal, args: { scenario: "long-content" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = dialogCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog", { name: copy.longTitle });
    await expect(within(dialog).getByRole("heading", { name: copy.longTitle })).toHaveFocus();
    await expect(dialog).not.toHaveAttribute("aria-describedby");
    geometry(dialog);
    const body = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
    const headerTop = dialog.querySelector("header")!.getBoundingClientRect().top;
    const footerTop = dialog.querySelector("footer")!.getBoundingClientRect().top;
    if (innerWidth === 320) expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    expect(dialog.querySelector("header")!.getBoundingClientRect().top).toBe(headerTop);
    expect(dialog.querySelector("footer")!.getBoundingClientRect().top).toBe(footerTop);
    await escape(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

const responsiveGeometry: NonNullable<Story["play"]> = async ({ canvasElement, globals }) => {
  if (import.meta.env.MODE !== "test") return;
  const { page } = await import("vitest/browser");
  const original = { width: innerWidth, height: innerHeight };
  const canvas = within(canvasElement);
  const copy = dialogCopy(globals.storyContentProfile);
  try {
    for (const width of [320, 640, 1024, 1280]) {
      await page.viewport(width, 720);
      await userEvent.click(canvas.getByRole("button", { name: copy.open }));
      const dialog = canvas.getByRole("dialog");
      geometry(dialog);
      expect(getComputedStyle(dialog).animationName).toBe("none");
      await escape(dialog);
      await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    }
  } finally {
    await page.viewport(original.width, original.height);
  }
};
export const ResponsiveFormGeometry: Story = { tags: internal, play: responsiveGeometry };
export const ResponsiveLongGeometry: Story = { tags: internal, args: { scenario: "long-content" }, play: responsiveGeometry };

export const ThemeContour: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: dialogCopy(globals.storyContentProfile).open }));
    const panel = canvas.getByRole("dialog");
    const originalTheme = panel.getAttribute("data-hito-color-scheme");
    const originalStyle = panel.getAttribute("style");
    const bounds = panel.getBoundingClientRect().toJSON();
    const focused = document.activeElement;
    try {
      for (const theme of ["dark", "light"] as const) {
        panel.dataset.hitoColorScheme = theme;
        const style = getComputedStyle(panel);
        const shadow = style.boxShadow;
        panel.style.boxShadow = "var(--elevation-overlay)";
        const elevation = getComputedStyle(panel).boxShadow;
        panel.style.removeProperty("box-shadow");
        expect(shadow).toBe(elevation);
        expect(style.borderTopColor).toBe(theme === "dark" ? "color(srgb 0 0 0 / 0.24)" : "rgba(0, 0, 0, 0)");
        expect(style.borderTopWidth).toBe("1px");
        expect(panel.getBoundingClientRect().toJSON()).toEqual(bounds);
        expect(document.activeElement).toBe(focused);
      }
    } finally {
      if (originalTheme === null) panel.removeAttribute("data-hito-color-scheme"); else panel.setAttribute("data-hito-color-scheme", originalTheme);
      if (originalStyle === null) panel.removeAttribute("style"); else panel.setAttribute("style", originalStyle);
    }
  },
};

export const WrappedTitleClose: Story = {
  tags: internal,
  render: (_, { globals }) => {
    const copy = dialogCopy(globals.storyContentProfile);
    return <Dialog open title={`${copy.title}: ${copy.description}`} description={copy.description} onDismiss={() => {}} style={{ inlineSize: "calc(var(--layout-space-fixed-2xl) * 14)" }}>
      <Dialog.Header closeLabel={copy.close} /><Dialog.Body>{copy.initial}</Dialog.Body>
      <Dialog.Footer><Button size="md" variant="ghost" intent="neutral">{copy.cancel}</Button><Button size="md" variant="primary" intent="accent">{copy.save}</Button></Dialog.Footer>
    </Dialog>;
  },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { page } = await import("vitest/browser");
    const original = { width: innerWidth, height: innerHeight };
    const dialog = within(canvasElement).getByRole("dialog");
    try {
      for (const width of [320, 1024]) {
        await page.viewport(width, 720);
        const title = dialog.querySelector("h2")!;
        expect(title.getBoundingClientRect().height).toBeGreaterThan(parseFloat(getComputedStyle(title).lineHeight));
        const close = within(dialog).getByRole("button", { name: dialogCopy(globals.storyContentProfile).close });
        close.focus(); await expect(close).toHaveFocus();
        geometry(dialog);
        const ring = parseFloat(getComputedStyle(close).outlineWidth) + parseFloat(getComputedStyle(close).outlineOffset);
        expect(close.getBoundingClientRect().right + ring).toBeLessThanOrEqual(dialog.getBoundingClientRect().right);
        expect(close.getBoundingClientRect().top - ring).toBeGreaterThanOrEqual(dialog.getBoundingClientRect().top);
      }
    } finally { await page.viewport(original.width, original.height); }
  },
};

function backdropGesture(dialog: HTMLElement, startsOutside: boolean, endsOutside: boolean) {
  const box = dialog.getBoundingClientRect();
  const point = (outside: boolean) => ({ pointerId: 1, isPrimary: true, button: 0, clientX: outside ? box.left - 1 : box.left + 1, clientY: box.top + 1 });
  fireEvent.pointerDown(dialog, point(startsOutside));
  fireEvent.pointerUp(dialog, point(endsOutside));
}
export const BackdropDefault: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = dialogCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: copy.open }));
    const dialog = canvas.getByRole("dialog");
    backdropGesture(dialog, true, true);
    await expect(dialog).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: copy.close }));
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
  },
};
export const BackdropOptIn: Story = {
  tags: internal, args: { dismissOnBackdrop: true },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = dialogCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog");
    backdropGesture(dialog, false, true); await expect(dialog).toBeVisible();
    backdropGesture(dialog, true, false); await expect(dialog).toBeVisible();
    backdropGesture(dialog, true, true);
    await waitFor(() => expect(canvas.queryByRole("dialog")).toBeNull());
    await expect(trigger).toHaveFocus();
  },
};

export const ControlledDismissal: Story = {
  tags: internal,
  render: () => <DialogLifecycleExample mode="veto" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open fixture" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog");
    const contents = within(dialog);
    const close = contents.getByRole("button", { name: "Close fixture" });
    await userEvent.click(close); await expect(dialog).toBeVisible();
    await escape(dialog); await expect(dialog).toBeVisible();
    await expect(canvas.getByLabelText("Dismissal requests")).toHaveTextContent("close,escape");
    await userEvent.click(contents.getByRole("button", { name: "Refresh 0" }));
    await expect(contents.getByRole("button", { name: "Refresh 1" })).toHaveFocus();
    await userEvent.click(contents.getByRole("button", { name: "Allow dismissal" }));
    await userEvent.click(close);
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByLabelText("Dismissal requests")).toHaveTextContent("close,escape,close");
  },
};

async function verifySuccessor(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "Open fixture" }));
  await userEvent.click(canvas.getByRole("button", { name: "Finish" }));
  await waitFor(() => expect(canvas.getByRole("heading", { name: "Next step" })).toHaveFocus());
  await expect(canvas.queryByRole("button", { name: "Open fixture" })).toBeNull();
  await expect(canvas.getByLabelText("Dismissal requests")).toHaveTextContent("");
}
export const RemovedOpener: Story = { tags: internal, render: () => <DialogLifecycleExample mode="removed-opener" />, play: async ({ canvasElement }) => verifySuccessor(canvasElement) };
export const UnmountAndStrictMode: Story = { tags: internal, render: () => <StrictMode><DialogLifecycleExample mode="unmount" /></StrictMode>, play: async ({ canvasElement }) => verifySuccessor(canvasElement) };
export const FocusScope: Story = {
  tags: internal, render: () => <DialogLifecycleExample mode="focus" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open fixture" }));
    const dialog = canvas.getByRole("dialog");
    const contents = within(dialog);
    await expect(contents.getByRole("textbox", { name: "Initial field" })).toHaveFocus();
    const firstRadio = contents.getByRole("radio", { name: "First" });
    const secondRadio = contents.getByRole("radio", { name: "Second" });
    contents.getByRole("textbox", { name: "Initial field" }).focus(); await tab(); await expect(firstRadio).toHaveFocus();
    const remove = contents.getByRole("button", { name: "Remove focused control" });
    await tab(); await expect(remove).toHaveFocus();
    // Native radio entry may retain the last visited unchecked radio.
    await tab(true); expect([firstRadio, secondRadio]).toContain(document.activeElement);
    await userEvent.click(secondRadio);
    remove.focus(); await tab(true); await expect(secondRadio).toHaveFocus();
    await userEvent.click(remove);
    await waitFor(() => expect(contents.getByRole("heading", { name: "Lifecycle example" })).toHaveFocus());
    await tab(true); await expect(contents.getByRole("button", { name: "Finish" })).toHaveFocus();
    await tab(); await expect(contents.getByRole("button", { name: "Close fixture" })).toHaveFocus();
    await escape(dialog);
  },
};

async function verifyDeepFocus(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const pageTop = document.documentElement.scrollTop;
  await userEvent.click(canvas.getByRole("button", { name: "Open deep content" }));
  const dialog = canvas.getByRole("dialog");
  const body = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
  const field = within(dialog).getByRole("textbox", { name: "Deep field" });
  const header = dialog.querySelector("header")!;
  const headerTop = header.getBoundingClientRect().top;
  const visible = () => {
    const target = field.getBoundingClientRect();
    const bounds = body.getBoundingClientRect();
    expect(field).toHaveFocus();
    expect(target.top).toBeGreaterThanOrEqual(bounds.top);
    expect(target.bottom).toBeLessThanOrEqual(bounds.bottom);
    expect(header.getBoundingClientRect().top).toBe(headerTop);
    expect(document.documentElement.scrollTop).toBe(pageTop);
  };
  visible();
  within(dialog).getByRole("button", { name: "Close deep content" }).focus();
  body.scrollTop = 0;
  await tab(true);
  visible();
  await escape(dialog);
}
export const DeepInitialFocus: Story = { tags: internal, render: () => <DeepBodyExample explicit={false} />, play: async ({ canvasElement }) => verifyDeepFocus(canvasElement) };
export const DeepExplicitFocus: Story = { tags: internal, render: () => <DeepBodyExample explicit />, play: async ({ canvasElement }) => verifyDeepFocus(canvasElement) };

export const ForcedColors: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser");
    const session = cdp();
    const canvas = within(canvasElement);
    const copy = dialogCopy(globals.storyContentProfile);
    const originalMedia = [
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
    ];
    try {
      await session.send("Emulation.setEmulatedMedia", { features: originalMedia.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature) });
      expect(matchMedia("(forced-colors: active)").matches).toBe(true);
      await userEvent.click(canvas.getByRole("button", { name: copy.open }));
      const dialog = canvas.getByRole("dialog");
      const style = getComputedStyle(dialog);
      expect(style.borderTopStyle).toBe("solid");
      expect(style.borderTopWidth).toBe("1px");
      expect(style.boxShadow).toBe("none");
      expect(style.animationName).toBe("none");
      await escape(dialog);
    } finally {
      await session.send("Emulation.setEmulatedMedia", { features: originalMedia });
    }
  },
};
