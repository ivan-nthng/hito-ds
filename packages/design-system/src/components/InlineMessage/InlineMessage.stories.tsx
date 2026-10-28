import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { InlineMessage } from "./InlineMessage";
import { messageIntents } from "../message/Message";
import { MessageExample, type MessageStoryProps } from "../message/Message.story-helpers";
const meta = {
  id: "feedback-inline-message", title: "Components/Feedback/InlineMessage", component: InlineMessage, tags: ["test"],
  parameters: { layout: "fullscreen", controls: { include: ["intent", "title", "body", "withIcon", "withAction", "dismissible"] }, figma: { label: "InlineMessage in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8710-50" } },
  args: { intent: "info", title: "Schedule updated", body: "The new schedule is available. Review the details when convenient.", withIcon: true, withAction: true, dismissible: true, announcement: "off" },
  argTypes: { intent: { control: "select", options: messageIntents }, title: { control: "text" }, body: { control: "text" }, withIcon: { control: "boolean" }, withAction: { control: "boolean" }, dismissible: { control: "boolean" } },
  render: args => <FoundationStoryPage title="InlineMessage" description="Use Controls to choose content, intent and optional actions."><MessageExample {...args} kind="inline"/></FoundationStoryPage>,
} satisfies Meta<MessageStoryProps>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  tags: ["context-matrix"],
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Review details" }));
    await expect(c.getByRole("status")).toHaveTextContent("Demo action performed");
    c.getByRole("button", { name: "Dismiss message" }).focus();
    if (import.meta.env.MODE === "test") {
      const { userEvent: browserInput } = await import("vitest/browser");
      await browserInput.keyboard("{Enter}");
    } else await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(c.getByRole("button", { name: "Restore example" })).toHaveFocus());
    await expect(c.queryByRole("button", { name: "Dismiss message" })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Restore example" }));
    const message = canvasElement.querySelector<HTMLElement>("[data-message-kind]")!;
    verifyDismissGeometry(message);
    await expect(c.queryByRole("alert")).toBeNull();
  },
};
export const LongContent: Story = { tags: ["context-matrix"], args: { title: "Atualização disponível", body: "A configuração foi atualizada e está disponível para revisão. Verifique os detalhes antes de continuar. IDENTIFICADOR-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ." } };
export const AnatomyCoverage: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"], parameters: { controls: { disable: true } },
  render: () => <FoundationStoryPage title="Message coverage" description="Intent and optional anatomy regression cases."><FoundationSpecimenGrid minItemWidth="full">
    {messageIntents.map(intent => <InlineMessage key={intent} intent={intent} title="Status update" body="Review the current details." action={{ label: "Review", onClick: () => {} }} dismiss={{ label: "Close", onDismiss: () => {} }}/>)}
    <InlineMessage title="Title only" icon={false}/><InlineMessage body="Body only" icon={false}/>
  </FoundationSpecimenGrid></FoundationStoryPage>,
};

function verifyDismissGeometry(message: HTMLElement) {
  const close = message.querySelector<HTMLButtonElement>(":scope > button")!;
  const box = message.getBoundingClientRect(), button = close.getBoundingClientRect();
  expect(close).toHaveAttribute("data-size", "sm");
  expect(close).toHaveAttribute("data-variant", "ghost");
  expect(close).toHaveAttribute("data-intent", message.dataset.intent);
  expect(button.width).toBe(28); expect(button.height).toBe(28);
  expect(button.top - box.top).toBeCloseTo(4, 1);
  expect(box.right - button.right).toBeCloseTo(4, 1);
  const icon = close.querySelector("[data-icon-name]")!;
  expect(icon).toHaveAttribute("data-icon-name", "controls/close-s");
  expect(icon.getBoundingClientRect().width).toBe(16);
  const content = message.querySelector<HTMLElement>(":scope > div")!;
  expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(button.left - 8);
  expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth);
  expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth);
  for (const action of content.querySelectorAll("button")) {
    expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(button.left - 8);
  }
}

export const DismissGeometry: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  render: () => <FoundationStoryPage title="Inline message dismiss" description="Narrow and long content, optional dismiss, and inherited typography.">
    {messageIntents.map(intent => <div key={intent} data-message-probe style={{ width: "100%" }}>
      <InlineMessage intent={intent} title="Atualização disponível para revisão da configuração" body="IDENTIFICADOR-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ" action={{ label: "Verificar todos os detalhes da configuração", onClick: () => {} }} dismiss={{ label: "Close", onDismiss: () => {} }} />
      <InlineMessage intent={intent} body="Body only with no icon and a dismiss action" icon={false} dismiss={{ label: "Close", onDismiss: () => {} }} />
      <InlineMessage intent={intent} title="No dismiss" body="Full content width remains available." icon={false} />
    </div>)}
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    for (const host of canvasElement.querySelectorAll<HTMLElement>("[data-message-probe]")) {
      try {
        for (const [width, fontSize] of [[200, 12], [320, 14], [480, 20], [640, 24]]) {
          host.style.width = `${width}px`; host.style.fontSize = `${fontSize}px`;
          for (const message of host.querySelectorAll<HTMLElement>('[data-dismiss="true"]')) {
            verifyDismissGeometry(message);
            const close = message.querySelector<HTMLButtonElement>(":scope > button")!;
            close.focus(); await expect(close).toHaveFocus();
          }
          const plain = host.querySelector<HTMLElement>('[data-dismiss="false"]')!;
          const css = getComputedStyle(plain);
          expect(css.paddingLeft).toBe(css.paddingRight);
          expect(plain.querySelector("button")).toBeNull();
        }
      } finally { host.style.width = "100%"; host.style.removeProperty("font-size"); }
    }
  },
};
