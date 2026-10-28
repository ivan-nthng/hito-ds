import { getStoryContent, resolveStoryContentProfile } from "../../storybook/story-content";

/** Synthetic same-context sections; this is not a product navigation model. */
export function tabsCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang, locale } = getStoryContent(resolved);
  const long = resolved.endsWith("long");
  const pt = lang === "pt-BR";
  return {
    lang,
    locale,
    title: pt ? "Espaço de trabalho" : "Workspace",
    tablist: pt ? "Seções do espaço de trabalho" : "Workspace sections",
    labels: pt
      ? { overview: long ? "Visão geral e informações do espaço" : "Visão geral", activity: long ? "Atividade recente e atualizações" : "Atividade", files: long ? "Arquivos e materiais compartilhados" : "Arquivos", settings: long ? "Configurações do espaço de trabalho" : "Configurações" }
      : { overview: long ? "Workspace overview and information" : "Overview", activity: long ? "Recent activity and updates" : "Activity", files: long ? "Shared files and reference materials" : "Files", settings: long ? "Workspace settings and preferences" : "Settings" },
    heading: pt ? "Tudo sobre este espaço" : "Everything about this workspace",
    description: pt ? "Informações, atividade e arquivos reunidos em um só lugar." : "Information, activity and files, together in one place.",
    draftLabel: pt ? "Nome do espaço" : "Workspace name",
    draftValue: pt ? "Estúdio de criação" : "Design studio",
    draftHint: pt ? "Experimente editar o nome e trocar de seção. O texto permanece aqui." : "Try editing the name and switching sections. Your text stays here.",
    activityHeading: pt ? "Atividade recente" : "Recent activity",
    activityBody: pt ? "As referências do projeto foram atualizadas. As notas da equipe estão prontas para revisão." : "Project references were updated. Team notes are ready for review.",
    filesHeading: pt ? "Nenhum arquivo por enquanto" : "No files yet",
    filesBody: pt ? "Os materiais compartilhados deste espaço aparecerão aqui." : "Shared materials for this workspace will appear here.",
    empty: pt ? "Nenhuma seção disponível." : "No sections available.",
    countLabel: (count: number) => pt ? `${new Intl.NumberFormat(locale).format(count)} itens` : `${new Intl.NumberFormat(locale).format(count)} items`,
  };
}
