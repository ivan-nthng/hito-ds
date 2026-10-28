import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { Field } from "../Field/Field";
import { Text } from "../Text/Text";
import {
  SearchField,
  type SearchFieldAppearance,
  type SearchFieldSize,
  type SearchFieldValidationState,
} from "./SearchField";
import searchFieldStyles from "./SearchField.module.css";
import styles from "./SearchField.stories.module.css";

const appearances: SearchFieldAppearance[] = ["outlined", "soft", "ghost"];
const sizes: SearchFieldSize[] = ["sm", "md", "lg", "xl"];
const validationStates: SearchFieldValidationState[] = [
  "none",
  "invalid",
  "success",
];

function collectStyleSelectors(rules: CSSRuleList): string[] {
  return Array.from(rules).flatMap((rule) => {
    if (rule instanceof CSSStyleRule) return [rule.selectorText];
    if ("cssRules" in rule)
      return collectStyleSelectors((rule as CSSGroupingRule).cssRules);
    return [];
  });
}

const meta = {
  id: "forms-search-field",
  title: "Components/Forms/SearchField",
  component: SearchField,
  tags: ["test"],
  args: {
    appearance: "outlined",
    clearLabel: "Clear search",
    defaultValue: "Morning orders",
    disabled: false,
    loading: false,
    placeholder: "Search orders",
    size: "md",
    validationState: "none",
  },
  parameters: {
    controls: {
      include: [
        "width",
        "appearance",
        "defaultValue",
        "disabled",
        "loading",
        "placeholder",
        "size",
        "validationState",
      ],
    },
  },
  argTypes: {
    width: { control: "inline-radio", options: ["hug", "fill"] },
    appearance: { control: "inline-radio", options: appearances },
    defaultValue: { control: "text" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    placeholder: { control: "text" },
    size: { control: "inline-radio", options: sizes },
    validationState: {
      control: "inline-radio",
      options: validationStates,
    },
  },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    figma: {
      label: "SearchField in Figma",
      url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8388-129",
    },
  },
  render: (args) => (
    <main className={styles.page}>
      <div className={styles.measure}>
        <SearchField
          {...args}
          aria-label="Search playground"
          key={String(args.defaultValue)}
        />
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Search playground" });
    await expect(input).toHaveAttribute("type", "search");
    await expect(input.parentElement).toHaveAttribute(
      "data-appearance",
      "outlined",
    );
  },
};

