import { Field } from "../Field/Field";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";
import { Disclosure, type DisclosureProps } from "./Disclosure";

export type DisclosureStoryArgs = { open: boolean; disabled: boolean; content: "text" | "form"; variant: NonNullable<DisclosureProps["variant"]> };

export function disclosureCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const pt = lang === "pt-BR";
  const long = resolved.endsWith("long");
  return {
    lang,
    title: pt ? (long ? "Informações adicionais e observações para compartilhar com a equipe" : "Informações adicionais") : (long ? "Additional details and notes to share with your team" : "Additional details"),
    body: pt ? "Inclua o contexto que pode ajudar sua equipe. Você pode fechar esta seção e voltar quando precisar; as informações permanecem disponíveis." : "Include context that may help your team. You can close this section and return when you need it; the information stays available.",
    label: pt ? "Observação" : "Note",
    draft: pt ? "Compartilhar as referências com a equipe." : "Share the references with the team.",
    hint: pt ? "O texto permanece aqui quando a seção é fechada." : "Your text stays here when the section is closed.",
  };
}

export function DisclosureExample({ open, disabled, content, variant, profile, onOpenChange }: DisclosureStoryArgs & { profile: unknown; onOpenChange: (open: boolean) => void }) {
  const copy = disclosureCopy(profile);
  return <div lang={copy.lang}>
    <Disclosure title={copy.title} variant={variant} open={open} onOpenChange={onOpenChange} disabled={disabled}>
      {content === "form" ? <Field label={copy.label} hint={copy.hint}>{({ controlProps }) => <TextInput {...controlProps} defaultValue={copy.draft} size="md" appearance="soft" />}</Field> : <Text variant="body-sm">{copy.body}</Text>}
    </Disclosure>
  </div>;
}
