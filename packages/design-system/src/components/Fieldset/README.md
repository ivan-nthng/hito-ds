# Fieldset and Legend

Native grouping for related form controls. Fieldset always renders its Legend as
the first child; pass the legend's content, not another Legend, in `legend`.
Standalone Legend is also exported for the first child of a native fieldset.

```tsx
<Fieldset
  appearance="card"
  size="compact"
  legend="Contact information"
  metadata="Required"
  description="Use the recipient's current contact information."
  error={error}
>
  {({ controlProps }) => <TextInput aria-label="Full name" {...controlProps} />}
</Fieldset>
```

Inline is the default and has no surface, border, shadow or padding. Card defaults
to Compact; Comfortable is explicit. Size is rejected for Inline by TypeScript
and at runtime. Card padding consumes responsive SM for Compact and responsive LG for Comfortable.
The existing token breakpoints adapt padding; the selected size and radius remain unchanged.
Parents own available width, external spacing and child composition.

Description/error IDs are stable, deduplicated with caller `aria-describedby`,
and removed when their content disappears. Error content determines invalid state.
The optional render function exposes `controlProps` for child controls whose own
contract requires the group relationships. It does not replace individual control
labels or inject props into arbitrary descendants. Plain React children are also
accepted. Metadata is non-interactive text and contributes to the group name.

Native `disabled`, `form`, `name` and the fieldset ref are forwarded. Native disabled
semantics apply to descendants; the HTML first-legend exception is preserved, so
interactive content must not be placed in the Legend. There is no group read-only
simulation or group focus ring. Focus belongs to children.

The accepted specification is docs/design-system/fieldset-legend-spec.md. Styles
consume complete semantic typography, surface, elevation, spacing and radius roles.
Fieldset uses its token-backed ordinary radius. Child components retain their own visual contracts.
Stories consume the accepted Radio
primitive from the choice-controls specification. Fieldset adds no child radius overrides,
selection state, persistence or form submission logic.
