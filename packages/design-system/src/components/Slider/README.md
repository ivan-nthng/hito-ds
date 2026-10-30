# Slider movement

`mode` defaults to `"discrete"`: existing callers continue supplying a positive
numeric `step`. Pointer values snap to the nearest min-aligned step (ties upward);
both endpoints remain legal even when the maximum is not step-aligned.

Use `mode="continuous"` without `step` for direct movement. The native
`input[type=range]` uses `step="any"`; each native change is immediately rounded
to six decimal places and reported through the existing value-change callback.
There is no interpolation, debounce or delayed animation. Continuous endpoints
and supplied values must be representable to at most six decimal places and fit
the existing safe-integer arithmetic envelope. Out-of-envelope values throw.
The default continuous display prints six decimal places; `formatValue` and
`valueLabel` remain caller-owned presentation seams. Formatters should reserve a
consistent precision/unit representation across the range for stable wrapping.

Continuous Arrow keys advance 1% of the range, rounded to the reporting quantum
(minimum 0.000001); Page Up/Down advance ten such increments. Home/End select the
exact endpoints. RTL horizontal direction, controlled/uncontrolled ownership,
commit/cancel, read-only, disabled, accessible naming and value text retain the
same semantics in both modes. Reduced motion remains immediate.

Markers use numeric positions proportional to the native handle-center travel
span: from half a handle width to the rail width minus half a handle width.
Uniform numeric intervals therefore have uniform visual intervals; coincident
markers remain behind the opaque handle. Markers remain passive.

Examples: Storybook `forms-slider--movement-modes`, plus `--marker-alignment`
for every size and explicit nonuniform positions, and
`--states-and-responsive-content` for narrow localized wrapping.
