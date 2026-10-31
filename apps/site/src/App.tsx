import { useLayoutEffect, useState, type FormEvent } from "react";
import { Button, Card, Checkbox, Field, Link, Text, TextInput } from "@hito-ds/react";
import { HitoWordmark } from "./HitoWordmark";
import styles from "./App.module.css";

const repository = "https://github.com/ivan-nthng/hito-runner";
const initialName = "Studio North";
const initialStatus = "Demo only. Nothing is sent or stored.";

export function App() {
  const [scheme, setScheme] = useState<"light" | "dark">(() =>
    window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const [name, setName] = useState(initialName);
  const [summary, setSummary] = useState(true);
  const [status, setStatus] = useState(initialStatus);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.hitoTheme = "neutral";
    root.dataset.hitoColorScheme = scheme;
    root.style.colorScheme = scheme;
  }, [scheme]);
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Changes saved for this demo.");
  }
  function reset() {
    setName(initialName); setSummary(true); setStatus(initialStatus);
  }
  return <div className={styles.page}>
    <Link href="#main" className={styles.skip}>Skip to main content</Link>
    <div className={styles.content}>
      <header className={styles.header}>
        <HitoWordmark className={styles.logo} />
        <nav aria-label="Main navigation" className={styles.links}>
          <Link href="/storybook/">Storybook</Link>
          <Link href={repository} external target="_blank">GitHub</Link>
          <Button variant="ghost" intent="neutral" size="md" onClick={() => setScheme(current => current === "light" ? "dark" : "light")}>{scheme === "light" ? "Dark mode" : "Light mode"}</Button>
        </nav>
      </header>
      <main id="main" tabIndex={-1} className={styles.main}>
        <section className={styles.stack} aria-labelledby="site-title">
          <Text as="p" variant="body-base" className={styles.secondary}>Hito design system</Text>
          <Text as="h1" id="site-title" variant="heading-xl" emphasis="strong">A shared language for design and code.</Text>
          <Text as="p" variant="body-md" className={styles.secondary}>React components, semantic tokens and a Figma library. Explore the details. Make them your own.</Text>
          <div className={styles.links}>
            <Link href="/storybook/" size="xl">Explore Storybook</Link>
            <Link href="https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX" size="lg" external target="_blank">Open Figma</Link>
          </div>
        </section>
        <section className={styles.stack} aria-labelledby="example-title">
          <Text as="h2" id="example-title" variant="heading-sm">Built with Hito</Text>
          <Card size="comfortable" layout="responsive" elevation="raised">
            <form className={`${styles.stack} ${styles.form}`} onSubmit={save}>
              <Text as="h3" variant="heading-sm">Your workspace</Text>
              <Text as="p" variant="body-base" className={styles.secondary}>A small example. Real components.</Text>
              <Field label="Workspace name" hint="Try editing this example.">
                {({ controlProps }) => <TextInput {...controlProps} size="md" value={name} onChange={event => { setName(event.target.value); setStatus(initialStatus); }} />}
              </Field>
              <Checkbox className={styles.alignedChoice} size="base" label="Send me a weekly summary" checked={summary} onChange={event => { setSummary(event.target.checked); setStatus(initialStatus); }} />
              <div className={styles.links}>
                <Button type="submit" variant="primary" intent="neutral" size="md">Save changes</Button>
                <Button type="button" variant="secondary" intent="neutral" size="md" onClick={reset}>Reset</Button>
              </div>
              <Text as="p" role="status" aria-live="polite" variant="body-sm">{status}</Text>
            </form>
          </Card>
          <Text as="p" variant="body-sm" className={styles.secondary}>Text · Card · Field · TextInput · Checkbox · Button</Text>
        </section>
      </main>
      <footer className={styles.footer}>
        <Text as="p" variant="body-sm" className={styles.secondary}>Open source. Built to be used together.</Text>
        <div className={styles.links}>
          <Link href={repository} external target="_blank">Source &amp; contributions</Link>
          <Link href={`${repository}/blob/main/LICENSE`} external target="_blank">MIT license</Link>
        </div>
      </footer>
    </div>
  </div>;
}
