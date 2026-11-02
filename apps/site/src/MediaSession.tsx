import { useEffect, useId, useRef, useState } from "react";
import { Button, Card, Dot, Link, Live, MediaFooter, RoundPlayButton, Tag, Text } from "@hito-ds/react";
import { loadSoundCloud, playerUrl, trackUrl, type SoundCloudWidget } from "./soundcloud-player";
import styles from "./MediaSession.module.css";

export function MediaSession() {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const engine = useRef<SoundCloudWidget | undefined>(undefined);
  useEffect(() => {
    let active = true, widget: SoundCloudWidget | undefined;
    const bound: string[] = [];
    const timer = window.setTimeout(() => { if (active) { setReady(false); setFailed(true); } }, 20000);
    loadSoundCloud().then(factory => {
      if (!active || !frame.current) return;
      widget = factory(frame.current); engine.current = widget;
      const bind = (name: string, handler: () => void) => { const event = factory.Events[name]; bound.push(event); widget!.bind(event, () => { if (active) handler(); }); };
      bind("READY", () => { window.clearTimeout(timer); setReady(true); setFailed(false); });
      bind("PLAY", () => setPlaying(true));
      bind("PAUSE", () => setPlaying(false));
      bind("FINISH", () => { setPlaying(false); widget?.seekTo(0); widget?.pause(); });
      bind("ERROR", () => { window.clearTimeout(timer); setPlaying(false); setReady(false); setFailed(true); widget?.pause(); });
    }).catch(() => { if (active) { window.clearTimeout(timer); setFailed(true); } });
    const pause = () => widget?.pause();
    window.addEventListener("pagehide", pause);
    return () => { active = false; window.clearTimeout(timer); window.removeEventListener("pagehide", pause); bound.forEach(event => widget?.unbind(event)); widget?.pause(); engine.current = undefined; };
  }, []);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <div className={styles.wrapper}>
    <Card data-hito-color-scheme="light" size="compact" layout="fixed" elevation="raised" className={styles.card}>
      <img className={styles.photo} src="/media/coastal-session.jpg" alt="Surfers waiting in calm coastal water beneath a cloudy sky" width="2789" height="2092" fetchPriority="high" />
      <div className={styles.body}>
        <div className={styles.metadata}><Text as="span" variant="body-sm" emphasis="strong">Vanya Nichego</Text><Dot /><Text as="span" variant="body-sm" className={styles.secondary}>Deep House</Text></div>
        <div className={styles.title}><Text as="h2" variant="heading-lg">You think you’re stuck</Text><RoundPlayButton playing={playing} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} disabled={!ready} aria-busy={!ready && !failed} onClick={() => { if (playing) engine.current?.pause(); else engine.current?.play(); }} /></div>
        <Text as="p" variant="body-sm" className={styles.secondary}>This is my experiment blending gospel samples with Detroit house.</Text>
        <div className={styles.tags} aria-label="Session details"><Tag label="Detroit house" /><Tag label="Chicago house" /><Tag label="Garage house" /></div>
      </div>
      <MediaFooter><Button variant="primary" intent="neutral" aria-pressed={saved} onClick={() => setSaved(value => !value)}>{saved ? "Session saved" : "Save Session"}</Button><Button variant="soft" intent="neutral" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>View Tracklist</Button></MediaFooter>
      <div id={id} hidden={!expanded} className={styles.tracklist}><Text variant="body-sm">You think you’re stuck · Vanya Nichego</Text></div>
      <span role="status" className={styles.srOnly}>{failed ? "Audio unavailable." : !ready ? "Audio loading." : playing ? "Audio playing." : "Audio paused."} {saved ? "Session saved for this visit." : "Session not saved."}</span>
    </Card>
    <iframe ref={frame} src={playerUrl} title="Audio playback engine" tabIndex={-1} aria-hidden="true" allow="autoplay" className={styles.audioEngine} />
    <div className={styles.statusFrame}><Live className={styles.live} /></div>
    <div className={styles.credits}><Link href="/storybook/" size="sm" className={styles.attribution}>Built with Hito DS</Link><Link href={trackUrl} size="sm" className={styles.attribution}>SoundCloud</Link></div>
  </div>;
}
