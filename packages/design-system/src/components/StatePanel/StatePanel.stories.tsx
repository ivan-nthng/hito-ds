import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimenGrid } from "../../foundations/FoundationStoryLayout";
import { getLoadingStateContent } from "../../storybook/loading-state.story";
import type { ButtonIntent } from "../Button/Button";
import { Text } from "../Text/Text";
import { StatePanel, type StatePanelProps } from "./StatePanel";

type StoryProps = StatePanelProps & { withIcon: boolean; withAction: boolean; actionIntent: ButtonIntent; profile?: unknown };
const defaultCopy = getLoadingStateContent("en-short");
function Example({ withIcon, withAction, actionIntent, profile, ...args }: StoryProps) {
  const [result, setResult] = useState("");
  const copy = getLoadingStateContent(profile);
  return <div lang={copy.lang}>
    <StatePanel {...args}
      title={args.title === defaultCopy.empty.title ? copy.empty.title : args.title}
      body={args.body === defaultCopy.empty.body ? copy.empty.body : args.body}
      icon={withIcon ? args.icon : undefined}
      action={withAction ? { label: copy.empty.action, intent: actionIntent, onClick: () => setResult(copy.result) } : undefined} />
    <Text variant="body-sm" role="status">{result}</Text>
  </div>;
}

const meta = {
  id: "feedback-state-panel", title: "Components/Feedback/StatePanel", component: StatePanel, tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["title", "body", "withIcon", "withAction", "actionIntent"] },
    docs: { description: { component: "[StatePanel component in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9033-24) · [Light examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9034-29) · [Dark mobile examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9034-110)" } },
  },
  args: { title: defaultCopy.empty.title, body: defaultCopy.empty.body, icon: "general/status-dashed-circle", withIcon: true, withAction: true, actionIntent: "neutral" },
  argTypes: { title: { control: "text" }, body: { control: "text" }, withIcon: { control: "boolean" }, withAction: { control: "boolean" }, actionIntent: { control: "select", options: ["neutral", "accent", "info", "success", "warning", "destructive"] } },
  render: (args, { globals }) => <FoundationStoryPage title="StatePanel" description="Empty, error and access feedback share one anatomy. The application supplies meaning and a safe action."><Example {...args} profile={globals.storyContentProfile} /></FoundationStoryPage>,
} satisfies Meta<StoryProps>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "StatePanel component in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9033-24" } },
  play: async ({ canvasElement, globals }) => {
    const c = within(canvasElement), copy = getLoadingStateContent(globals.storyContentProfile);
    const button = c.getByRole("button", { name: copy.empty.action });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(c.getByRole("status")).toHaveTextContent(copy.result);
    await expect(button).toHaveFocus();
    const panel = canvasElement.querySelector("[data-state-panel]")!;
    await expect(panel.querySelector("[aria-live], [role=status], [role=alert]")).toBeNull();
    await expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(canvasElement.clientWidth);
  },
};

export const Outcomes: Story = {
  tags: ["context-matrix"],
  parameters: {
    controls: { disable: true },
    figma: { label: "StatePanel light examples in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9034-29" },
    docs: { description: { story: "[Light outcomes](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9034-29) · [Dark mobile outcomes](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9034-110)" } },
  },
  render: (_, { globals }) => {
    const copy = getLoadingStateContent(globals.storyContentProfile);
    return <FoundationStoryPage title="StatePanel outcomes" description="Examples of caller-owned content and icon meaning."><FoundationSpecimenGrid minItemWidth="full" lang={copy.lang}>
      <StatePanel title={copy.empty.title} body={copy.empty.body} icon="general/status-dashed-circle" />
      <StatePanel title={copy.error.title} body={copy.error.body} icon="general/status-cross-circle" iconTone="destructive" />
      <StatePanel title={copy.access.title} body={copy.access.body} icon="general/lock" iconTone="secondary" />
    </FoundationSpecimenGrid></FoundationStoryPage>;
  },
};

export const Minimal: Story = {
  parameters: { figma: { label: "StatePanel optional anatomy in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9034-22" } },
  args: { body: "", withIcon: false, withAction: false },
};
