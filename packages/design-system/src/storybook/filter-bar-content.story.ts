import { getStoryContent, resolveStoryContentProfile } from "./story-content";

export type FilterField = "name" | "owner" | "status";
export type FilterColumn = FilterField | "updated";
export type SortRule = { column: FilterColumn; direction: "ascending" | "descending" };
export type TextRule = { operator: "contains" | "notContains" | "equals" | "empty" | "notEmpty"; value: string };
export type Filters = { name: TextRule | null; owner: string[]; status: string };
export const columns = ["name", "owner", "status", "updated"] as const;
export const fields = ["name", "owner", "status"] as const;
export const owners = [{ id: "marina", name: "Marina Costa", initials: "MC" }, { id: "alex", name: "Alex Silva", initials: "AS" }, { id: "joao", name: "João Santos", initials: "JS" }];
export const statuses = ["ready", "review", "draft"] as const;
export const icons = { name: "general/assets", owner: "general/user-filled", status: "general/status-dashed-circle", updated: "general/calendar" } as const;
export function filterBarCopy(profile: unknown) {
  const { lang, locale } = getStoryContent(profile);
  const pt = lang !== "en";
  const long = resolveStoryContentProfile(profile).endsWith("long");
  return {
    lang, locale, title: pt ? long ? "Projetos e materiais da equipe de criação" : "Projetos" : long ? "Projects and materials for the creative team" : "Projects",
    name: pt ? "Nome" : "Name", owner: pt ? "Responsável" : "Owner", status: "Status", updated: pt ? "Atualizado" : "Updated",
    filters: pt ? "Filtros" : "Filters", sort: pt ? "Ordenação" : "Sorting", search: pt ? "Pesquisar projetos" : "Search projects",
    moreActions: pt ? "Mais ações" : "More actions",
    select: pt ? "Selecionar" : "Select", selectVisible: pt ? "Selecionar projetos visíveis" : "Select visible projects",
    selected: pt ? "selecionados" : "selected",
    exportAction: pt ? "Exportar…" : "Export…", shareAction: pt ? "Compartilhar…" : "Share…",
    exportDemoOnly: pt ? "Demonstração: exportação indisponível neste exemplo." : "Demo only: export is unavailable in this example.",
    shareDemoOnly: pt ? "Demonstração: compartilhamento indisponível neste exemplo." : "Demo only: sharing is unavailable in this example.",
    closeSearch: pt ? "Recolher pesquisa" : "Collapse search", clearSearch: pt ? "Limpar pesquisa" : "Clear search",
    close: pt ? "Fechar" : "Close", back: pt ? "Voltar" : "Back", findFilter: pt ? "Buscar filtro" : "Find a filter",
    findValue: pt ? "Buscar valor" : "Find a value", clear: pt ? "Limpar filtro" : "Clear filter", clearAll: pt ? "Limpar filtros" : "Clear filters",
    clearSort: pt ? "Remover ordenação" : "Clear sorting", filterColumn: pt ? "Filtrar esta coluna" : "Filter this column",
    ascending: pt ? "Ordem crescente" : "Sort ascending", descending: pt ? "Ordem decrescente" : "Sort descending",
    add: pt ? "Adicionar" : "Add", noMatches: pt ? "Nenhum resultado" : "No matches", results: pt ? "Projetos encontrados" : "Matching projects",
    empty: pt ? "Nenhum registro encontrado. Ajuste a pesquisa ou os filtros." : "No records match. Adjust your search or filters.",
    columnMenu: pt ? "Opções da coluna" : "Column options",
    statusLabels: pt ? { ready: "Pronto", review: "Em análise", draft: "Rascunho" } : { ready: "Ready", review: "In review", draft: "Draft" },
    addFilter: pt ? "Adicionar filtro" : "Add filter", addSort: pt ? "Adicionar ordenação" : "Add sorting",
    matchAll: pt ? "Todas as condições" : "Match all", apply: pt ? "Aplicar" : "Apply", cancel: pt ? "Cancelar" : "Cancel",
    operator: pt ? "Condição" : "Condition", value: pt ? "Valor" : "Value", anyOf: pt ? "Qualquer responsável selecionado" : "Any selected owner",
    contains: pt ? "contém" : "contains", notContains: pt ? "não contém" : "does not contain", equals: pt ? "é igual a" : "equals", emptyOperator: pt ? "está vazio" : "is empty", notEmpty: pt ? "não está vazio" : "is not empty",
    enterValue: pt ? "Digite um valor…" : "Enter a value…",
    moveUp: pt ? "Subir prioridade" : "Move up", moveDown: pt ? "Descer prioridade" : "Move down", remove: pt ? "Remover" : "Remove", direction: pt ? "Direção" : "Direction",
    priority: pt ? "Prioridade" : "Priority",
    names: pt ? long ? ["Materiais e referências para o novo estúdio de criação", "Catálogo sazonal de produtos e apresentações da equipe", "Planejamento semanal de atividades e responsabilidades", "Fotografias e descrições do próximo catálogo"] : ["Materiais do estúdio", "Catálogo sazonal", "Planejamento semanal", "Fotografias do catálogo"] : long ? ["Materials and references for the new creative studio", "Seasonal product catalogue and team presentations", "Weekly planning for activities and responsibilities", "Photography and descriptions for the next catalogue"] : ["Studio materials", "Seasonal catalogue", "Weekly planning", "Catalogue photography"],
  };
}
export type FilterBarCopy = ReturnType<typeof filterBarCopy>;
export function filterSummary(field: FilterField, filters: Filters, copy: FilterBarCopy) {
  if (field === "status") return filters.status ? copy.statusLabels[filters.status as keyof typeof copy.statusLabels] : "";
  if (field === "owner") return filters.owner.map(id => owners.find(owner => owner.id === id)?.name ?? id).join(", ");
  const rule = filters.name;
  if (!rule) return "";
  const operator = rule.operator === "empty" ? copy.emptyOperator : copy[rule.operator];
  return [operator, rule.value].filter(Boolean).join(" ");
}
