import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useId } from "react";
import { expect, userEvent } from "storybook/test";
import { getStoryContent } from "../../storybook/story-content";
import { Field } from "../Field/Field";
import { TextInput } from "../TextInput/TextInput";
import { Fieldset } from "./Fieldset";
import { Radio } from "../Radio/Radio";
import styles from "./Fieldset.stories.module.css";

const copy = {
  en: {
    legend: "Contact information for the person receiving this delivery",
    metadata: "Required",
    description:
      "Provide the current contact information so the recipient can be reached when necessary.",
    error: "Complete the contact information before continuing.",
    name: "Full name",
    email: "Email address",
    options: [
      "First illustrative choice with a complete descriptive label",
      "Second illustrative choice with additional explanatory content",
    ],
  },
  "pt-BR": {
    legend:
      "Informações de contato da pessoa responsável por receber esta entrega",
    metadata: "Obrigatório",
    description:
      "Informe os dados de contato atuais para que seja possível falar com a pessoa responsável quando necessário.",
    error: "Preencha os dados de contato antes de continuar.",
    name: "Nome completo",
    email: "Endereço de e-mail",
    options: [
      "Primeira opção ilustrativa com uma descrição completa para leitura",
      "Segunda opção ilustrativa com informações adicionais para orientar a escolha",
    ],
  },
};
const meta = {
  id: "forms-fieldset",
  title: "Components/Forms/Fieldset",
  component: Fieldset,
  tags: ["test"],
  parameters: {
    controls: {
      include: [
        "appearance",
        "size",
        "legend",
        "metadata",
        "description",
        "error",
        "disabled",
      ],
    },
  },
  argTypes: {
    appearance: {
      control: "inline-radio",
      options: ["inline", "card"],
      description:
        "Inline has no container surface. Card adds a raised surface.",
    },
    size: {
      control: "inline-radio",
      options: ["compact", "comfortable"],
      if: { arg: "appearance", eq: "card" },
      description:
        "Card padding: responsive SM for compact, responsive LG for comfortable.",
    },
    legend: { control: "text", description: "Visible group heading." },
    metadata: {
      control: "text",
      description:
        "Optional short text next to the heading, e.g. Required. Does not enforce validation.",
    },
    description: { control: "text" },
    error: { control: "text" },
    disabled: { control: "boolean" },
    children: { control: false, table: { disable: true } },
  },
  args: {
    legend: "Contact information",
    appearance: "card",
    size: "compact",
    metadata: "",
    description: "",
    error: "",
    disabled: false,
    children: null,
  },
  render: ({ size, ...args }) => {
    const presentation =
      args.appearance === "card"
        ? { appearance: "card" as const, size }
        : { appearance: "inline" as const };
    // Controls are plain text; discard objects retained from older Storybook args.
    const text = (value: unknown) => (typeof value === "string" ? value : "");
    return (
      <main className={styles.page}>
        <Fieldset
          {...args}
          {...presentation}
          legend={text(args.legend)}
          metadata={text(args.metadata)}
          description={text(args.description)}
          error={text(args.error)}
        >
          {({ controlProps: groupProps }) => (
            <Field label="Full name">
              {({ controlProps }) => (
                <TextInput {...controlProps} {...groupProps} />
              )}
            </Field>
          )}
        </Fieldset>
      </main>
    );
  },
} satisfies Meta<typeof Fieldset>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {
  play: async ({ canvas, args }) => {
    const input = canvas.getByRole("textbox");
    if (args.disabled) {
      await expect(input).toBeDisabled();
      return;
    }
    await userEvent.click(input);
    await userEvent.type(input, "Maria");
    await expect(input).toHaveFocus();
    await expect(canvas.getByRole("group").tagName).toBe("FIELDSET");
  },
};

function Illustration({
  size = "compact",
  lang,
}: {
  size?: "compact" | "comfortable";
  lang: "en" | "pt-BR";
}) {
  const id = useId();
  return (
    <div className={styles.options} data-size={size}>
      {copy[lang].options.map((label, i) => (
        <Radio key={label} name={id} value={i} label={label} />
      ))}
    </div>
  );
}
export const AppearancesAndStates: Story = {
  tags: ["context-matrix"],
  parameters: { controls: { disable: true } },
  render: (_, { globals }) => {
    const { lang } = getStoryContent(globals.storyContentProfile);
    const text = copy[lang];
    const controls = <Illustration lang={lang} />;
    return (
      <main className={styles.page} lang={lang}>
        <Fieldset
          legend={text.legend}
          metadata={text.metadata}
          description={text.description}
        >
          {controls}
        </Fieldset>
        <Fieldset
          appearance="card"
          legend={text.legend}
          metadata={text.metadata}
          description={text.description}
        >
          {controls}
        </Fieldset>
        <Fieldset
          appearance="card"
          size="comfortable"
          legend={text.legend}
          metadata={text.metadata}
          description={text.description}
        >
          <Illustration lang={lang} size="comfortable" />
        </Fieldset>
        <div className={styles.narrow}>
          <Fieldset
            appearance="card"
            legend={text.legend}
            description={text.description}
            error={text.error}
          >
            {({ controlProps }) => (
              <TextInput aria-label={text.name} {...controlProps} />
            )}
          </Fieldset>
        </div>
        <Fieldset
          appearance="card"
          disabled
          legend={text.legend}
          description={text.description}
        >
          {controls}
        </Fieldset>
        <Fieldset legend={text.legend}>
          <Field label={text.email}>
            {({ controlProps }) => <TextInput {...controlProps} />}
          </Field>
        </Fieldset>
      </main>
    );
  },
  play: async ({ canvas }) => {
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth,
    );
    const groups = canvas.getAllByRole("group");
    for (const group of groups) {
      await expect(group.firstElementChild?.tagName).toBe("LEGEND");
      await expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth);
      const legend = group.querySelector("legend")!;
      const description = group.querySelector('p[id$="-description"]');
      if (description)
        await expect(legend.getBoundingClientRect().left).toBeCloseTo(
          description.getBoundingClientRect().left,
          1,
        );
      const css = getComputedStyle(group);
      await expect(css.borderTopWidth).toBe("0px");
      const expected =
        group.dataset.appearance === "inline"
          ? 0
          : parseFloat(
              css.getPropertyValue(
                group.dataset.size === "comfortable"
                  ? "--layout-space-responsive-lg"
                  : "--layout-space-responsive-sm",
              ),
            ) * parseFloat(getComputedStyle(document.documentElement).fontSize);
      await expect(parseFloat(css.paddingLeft)).toBe(expected);
    }
    await expect(groups[4].querySelector("input")).toBeDisabled();
    await expect(groups[3]).toHaveAttribute("aria-invalid", "true");
    await expect(getComputedStyle(groups[0]).boxShadow).toBe("none");
    const input = groups[3].querySelector("input")!;
    await userEvent.click(input);
    await expect(input).toHaveFocus();
  },
};
