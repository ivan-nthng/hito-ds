import { useId, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { Field } from "../Field/Field";
import { InlineMessage } from "../InlineMessage/InlineMessage";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { getStoryContent } from "../../storybook/story-content";
import { BottomSheet, type BottomSheetDismissReason, type BottomSheetProps } from "./BottomSheet";
import styles from "./BottomSheet.story.module.css";

export function bottomSheetCopy(profile: unknown) {
  const { lang } = getStoryContent(profile); const pt = lang === "pt-BR";
  return {
    lang, open: pt ? "Abrir painel" : "Open bottom sheet", title: pt ? "Editar os detalhes deste exemplo" : "Edit details",
    description: pt ? "Confira as informações antes de salvar as alterações." : "Review the details before saving your changes.",
    close: pt ? "Fechar painel" : "Close bottom sheet", name: pt ? "Nome" : "Name", initial: pt ? "Rascunho de exemplo" : "Sample draft",
    cancel: pt ? "Cancelar" : "Cancel", save: pt ? "Salvar alterações" : "Save changes", saved: pt ? "Alterações salvas." : "Changes saved.",
    required: pt ? "Insira um nome." : "Enter a name.", next: pt ? "Próxima etapa" : "Next step",
    guard: pt ? "Há alterações não salvas. Continue editando ou descarte as alterações para fechar." : "You have unsaved changes. Keep editing or discard the changes to close.",
    keep: pt ? "Continuar editando" : "Keep editing", discard: pt ? "Descartar as alterações não salvas" : "Discard unsaved changes",
    readTitle: pt ? "Revise as informações antes de continuar" : "Review before continuing",
    paragraph: pt ? "As informações importantes continuam disponíveis enquanto você percorre o conteúdo. O título e as ações permanecem ao alcance. Este exemplo não altera nenhum dado real." : "Important information remains available as you scroll through the content. The title and actions stay within reach. This example does not change any real data.",
    section: pt ? "Informações para revisão" : "Review notes", continue: pt ? "Concluir a revisão das informações" : "Finish reviewing the information",
  };
}
export type BottomSheetStoryArgs = { scenario: "form" | "long-content" | "dirty-guard"; dismissOnBackdrop: boolean } & Pick<BottomSheetProps, "headerVariant">;
export function BottomSheetExample({ scenario, dismissOnBackdrop, headerVariant, profile, noFooter = false, deepFocus = false, removeOpener = false, recordRequests = false }: BottomSheetStoryArgs & { profile: unknown; noFooter?: boolean; deepFocus?: boolean; removeOpener?: boolean; recordRequests?: boolean }) {
  const copy = bottomSheetCopy(profile); const fieldId = useId(); const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null); const nextRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false); const [removed, setRemoved] = useState(false);
  const [value, setValue] = useState(copy.initial); const [draft, setDraft] = useState(copy.initial);
  const [guard, setGuard] = useState(false); const [error, setError] = useState(false); const [result, setResult] = useState("");
  const [requests, setRequests] = useState<string[]>([]);
  const long = scenario === "long-content";
  const dismiss = (reason: BottomSheetDismissReason | "cancel") => {
    setRequests(previous => [...previous, reason]);
    if (scenario === "dirty-guard" && draft !== value) { setGuard(true); return; }
    setOpen(false);
  };
  const save = () => { setValue(draft); setResult(copy.saved); setOpen(false); if (removeOpener) setRemoved(true); };
  return <div className={styles.example} lang={copy.lang}>
    {!removed ? <Button variant="primary" intent="accent" size="md" aria-haspopup="dialog" onClick={() => { setDraft(value); setGuard(false); setError(false); setOpen(true); }}>{copy.open}</Button> : null}
    <Text variant="body-sm" role="status">{result}</Text>
    <Button ref={nextRef} variant="ghost" intent="neutral" size="md">{copy.next}</Button>
    {recordRequests ? <output aria-label="Dismissal requests">{requests.join(",")}</output> : null}
    <BottomSheet open={open} title={long ? copy.readTitle : copy.title} description={long ? undefined : copy.description} closeLabel={copy.close}
      headerVariant={headerVariant}
      onDismiss={dismiss} dismissOnBackdrop={dismissOnBackdrop} initialFocus={long && !deepFocus ? "title" : deepFocus ? inputRef : undefined} returnFocusRef={removeOpener ? nextRef : undefined}
      footer={noFooter ? undefined : guard ? <>
        <Button variant="ghost" intent="neutral" size="md" onClick={() => { setGuard(false); inputRef.current?.focus(); }}>{copy.keep}</Button>
        <Button variant="primary" intent="destructive" size="md" onClick={() => { setDraft(value); setGuard(false); setOpen(false); }}>{copy.discard}</Button>
      </> : <>
        <Button variant="ghost" intent="neutral" size="md" onClick={() => dismiss("cancel")}>{copy.cancel}</Button>
        <Button variant="primary" intent="accent" size="md" type={long ? "button" : "submit"} form={long ? undefined : formId} onClick={long ? save : undefined}>{long ? copy.continue : copy.save}</Button>
      </>}>
      {long ? <div className={styles.sections}>
        {Array.from({ length: 12 }, (_, index) => <section className={styles.section} key={index}>
          <Text as="h3" variant="label-base">{copy.section} {index + 1}</Text><Text variant="body-sm">{copy.paragraph}</Text>
        </section>)}
        {deepFocus ? <Field label={copy.name} controlId={fieldId}>{({ controlProps }) => <TextInput {...controlProps} ref={inputRef} size="md" />}</Field> : null}
      </div> : <form id={formId} className={styles.section} noValidate onSubmit={event => {
        event.preventDefault();
        if (!draft.trim()) { setError(true); inputRef.current?.focus(); return; }
        save();
      }}>
        <Field label={copy.name} controlId={fieldId} error={error ? copy.required : undefined}>{({ controlProps }) =>
          <TextInput {...controlProps} ref={inputRef} size="md" value={draft} onChange={event => { setDraft(event.target.value); setError(false); }} />}
        </Field>
        {guard ? <InlineMessage intent="warning" body={copy.guard} announcement="polite" /> : null}
      </form>}
    </BottomSheet>
  </div>;
}
