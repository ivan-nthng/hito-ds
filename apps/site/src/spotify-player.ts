// Official Spotify Embed iFrame API only; no SDK, authentication or hosted audio.
export const spotifyTrack = { uri: 'spotify:track:4i4ArYpqtsA3MJ1k0o2dxq', url: 'https://open.spotify.com/track/4i4ArYpqtsA3MJ1k0o2dxq' } as const;
export type PlaybackState = 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'ended' | 'blocked' | 'error';
type Event = { data?: { playingURI?: string; isPaused?: boolean; isBuffering?: boolean; position?: number; duration?: number } };
type Listener = (event: Event) => void;
export type SpotifyController = { play(): void; pause(): void; destroy(): void; addListener(name: string, listener: Listener): void; removeListener?(name: string, listener: Listener): void };
export type SpotifyAPI = { createController(element: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: SpotifyController) => void): void };
declare global { interface Window { onSpotifyIframeApiReady?: (api: SpotifyAPI) => void } }
let loaded: SpotifyAPI | undefined;
let pending: { promise: Promise<SpotifyAPI>; refs: number; cleanup(): void; cancel(): void } | undefined;
function acquire() {
  if (loaded) return { promise: Promise.resolve(loaded), release() {} };
  if (!pending) {
    const script = document.createElement('script'); script.src = 'https://open.spotify.com/embed/iframe-api/v1'; script.async = true; script.dataset.hitoSpotify = 'true';
    const previous = window.onSpotifyIframeApiReady; let active = true; let cancel = () => {};
    const promise = new Promise<SpotifyAPI>((resolve, reject) => {
      const callback = (api: SpotifyAPI) => { if (!active) return; loaded = api; cleanup(); try { previous?.(api); } finally { resolve(api); } };
      const fail = () => { if (!active) return; cleanup(); reject(new Error('Spotify player could not load.')); };
      const timer = window.setTimeout(fail, 12000);
      function cleanup() { active = false; clearTimeout(timer); script.removeEventListener('error', fail); script.remove(); if (window.onSpotifyIframeApiReady === callback) window.onSpotifyIframeApiReady = previous; }
      cancel = () => { cleanup(); reject(new Error('Spotify loading cancelled.')); };
      window.onSpotifyIframeApiReady = callback; script.addEventListener('error', fail); document.body.append(script);
    });
    // Each consumer guards late callbacks. Failed loads can be retried explicitly.
    const entry = { promise, refs: 0, cleanup: () => script.remove(), cancel: () => cancel() }; pending = entry;
    void promise.then(() => { if (pending === entry) pending = undefined; }, () => { if (pending === entry) pending = undefined; });
  }
  const entry = pending!; entry.refs++;
  return { promise: entry.promise, release() { entry.refs--; if (entry.refs === 0 && pending === entry) { entry.cancel(); pending = undefined; } } };
}
export function createSpotifyPlayer(host: HTMLElement, onState: (state: PlaybackState) => void) {
  let requestBlocked = false;
  let disposed = false, controller: SpotifyController | undefined, ready = false, wanted = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const listeners: [string, Listener][] = [], lease = acquire(), mount = document.createElement('div'); host.append(mount);
  const emit = (state: PlaybackState) => { if (!disposed) onState(state); };
  const clear = () => { clearTimeout(timeout); timeout = undefined; };
  const watch = () => { timeout = setTimeout(() => { timeout = undefined; requestBlocked = true; emit('blocked'); }, 6000); };
  const request = (play: boolean) => { wanted = play; if (!ready || !controller || disposed) return; clear(); requestBlocked = false; watch(); try { play ? controller.play() : controller.pause(); } catch { clear(); emit('error'); } };
  const decorate = () => { const iframe = host.querySelector('iframe'); if (iframe) { iframe.title = 'Spotify player — If I Had a Gun…'; iframe.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'); } };
  const observer = new MutationObserver(decorate); observer.observe(host, { childList: true, subtree: true });
  emit('loading'); timeout = setTimeout(() => emit('error'), 15000);
  void lease.promise.then(api => { if (disposed) return; try { api.createController(mount, { uri: spotifyTrack.uri, width: '100%', height: 152 }, next => {
    if (disposed) { next.destroy(); return; } controller = next; decorate();
    const listen = (name: string, fn: Listener) => { const guarded: Listener = e => { if (!disposed) fn(e); }; listeners.push([name, guarded]); next.addListener(name, guarded); };
    listen('ready', () => { clear(); ready = true; emit('ready'); if (wanted) request(true); });
    listen('playback_started', e => { if (e.data?.playingURI !== spotifyTrack.uri) return; clear(); requestBlocked = false; emit('playing'); });
    listen('playback_update', e => { const d = e.data; if (!d || d.playingURI !== spotifyTrack.uri) return; if (typeof d.duration === 'number' && d.duration > 0 && typeof d.position === 'number' && d.position >= d.duration) { clear(); requestBlocked = false; emit('ended'); } else if (d.isBuffering) { if (!requestBlocked) { if (!timeout) watch(); emit('buffering'); } } else if (typeof d.isPaused === 'boolean') { clear(); requestBlocked = false; emit(d.isPaused ? 'paused' : 'playing'); } });
  }); } catch { clear(); emit('error'); } }, () => { clear(); emit('error'); });
  return { play: () => request(true), pause: () => request(false), destroy() { if (disposed) return; disposed = true; clear(); observer.disconnect(); lease.release(); if (controller) { for (const [name, fn] of listeners) controller.removeListener?.(name, fn); controller.destroy(); } host.replaceChildren(); } };
}
