# CompoundRangeField

A Field containing one RangeSlider and two NumberFields. The single ordered
`readonly [beginning, end]` pair is the accepted value. Supply exactly one of
`value` and `defaultValue`, plus caller-owned group and endpoint labels.

```tsx
<CompoundRangeField
  label="Duration interval"
  beginningLabel="Beginning"
  endLabel="End"
  min={0}
  max={100}
  step={5}
  value={interval}
  onValueChange={setInterval}
  locale="en-US"
  suffix="min"
  hint="Choose both endpoints."
  formatIssue={() => "Enter an ordered interval on the supported scale."}
/>
```

Slider interaction updates the pair immediately and synchronizes both numeric
editors. Numeric input remains a local draft until Enter or blur commits a valid
value. Empty, incomplete, invalid, out-of-range, off-grid and crossing drafts keep
the accepted pair unchanged. Escape restores the accepted value. Neither endpoint
sorts, pushes or crosses its peer; equality is legal. Arrow stepping uses the same
legal values as Slider and stops at the peer.

Discrete mode requires a positive step. The grid is min-aligned, with both global
endpoints legal even when max is off-grid. For min 0, max 1 and step 0.3, 1 is legal
and 0.95 is rejected. The private NumberField adapter shares Slider's legality and
stepping without changing standalone NumberField behavior. Continuous mode omits
step and retains Slider's six-decimal reporting precision. Numeric editor arrows
use that reporting quantum; the RangeSlider retains its own span-based keys.

`onValueChange(next, details)` reports accepted uncontrolled changes or proposals
for controlled parents; details identify the source, active handle and previous
pair. `onValueCommit` reports valid numeric commits or completed slider gestures.
Controlled parents own acceptance. Numeric focus and active drafts survive parent
renders. Slider cancellation restores the gesture's original pair through the
normal controlled callback.

One Field owns the visible group label, hint/error and shared description IDs.
Both slider handles and both numeric editors have separately qualified names.
`formatIssue` supplies caller-owned constraint copy; `onConstraintIssueChange`
reports constraint state. External `error` takes precedence over generated copy.
Read-only preserves focus without mutation; disabled removes editable focus stops.

Compact soft (secondary) numeric editors sit to the right of the slider on wide
layouts and wrap below it on narrow layouts. Shared grid rows at the existing md
layout boundary align each numeric frame with the visible rail at the same height,
with labels above, including wrapped labels. The duplicate current-pair header
is omitted; scale endpoints remain visible. Existing Field,
NumberField and RangeSlider sizes, focus treatment, tokens, forced colors and
motion preferences are reused. Applications own units, locale, validation copy,
persistence and business meaning. There is no implicit form serialization.
