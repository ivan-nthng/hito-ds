import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button, Menu, Text, type MenuProps } from "@hito-ds/react/components";

function Example({ presentation }: { presentation: NonNullable<MenuProps["presentation"]> }) {
  const [open, setOpen] = useState(false), [result, setResult] = useState("");
  return <div>
    <Menu open={open} onOpenChange={setOpen} presentation={presentation} label="Synthetic account" closeLabel="Close synthetic account"
      trigger={<Button variant="soft" intent="neutral">Open account</Button>}
      items={[
        { id: "orders", label: "My orders", annotation: "2", icon: "general/basket" },
        { id: "language", label: "Language", annotation: "EN", submenu: { label: "Language", items: [
          { id: "en", label: "English", checked: true, annotation: "EN" }, { id: "pt", label: "Português", checked: false },
        ] } },
        { id: "unavailable", label: "Unavailable", annotation: "4", disabled: true },
        { id: "signout", label: "Sign out" },
      ]} onAction={setResult} />
    <Text role="status">{result}</Text>
  </div>;
}
const meta = {
  title: "Internal/Customer/Menu count annotation", id: "internal-customer-menu-annotation", tags: ["internal", "test", "context-matrix"],
  args: { presentation: "popover" },
  parameters: { layout: "padded", docs: { description: { component: "The accepted optional passive Menu annotation uses the existing ListItem slot, including submenus and sheet. Synthetic commands only." } } },
  render: args => <Example presentation={args.presentation} />,
} satisfies Meta<{ presentation: NonNullable<MenuProps["presentation"]> }>;
export default meta;
type Story = StoryObj<typeof meta>;
const play: NonNullable<Story["play"]> = async ({ canvasElement }) => {
  const c = within(canvasElement), body = within(document.body), trigger = c.getByRole("button", { name: "Open account" });
  await userEvent.click(trigger);
  const menu = await body.findByRole("menu", { name: "Synthetic account" });
  const row = within(menu).getByRole("menuitem", { name: /My orders/ });
  expect(row.textContent).toBe("My orders2"); expect(row.querySelector("button,a,[tabindex]")).toBeNull();
  const unavailable = within(menu).getByRole("menuitem", { name: /Unavailable/ });
  expect(unavailable).toHaveAttribute("aria-disabled", "true");
  expect(getComputedStyle(within(unavailable).getByText("4")).color).toBe(getComputedStyle(within(unavailable).getByText("Unavailable")).color);
  await userEvent.keyboard("{End}my{Enter}"); expect(c.getByRole("status")).toHaveTextContent("orders");
  await userEvent.click(trigger);
  await userEvent.click(await body.findByRole("menuitem", { name: /Language/ }));
  const child = await body.findByRole("menuitemradio", { name: /English/ });
  expect(child).toHaveAttribute("aria-checked", "true"); expect(child.textContent).toBe("EnglishEN");
  await userEvent.click(child); expect(c.getByRole("status")).toHaveTextContent("en");
  expect(trigger).toHaveFocus(); expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
};
export const Popover: Story = { play };
export const Sheet: Story = { args: { presentation: "sheet" }, play };
