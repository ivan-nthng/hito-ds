import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import mark from "../../assets/hito-mark.svg";
import wordmark from "../../../../docs/hito-wordmark.svg";
import { FoundationStoryPage, FoundationStorySection, FoundationSpecimenGrid, FoundationSpecimen } from "./FoundationStoryLayout";

const meta = {
  title: "Foundations/Color/Hito Identity",
  parameters: { layout: "fullscreen" },
  tags: ["test", "context-matrix"],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const assetUrl = (asset: string | { src: string }) => typeof asset === "string" ? asset : asset.src;

export const Logo: Story = {
  render: () => <FoundationStoryPage title="Hito identity" description="The monochrome Hito wordmark and symbol use the original repository artwork. Identity is separate from the blue action palette and meaningful status colors.">
    <FoundationStorySection title="Original artwork" description="Native paths from ivan-nthng/hito-runner, revision 97d83baa8b25cbcce0941029632f7d169dd46edc. Artwork adapts its monochrome foreground to the host color scheme.">
      <FoundationSpecimenGrid minItemWidth="standard">
        <FoundationSpecimen label="Wordmark" value="608 × 256 native viewBox"><img src={assetUrl(wordmark)} width={152} height={64} alt="Hito wordmark" /></FoundationSpecimen>
        <FoundationSpecimen label="Symbol" value="219 × 222 native viewBox"><img src={assetUrl(mark)} width={64} height={64} alt="Hito symbol" /></FoundationSpecimen>
      </FoundationSpecimenGrid>
    </FoundationStorySection>
    <FoundationStorySection title="Identity migration" description="The former five multicolor identity families and their identity-colors package export are retired. Do not substitute them with status colors.">
      <p>Use the original SVG artwork for branding. Use existing semantic UI tokens for actions, surfaces and status feedback.</p>
    </FoundationStorySection>
  </FoundationStoryPage>,
  play: async ({ canvas }) => {
    for (const name of ["Hito wordmark", "Hito symbol"]) {
      const image = canvas.getByRole("img", { name });
      await expect(image).toBeVisible();
      await (image as HTMLImageElement).decode();
      await expect((image as HTMLImageElement).naturalWidth).toBeGreaterThan(0);
    }
  },
};
