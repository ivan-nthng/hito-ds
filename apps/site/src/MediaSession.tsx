import { useEffect, useId, useRef, useState } from "react";
import { Button, Card, Dot, Link, Live, MediaFooter, RoundPlayButton, Tag, Text } from "@hito-ds/react";
import { createSpotifyPlayer, spotifyTrack, type PlaybackState } from "./spotify-player";
import styles from "./MediaSession.module.css";

export function MediaSession() {
  const [state, setState] = useState<PlaybackState | "idle">("idle");
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<ReturnType<typeof createSpotifyPlayer> | null>(null);
  const wanted = useRef(false);
  const playing = state === "playing" || state === "buffering";
  useEffect(() => {
    if (!active || !host.current) return;
    const current = createSpotifyPlayer(host.current, setState); player.current = current;
    if (wanted.current) current.play();
    return () => { current.destroy(); if (player.current === current) player.current = null; };
  }, [active, attempt]);
  const togglePlayback = () => {
    if (state === "loading") return;
    setExpanded(true);
    if (!active) { wanted.current = true; setActive(true); }
    else if (state === "error") { wanted.current = true; setAttempt(v => v + 1); }
    else if (playing) { wanted.current = false; player.current?.pause(); }
    else { wanted.current = true; player.current?.play(); }
  };
  const messages = { idle: "Spotify player is not loaded.", loading: "Loading Spotify player…", ready: "Spotify is ready. Use Play or the native player.", playing: "Playing in Spotify.", paused: "Paused in Spotify.", buffering: "Buffering in Spotify…", ended: "Playback ended.", blocked: "Playback has not been confirmed. Use the Spotify player or open the track in Spotify.", error: "Spotify player unavailable. Open the track in Spotify or try Play again." };
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <div className={styles.wrapper}>
    <Card data-hito-color-scheme="light" size="compact" layout="fixed" elevation="raised" className={styles.card}>
      <img className={styles.photo} src="/media/coastal-session.jpg" alt="Surfers waiting in calm coastal water beneath a cloudy sky" width="2789" height="2092" fetchPriority="high" />
      <div className={styles.body}>
        <div className={styles.metadata}><Text as="span" variant="body-sm" emphasis="strong">Noel Gallagher</Text><Dot /><Text as="span" variant="body-sm" className={styles.secondary}>High Flying Birds</Text></div>
        <div className={styles.title}><Text as="h2" variant="heading-lg">If I Had a Gun…</Text><RoundPlayButton playing={playing} aria-label={state === "loading" ? "Loading Spotify player" : playing ? "Pause" : "Play"} aria-pressed={playing} loading={state === "loading"} onClick={togglePlayback} /></div>
        <Text as="p" variant="body-sm" className={styles.secondary}>A guitar ballad with acoustic layers, from Noel Gallagher’s solo debut.</Text>
        <div className={styles.tags} aria-label="Track details"><Tag label="Britpop" /><Tag label="Rock" /></div>
      </div>
      <MediaFooter><Button variant="primary" intent="neutral" aria-pressed={saved} onClick={() => setSaved(value => !value)}>{saved ? "Track saved" : "Save track"}</Button><Button variant="soft" intent="neutral" aria-expanded={expanded} aria-controls={id} onClick={() => { if (expanded) { wanted.current = false; player.current?.pause(); setActive(false); setState("idle"); setExpanded(false); } else { wanted.current = false; setActive(true); setExpanded(true); } }}>{expanded ? "Hide player" : "Show player"}</Button></MediaFooter>
      <div id={id} hidden={!expanded} className={styles.tracklist}>{active ? <div ref={host} className={styles.spotifyHost} /> : null}<Text variant="body-sm">{messages[state]}</Text><Link href={spotifyTrack.url} external target="_blank">Open track in Spotify</Link><Text variant="body-sm" className={styles.secondary}>Playback availability depends on Spotify and your browser.</Text></div>
      <span role="status" className={styles.srOnly}>{messages[state]} {saved ? "Track saved for this visit only; your Spotify library is unchanged." : "Track not saved for this visit."}</span>
    </Card>
    <div className={styles.statusFrame}><Live className={styles.live}>Spotify</Live></div>
    <Link href="/storybook/" size="sm" className={styles.attribution}>Built with Hito DS</Link>
  </div>;
}
