import { useId, useState } from "react";
import { Button, Card, Dot, Link, Live, MediaFooter, RoundPlayButton, Tag, Text } from "@hito-ds/react";
import styles from "./MediaSession.module.css";

export function MediaSession() {
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <div className={styles.wrapper}>
    <Card data-hito-color-scheme="light" size="compact" layout="fixed" elevation="raised" className={styles.card}>
      <img className={styles.photo} src="/media/coastal-session.jpg" alt="Surfers waiting in calm coastal water beneath a cloudy sky" width="2789" height="2092" fetchPriority="high" />
      <div className={styles.body}>
        <div className={styles.metadata}><Text as="span" variant="body-sm" emphasis="strong">Studio North</Text><Dot /><Text as="span" variant="body-sm" className={styles.secondary}>Session 04</Text></div>
        <div className={styles.title}><Text as="h2" variant="heading-lg">Soft Signals</Text><RoundPlayButton playing={playing} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} onClick={() => setPlaying(value => !value)} /></div>
        <Text as="p" variant="body-sm" className={styles.secondary}>Slow-burning guitars, ambient textures and a steady pulse, recorded live by the sea.</Text>
        <div className={styles.tags} aria-label="Session details"><Tag label="Ambient" /><Tag label="Post-punk" /><Tag label="24 min" /></div>
      </div>
      <MediaFooter><Button variant="primary" intent="neutral" aria-pressed={saved} onClick={() => setSaved(value => !value)}>{saved ? "Session saved" : "Save Session"}</Button><Button variant="soft" intent="neutral" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>View Tracklist</Button></MediaFooter>
      <div id={id} hidden={!expanded} className={styles.tracklist}><Text variant="body-sm">Demo tracklist · Soft Signals · Coastal Echoes · After the Tide</Text></div>
      <span role="status" className={styles.srOnly}>{playing ? "Demo playback active. No audio is streamed." : "Demo playback paused."} {saved ? "Session saved for this visit." : "Session not saved."}</span>
    </Card>
    <div className={styles.statusFrame}><Live className={styles.live} /></div>
    <Link href="/storybook/" size="sm" className={styles.attribution}>Built with Hito DS</Link>
  </div>;
}
