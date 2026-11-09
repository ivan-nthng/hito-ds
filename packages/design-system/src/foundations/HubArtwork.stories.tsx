import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor } from "storybook/test";
import manifest from "@hito-ds/react/assets/hub-soft-3d/manifest.json";
import hubManifest from "@hito-ds/react/assets/hub-soft-3d/hub-navigation-manifest.json";
import { FoundationStoryPage, FoundationSpecimen, FoundationSpecimenGrid } from "./FoundationStoryLayout";
import styles from "./HubArtwork.stories.module.css";

const images = import.meta.glob<string | { src: string }>("../../assets/hub-soft-3d/png-160/*.png", {
  eager: true, query: "?url", import: "default",
});
const prompts = new URL("../../assets/hub-soft-3d/prompts.json", import.meta.url).href;
const provenance = new URL("../../assets/hub-soft-3d/generation-sources.json", import.meta.url).href;
const hubProvenance = new URL("../../assets/hub-soft-3d/hub-navigation-provenance.json", import.meta.url).href;
// Story-only composition from source manifests; Hub navigation is not a server service.
const family = [
  ...manifest.icons.map(icon => ({ key: icon.service_id, name: icon.name, path: icon.exports.find(asset => asset.width === 160)!.path })),
  { key: hubManifest.subject_id, name: "Hub", path: hubManifest.exports.find(asset => asset.dimensions[0] === 160)!.path },
];

const meta = {
  id: "foundations-iconography-hub-artwork",
  title: "Foundations/Iconography/Hub Artwork",
  tags: ["test"],
  parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Family: Story = {
  tags: ["context-matrix"],
  render: () => <FoundationStoryPage title="Hub artwork" description={<>Decorative service and Hub navigation artwork at 64 CSS px. Use the theme toolbar to compare backgrounds. <a href="https://github.com/ivan-nthng/hito-ds/blob/main/docs/figma-and-code.md">Integration guide</a> · <a href={prompts}>Prompts</a> · <a href={provenance}>Master provenance</a> · <a href={hubProvenance}>Hub provenance</a></>}>
    <FoundationSpecimenGrid minItemWidth="compact">
      {family.map(icon => {
        const source = images[`../../assets/hub-soft-3d/${icon.path}`];
        return <FoundationSpecimen key={icon.key} label={icon.name} token={icon.key} value="160 px export">
        {/* Native raster specimen; no public image control or SVG glyph semantics. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.artwork} src={typeof source === "string" ? source : source.src} alt="" width={160} height={160} />
      </FoundationSpecimen>;
      })}
    </FoundationSpecimenGrid>
  </FoundationStoryPage>,
  play: async ({ canvasElement }) => {
    const specimens = canvasElement.querySelectorAll<HTMLImageElement>("img");
    await expect(specimens.length).toBe(family.length);
    for (const image of specimens) {
      await waitFor(() => expect(image.complete && image.naturalWidth === 160).toBe(true));
      await expect(image).toHaveAttribute("alt", "");
      await expect(image.getBoundingClientRect().width).toBe(64);
      await expect(image.getBoundingClientRect().height).toBe(64);
    }
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};
