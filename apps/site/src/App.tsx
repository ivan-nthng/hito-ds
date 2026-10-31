import { Breadcrumbs, Link, MediaActionLink, MediaBackdrop, Separator, Text } from "@hito-ds/react";
import { HitoWordmark } from "./HitoWordmark";
import { MediaSession } from "./MediaSession";
import styles from "./App.module.css";
const repository = "https://github.com/ivan-nthng/hito-runner";
export function App() {
  return <div className={styles.page} data-hito-theme="neutral" data-hito-color-scheme="dark">
    <MediaBackdrop />
    <Link href="#main" className={styles.skip}>Skip to main content</Link>
    <div className={styles.content}>
      <header className={styles.header}>
        <div className={styles.logoSlot}><HitoWordmark className={styles.logo} /></div>
        <nav aria-label="Main navigation" className={styles.links}><Link href="/storybook/">Storybook</Link><Link href={repository} external target="_blank">GitHub</Link><Link href="https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX" external target="_blank">Figma</Link></nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        <Breadcrumbs items={[{id:"home",label:"Hito",href:"/"}]} currentPage="Overview" label="Breadcrumb" overflowLabel={count => `Show ${count} ancestors`} closeLabel="Close breadcrumb menu" className={styles.breadcrumbs} />
        <div className={styles.editorial}>
          <section className={styles.intro} aria-labelledby="site-title">
            <Text as="h1" id="site-title" variant="display-hero" className={styles.heading}><span>Structure.</span>{" "}<span>With feeling.</span></Text>
            <Text as="p" variant="body-md" className={styles.support}>A design system for interfaces with a point of view. Native Figma components, semantic tokens and React — ready to make your own.</Text>
            <div className={styles.ctas}><MediaActionLink href="/storybook/">Explore Storybook</MediaActionLink><Link href={repository} size="lg" external target="_blank">View source</Link></div>
          </section>
          <section aria-label="Built with Hito" className={styles.media}><MediaSession /></section>
        </div>
      </main>
      <footer className={styles.footer}><Separator decorative /><div className={styles.footerContent}><Text as="p" variant="body-sm" className={styles.secondary}>Open source. Built to be used together.</Text><div className={styles.links}><Link href={repository} external target="_blank">Source &amp; contributions</Link><Link href={`${repository}/blob/main/LICENSE`} external target="_blank">MIT license</Link></div></div></footer>
    </div>
  </div>;
}
