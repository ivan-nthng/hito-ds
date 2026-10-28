import { StrictMode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { AlertDialogExample, type AlertDialogStoryArgs } from "./AlertDialog.example.story";
import { alertDialogCopy } from "./AlertDialog.content.story";
import { AlertDialogLifecycleExample } from "./AlertDialog.lifecycle.story";

const meta = {
  id: "overlays-alert-dialog", title: "Components/Overlays/AlertDialog", tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["scenario", "confirmIntent"] } },
  args: { scenario: "confirmation", confirmIntent: "destructive" },
  argTypes: {
    scenario: { control: "select", options: ["confirmation", "pending-error", "long-content"], description: "A consequential decision, caller-owned pending/error, or supporting content." },
    confirmIntent: { control: "inline-radio", options: ["accent", "destructive"], description: "Only the Confirm action carries consequential intent; Cancel stays neutral." },
  },
  render: (args, { globals }) => <FoundationStoryPage title="AlertDialog" description="A consequential decision with a safe Cancel action and one confirmation intent per opening.">
    <AlertDialogExample key={`${args.scenario}-${String(globals.storyContentProfile)}`} {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<AlertDialogStoryArgs>;
export default meta;
type Story = StoryObj<typeof meta>;
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
function geometry(dialog: HTMLElement, safeArea = { top: 0, right: 0, bottom: 0, left: 0 }) {
  const shell = dialog.getBoundingClientRect();
  const header = dialog.querySelector("header")!;
  const body = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
  const footer = dialog.querySelector("footer")!;
  const actions = [...footer.querySelectorAll("button")];
  const [cancel, confirm] = actions.map(button => button.getBoundingClientRect());
  const mode = innerWidth < 640 ? 0 : innerWidth < 1024 ? 1 : innerWidth < 1280 ? 2 : 3;
  const inset = 12;
  const radius = 16;
  const mobile = innerWidth < 640;
  const dialogCss = getComputedStyle(dialog);
  expect(dialogCss.borderWidth).toBe("0px");
  expect([dialogCss.borderTopLeftRadius, dialogCss.borderTopRightRadius, dialogCss.borderBottomLeftRadius, dialogCss.borderBottomRightRadius]).toEqual([`${radius}px`, `${radius}px`, mobile ? "0px" : `${radius}px`, mobile ? "0px" : `${radius}px`]);
  const left = `${mobile ? Math.max(inset, safeArea.left) : inset}px`;
  const right = `${mobile ? Math.max(inset, safeArea.right) : inset}px`;
  const headerCss = getComputedStyle(header), bodyCss = getComputedStyle(body), footerCss = getComputedStyle(footer);
  expect([headerCss.paddingTop, headerCss.paddingRight, headerCss.paddingBottom, headerCss.paddingLeft]).toEqual([`${inset}px`, right, "0px", left]);
  expect([bodyCss.paddingTop, bodyCss.paddingRight, bodyCss.paddingBottom, bodyCss.paddingLeft]).toEqual([`${inset}px`, right, `${inset}px`, left]);
  expect([footerCss.paddingTop, footerCss.paddingRight, footerCss.paddingBottom, footerCss.paddingLeft]).toEqual(["0px", right, `${inset}px`, left]);
  expect(dialogCss.paddingBottom).toBe(`${mobile ? safeArea.bottom : 0}px`);
  if (mobile) {
    expect(shell.left).toBe(0); expect(shell.width).toBe(innerWidth);
    expect(shell.bottom).toBeCloseTo(innerHeight, 1);
    expect(shell.top).toBeGreaterThanOrEqual(safeArea.top + inset);
    expect(footer.getBoundingClientRect().bottom + safeArea.bottom).toBeCloseTo(shell.bottom, 1);
  } else {
    expect(shell.left + shell.width / 2).toBeCloseTo(innerWidth / 2, 1);
    expect(shell.top + shell.height / 2).toBeCloseTo(innerHeight / 2, 1);
  }
  expect(footerCss.columnGap).toBe("8px");
  expect(parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--layout-space-responsive-sm")) * 16).toBe([12, 16, 16, 20][mode]);
  const focusGutter = parseFloat(dialogCss.getPropertyValue("--focus-indicator-width")) + parseFloat(dialogCss.getPropertyValue("--focus-indicator-offset"));
  for (const button of actions) {
    expect(button).toHaveAttribute("data-size", "md");
    expect(button.getBoundingClientRect().height).toBe(36);
    expect(getComputedStyle(button).borderTopLeftRadius).toBe("6px");
    const bounds = button.getBoundingClientRect();
    expect(bounds.left - focusGutter).toBeGreaterThanOrEqual(shell.left);
    expect(bounds.right + focusGutter).toBeLessThanOrEqual(shell.right);
    expect(bounds.top - focusGutter).toBeGreaterThanOrEqual(shell.top);
    expect(bounds.bottom + focusGutter).toBeLessThanOrEqual(shell.bottom);
  }
  expect(cancel.top).toBeCloseTo(confirm.top, 1);
  expect(cancel.right).toBeLessThanOrEqual(confirm.left);
  expect(footer.scrollWidth).toBeLessThanOrEqual(footer.clientWidth);
  expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth);
  expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
  expect(shell.left).toBeGreaterThanOrEqual(0);
  expect(shell.right).toBeLessThanOrEqual(innerWidth);
  expect(shell.top).toBeGreaterThanOrEqual(0);
  expect(shell.bottom).toBeLessThanOrEqual(innerHeight);
  expect(header.querySelector("button")).toBeNull();
}

export const Playground: Story = {
  parameters: {
    figma: {
      label: "AlertDialog in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8569-7",
    },
  },
  tags: ["context-matrix"],
};

export const ThemeContour: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser");
    const session = cdp();
    const systemScheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const canvas = within(canvasElement);
    const copy = alertDialogCopy(globals.storyContentProfile);
    await userEvent.click(canvas.getByRole("button", { name: copy.open }));
    const dialog = canvas.getByRole("alertdialog");
    const originalStyle = dialog.getAttribute("style");
    const originalTheme = dialog.getAttribute("data-hito-color-scheme");
    const bounds = dialog.getBoundingClientRect().toJSON();
    try {
      for (const system of ["light", "dark"] as const) {
        await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: system }] });
        for (const theme of ["light", "dark", "system"] as const) {
          if (theme === "system") {
            dialog.removeAttribute("data-hito-color-scheme");
            dialog.style.colorScheme = "light dark";
          } else {
            dialog.dataset.hitoColorScheme = theme;
            dialog.style.removeProperty("color-scheme");
          }
          const shadow = getComputedStyle(dialog).boxShadow;
          dialog.style.boxShadow = "var(--elevation-overlay)";
          const elevation = getComputedStyle(dialog).boxShadow;
          dialog.style.removeProperty("box-shadow");
          const dark = (theme === "system" ? system : theme) === "dark";
          expect(shadow).toBe(`${dark ? "color(srgb 0 0 0 / 0.24)" : "rgba(0, 0, 0, 0)"} 0px 0px 0px 1px inset, ${elevation}`);
          expect(dialog.getBoundingClientRect().toJSON()).toEqual(bounds);
          geometry(dialog);
          await expect(within(dialog).getByRole("button", { name: copy.cancel })).toHaveFocus();
        }
      }
      await escape(dialog);
    } finally {
      if (originalStyle === null) dialog.removeAttribute("style"); else dialog.setAttribute("style", originalStyle);
      if (originalTheme === null) dialog.removeAttribute("data-hito-color-scheme"); else dialog.setAttribute("data-hito-color-scheme", originalTheme);
      await session.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: systemScheme }] });
    }
  },
};
export const SafeDecision: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = alertDialogCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    const originalOverflow = document.documentElement.style.overflow;
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("alertdialog", { name: copy.title });
    const contents = within(dialog);
    const cancel = contents.getByRole("button", { name: copy.cancel });
    const confirm = contents.getByRole("button", { name: copy.confirm });
    await expect(dialog).toHaveAccessibleDescription(copy.description);
    await expect(cancel).toHaveFocus();
    geometry(dialog);
    trigger.focus(); await expect(cancel).toHaveFocus();
    await tab(true); await expect(confirm).toHaveFocus();
    await tab(); await expect(cancel).toHaveFocus();
    const bounds = dialog.getBoundingClientRect();
    const point = { pointerId: 1, isPrimary: true, button: 0, clientX: bounds.left - 1, clientY: bounds.top + 1 };
    fireEvent.pointerDown(dialog, point); fireEvent.pointerUp(dialog, point);
    await expect(dialog).toBeVisible();
    await escape(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.cancelled);
    expect(canvasElement.querySelector("[data-confirm-count]")?.textContent).toBe("0");
    expect(document.documentElement.style.overflow).toBe(originalOverflow);
    await userEvent.click(trigger); await userEvent.click(confirm);
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(canvasElement.querySelector("[data-confirm-count]")?.textContent).toBe("1");
    await expect(canvas.getByRole("status")).toHaveTextContent(copy.confirmed);
  },
};

