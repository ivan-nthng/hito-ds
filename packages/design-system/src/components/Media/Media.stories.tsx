import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Live, RoundPlayButton } from "./Media";
const meta = { title: "Components/Media/Media helpers", component: Live, parameters: { layout: "centered" }, tags: ["test"] } satisfies Meta<typeof Live>;
export default meta;
type Story = StoryObj<typeof meta>;
export const LiveStatus: Story = {};
export const RoundPlay: Story = { render: () => <RoundPlayButton aria-label="Play" /> };
