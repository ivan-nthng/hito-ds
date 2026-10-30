import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useId, useState, type CSSProperties } from "react";
import { generatePalette } from "../../tokens/generate-palette.mjs";
import { createPalettePreview, updatePalettePreview } from "../../tokens/palette-preview.mjs";
import { expect, userEvent } from "storybook/test";
import { Text } from "../components/Text/Text";
import { Surface } from "../components/Surface/Surface";
import { Button } from "../components/Button/Button";
import { Field } from "../components/Field/Field";
import { TextInput } from "../components/TextInput/TextInput";
import { Checkbox } from "../components/Checkbox/Checkbox";
import { Card, CardHeader } from "../components/Card/Card";
import styles from "./NeutralPilot.module.css";

function Pilot() {
  const errorId = useId();
  return <Surface className={styles.pilot}>
    <Text as="h1" variant="heading-lg">Workspace preferences</Text>
    <Text>One shared composition, with independent theme and color scheme.</Text>
    <Card size="comfortable" className={styles.stack}>
      <CardHeader title="Project details" />
      <Field label="Project name" hint="Visible to everyone in your workspace.">
        {({ controlProps }) => <TextInput {...controlProps} defaultValue="North studio" />}
      </Field>
      <Field label="Contact email" error="Enter a valid email address.">
        {({ controlProps }) => <TextInput {...controlProps} defaultValue="studio@" />}
      </Field>
      <Field label="Workspace ID" hint="Managed by your administrator.">
        {({ controlProps }) => <TextInput {...controlProps} disabled defaultValue="workspace-001" />}
      </Field>
      <Checkbox label="Send project updates" defaultChecked />
      <Checkbox label="Include archived projects" />
      <Checkbox label="Some projects selected" indeterminate />
      <Checkbox label="Managed preference" disabled defaultChecked />
      <div className={styles.row}>
        <Button variant="primary" intent="accent">Save changes</Button>
        <Button variant="secondary" intent="neutral">Cancel</Button>
        <Button variant="soft" intent="accent">Preview</Button>
        <Button variant="ghost" intent="neutral" disabled>Unavailable</Button>
      </div>
    </Card>
    <Card className={styles.stack}>
      <CardHeader title="Control sizes" />
      <div className={styles.row}>{(["sm", "md", "lg", "xl"] as const).map(size => <Button key={size} variant="primary" intent="accent" size={size}>{size.toUpperCase()}</Button>)}</div>
      <div className={styles.row}><Checkbox label="Small checkbox" size="sm" /><Checkbox label="Base checkbox" size="base" /></div>
      <div className={styles.row}>{(["primary", "secondary", "soft", "ghost"] as const).map(variant => <Button key={variant} variant={variant} intent="accent">{variant}</Button>)}</div>
      <div className={styles.row}><Button variant="primary" intent="accent" loading>Saving</Button><Button variant="primary" intent="accent" icon="general/check" aria-label="Confirm" /><Button variant="secondary" intent="neutral" leadingIcon="general/check">Apply</Button></div>
      {(["sm", "md", "lg", "xl"] as const).map(size => <Field key={size} label={`Empty ${size} field`} labelSize="sm" required hint="Required project value.">{({ controlProps }) => <TextInput {...controlProps} size={size} placeholder="Enter a value" />}</Field>)}
      <Field label="Read only value">{({ controlProps }) => <TextInput {...controlProps} readOnly defaultValue="Reference value" />}</Field>
      <Checkbox label="Unavailable selection" disabled />
      <Checkbox label="Unavailable partial selection" disabled indeterminate />
      <Checkbox label="Required confirmation" aria-invalid="true" aria-describedby={errorId} />
      <Text id={errorId} variant="body-sm" className={styles.error}>Confirm this preference to continue.</Text>
      <Text variant="body-sm" className={styles.secondary}>Secondary supporting text</Text>
      <Text variant="label-base" className={styles.muted}>Muted label</Text>
      <Text variant="ui-md">Interface text</Text>
      <Text variant="data-base">workspace-001 · explicit monospace data</Text>
      <Surface className={styles.raised}><Text>Raised surface</Text></Surface>
      <Surface className={styles.subtle}><Text>Contextual subtle surface</Text></Surface>
      <Surface className={styles.accent}><Text className={styles.onAccent}>Strong accent surface</Text></Surface>
      <Surface className={styles.accentSubtle}><Text>Subtle accent surface</Text></Surface>
      <Card size="compact" layout="fixed" elevation="raised"><CardHeader title="Compact raised card" /></Card>
    </Card>
  </Surface>;
}
const meta = { title: "Start here/Neutral pilot", component: Pilot, tags: ["test", "context-matrix"], parameters: { layout: "fullscreen" } } satisfies Meta<typeof Pilot>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SharedPilot: Story = {
  play: async ({ canvas }) => {
    const name = canvas.getByRole("textbox", { name: "Project name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Shared theme preview");
    await expect(name).toHaveValue("Shared theme preview");
    const updates = canvas.getByRole("checkbox", { name: "Send project updates" });
    await userEvent.click(updates);
    await expect(updates).not.toBeChecked();
    await expect(canvas.getByRole("textbox", { name: "Contact email" })).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  },
};
export const ThemeMatrix: Story = { render: () => <div className={styles.matrix}>{(["neutral", "inherited"] as const).flatMap(theme => (["light", "dark"] as const).map(scheme => <section key={`${theme}-${scheme}`} data-hito-theme={theme} data-hito-color-scheme={scheme} aria-label={`${theme} ${scheme}`}><Text as="h2" variant="heading-sm">{theme} · {scheme}</Text><Pilot /></section>))}</div> };

const standardPreview = createPalettePreview(generatePalette("#2563EB"));
function GeneratedPreview({ seed }: { seed: string }) {
  const [state, setState] = useState(() => ({ seed, ...updatePalettePreview(generatePalette(seed), standardPreview) }));
  useEffect(() => {
    setState(previous => previous.seed === seed ? previous :
      { seed, ...updatePalettePreview(generatePalette(seed), previous.preview) });
  }, [seed]);
  const preview = state.preview;
  if (!preview?.ok) return <Text role="alert">No valid standard preview.</Text>;
  return <>
    {state.error ? <Text role="alert">{state.error.code}: {state.error.message} Last valid preview retained.</Text> : null}
    <div className={styles.matrix}>{(["light", "dark"] as const).map(scheme => {
      const report = preview.schemes[scheme];
      return <section key={scheme} data-generated-preview={scheme} data-preview-seed={preview.seed}
        data-hito-theme="neutral" data-hito-color-scheme={scheme} style={report.styles as CSSProperties}
        aria-label={`${preview.seed} ${scheme}`}>
        <Text as="h2" variant="heading-sm">{preview.seed} · seed step {preview.anchorStep} · {scheme}</Text>
        <Text>Standard mapping · fill {report.fill.reference}: {report.fill.color} · foreground {report.foreground}</Text>
        <Text role="status">{report.verdict} · {report.validation.length} required pair checks · {preview.changedShades.length} changed shades · {report.changedRoles.length} changed roles</Text>
        <details><summary>Actual previous → next assignments and checks</summary>
          <pre>{JSON.stringify({ mapping: preview.mapping, shades: preview.shades, changedShades: preview.changedShades,
            changedRoles: report.changedRoles, validation: report.validation }, null, 2)}</pre>
        </details>
        <Pilot />
      </section>;
    })}</div>
  </>;
}
type PaletteStory = StoryObj<{ seed: string }>;
const generated = { render: (args: { seed: string }) => <GeneratedPreview {...args} />,
  argTypes: { seed: { control: "text" as const, description: "Opaque #RRGGBB; invalid/unsupported output retains the last valid preview." } },
};
export const GeneratedBlue: PaletteStory = { ...generated, args: { seed: "#2563EB" } };
export const GeneratedYellow: PaletteStory = { ...generated, args: { seed: "#FACC15" } };
export const GeneratedInk: PaletteStory = { ...generated, args: { seed: "#111827" } };
