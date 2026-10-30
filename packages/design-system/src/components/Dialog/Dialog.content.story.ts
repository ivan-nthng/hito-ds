import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";

export function dialogCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const pt = lang === "pt-BR";
  const long = resolved.endsWith("long");
  return {
    lang,
    open: pt ? "Abrir diálogo" : "Open dialog",
    title: pt ? long ? "Editar o nome usado para identificar este exemplo" : "Editar detalhes" : long ? "Edit the name used to identify this example" : "Edit details",
    description: pt ? "Confira os detalhes antes de salvar as alterações." : "Review the details before saving your changes.",
    field: pt ? "Nome" : "Name",
    initial: pt ? "Rascunho de exemplo" : "Sample draft",
    cancel: pt ? "Cancelar" : "Cancel",
    save: pt ? "Salvar" : "Save",
    close: pt ? "Fechar diálogo" : "Close dialog",
    longTitle: pt ? "Antes de continuar" : "Before you continue",
    section: pt ? "Notas para revisão" : "Review notes",
    paragraphs: pt ? [
      "Leia as informações com calma. O conteúdo pode ocupar mais espaço quando há explicações, instruções ou textos mais longos.",
      "Cada seção mantém seu próprio título e parágrafo para facilitar a leitura. As informações importantes continuam disponíveis ao percorrer o conteúdo.",
      "Você pode voltar sem confirmar nenhuma alteração. A ação principal só acontece quando você escolhe continuar.",
      "Em uma tela menor, o conteúdo pode ser percorrido sem perder o acesso ao título e às ações no final do diálogo.",
      "Confira todos os detalhes necessários antes de continuar. Os nomes e exemplos desta página são fictícios.",
      "Ao terminar a revisão, escolha continuar. Para voltar à página anterior, use a ação de cancelar ou feche o diálogo.",
    ] : [
      "Take your time to review the information. Explanations, instructions and longer text can take up more room than a short message.",
      "Each section keeps its own heading and paragraph so the content is easy to scan. Important information remains available as you read through it.",
      "You can go back without confirming any changes. The primary action happens only when you choose to continue.",
      "On a smaller screen, you can scroll through the content while keeping the title and the actions at the end of the dialog within reach.",
      "Check the details you need before continuing. The names and examples on this page are fictional.",
      "When you finish reviewing, choose continue. To return to the previous page, use the cancel action or close the dialog.",
    ],
    continue: pt ? "Continuar" : "Continue",
    saved: pt ? "Alterações salvas." : "Changes saved.",
    cancelled: pt ? "Nenhuma alteração foi aplicada." : "No changes applied.",
    confirmed: pt ? "Revisão concluída." : "Review completed.",
    required: pt ? "Insira um nome." : "Enter a name.",
  };
}