export const OneShotAndCallerError: Story = {
  tags: internal, args: { scenario: "pending-error" },
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const copy = alertDialogCopy(globals.storyContentProfile);
    const trigger = canvas.getByRole("button", { name: copy.open });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("alertdialog");
    const contents = within(dialog);
    const confirm = contents.getByRole("button", { name: copy.confirm });
    const cancel = contents.getByRole("button", { name: copy.cancel });
    fireEvent.click(confirm); fireEvent.click(confirm);
    await expect(confirm).toHaveAttribute("aria-busy", "true");
    await expect(cancel).toBeEnabled();
    geometry(dialog);
    await waitFor(() => expect(contents.getByRole("alert")).toHaveFocus(), { timeout: 3000 });
    await expect(confirm).toBeDisabled();
    await expect(confirm).not.toHaveAttribute("aria-busy");
    geometry(dialog);
    fireEvent.click(confirm);
    expect(canvasElement.querySelector("[data-confirm-count]")?.textContent).toBe("1");
    await userEvent.click(cancel); await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);
    expect(canvasElement.querySelector("[data-confirm-count]")?.textContent).toBe("2");
    await escape(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const ControlledCancelAndKeyboard: Story = {
  tags: internal, render: () => <AlertDialogLifecycleExample mode="hold" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open fixture" });
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("alertdialog");
    const contents = within(dialog);
    const cancel = contents.getByRole("button", { name: "Cancel" });
    const confirm = contents.getByRole("button", { name: "Confirm" });
    await expect(cancel).toHaveFocus();
    await userEvent.click(cancel); await escape(dialog);
    expect(canvas.getByLabelText("Cancellations")).toHaveTextContent("cancel,escape");
    expect(canvas.getByLabelText("Confirmations")).toHaveTextContent("0");
    confirm.focus();
    if (import.meta.env.MODE === "test") {
      const { userEvent: browserInput } = await import("vitest/browser");
      await browserInput.keyboard("{Enter}{Enter}");
    } else { fireEvent.click(confirm); fireEvent.click(confirm); }
    await expect(confirm).toBeDisabled();
    expect(canvas.getByLabelText("Confirmations")).toHaveTextContent("1");
    await userEvent.click(contents.getByRole("button", { name: "Allow cancellation" }));
    await expect(confirm).toBeDisabled();
    await escape(dialog);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const RemovedOpenerAndStrictMode: Story = {
  tags: internal, render: () => <StrictMode><AlertDialogLifecycleExample mode="successor" /></StrictMode>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open fixture" }));
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Confirm" }));
    await waitFor(() => expect(canvas.getByRole("heading", { name: "Next step" })).toHaveFocus());
    expect(canvas.getByLabelText("Confirmations")).toHaveTextContent("1");
    expect(canvas.getByLabelText("Cancellations")).toHaveTextContent("");
  },
};

export const ResponsiveLongBody: Story = {
  tags: internal, args: { scenario: "long-content" },
  play: async ({ canvasElement, globals, args }) => {
    if (import.meta.env.MODE !== "test") return;
    const { page } = await import("vitest/browser");
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement);
    const copy = alertDialogCopy(globals.storyContentProfile);
    try {
      for (const width of [320, 639, 640, 1024, 1280]) {
        await page.viewport(width, 720);
        await userEvent.click(canvas.getByRole("button", { name: copy.open }));
        const dialog = canvas.getByRole("alertdialog");
        geometry(dialog);
        expect(dialog).toHaveAccessibleDescription(copy.description);
        expect(getComputedStyle(dialog).animationName).toBe("none");
        const body = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
        const header = dialog.querySelector("header")!.getBoundingClientRect().top;
        const footer = dialog.querySelector("footer")!.getBoundingClientRect().top;
        if (args.scenario === "long-content") expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
        body.scrollTop = body.scrollHeight;
        expect(dialog.querySelector("header")!.getBoundingClientRect().top).toBe(header);
        expect(dialog.querySelector("footer")!.getBoundingClientRect().top).toBe(footer);
        await escape(dialog);
      }
    } finally { await page.viewport(original.width, original.height); }
  },
};

