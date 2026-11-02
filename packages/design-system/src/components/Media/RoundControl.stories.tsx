import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { RoundControl, RoundPlayButton } from "./Media";
import styles from "./RoundControl.stories.module.css";
const meta = { title: "Components/Media/Round control", component: RoundControl, args: { icon: "controls/play", "aria-label": "Circular action" }, parameters: { layout: "centered", design: { type: "figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=11421-1040" } }, tags: ["test"] } satisfies Meta<typeof RoundControl>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SizesAndProgress: Story = {
  tags: ["context-matrix"],
  render: () => <div className={styles.grid}>{(["sm","md","lg","xl"] as const).map(size => <div className={styles.row} key={size}>
    <span>{size}</span><RoundControl size={size} icon="controls/play" aria-label={`${size} default`} />
    {[0,50,100].map(value => <RoundControl key={value} size={size} icon="controls/play" aria-label={`${size} ${value} percent`} progress={{value, valueText:`${value}%`, label:`${size} progress ${value}`}} />)}
  </div>)}</div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for(const [size,diameter] of [["sm",28],["md",36],["lg",44],["xl",56]] as const) {
      const button = canvas.getByRole("button", {name:`${size} 50 percent`});
      expect(button.getBoundingClientRect().width).toBe(diameter); expect(button.getBoundingClientRect().height).toBe(diameter);
      expect(getComputedStyle(button).borderRadius).toBe("9999px");
      expect(canvas.getByRole("progressbar", {name:`${size} progress 50`}).getAttribute("aria-valuetext")).toBe("50%");
    }
  },
};
export const States: Story = { render: () => <div className={styles.row}>
  <RoundControl icon="controls/play" aria-label="Enabled" progress={{value:25,valueText:"25%"}} />
  <RoundControl icon="controls/play" aria-label="Disabled" disabled progress={{value:25,valueText:"25%"}} />
  <RoundControl icon="controls/play" aria-label="Loading" loading progress={{value:25,valueText:"25%"}} />
  <RoundControl icon="controls/play" aria-label="Soft action" variant="soft" intent="accent" progress={{value:25,valueText:"25%"}} />
<div className={styles.scrim}><RoundControl icon="controls/play" aria-label="On scrim" variant="ghost" intent="neutral" context="on-scrim" progress={{value:50,valueText:"50%"}} /></div>
</div>, play: async ({canvasElement}) => { const canvas=within(canvasElement);await userEvent.tab();const button=canvas.getByRole("button",{name:"On scrim"});button.focus();expect(getComputedStyle(button).outlineOffset).toBe("2px");expect(getComputedStyle(button).outlineWidth).toBe("2px"); } };
function PlaybackExample() { const [playing, setPlaying] = useState(false); return <div className={styles.row}><span className={styles.time}>1:23 / 3:28</span><RoundPlayButton aria-label={playing ? "Pause example" : "Play example"} playing={playing} aria-pressed={playing} onClick={()=>setPlaying(v=>!v)} progress={{value:83000,max:208000,valueText:"1:23 of 3:28",label:"Example playback progress"}} /></div>; }
export const Playback: Story = { render: () => <PlaybackExample />, play: async ({canvasElement}) => { const canvas=within(canvasElement);await userEvent.click(canvas.getByRole("button",{name:"Play example"}));expect(canvas.getByRole("button",{name:"Pause example"}).getAttribute("aria-pressed")).toBe("true"); } };

/** Legacy width is forwarded; Button's icon-only sizing has always retained the circle. */
export const LegacyWidthCompatibility: Story = {
 render: () => <div className={styles.legacyWidth}><RoundPlayButton width="content" aria-label="Legacy content width" /><RoundPlayButton width="full" aria-label="Legacy full width" /></div>,
 play: async ({canvasElement}) => { const canvas=within(canvasElement);for(const width of ["content","full"]){const button=canvas.getByRole("button",{name:`Legacy ${width} width`});expect(button.getAttribute("data-width")).toBe(width);expect(button.getBoundingClientRect().width).toBe(56);expect(button.getBoundingClientRect().height).toBe(56);} }
};
