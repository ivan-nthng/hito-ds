import { getStoryContent, resolveStoryContentProfile } from "./story-content";

/** Synthetic content only; no application taxonomy or dietary promise. */
export function getTagChipContent(profile: unknown) {
  const resolved = resolveStoryContentProfile(profile);
  const { lang } = getStoryContent(resolved);
  const long = resolved.endsWith("long");
  const pt = lang === "pt-BR";
  return {
    lang, long,
    category: pt ? (long ? "Ingredientes frescos e da estação selecionados pela cozinha" : "Vegetariano") : (long ? "Fresh and seasonal ingredients selected by the kitchen" : "Vegetarian"),
    choice: pt ? (long ? "Refeições com proteína adicional preparadas para a semana" : "Mais proteína") : (long ? "Meals with extra protein prepared throughout the week" : "High protein"),
    values: pt ? (long ? ["São Paulo · região metropolitana", "Almoço entregue durante a tarde", "Uma seleção diferente a cada semana"] : ["São Paulo", "Almoço", "Semanal"]) : (long ? ["São Paulo · metropolitan area", "Lunch delivered during the afternoon", "A different selection for every week"] : ["São Paulo", "Lunch", "Weekly"]),
    remove: pt ? "Remover" : "Remove",
    removed: pt ? "Removido" : "Removed",
    add: pt ? "Adicionar valor" : "Add value",
    restored: pt ? "Valor adicionado" : "Value added",
    empty: pt ? "Nenhum valor selecionado." : "No values selected.",
    full: pt ? "Valores completos" : "Full values",
    group: pt ? "Valores selecionados" : "Selected values",
  };
}
