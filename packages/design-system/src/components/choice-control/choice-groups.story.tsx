import { useId } from "react";
import {
  FoundationStoryPage,
  FoundationSpecimenGrid,
} from "../../foundations/FoundationStoryLayout";
import { getStoryContent } from "../../storybook/story-content";
import { CheckboxGroup } from "../CheckboxGroup/CheckboxGroup";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import type {
  ChoiceGroupOption,
  ChoiceGroupProps,
  ChoiceGroupPresentation,
} from "./choice-group";

export const groupStoryOptions: ChoiceGroupOption[] = [
  {
    value: "confirmed",
    label: "Order confirmed",
    description: "A confirmation when the order is accepted.",
  },
  {
    value: "route",
    label: "Out for delivery",
    description: "An update when the driver starts the route.",
  },
  {
    value: "complete",
    label: "Delivery completed",
    description: "A confirmation after delivery is completed.",
  },
];
export const radioGroupStoryOptions: ChoiceGroupOption[] = [
  { value: "morning", label: "Morning", description: "09:00–12:00" },
  { value: "afternoon", label: "Afternoon", description: "12:00–16:00" },
  { value: "evening", label: "Evening", description: "16:00–20:00" },
];
export function GroupExamples({
  kind,
  profile,
}: {
  kind: "checkbox" | "radio";
  profile: unknown;
}) {
  const { lang } = getStoryContent(profile),
    pt = lang === "pt-BR",
    id = useId();
  const options: ChoiceGroupOption[] =
    kind === "radio"
      ? pt
        ? [
            {
              value: "morning",
              label: "Período da manhã",
              description: "Das 09:00 às 12:00",
            },
            {
              value: "afternoon",
              label: "Período da tarde",
              description: "Das 12:00 às 16:00",
            },
            {
              value: "evening",
              label: "Período da noite",
              description: "Das 16:00 às 20:00",
            },
          ]
        : radioGroupStoryOptions
      : pt
        ? [
            {
              value: "confirmed",
              label: "Confirmação de recebimento do pedido",
              description:
                "Receba uma confirmação assim que o pedido for aceito.",
            },
            {
              value: "route",
              label: "Saída do entregador para a rota de entrega",
              description:
                "Saiba quando o entregador iniciar o trajeto até o endereço informado.",
            },
            {
              value: "complete",
              label: "Confirmação de conclusão da entrega",
              description:
                "Receba uma confirmação quando a entrega tiver sido concluída.",
            },
          ]
        : groupStoryOptions;
  const render = (
    name: string,
    extra: Omit<
      ChoiceGroupProps,
      "name" | "options" | "appearance" | "cardSize"
    > &
      ChoiceGroupPresentation,
  ) =>
    kind === "checkbox" ? (
      <CheckboxGroup
        {...extra}
        name={name}
        options={options}
        defaultValue={extra.error ? [] : [options[0].value]}
      />
    ) : (
      <RadioGroup
        {...extra}
        name={name}
        options={options}
        defaultValue={extra.error ? undefined : options[0].value}
      />
    );
  const description = pt
    ? "Escolha as opções adequadas antes de continuar."
    : "Choose the appropriate options before continuing.";
  return (
    <FoundationStoryPage
      title={kind === "checkbox" ? "CheckboxGroup" : "RadioGroup"}
      description={
        pt
          ? "Grupos compostos com os controles existentes."
          : "Group naming, selection and validation using existing controls."
      }
    >
      <div lang={lang}>
        <FoundationSpecimenGrid minItemWidth="wide">
          {render(`${id}-inline`, {
            legend: pt ? "Sem contêiner" : "Inline",
            description,
          })}
          {render(`${id}-compact`, {
            legend: "Card · Compact / Small",
            appearance: "card",
            cardSize: "compact",
            controlSize: "sm",
            description,
          })}
          {render(`${id}-error`, {
            legend: "Card · Comfortable / Base",
            appearance: "card",
            cardSize: "comfortable",
            error: pt
              ? "Escolha uma opção antes de continuar."
              : "Choose an option before continuing.",
            description,
          })}
          {render(`${id}-disabled`, {
            legend: pt ? "Grupo desativado" : "Group disabled",
            appearance: "card",
            cardSize: "compact",
            disabled: true,
            description,
          })}
        </FoundationSpecimenGrid>
      </div>
    </FoundationStoryPage>
  );
}