export const ResponsiveConfirmation: Story = {
  tags: internal,
  play: ResponsiveLongBody.play,
};

export const MobileSafeArea: Story = {
  tags: internal,
  args: { scenario: "long-content" },
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { page } = await import("vitest/browser");
    const original = { width: innerWidth, height: innerHeight };
    const canvas = within(canvasElement), copy = alertDialogCopy(globals.storyContentProfile);
    let dialog: HTMLElement | undefined;
    const safeArea = { top: 16, right: 20, bottom: 32, left: 24 };
    try {
      await page.viewport(320, 720);
      const trigger = canvas.getByRole("button", { name: copy.open });
      await userEvent.click(trigger);
      dialog = canvas.getByRole("alertdialog");
      for (const [side, value] of Object.entries(safeArea)) dialog.style.setProperty(`--alert-dialog-safe-${side}`, `${value}px`);
      const cancel = within(dialog).getByRole("button", { name: copy.cancel });
      for (const width of [320, 639, 640]) {
        await page.viewport(width, 720);
        geometry(dialog, safeArea);
        await expect(dialog.matches(":modal")).toBe(true);
        await expect(cancel).toHaveFocus();
        const body = dialog.querySelector<HTMLElement>("[data-dialog-body]")!;
        const footerTop = dialog.querySelector("footer")!.getBoundingClientRect().top;
        expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
        body.scrollTop = body.scrollHeight;
        expect(dialog.querySelector("footer")!.getBoundingClientRect().top).toBe(footerTop);
      }
      await escape(dialog);
      await waitFor(() => expect(trigger).toHaveFocus());
    } finally {
      for (const side of Object.keys(safeArea)) dialog?.style.removeProperty(`--alert-dialog-safe-${side}`);
      await page.viewport(original.width, original.height);
    }
  },
};

