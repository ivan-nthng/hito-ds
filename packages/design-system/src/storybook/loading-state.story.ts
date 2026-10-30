import { getStoryContent, resolveStoryContentProfile } from "./story-content";

/** Shared synthetic copy only; locale is a story context, not component state. */
export function getLoadingStateContent(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const long = resolved.endsWith("long");
  return lang === "en" ? {
    lang,
    loading: long ? "Loading the latest content. Your saved preferences will be preserved." : "Loading content…",
    save: long ? "Save all changes to the current workspace" : "Save changes",
    result: "Demo action performed",
    empty: { title: "No results yet", body: long ? "New items will appear here. Review the current filters or create your first item when you are ready to continue." : "New items will appear here.", action: "Create item" },
    error: { title: "Could not load content", body: long ? "Your filters and unsent changes are safe. Check your connection, then try loading this view again without repeating completed actions." : "Your changes are safe. Try loading this view again.", action: "Try again" },
    access: { title: "Access required", body: long ? "Ask a workspace administrator for the appropriate access before opening this content again." : "Ask an administrator for workspace access.", action: "Request access" },
  } : {
    lang,
    loading: long ? "Carregando o conteúdo mais recente. Suas preferências salvas serão preservadas." : "Carregando conteúdo…",
    save: long ? "Salvar todas as alterações no espaço de trabalho atual" : "Salvar alterações",
    result: "Ação de demonstração executada",
    empty: { title: "Ainda não há resultados", body: long ? "Os novos itens aparecerão aqui. Revise os filtros atuais ou crie o primeiro item quando estiver pronto para continuar." : "Os novos itens aparecerão aqui.", action: "Criar item" },
    error: { title: "Não foi possível carregar o conteúdo", body: long ? "Seus filtros e alterações não enviadas estão seguros. Verifique sua conexão e carregue esta visualização novamente sem repetir ações concluídas." : "Suas alterações estão seguras. Tente carregar novamente.", action: "Tentar novamente" },
    access: { title: "Acesso necessário", body: long ? "Peça a um administrador do espaço de trabalho o acesso apropriado antes de abrir este conteúdo novamente." : "Peça acesso ao espaço de trabalho para um administrador.", action: "Solicitar acesso" },
  };
}
