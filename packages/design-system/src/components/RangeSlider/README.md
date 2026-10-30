# RangeSlider

One horizontal ordered `readonly [beginning, end]` pair on a shared rail. Required
`label`, `beginningHandleLabel` and `endHandleLabel` provide a labelled group and
separately named native inputs. Use exactly one of `value` and `defaultValue`.

```tsx
<RangeSlider
  label="Duration"
  beginningHandleLabel="Beginning"
  endHandleLabel="End"
  min={0}
  max={100}
  step={5}
  value={interval}
  onValueChange={setInterval}
  formatValue={(value) => `${value} min`}
  formatRange={([beginning, end]) => `${beginning}–${end} min`}
/>
```

Discrete is the default and requires a positive `step`; quantization is min-aligned,
ties round up, and both global endpoints remain legal. `mode="continuous"` omits
step and shares Slider's six-decimal precision, finite range and safe arithmetic
envelope. Continuous arrows move 1% of the span rounded to the reporting quantum;
Page keys move ten increments. All movement is immediate.

Beginning clamps at End; End clamps at Beginning. Equality is legal, with zero fill
width and overlapping handles. Inputs never swap or reorder. Home/End select the
active handle's dynamic lower/upper bound. Horizontal arrows mirror in RTL; vertical
arrows and Page keys retain numeric meaning. The visible pair retains semantic
Beginning–End order even when its physical track mirrors.

Pointer presses choose the nearest handle. Ties retain the most recent active handle;
without history, equal-value presses below/above choose Beginning/End, and exact ties
choose End except at global maximum. The selected native input owns capture until
pointerup/cancel. Cancellation restores the gesture's original pair and emits one
`pointerCancel`, including when the pair did not move. It does not commit.
`onValueChange(next, { previousValue, activeHandle, reason })` reports the preceding
accepted pair; `onValueCommit` reports the gesture's original pair and keyboard/pointer
reason once at completion (keyboard release or blur, pointer release). A controlled
parent owns acceptance and must apply updates, including cancellation rollback.

Both native inputs use the global physical scale and `step="any"`; ARIA exposes each
handle's peer-constrained min/max. All mutation paths normalize and clamp before a
callback. Read-only blocks mutation but preserves both focus stops; disabled removes
them. `aria-describedby` and `aria-invalid` apply to both inputs. The output is associated
with both inputs and is not live. A `RangeSliderRef` exposes `focus("beginning" | "end")`,
defaulting to Beginning. There is no implicit form serialization or generic input-prop
spread.

`formatValue` formats handles, endpoints and markers; `formatRange` formats the header.
The default range uses an en dash and no unit. Complete text wraps in independent
header/endpoint halves. Hidden representative endpoint-pair samples reserve geometry;
arbitrarily longer interior formatter output may require more parent space. Markers and
baseline reuse Slider shapes and remain passive. Sizes, visual states, forced colors,
focus and geometry share Slider's existing recipes; only two-position geometry and
interaction are RangeSlider-specific. Applications own units, locale, validation and
persistence. No crossing, pushing, minimum distance, per-handle bounds, vertical/logarithmic
scales, color/render slots, CompoundRangeField or business behavior is included.
