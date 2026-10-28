export const storyContentProfiles = [
  "en-short",
  "en-long",
  "pt-short",
  "pt-long",
] as const;

export type StoryContentProfile = (typeof storyContentProfiles)[number];

type StoryLanguage = "en" | "pt-BR";
type StoryLocale = "en-US" | "pt-BR";

export type StoryContent = {
  editableValue: {
    autosizeDraftLong: string;
    cancelLabel: string;
    clearLabel: string;
    committedValue: string;
    draftValue: string;
    editLabel: string;
    emptyLabel: string;
    label: string;
    nameDraft: string;
    nameEditLabel: string;
    nameLabel: string;
    nameValue: string;
    nicknameEditLabel: string;
    nicknameLabel: string;
    outsideTarget: string;
    phoneLabel: string;
    saveLabel: string;
  };
  inlineEdit: {
    clearDescription: string;
    clearHeading: string;
    description: string;
    descriptionLabel: string;
    editDescription: string;
    editHeading: string;
    editOrder: string;
    heading: string;
    headingLabel: string;
    orderDraftLong: string;
    orderDraftMedium: string;
    orderDraftShort: string;
    orderLabel: string;
    orderValue: string;
    outsideTarget: string;
    saveDescription: string;
    saveHeading: string;
    validationMessage: string;
  };
  lang: StoryLanguage;
  locale: StoryLocale;
  rangeSlider: {
    label: string;
    beginningHandleLabel: string;
    endHandleLabel: string;
  };
  slider: {
    baselineLabel: string;
    disabledLabel: string;
    error: string;
    label: string;
    markerLabel: string;
    readOnlyLabel: string;
    resetLabel: string;
    unit: string;
  };
  textarea: {
    instructionsError: string;
    instructionsLabel: string;
    instructionsPlaceholder: string;
    localizedLongLabel: string;
    localizedLongValue: string;
  };
};

