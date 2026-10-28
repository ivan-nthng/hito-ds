import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../../../packages/design-system/src/components/Button/Button";
import { expect } from "storybook/test";
import styles from "./welcome.module.css";

const meta = {
  title: "Start here/Welcome", id: "hito-welcome", parameters: { layout: "fullscreen", controls: { disable: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => <main className={styles.page}>
    <header className={styles.header}><a href="?path=/story/hito-welcome--overview" className={styles.logo}>Hito<span>DS</span></a><span className={styles.version}>OPEN SOURCE · v0.1 ALPHA</span></header>
    <section className={styles.hero} aria-labelledby="hito-title">
      <p className={styles.eyebrow}>FIGMA / REACT / STORYBOOK</p>
      <h1 id="hito-title">Design it.<br/>Build it.<br/><span>Keep it together.</span></h1>
      <p className={styles.intro}>A shared language for the people who design products and the people who build them. Components, tokens and working examples, in one place.</p>
      <div className={styles.actions}><a className={styles.primary} href="?path=/story/actions-button--playground">Explore components <span aria-hidden="true">↗</span></a><a className={styles.secondary} href="https://github.com/ivan-nthng/hito-ds">Get the code <span aria-hidden="true">↗</span></a></div>
    </section>
    <section className={styles.preview} aria-label="Design system preview">
      <div className={styles.previewTitle}><span>ONE SYSTEM. MANY STATES.</span><span>LIVE COMPONENTS</span></div>
      <div className={styles.specimens}>
        <article><p className={styles.label}>01 / ACTIONS</p><h2>Details that work.</h2><p>Try the controls. Use the toolbar to switch appearance, language and content length.</p><div className={styles.buttonRow}><Button intent="neutral" variant="primary">Save changes</Button><Button intent="neutral" variant="secondary">Cancel</Button><Button intent="neutral" variant="primary" disabled>Unavailable</Button></div></article>
        <article><p className={styles.label}>02 / FOUNDATIONS</p><div role="img" className={styles.swatches} aria-label="Sample palette"><span/><span/><span/><span/><span/></div><h2>Decisions, made explicit.</h2><p>Semantic tokens for color, typography, spacing, geometry and motion. A foundation your team can adapt.</p></article>
      </div>
    </section>
    <section className={styles.paths} aria-label="Explore the system">
      <a href="?path=/story/foundations-color-primitives-palettes--neutral"><span>01</span><h2>Foundations</h2><p>Understand the visual language and the rules behind it.</p><strong>Open the library ↗</strong></a>
      <a href="?path=/story/actions-button--playground"><span>02</span><h2>Components</h2><p>Inspect properties, states, interactions and the code that runs.</p><strong>Try a component ↗</strong></a>
      <a href="https://github.com/ivan-nthng/hito-ds/blob/main/docs/figma-and-code.md"><span>03</span><h2>Design ↔ code</h2><p>See how Figma, tokens and implementation stay aligned.</p><strong>Read the workflow ↗</strong></a>
    </section>
    <section className={styles.service}><div><p className={styles.eyebrow}>FROM LIBRARY TO YOUR PRODUCT</p><h2>Need this in your team?</h2><p>I help teams connect their Figma library, frontend components and Storybook, then put the system to work in a real product.</p></div><a className={styles.primary} href="https://www.upwork.com/freelancers/~011ddc278b4de54094">Discuss an implementation ↗</a></section>
    <footer className={styles.footer}><span>Built by <a href="https://www.cheremisin.co.uk/">Ivan Cheremisin</a></span><span>Product design × design engineering</span><a href="https://github.com/ivan-nthng/hito-ds/blob/main/LICENSE">MIT license ↗</a></footer>
  </main>,
  play: async ({canvas}) => { await expect(canvas.getByRole("heading",{level:1})).toBeVisible(); await expect(canvas.getByRole("button",{name:"Unavailable"})).toBeDisabled(); },
};
