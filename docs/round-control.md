# RoundControl and RoundPlayButton

RoundControl is a native icon action with a circular shape. Supply a meaningful aria-label and an icon. It reuses Button variants/intents, sizes sm/md/lg/xl (28/36/44/56px; icons16/20/24/28px), disabled/loading behavior, keyboard focus and button ref. Minimum44px hit-area expansion is enabled; callers reserve unclipped, nonoverlapping space for small controls. The circle is independent of theme radius. RoundPlayButton keeps its xl/primary/accent defaults and playing prop.

Native button value is always forwarded unchanged, including form values while progress is present. Add known numerical progress with `progress={{ value, max, valueText, label }}`: finite value in [0,max], positive finite max (default100), and nonempty caller-localized valueText. Optional label names the separate native progress semantic; otherwise the action aria-label is reused. Do not override the button role with progressbar. A ring sits2px inside the edge with2px stroke; native focus stays outside. Fill inherits native button foreground; track inherits it at24% opacity. Value updates have no independent animation, including reduced motion. Omit progress until a real maximum exists. Progress is display-only, not a seek control.

```tsx
<RoundPlayButton aria-label="Play track"
  progress={{value:83, max:208, valueText:"1:23 of 3:28", label:"Playback progress"}} />
```

The caller owns real playback, formatting, updates and announcements. No provider integration belongs to the DS. Storybook: components-media-round-control--sizes-and-progress, --states, --playback. Component defaults live in tokens/component-round-control.mjs and are caller-overridable through the governed WEB tokens.

Legacy `width="content" | "full"` stays accepted and forwarded on RoundPlayButton only. Existing Button icon-only sizing takes precedence over full width, preserving its56px default circle in both modes. Generic RoundControl intentionally has no width prop; choose its token-owned size.
