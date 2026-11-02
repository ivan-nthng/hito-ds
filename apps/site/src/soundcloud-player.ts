export const trackUrl = "https://soundcloud.com/vanya-nichego/you-think-youre-stuck";
export const playerUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(trackUrl)}&auto_play=false&buying=false&sharing=false&download=false&show_artwork=false&show_user=false&show_playcount=false`;
export type SoundCloudEvent = { currentPosition?: number };
export interface SoundCloudWidget {
  bind(event: string, handler: (event?: SoundCloudEvent) => void): void;
  unbind(event: string): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  play(): void;
  pause(): void;
  seekTo(position: number): void;
}
type WidgetFactory = ((frame: HTMLIFrameElement) => SoundCloudWidget) & { Events: Record<string, string> };
declare global { interface Window { SC?: { Widget: WidgetFactory }; } }
let loading: Promise<WidgetFactory> | undefined;
export function loadSoundCloud(): Promise<WidgetFactory> {
  if (window.SC?.Widget) return Promise.resolve(window.SC.Widget);
  return loading ??= new Promise<WidgetFactory>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://w.soundcloud.com/player/api.js";
    script.async = true;
    script.onload = () => window.SC?.Widget ? resolve(window.SC.Widget) : reject(new Error("SoundCloud API unavailable"));
    script.onerror = () => reject(new Error("SoundCloud API unavailable"));
    document.head.append(script);
  }).catch(error => { loading = undefined; throw error; });
}
