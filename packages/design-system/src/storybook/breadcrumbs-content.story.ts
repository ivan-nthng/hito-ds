import { getStoryContent, resolveStoryContentProfile } from "./story-content";

/** Synthetic hierarchy only; product surfaces own the real navigation model. */
export function breadcrumbsCopy(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const pt = lang === "pt-BR";
  const long = resolved.endsWith("long");
  return {
    lang,
    navigation: pt ? "Caminho da página" : "Page location",
    overflow: pt ? "Mostrar níveis anteriores" : "Show earlier levels",
    close: pt ? "Fechar" : "Close",
    description: pt ? "Abra um nível anterior para explorar este exemplo de navegação." : "Open a parent level to explore this navigation example.",
    reset: pt ? "Restaurar caminho" : "Reset path",
    labels: pt
      ? long
        ? ["Espaços de trabalho compartilhados", "Projetos e referências da equipe", "Coleções de materiais do estúdio", "Identidade e comunicação visual", "Diretrizes e referências para a equipe de criação"]
        : ["Espaços", "Projetos", "Coleções", "Identidade", "Diretrizes"]
      : long
        ? ["Shared workspaces and resources", "Team projects and references", "Studio material collections", "Visual identity and communication", "Guidelines and references for the creative team"]
        : ["Workspaces", "Projects", "Collections", "Identity", "Guidelines"],
  };
}
