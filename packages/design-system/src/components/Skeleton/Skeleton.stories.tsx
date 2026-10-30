import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { FoundationStoryPage, FoundationSpecimenGrid, FoundationSpecimen } from "../../foundations/FoundationStoryLayout";
import { getLoadingStateContent } from "../../storybook/loading-state.story";
import { Skeleton, skeletonShapes } from "./Skeleton";
import styles from "./Skeleton.stories.module.css";

const meta = {
  id: "feedback-skeleton", title: "Components/Feedback/Skeleton", component: Skeleton, tags: ["test"],
  parameters: {
    layout: "fullscreen",
    controls: { include: ["shape"] },
    docs: { description: { component: "[Skeleton component in Figma](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9020-5) · [Light wide examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9021-5) · [Dark wide examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9021-33) · [Light narrow examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9021-61) · [Dark narrow examples](https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9021-88)" } },
  },
  args: { shape: "text" },
  argTypes: { shape: { control: "select", options: skeletonShapes } },
  render: (args, { globals }) => {
    const copy = getLoadingStateContent(globals.storyContentProfile);
    return <FoundationStoryPage title="Skeleton" description="Match the shape to the content being loaded. The parent owns dimensions and loading announcements.">
      <div role="region" aria-label={copy.loading} lang={copy.lang} aria-busy="true"><Skeleton {...args} /></div>
    </FoundationStoryPage>;
  },
} satisfies Meta<typeof Skeleton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  tags: ["context-matrix"],
  parameters: { figma: { label: "Skeleton text shape in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9021-8" } },
  play: async ({ canvasElement }) => {
    const bone = canvasElement.querySelector<HTMLElement>("[data-skeleton]")!;
    await expect(bone).toHaveAttribute("aria-hidden", "true");
    await expect(bone).not.toHaveAttribute("role");
    await expect(bone.textContent).toBe("");
    await expect(getComputedStyle(bone).animationName === "none").toBe(matchMedia("(prefers-reduced-motion: reduce)").matches);
  },
};

export const Compositions: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true }, figma: { label: "Skeleton compositions in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=9021-5" } },
  render: (_, { globals }) => {
    const copy = getLoadingStateContent(globals.storyContentProfile);
    return <FoundationStoryPage title="Skeleton compositions" description="Text, a list row and media reuse the same hidden shapes.">
    <div role="region" aria-label={copy.loading} lang={copy.lang} aria-busy="true"><FoundationSpecimenGrid>
      <FoundationSpecimen label="Text"><div className={styles.lines}><Skeleton /><Skeleton className={styles.medium} /><Skeleton className={styles.short} /></div></FoundationSpecimen>
      <FoundationSpecimen label="List row"><div className={styles.row}><Skeleton shape="circle" /><div className={styles.copy}><Skeleton /><Skeleton className={styles.medium} /></div></div></FoundationSpecimen>
      <FoundationSpecimen label="Media"><div className={styles.lines}><Skeleton shape="block" className={styles.media} /><Skeleton /><Skeleton className={styles.short} /></div></FoundationSpecimen>
    </FoundationSpecimenGrid></div>
  </FoundationStoryPage>;
  },
};
