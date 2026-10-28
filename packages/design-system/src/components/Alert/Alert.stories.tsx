import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within, waitFor } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { Alert, alertSizes, type AlertSize } from "./Alert";
import { Text } from "../Text/Text";
import { messageIntents } from "../message/Message";
import { MessageExample, type MessageStoryProps } from "../message/Message.story-helpers";
const meta = {
  id: "feedback-alert", title: "Components/Feedback/Alert", component: Alert, tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["size", "intent", "title", "body", "withIcon", "withAction", "dismissible"] },
    docs: { description: { component: "[Alert component in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9009-103) · [Light examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-35) · [Dark examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-218)" } },
  },
  args: { size: "md", intent: "info", title: "Schedule updated", body: "The new schedule is available. Review the details when convenient.", withIcon: true, withAction: true, dismissible: true, announcement: "off" },
  argTypes: { size: { control: "select", options: alertSizes }, intent: { control: "select", options: messageIntents }, title: { control: "text" }, body: { control: "text" }, withIcon: { control: "boolean" }, withAction: { control: "boolean" }, dismissible: { control: "boolean" } },
  render: ({ size, ...args }) => <FoundationStoryPage title="Alert" description="Use Controls to choose size, content, intent and optional actions."><MessageExample {...args} kind="alert" alertSize={size}/></FoundationStoryPage>,
} satisfies Meta<MessageStoryProps & { size: AlertSize }>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "Alert playground in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-37" } },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Review details" }));
    await expect(c.getByRole("status")).toHaveTextContent("Demo action performed");
    await userEvent.click(c.getByRole("button", { name: "Dismiss message" }));
    await waitFor(() => expect(c.getByRole("button", { name: "Restore example" })).toHaveFocus());
    await expect(c.queryByRole("button", { name: "Dismiss message" })).toBeNull();
    await userEvent.click(c.getByRole("button", { name: "Restore example" }));
    const message = canvasElement.querySelector<HTMLElement>("[data-message-kind]")!;
    const icon = message.querySelector<HTMLElement>("[data-icon-name]")!;
    const close = c.getByRole("button", { name: "Dismiss message" }).querySelector<HTMLElement>("[data-icon-name]")!;
    const a = icon.getBoundingClientRect(), b = close.getBoundingClientRect();
    await expect(Math.abs(a.top + a.height / 2 - b.top - b.height / 2)).toBeLessThan(1);
    await expect(c.queryByRole("alert")).toBeNull();
  },
};
export const LongContent: Story = {
  tags: ["context-matrix"],
  parameters: {
    figma: { label: "Alert long-content example in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-199" },
    docs: { description: { story: "[Light long-content example](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-199) · [Dark long-content example](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-361)" } },
  },
  args: { title: "Atualização disponível", body: "A configuração foi atualizada e está disponível para revisão. Verifique os detalhes antes de continuar. IDENTIFICADOR-ABCDEFGHIJKLMNOPQRSTUVWXYZ-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ." },
};
export const AnatomyCoverage: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: {
    controls: { disable: true },
    figma: { label: "Alert intent and anatomy examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9012-35" },
  },
  render: () => <FoundationStoryPage title="Message coverage" description="Intent and optional anatomy regression cases."><FoundationSpecimenGrid minItemWidth="full">
    {alertSizes.map(size => <section key={size} aria-label={`${size} anatomy`}><Text as="h2" variant="heading-sm">{size.toUpperCase()}</Text>
      <FoundationSpecimenGrid minItemWidth="full">{messageIntents.map(intent => <Alert key={intent} size={size} intent={intent} title="Status update" body="Review the current details." action={{ label: "Review", onClick: () => {} }} dismiss={{ label: "Close", onDismiss: () => {} }}/>)}
      <Alert size={size} title="Title only" icon={false}/><Alert size={size} body="Body only" icon={false}/>
      </FoundationSpecimenGrid>
    </section>)}
  </FoundationSpecimenGrid></FoundationStoryPage>,
};
export const Sizes: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: () => <FoundationStoryPage title="Alert sizes" description="Compact and default retain the same typography, intents and actions."><FoundationSpecimenGrid minItemWidth="full">
    {alertSizes.map(size => <section key={size} aria-label={`${size} example`}><Text as="h2" variant="heading-sm">{size === "sm" ? "Compact (SM)" : "Default (MD)"}</Text><MessageExample kind="alert" alertSize={size} intent="info" title="Packaged separately" body="Specify the contents of each package and how many packages are included in one portion. You can select a saved component or enter a new name." withIcon withAction dismissible/></section>)}
    <section aria-label="Default without size"><Text as="h2" variant="heading-sm">Default without a size prop</Text><Alert title="Schedule updated" body="Current callers preserve their default appearance."/></section>
  </FoundationSpecimenGrid></FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    const messages = [...canvasElement.querySelectorAll<HTMLElement>('[data-message-kind="alert"]')];
    await expect(messages).toHaveLength(3);
    const referenceTitle = getComputedStyle(messages[0].querySelector<HTMLElement>(':scope > div > div')!);
    for (const [index, message] of messages.entries()) {
      const style = getComputedStyle(message);
      await expect(style.paddingTop).toBe(index === 0 ? "12px" : "16px");
      await expect(style.paddingLeft).toBe(index === 0 ? "12px" : "16px");
      await expect(style.borderRadius).toBe(index === 0 ? "8px" : "12px");
      await expect(message.scrollWidth).toBeLessThanOrEqual(message.clientWidth);
      const title = getComputedStyle(message.querySelector<HTMLElement>(':scope > div > div')!);
      await expect([title.fontSize, title.lineHeight, title.fontWeight, title.fontFamily]).toEqual([referenceTitle.fontSize, referenceTitle.lineHeight, referenceTitle.fontWeight, referenceTitle.fontFamily]);
    }
    for (const label of ["sm example", "md example"]) {
      const scope = within(within(canvasElement).getByRole("region", { name: label }));
      await userEvent.click(scope.getByRole("button", { name: "Review details" }));
      await expect(scope.getByRole("status")).toHaveTextContent("Demo action performed");
      await userEvent.click(scope.getByRole("button", { name: "Dismiss message" }));
      await waitFor(() => expect(scope.getByRole("button", { name: "Restore example" })).toHaveFocus());
      await userEvent.click(scope.getByRole("button", { name: "Restore example" }));
    }
  },
};