export const StatesAndComposition: Story = {
  name: "States & composition",
  render: (args) => (
    <main className={styles.page}>
      <header className={styles.stack}>
        <Text as="h1" variant="heading-lg">
          SearchField
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Native search entry; applications own queries and results.
        </Text>
      </header>
      <section className={styles.grid}>
        <Field hint="Search by customer or order." label="Orders">
          {({ controlProps }) => (
            <SearchField
              {...args}
              {...controlProps}
              key={String(args.defaultValue)}
            />
          )}
        </Field>
        <Field error="Use at least two characters." label="Invalid search">
          {({ controlProps }) => (
            <SearchField
              {...controlProps}
              clearLabel="Clear invalid search"
              defaultValue="M"
              validationState="invalid"
            />
          )}
        </Field>
        <Field hint="Matching service is available." label="Validated search">
          {({ controlProps }) => (
            <SearchField
              {...controlProps}
              appearance="soft"
              clearLabel="Clear validated search"
              defaultValue="Delivery"
              validationState="success"
            />
          )}
        </Field>
        <SearchField
          aria-label="Loading search"
          clearLabel="Clear loading search"
          defaultValue="Fresh menu"
          loading
        />
        <SearchField
          aria-label="Disabled search"
          clearLabel="Clear disabled search"
          defaultValue="Unavailable"
          disabled
        />
        <SearchField
          aria-label="Read-only search"
          clearLabel="Clear read-only search"
          defaultValue="Saved filter"
          readOnly
        />
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    const orders = canvas.getByRole("searchbox", { name: "Orders" });
    const invalid = canvas.getByRole("searchbox", { name: "Invalid search" });
    const loading = canvas.getByRole("searchbox", { name: "Loading search" });
    const disabled = canvas.getByRole("searchbox", { name: "Disabled search" });
    const readOnly = canvas.getByRole("searchbox", {
      name: "Read-only search",
    });

    await expect(orders).toHaveAttribute("type", "search");
    await expect(orders.parentElement).toHaveAttribute(
      "data-search-clear",
      "true",
    );
    await expect(orders.parentElement?.querySelectorAll("button")).toHaveLength(
      1,
    );
    await expect(invalid).toHaveAttribute("aria-invalid", "true");
    await expect(loading).toHaveAttribute("aria-busy", "true");
    await expect(loading).toHaveAttribute("readonly");
    await expect(loading.parentElement).not.toHaveAttribute(
      "data-search-clear",
    );
    await expect(disabled.parentElement).not.toHaveAttribute(
      "data-search-clear",
    );
    await expect(readOnly.parentElement).not.toHaveAttribute(
      "data-search-clear",
    );
    await expect(
      canvas.queryByRole("button", { name: "Clear loading search" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Clear disabled search" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("button", { name: "Clear read-only search" }),
    ).not.toBeInTheDocument();
  },
};

export const SizesAndAppearances: Story = {
  name: "Sizes & appearances",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      {appearances.map((appearance) => (
        <section className={styles.stack} key={appearance}>
          <Text as="h2" variant="heading-sm">
            {appearance}
          </Text>
          <div className={styles.grid}>
            {sizes.map((size) => (
              <SearchField
                appearance={appearance}
                aria-label={`${appearance} ${size} search`}
                clearLabel={`Clear ${appearance} ${size} search`}
                defaultValue={`${size.toUpperCase()} orders`}
                key={size}
                size={size}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  ),
};

export const ClearAndKeyboardBehavior: Story = {
  name: "Clear & keyboard behavior",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <div className={styles.measure}>
        <Field hint="Tab once more to reach Clear search." label="Menu search">
          {({ controlProps }) => (
            <SearchField
              {...controlProps}
              clearLabel="Clear search"
              defaultValue="Morning orders"
            />
          )}
        </Field>
      </div>
    </main>
  ),
  play: async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Menu search" });
    const clear = canvas.getByRole("button", { name: "Clear search" });

    await userEvent.tab();
    await expect(input).toHaveFocus();
    await userEvent.tab();
    await expect(clear).toHaveFocus();

    const frame = input.parentElement;
    if (!frame)
      throw new Error("SearchField did not render its governed frame.");
    await waitFor(() => {
      const style = getComputedStyle(frame);
      expect(style.outlineColor).toBe(style.borderTopColor);
    });

    const enterEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    });
    const escapeEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    });
    await expect(input.dispatchEvent(enterEvent)).toBe(true);
    await expect(input.dispatchEvent(escapeEvent)).toBe(true);
    await expect(enterEvent.defaultPrevented).toBe(false);
    await expect(escapeEvent.defaultPrevented).toBe(false);

    const selectors = Array.from(document.styleSheets).flatMap((sheet) =>
      collectStyleSelectors(sheet.cssRules),
    );
    const cancelSelectors = selectors.filter((selector) =>
      selector.includes(
        `.${searchFieldStyles.input}::-webkit-search-cancel-button`,
      ),
    );
    await expect(cancelSelectors).toEqual([
      `.${searchFieldStyles.root}[data-search-clear="true"] .${searchFieldStyles.input}::-webkit-search-cancel-button`,
    ]);

    await userEvent.keyboard("{Enter}");
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
    await expect(frame).not.toHaveAttribute("data-search-clear");
    await expect(
      canvas.queryByRole("button", { name: "Clear search" }),
    ).toBeNull();
  },
};

export const NarrowPtLong: Story = {
  name: "Narrow · PT long",
  parameters: {
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => (
    <main className={styles.page} lang="pt-BR">
      <div className={styles.narrow}>
        <Field
          error="Digite pelo menos dois caracteres para pesquisar pedidos disponíveis."
          label="Pesquisar pedidos por cliente, produto ou referência"
        >
          {({ controlProps }) => (
            <SearchField
              {...controlProps}
              appearance="soft"
              clearLabel="Limpar pesquisa de pedidos"
              defaultValue="Pedido fresco preparado para entrega hoje"
              placeholder="Nome, produto ou referência do pedido"
              validationState="invalid"
            />
          )}
        </Field>
      </div>
    </main>
  ),
};
