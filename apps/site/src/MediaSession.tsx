import { useEffect, useId, useRef, useState } from "react";
import { Button, Card, Dot, Link, Live, MediaFooter, RoundPlayButton, Tag, Text } from "@hito-ds/react";
import { loadSoundCloud, playerUrl, trackUrl, type SoundCloudEvent, type SoundCloudWidget } from "./soundcloud-player";
import styles from "./MediaSession.module.css";

function formatTime(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
export function MediaSession() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState<number>();
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
      const bind = (name: string, handler: (event?: SoundCloudEvent) => void) => { const event = factory.Events[name]; bound.push(event); widget!.bind(event, payload => { if (active) handler(payload); }); };
      bind("READY", () => { window.clearTimeout(timer); setReady(true); setFailed(false); widget?.getDuration(value => { if (active && Number.isFinite(value) && value > 0) setDuration(value); }); widget?.getPosition(value => { if (active && Number.isFinite(value) && value >= 0) setPosition(value); }); });
      const progress = (event?: SoundCloudEvent) => { const value = event?.currentPosition; if (value !== undefined && Number.isFinite(value) && value >= 0) setPosition(value); };
      bind("PLAY_PROGRESS", progress);
      bind("SEEK", progress);
      bind("PLAY", () => setPlaying(true));
      bind("PAUSE", () => setPlaying(false));
      bind("FINISH", () => { setPlaying(false); setPosition(0); widget?.seekTo(0); widget?.pause(); });
      bind("ERROR", () => { window.clearTimeout(timer); setPlaying(false); setReady(false); setFailed(true); widget?.pause(); });
    }).catch(() => { if (active) { window.clearTimeout(timer); setFailed(true); } });
    const pause = () => widget?.pause();
    window.addEventListener("pagehide", pause);
    return () => { active = false; window.clearTimeout(timer); window.removeEventListener("pagehide", pause); bound.forEach(event => widget?.unbind(event)); widget?.pause(); engine.current = undefined; };
  }, []);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  const elapsed = duration === undefined ? undefined : Math.min(position, duration);
  const time = elapsed === undefined || duration === undefined ? "--:-- / --:--" : `${formatTime(elapsed)} / ${formatTime(duration)}`;
  const progress = elapsed === undefined || duration === undefined ? undefined : { value: elapsed, max: duration, valueText: `${formatTime(elapsed)} of ${formatTime(duration)}`, label: "Playback progress" };
  return <div className={styles.wrapper}>
    <Card data-hito-color-scheme="light" size="compact" layout="fixed" elevation="raised" className={styles.card}>
      <img className={styles.photo} src="/media/coastal-session.jpg" alt="Surfers waiting in calm coastal water beneath a cloudy sky" width="2789" height="2092" fetchPriority="high" />
      <div className={styles.body}>
        <div className={styles.metadata}><Text as="span" variant="body-sm" emphasis="strong">Vanya Nichego</Text><Dot /><Text as="span" variant="body-sm" className={styles.secondary}>Deep House</Text></div>
        <div className={styles.title}><Text as="h2" variant="heading-lg">You think you’re stuck</Text><RoundPlayButton progress={progress} playing={playing} aria-label={playing ? "Pause" : "Play"} aria-pressed={playing} disabled={!ready} aria-busy={!ready && !failed} onClick={() => { if (playing) engine.current?.pause(); else engine.current?.play(); }} /></div>
        <Text as="p" variant="body-sm" className={styles.secondary}>Inspired by old Detroit hip-hop and house, with dusty drums, chopped samples and a warm, rolling bassline. A late-night groove for moving forward.</Text>
        <div className={styles.tags} aria-label="Session details"><Tag label="Detroit house" /><Tag label="Chicago house" /><Tag label="Garage house" /></div>
      </div>
      <MediaFooter><Button variant="primary" intent="neutral" aria-pressed={saved} onClick={() => setSaved(value => !value)}>{saved ? "Session saved" : "Save Session"}</Button><Button variant="soft" intent="neutral" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>View Tracklist</Button></MediaFooter>
      <div id={id} hidden={!expanded} className={styles.tracklist}><Text variant="body-sm">You think you’re stuck · Vanya Nichego</Text></div>
      <span role="status" className={styles.srOnly}>{failed ? "Audio unavailable." : !ready ? "Audio loading." : playing ? "Audio playing." : "Audio paused."} {saved ? "Session saved for this visit." : "Session not saved."}</span>
    </Card>
    <iframe ref={frame} src={playerUrl} title="Audio playback engine" tabIndex={-1} aria-hidden="true" allow="autoplay" className={styles.audioEngine} />
    <div className={styles.statusFrame}><Live className={styles.live} /><Live className={styles.timeChip} data-playback-chip=""><span className={styles.time} data-playback-time="">{time}</span></Live></div>
    <div className={styles.credits}><Link href="/storybook/" size="sm" className={styles.attribution}>Built with Hito DS</Link><Link href={trackUrl} size="sm" className={styles.attribution}>SoundCloud</Link></div>
  </div>;
}
