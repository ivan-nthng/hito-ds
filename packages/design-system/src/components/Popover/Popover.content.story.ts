import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";

export function popoverCopy(profile: unknown) {
  const { lang } = getStoryContent(profile);
  const pt = lang === "pt-BR";
  const long = resolveStoryContentProfile(profile).endsWith("long");
  return {
    lang,
    open: pt ? "Editar detalhes" : "Edit details",
    title: pt ? long ? "Detalhes usados para identificar este exemplo" : "Detalhes do exemplo" : long ? "Details used to identify this example" : "Example details",
    description: pt ? "Atualize o nome usado neste exemplo. Você pode cancelar sem salvar." : "Update the name used in this example. You can cancel without saving.",
    field: pt ? "Nome" : "Name",
    initial: pt ? "Meu exemplo" : "My example",
    cancel: pt ? "Cancelar" : "Cancel",
    save: pt ? "Salvar" : "Save",
    close: pt ? "Fechar detalhes" : "Close details",
    saved: pt ? "Nome atualizado neste exemplo." : "Name updated in this example.",
    next: pt ? "Próxima ação" : "Next action",
    previous: pt ? "Ação anterior" : "Previous action",
    outside: pt ? "A página continua disponível enquanto o painel está aberto." : "The page stays available while the panel is open.",
    required: pt ? "Insira um nome." : "Enter a name.",
    paragraph: pt ? "Leia estas informações antes de editar. O conteúdo pode ser percorrido dentro do painel, sem bloquear a página ou impedir o acesso às outras ações." : "Read this information before editing. You can scroll through the panel without blocking the page or preventing access to its other actions.",
    more: pt ? "Mais informações" : "More information",
  };
}
