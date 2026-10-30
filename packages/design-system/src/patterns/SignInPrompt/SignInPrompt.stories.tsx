import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "../../components/Button/Button";
import { FoundationStoryPage } from "../../foundations/FoundationStoryLayout";
import { getStoryContent } from "../../storybook/story-content";
import { SignInPrompt } from "./SignInPrompt";

function copy(profile: unknown) {
  const { lang } = getStoryContent(profile);
  return lang === "pt-BR" ? { lang, title: "Entrar", description: "Use sua conta Google para continuar.", action: "Entrar com Google", close: "Fechar", requested: "Entrada solicitada" }
    : { lang, title: "Sign in", description: "Use your Google account to continue.", action: "Sign in with Google", close: "Close", requested: "Sign-in requested" };
}
type Args = { loading: boolean };
function Example({ loading, profile }: Args & { profile: unknown }) {
  const [mobile, setMobile] = useState(false), [requested, setRequested] = useState(false), m = copy(profile);
  useEffect(() => {
    const query = matchMedia("(max-width: 63.999rem)");
    const update = () => setMobile(query.matches);
    update(); query.addEventListener("change", update); return () => query.removeEventListener("change", update);
  }, []);
  return <div lang={m.lang}>
    <SignInPrompt mobile={mobile} loading={loading || requested} title={m.title} description={m.description}
      actionLabel={m.action} closeLabel={m.close} onSignIn={() => setRequested(true)} trigger={<Button variant="ghost" intent="neutral">{m.title}</Button>} />
    {requested ? <output role="status">{m.requested}</output> : null}
  </div>;
}
const meta = {
  id: "patterns-sign-in-prompt", title: "Patterns/Forms & Validation/SignInPrompt", tags: ["test"],
  args: { loading: false }, parameters: { layout: "fullscreen", controls: { include: ["loading"] } },
  argTypes: { loading: { control: "boolean" } },
  render: (args, { globals }) => <FoundationStoryPage title="SignInPrompt" description="An explicit Google action in a contextual desktop popover or compact mobile sheet. The caller owns authentication.">
    <Example {...args} profile={globals.storyContentProfile} />
  </FoundationStoryPage>,
} satisfies Meta<Args>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = { tags: ["context-matrix"] };
export const ExplicitActionAndDismissal: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement), m = copy(globals.storyContentProfile);
    const opener = canvas.getByRole("button", { name: m.title });
    await userEvent.click(opener);
    let panel = canvas.getByRole("dialog", { name: m.title });
    const box = panel.getBoundingClientRect();
    expect(panel.scrollWidth).toBeLessThanOrEqual(panel.clientWidth);
    expect(box.left).toBeGreaterThanOrEqual(0); expect(box.right).toBeLessThanOrEqual(innerWidth);
    expect(within(panel).getByText(m.description)).toBeVisible();
    expect(within(panel).getByRole("button", { name: m.action }).querySelector("[data-icon-name]")).toHaveAttribute("data-icon-name", "social/google/branded");
    expect(canvas.queryByRole("status")).toBeNull();
    await userEvent.click(within(panel).getByRole("button", { name: m.close }));
    await waitFor(() => expect(opener).toHaveFocus());
    await userEvent.click(opener); panel = canvas.getByRole("dialog", { name: m.title });
    await userEvent.click(within(panel).getByRole("button", { name: m.action }));
    await expect(canvas.getByRole("status")).toHaveTextContent(m.requested);
    await expect(within(panel).getByRole("button", { name: m.action })).toHaveAttribute("aria-busy", "true");
    await userEvent.click(within(panel).getByRole("button", { name: m.close }));
    await waitFor(() => expect(opener).toHaveFocus());
  },
};
