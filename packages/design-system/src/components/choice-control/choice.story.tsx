import { useId } from "react";
import {
  FoundationStoryPage,
  FoundationSpecimenGrid,
} from "../../foundations/FoundationStoryLayout";
import { getStoryContent } from "../../storybook/story-content";
import { Fieldset } from "../Fieldset/Fieldset";
import { Checkbox } from "../Checkbox/Checkbox";
import { Radio } from "../Radio/Radio";
import { Switch } from "../Switch/Switch";
import { choiceControlSizes } from "./ChoiceControl";

export function ChoiceStates({
  kind,
  profile,
}: {
  kind: "Checkbox" | "Radio" | "Switch";
  profile: unknown;
}) {
  const id = useId();
  const { lang } = getStoryContent(profile);
  const pt = lang === "pt-BR";
  const Component =
    kind === "Checkbox" ? Checkbox : kind === "Radio" ? Radio : Switch;
  const label = pt
    ? "Receber atualizações sobre as entregas programadas para esta semana"
    : "Receive updates about deliveries scheduled for this week";
  const description = pt
    ? "As informações ajudam a organizar a preparação e a entrega de cada pedido."
    : "Updates help coordinate preparation and delivery of each order.";
  return (
    <FoundationStoryPage
      title={kind}
      description={
        pt
          ? "Tamanhos, estados e interação nativa."
          : "Sizes, states and native interaction."
      }
    >
      <div lang={lang}>
        <FoundationSpecimenGrid minItemWidth="wide">
          {choiceControlSizes.map((size) => (
            <Fieldset
              key={size}
              legend={size === "base" ? "Base" : "Small"}
              appearance="card"
              size="compact"
            >
              <Component
                size={size}
                name={`${id}-${size}`}
                label={label}
                description={description}
              />
              <Component
                size={size}
                name={`${id}-${size}`}
                label={pt ? "Selecionado" : "Selected"}
                defaultChecked
              />
              {kind === "Checkbox" ? (
                <Checkbox
                  size={size}
                  label={pt ? "Seleção parcial" : "Mixed selection"}
                  indeterminate
                />
              ) : null}
              <Component
                size={size}
                name={`${id}-${size}-disabled`}
                label={pt ? "Bloqueado pela política" : "Locked by policy"}
                defaultChecked
                disabled
              />
              <Component
                size={size}
                name={`${id}-${size}-unavailable`}
                label={pt ? "Indisponível" : "Unavailable"}
                disabled
              />
            </Fieldset>
          ))}
          {kind !== "Switch" ? (
            <Fieldset
              legend={pt ? "Validação" : "Validation"}
              appearance="card"
              size="comfortable"
              error={
                pt
                  ? "Confirme a seleção antes de continuar."
                  : "Confirm the selection before continuing."
              }
            >
              {({ controlProps }) => (
                <Component
                  {...controlProps}
                  name={`${id}-error`}
                  label={label}
                />
              )}
            </Fieldset>
          ) : null}
        </FoundationSpecimenGrid>
      </div>
    </FoundationStoryPage>
  );
}