const storyContentByProfile = {
  "en-short": {
    rangeSlider: {
      label: "Duration interval",
      beginningHandleLabel: "Beginning",
      endHandleLabel: "End",
    },
    lang: "en",
    locale: "en-US",
    slider: {
      baselineLabel: "Usual",
      disabledLabel: "Unavailable duration",
      error: "Choose a supported duration.",
      label: "Preparation time",
      markerLabel: "Recommended break",
      readOnlyLabel: "Confirmed duration",
      resetLabel: "Reset to usual",
      unit: "min",
    },
    inlineEdit: {
      clearDescription: "Clear order description",
      clearHeading: "Clear title",
      description: "Confirm availability.\nDeliver tomorrow morning.",
      descriptionLabel: "Order description",
      editDescription: "Edit order description",
      editHeading: "Edit menu title",
      editOrder: "Edit order name",
      heading: "Menu",
      headingLabel: "Menu title",
      orderDraftLong: "er — a considerably longer editable value",
      orderDraftMedium: "er — growing value",
      orderDraftShort: "er",
      orderLabel: "Order name",
      orderValue: "Morning order",
      outsideTarget: "Outside target",
      saveDescription: "Save order description",
      saveHeading: "Save title",
      validationMessage: "Enter a complete order description.",
    },
    textarea: {
      instructionsError: "Describe how to find the entrance.",
      instructionsLabel: "Instructions",
      instructionsPlaceholder: "For example: blue gate beside the bakery",
      localizedLongLabel: "Localized delivery content",
      localizedLongValue: "Leave the order with reception if nobody answers.",
    },
    editableValue: {
      autosizeDraftLong: "er — a considerably longer editable value",
      cancelLabel: "Cancel",
      clearLabel: "Clear",
      committedValue: "Confirm for tomorrow morning",
      draftValue: "Confirm for tomorrow morning",
      editLabel: "Edit description",
      emptyLabel: "Add Phone",
      label: "Description",
      nameDraft: "Maria Silva",
      nameEditLabel: "Edit name",
      nameLabel: "Name",
      nameValue: "Ivan Petrov",
      nicknameEditLabel: "Edit nickname",
      nicknameLabel: "Nickname",
      outsideTarget: "Outside target",
      phoneLabel: "Phone",
      saveLabel: "Save",
    },
  },
  "en-long": {
    rangeSlider: {
      label: "Duration interval with a complete explanatory label",
      beginningHandleLabel: "Beginning of interval",
      endHandleLabel: "End of interval",
    },
    lang: "en",
    locale: "en-US",
    slider: {
      baselineLabel: "Usual preparation time",
      disabledLabel: "Unavailable preparation duration",
      error: "Choose a supported preparation duration for this delivery.",
      label: "Preparation duration for the complete delivery order",
      markerLabel: "Recommended operational break",
      readOnlyLabel: "Confirmed preparation duration",
      resetLabel: "Reset to the usual preparation time",
      unit: "minutes",
    },
    inlineEdit: {
      clearDescription: "Clear the complete delivery description",
      clearHeading: "Clear the seasonal menu title",
      description:
        "Confirm the complete order availability with the kitchen.\nDeliver tomorrow morning after reception confirms the entrance.",
      descriptionLabel: "Complete delivery description",
      editDescription: "Edit the complete delivery description",
      editHeading: "Edit the seasonal menu title",
      editOrder: "Edit the customer-facing order name",
      heading: "Seasonal breakfast menu",
      headingLabel: "Seasonal menu title",
      orderDraftLong:
        "er — a considerably longer editable order name for tomorrow morning",
      orderDraftMedium: "er — growing order name",
      orderDraftShort: "er",
      orderLabel: "Customer-facing order name",
      orderValue: "Morning order for the reception team",
      outsideTarget: "Move focus outside the editor",
      saveDescription: "Save the complete delivery description",
      saveHeading: "Save the seasonal menu title",
      validationMessage: "Enter a complete description for the delivery order.",
    },
    textarea: {
      instructionsError: "Describe precisely how the courier can find the entrance.",
      instructionsLabel: "Detailed delivery instructions",
      instructionsPlaceholder:
        "For example: use the blue gate beside the bakery and ask at reception",
      localizedLongLabel: "Complete localized delivery content",
      localizedLongValue:
        "Leave the complete order with reception if nobody answers the apartment intercom.",
    },
    editableValue: {
      autosizeDraftLong:
        "er — a considerably longer editable value for tomorrow morning",
      cancelLabel: "Cancel editing",
      clearLabel: "Clear the description",
      committedValue:
        "Confirm the complete delivery window with reception tomorrow morning",
      draftValue:
        "Confirm the complete delivery window with reception tomorrow morning",
      editLabel: "Edit the complete delivery description",
      emptyLabel: "Add a customer contact phone number",
      label: "Complete delivery description",
      nameDraft: "Maria da Silva Oliveira",
      nameEditLabel: "Edit the customer display name",
      nameLabel: "Customer display name",
      nameValue: "Ivan Petrov de Oliveira",
      nicknameEditLabel: "Edit the customer-facing nickname",
      nicknameLabel: "Customer-facing nickname",
      outsideTarget: "Move focus outside the editor",
      phoneLabel: "Customer contact phone number",
      saveLabel: "Save the description",
    },
  },
  "pt-short": {
    rangeSlider: {
      label: "Intervalo de duração",
      beginningHandleLabel: "Início",
      endHandleLabel: "Fim",
    },
    lang: "pt-BR",
    locale: "pt-BR",
    slider: {
      baselineLabel: "Habitual",
      disabledLabel: "Duração indisponível",
      error: "Escolha uma duração válida.",
      label: "Tempo de preparo",
      markerLabel: "Pausa recomendada",
      readOnlyLabel: "Duração confirmada",
      resetLabel: "Voltar ao habitual",
      unit: "min",
    },
    inlineEdit: {
      clearDescription: "Limpar descrição do pedido",
      clearHeading: "Limpar título",
      description: "Confirmar disponibilidade.\nEntregar amanhã de manhã.",
      descriptionLabel: "Descrição do pedido",
      editDescription: "Editar descrição do pedido",
      editHeading: "Editar título do menu",
      editOrder: "Editar nome do pedido",
      heading: "Menu",
      headingLabel: "Título do menu",
      orderDraftLong: "er — um nome de pedido consideravelmente mais longo",
      orderDraftMedium: "er — valor editável",
      orderDraftShort: "er",
      orderLabel: "Nome do pedido",
      orderValue: "Pedido da manhã",
      outsideTarget: "Área externa",
      saveDescription: "Salvar descrição do pedido",
      saveHeading: "Salvar título",
      validationMessage: "Informe uma descrição completa para o pedido.",
    },
    textarea: {
      instructionsError: "Descreva como encontrar a entrada.",
      instructionsLabel: "Instruções",
      instructionsPlaceholder: "Ex.: portão azul ao lado da padaria",
      localizedLongLabel: "Conteúdo localizado da entrega",
      localizedLongValue: "Deixe o pedido na recepção se ninguém atender.",
    },
    editableValue: {
      autosizeDraftLong: "er — um valor editável mais longo",
      cancelLabel: "Cancelar",
      clearLabel: "Limpar",
      committedValue: "Confirmar para amanhã cedo",
      draftValue: "Confirmar para amanhã cedo",
      editLabel: "Editar descrição",
      emptyLabel: "Adicionar telefone",
      label: "Descrição",
      nameDraft: "Maria Silva",
      nameEditLabel: "Editar nome",
      nameLabel: "Nome",
      nameValue: "Ivan Petrov",
      nicknameEditLabel: "Editar apelido",
      nicknameLabel: "Apelido",
      outsideTarget: "Área externa",
      phoneLabel: "Telefone",
      saveLabel: "Salvar",
    },
  },
  "pt-long": {
    rangeSlider: {
      label:
        "Intervalo de duração com descrição completa para leitura sem truncamento",
      beginningHandleLabel: "Início do intervalo",
      endHandleLabel: "Fim do intervalo",
    },
    lang: "pt-BR",
    locale: "pt-BR",
    slider: {
      baselineLabel: "Tempo habitual de preparo",
      disabledLabel: "Duração de preparo indisponível",
      error: "Escolha uma duração de preparo válida para esta entrega.",
      label: "Duração do preparo para o pedido completo da entrega",
      markerLabel: "Pausa operacional recomendada",
      readOnlyLabel: "Duração de preparo confirmada",
      resetLabel: "Voltar ao tempo habitual de preparo",
      unit: "minutos",
    },
    inlineEdit: {
      clearDescription: "Limpar a descrição completa da entrega",
      clearHeading: "Limpar o título do menu sazonal",
      description:
        "Confirmar com a cozinha a disponibilidade completa do pedido.\nEntregar amanhã de manhã após a recepção confirmar a entrada.",
      descriptionLabel: "Descrição completa da entrega",
      editDescription: "Editar a descrição completa da entrega",
      editHeading: "Editar o título do menu sazonal",
      editOrder: "Editar o nome do pedido exibido ao cliente",
      heading: "Menu sazonal de café da manhã",
      headingLabel: "Título do menu sazonal",
      orderDraftLong:
        "er — um nome de pedido consideravelmente mais longo para amanhã de manhã",
      orderDraftMedium: "er — nome editável",
      orderDraftShort: "er",
      orderLabel: "Nome do pedido exibido ao cliente",
      orderValue: "Pedido",
      outsideTarget: "Mover o foco para fora do editor",
      saveDescription: "Salvar a descrição completa da entrega",
      saveHeading: "Salvar o título do menu sazonal",
      validationMessage: "Informe uma descrição completa para o pedido de entrega.",
    },
    textarea: {
      instructionsError:
        "Descreva com precisão como a pessoa entregadora pode encontrar a entrada.",
      instructionsLabel: "Instruções detalhadas para a entrega",
      instructionsPlaceholder:
        "Ex.: use o portão azul ao lado da padaria e fale com a recepção",
      localizedLongLabel: "Conteúdo completo e localizado da entrega",
      localizedLongValue:
        "Deixe o pedido completo na recepção se ninguém atender ao interfone do apartamento.",
    },
    editableValue: {
      autosizeDraftLong: "er — valor editável bem longo",
      cancelLabel: "Cancelar edição",
      clearLabel: "Limpar a descrição",
      committedValue:
        "Confirmar amanhã de manhã toda a janela de entrega com a recepção",
      draftValue:
        "Confirmar amanhã de manhã toda a janela de entrega com a recepção",
      editLabel: "Editar a descrição completa da entrega",
      emptyLabel: "Adicionar telefone",
      label: "Descrição completa da entrega",
      nameDraft: "Maria da Silva Oliveira",
      nameEditLabel: "Editar o nome exibido para o cliente",
      nameLabel: "Nome exibido para o cliente",
      nameValue: "Ivan Petrov de Oliveira",
      nicknameEditLabel: "Editar o apelido exibido para o cliente",
      nicknameLabel: "Apelido exibido para o cliente",
      outsideTarget: "Mover o foco para fora do editor",
      phoneLabel: "Telefone de contato do cliente",
      saveLabel: "Salvar a descrição",
    },
  },
} as const satisfies Record<StoryContentProfile, StoryContent>;

export const defaultStoryContentProfile: StoryContentProfile = "en-short";

export function resolveStoryContentProfile(value: unknown): StoryContentProfile {
  return typeof value === "string" &&
    storyContentProfiles.includes(value as StoryContentProfile)
    ? (value as StoryContentProfile)
    : defaultStoryContentProfile;
}

export function getStoryContent(value: unknown): StoryContent {
  return storyContentByProfile[resolveStoryContentProfile(value)];
}
