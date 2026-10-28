import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";

export function alertDialogCopy(profile: unknown) {
  const { lang } = getStoryContent(profile);
  const pt = lang === "pt-BR";
  const long = resolveStoryContentProfile(profile).endsWith("long");
  return {
    lang,
    open: pt ? "Abrir confirmação" : "Open confirmation",
    title: pt ? long ? "Descartar todas as alterações deste rascunho?" : "Descartar rascunho?" : long ? "Discard all changes in this draft?" : "Discard draft?",
    description: pt ? "O texto que ainda não foi salvo será descartado. Você pode cancelar para manter suas alterações." : "Your unsaved text will be discarded. You can cancel to preserve your changes.",
    cancel: pt ? "Cancelar" : "Cancel",
    confirm: pt ? "Descartar" : "Discard",
    cancelled: pt ? "Rascunho mantido." : "Draft kept.",
    confirmed: pt ? "Rascunho descartado." : "Draft discarded.",
    pending: pt ? "Processando esta confirmação de exemplo…" : "Processing this example confirmation…",
    error: pt ? "Não foi possível concluir este exemplo. Cancele e abra a confirmação novamente para tentar outra vez." : "This example could not finish. Cancel and reopen the confirmation to try again.",
    policy: pt ? "Nesta demonstração de erro, a tentativa falha após um segundo. Cancele e abra novamente para repetir." : "In this error demonstration the attempt fails after one second. Cancel and reopen to try again.",
    section: pt ? "Detalhes da decisão" : "Decision details",
    paragraph: pt ? "Estas informações adicionais pertencem à aplicação. Confira o contexto antes de confirmar; cancelar preserva o rascunho e volta ao ponto de partida." : "This supporting information belongs to the application. Review the context before confirming; cancelling preserves the draft and returns to the starting point.",
  };
}
