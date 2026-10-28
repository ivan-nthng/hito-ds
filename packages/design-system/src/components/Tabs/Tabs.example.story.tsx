import { useState } from "react";
import { Card } from "../Card/Card";
import { Field } from "../Field/Field";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Tabs, type TabsSize, type TabsAppearance } from "./Tabs";
import { tabsCopy } from "./Tabs.content.story";
import styles from "./Tabs.story.module.css";

export type TabsExampleProps = { size: TabsSize; appearance: TabsAppearance; icons: boolean; counts: boolean; profile: unknown };
export function TabsExample({ size, appearance, icons, counts, profile }: TabsExampleProps) {
  const copy = tabsCopy(profile);
  const [value, setValue] = useState<string | null>("overview");
  return <div lang={copy.lang} className={styles.example}>
    <Text as="h2" variant="heading-sm">{copy.title}</Text>
    <Tabs size={size} appearance={appearance} label={copy.tablist} value={value} onValueChange={setValue} items={[
      { id: "overview", label: copy.labels.overview, icon: icons ? "general/dashboard" : undefined, content: <Card><div className={styles.content}>
        <Text as="h3" variant="heading-sm">{copy.heading}</Text>
        <Text variant="body-sm" className={styles.secondary}>{copy.description}</Text>
        <Field label={copy.draftLabel} hint={copy.draftHint}>{({ controlProps }) => <TextInput {...controlProps} defaultValue={copy.draftValue} appearance="soft" size="md" />}</Field>
      </div></Card> },
      { id: "activity", label: copy.labels.activity, icon: icons ? "general/clock" : undefined, count: counts ? { display: new Intl.NumberFormat(copy.locale).format(1248), label: copy.countLabel(1248) } : undefined, content: <Card><div className={styles.content}>
        <Text as="h3" variant="heading-sm">{copy.activityHeading}</Text><Text variant="body-sm" className={styles.secondary}>{copy.activityBody}</Text>
      </div></Card> },
      { id: "files", label: copy.labels.files, icon: icons ? "general/assets" : undefined, count: counts ? { display: "0", label: copy.countLabel(0) } : undefined, content: <Card><div className={styles.content}>
        <Text as="h3" variant="heading-sm">{copy.filesHeading}</Text>
        <Text variant="body-sm" className={styles.secondary}>{copy.filesBody}</Text>
      </div></Card> },
      { id: "settings", label: copy.labels.settings, icon: icons ? "controls/settings" : undefined, disabled: true, content: null },
    ]} />
  </div>;
}