export const ForcedColors: Story = {
  tags: internal,
  play: async ({ canvasElement, globals }) => {
    if (import.meta.env.MODE !== "test") return;
    const { cdp } = await import("vitest/browser");
    const session = cdp();
    const originalMedia = [
      { name: "forced-colors", value: matchMedia("(forced-colors: active)").matches ? "active" : "none" },
      { name: "prefers-reduced-motion", value: matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduce" : "no-preference" },
      { name: "prefers-color-scheme", value: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" },
    ];
    const canvas = within(canvasElement);
    const copy = alertDialogCopy(globals.storyContentProfile);
    try {
      await session.send("Emulation.setEmulatedMedia", { features: originalMedia.map(feature => feature.name === "forced-colors" ? { ...feature, value: "active" } : feature) });
      await userEvent.click(canvas.getByRole("button", { name: copy.open }));
      const dialog = canvas.getByRole("alertdialog");
      expect(matchMedia("(forced-colors: active)").matches).toBe(true);
      expect(getComputedStyle(dialog).outlineStyle).toBe("solid");
      expect(getComputedStyle(dialog).boxShadow).toBe("none");
      expect(within(dialog).getByRole("button", { name: copy.cancel })).toHaveFocus();
      await escape(dialog);
    } finally { await session.send("Emulation.setEmulatedMedia", { features: originalMedia }); }
  },
};
