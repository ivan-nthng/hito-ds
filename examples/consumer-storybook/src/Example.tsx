import { useState } from 'react';
import { Button, Field, TextInput } from '@hito-ds/react';
export function Example({ actionLabel = 'Save' }: { actionLabel?: string }) {
  const [saved, setSaved] = useState(0);
  return <main><h1>Local components</h1><Field label="Synthetic name" controlId="synthetic-name">
    {({ controlProps }) => <TextInput {...controlProps} placeholder="Name" />}
  </Field><Button variant="primary" intent="accent" onClick={() => setSaved(value => value + 1)}>{actionLabel}</Button>
  <output aria-label="Saved count">{saved}</output></main>;
}
