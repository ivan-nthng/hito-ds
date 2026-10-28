import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";
import { iconCatalog } from "../Icon/icon-catalog";
import { Text } from "../Text/Text";
import { TextInput } from "../TextInput/TextInput";
import { Card } from "../Card/Card";
import {
  Button,
  type ButtonIntent,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from "./Button";
import styles from "./Button.stories.module.css";
import { resolvedBackground } from "../../storybook/open-trigger-paint.story";

const variants: ButtonVariant[] = ["primary", "secondary", "soft", "ghost"];
const intents: ButtonIntent[] = ["neutral", "accent", "info", "success", "warning", "destructive"];
const sizes: ButtonSize[] = ["sm", "md", "lg", "xl"];
const iconNames = Object.keys(iconCatalog);
type ButtonAvailability = "enabled" | "disabled" | "loading";
type ButtonStoryProps = ButtonProps & {
  availability?: ButtonAvailability;
};

function renderButton({
  availability,
  disabled,
  loading,
  ...props
}: ButtonStoryProps) {
  const resolvedAvailability =
    availability ?? (disabled ? "disabled" : loading ? "loading" : "enabled");

  if (resolvedAvailability === "disabled") {
    return <Button {...props} disabled />;
  }

  if (resolvedAvailability === "loading") {
    return <Button {...props} loading />;
  }

  return <Button {...props} />;
}

const meta = {
  id: "actions-button",
  title: "Components/Actions/Button",
  component: Button,
  tags: ["test"],
  args: {
    availability: "enabled",
    children: "Continue",
    intent: "accent",
    onClick: fn(),
    variant: "primary",
  },
  argTypes: {
    availability: {
      control: "inline-radio",
      options: ["enabled", "disabled", "loading"],
    },
    disabled: { control: false, table: { disable: true } },
    hitArea: { control: "select", options: [undefined, "minimum"] },
    icon: { control: "select", options: iconNames },
    intent: { control: "inline-radio", options: intents },
    leadingIcon: { control: "select", options: iconNames },
    loading: { control: false, table: { disable: true } },
    size: { control: "inline-radio", options: sizes },
    trailingIcon: { control: "select", options: iconNames },
    type: { control: "inline-radio", options: ["button", "submit", "reset"] },
    variant: { control: "inline-radio", options: variants },
    width: { control: "inline-radio", options: ["content", "full"] },
  },
  render: renderButton,
  parameters: { figma: { label: "Button states in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8249-85" } },
} satisfies Meta<ButtonStoryProps>;

export default meta;
type Story = StoryObj<typeof meta>;

function MinimumHitAreaExample(args: ButtonStoryProps) {
  const [activations, setActivations] = useState(0);
  return <form className={styles.targetExample} onSubmit={event => { event.preventDefault(); setActivations(value => value + 1); }}>
    <div className={styles.targetSlot}>{renderButton(args)}</div>
    <Text role="status">Activations: {activations}</Text>
    <Text variant="body-sm">The layout reserves the minimum target around the smaller native button.</Text>
  </form>;
}

export const MinimumHitArea: Story = {
  args: { "aria-label": "Add", children: undefined, icon: "controls/plus-s", hitArea: "minimum", size: "md", type: "submit" },
  argTypes: { "aria-disabled": { control: "boolean" }, "aria-expanded": { control: "boolean" } },
  render: args => <MinimumHitAreaExample {...args} />,
  play: async ({ args, canvas }) => {
    if (args.availability !== "enabled" || args["aria-disabled"] === true || args["aria-disabled"] === "true") {
      await userEvent.click(canvas.getByRole("button", { name: "Add" }));
      await expect(canvas.getByRole("status")).toHaveTextContent("Activations: 0");
      return;
    }
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "Add" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByRole("status")).toHaveTextContent("Activations: 1");
  },
};

export const Default: Story = {
  name: "Text Button",
  argTypes: {
    icon: { control: false, table: { disable: true } },
  },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Continue" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const focusStyle = getComputedStyle(button);
    await expect(focusStyle.outlineWidth).toBe("2px");
    await expect(focusStyle.outlineOffset).toBe("2px");
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const IconOnly: Story = {
  parameters: { figma: { label: "Icon Button states in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8738-432" } },
  name: "Icon Button",
  args: {
    "aria-label": "Add item",
    children: undefined,
    icon: "controls/plus-s",
  },
  argTypes: {
    children: { control: false, table: { disable: true } },
    leadingIcon: { control: false, table: { disable: true } },
    trailingIcon: { control: false, table: { disable: true } },
    width: { control: false, table: { disable: true } },
  },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole("button", { name: "Add item" });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(button.getAttribute("data-icon-position")).toBe("only");
    await userEvent.keyboard("{Enter}");
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const CornerShapes: Story = {
  name: "Corner shapes",
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => <div className={styles.matrix}>
    {(["light", "dark"] as const).map(theme => <section key={theme} data-hito-color-scheme={theme} data-corner-theme={theme} className={styles.cornerTheme}>
      <Text as="h2" variant="heading-sm">{theme}</Text>
      <div className={styles.row}>
        {sizes.map(size => <Button key={`text-${size}`} size={size} variant="secondary" intent="neutral">Text {size}</Button>)}
        {sizes.map(size => <Button key={`icon-${size}`} size={size} variant="secondary" intent="neutral" icon="controls/plus-s" aria-label={`Icon ${size}`} />)}
        <TextInput size="md" aria-label="Corner input" placeholder="Input" />
        <Card as="article" size="compact" layout="fixed"><Text variant="ui-sm">Card surface</Text></Card>
      </div>
    </section>)}
  </div>,
  play: async ({ canvas }) => {
    const supported = CSS.supports("corner-shape", "squircle");
    await userEvent.tab();
    const focused = document.activeElement as HTMLElement;
    await expect(focused).toHaveTextContent("Text sm");
    await expect(getComputedStyle(focused).outlineWidth).toBe("2px");
    await expect(getComputedStyle(focused).outlineOffset).toBe("2px");
    const isSquircle = (element: Element) => ["squircle", "superellipse(2)"].includes(getComputedStyle(element).getPropertyValue("corner-shape").trim());
    await expect(isSquircle(focused)).toBe(false);
    for (const theme of ["light", "dark"]) {
      const scope = canvas.getByText(theme).closest<HTMLElement>("[data-corner-theme]")!;
      for (const [size, radius] of Object.entries({ sm: 4, md: 6, lg: 8, xl: 12 })) {
        for (const label of [`Text ${size}`, `Icon ${size}`]) {
          const control = scope.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`) ?? [...scope.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === label)!;
          const style = getComputedStyle(control);
          await expect(parseFloat(style.borderTopLeftRadius)).toBe(radius);
          await expect(isSquircle(control)).toBe(supported && size === "xl");
        }
      }
      const input = scope.querySelector<HTMLInputElement>("input")!;
      const inputFrame = input.parentElement!;
      const card = scope.querySelector<HTMLElement>("article")!;
      await expect(parseFloat(getComputedStyle(inputFrame).borderTopLeftRadius)).toBe(6);
      await expect(parseFloat(getComputedStyle(card).borderTopLeftRadius)).toBe(16);
      await expect(isSquircle(inputFrame)).toBe(false);
      await expect(isSquircle(card)).toBe(false);
      await userEvent.click(input);
      await expect(input).toHaveFocus();
      await expect(parseFloat(getComputedStyle(inputFrame).outlineWidth)).toBeGreaterThan(0);
    }
  },
};

export const OpenAvailability: Story = {
  tags: ["context-matrix", "!dev", "!autodocs"],
  parameters: { controls: { disable: true } },
  render: () => (
    <div className={styles.row}>
      <Button aria-controls="button-open-example" aria-expanded intent="neutral" variant="ghost">Open text</Button>
      <Button aria-controls="button-open-example" aria-expanded aria-label="Open icon" icon="controls/more" intent="neutral" variant="ghost" />
      <Button aria-controls="button-open-example" aria-expanded intent="accent" variant="primary">Open primary</Button>
      <Button aria-controls="button-open-example" aria-expanded disabled intent="neutral" variant="ghost">Disabled open</Button>
      <Button aria-controls="button-open-example" aria-expanded loading intent="neutral" variant="ghost">Loading open</Button>
      <div id="button-open-example">Controlled panel</div>
    </div>
  ),
  play: async ({ canvas }) => {
    const text = canvas.getByRole("button", { name: "Open text" });
    const icon = canvas.getByRole("button", { name: "Open icon" });
    const primary = canvas.getByRole("button", { name: "Open primary" });
    const pressed = resolvedBackground(text, "--color-surface-neutral-subtle-pressed");
    await expect(getComputedStyle(text).backgroundColor).toBe(pressed);
    await expect(getComputedStyle(icon).backgroundColor).toBe(pressed);
    await expect(getComputedStyle(primary).backgroundColor).toBe(resolvedBackground(primary, "--button-strong-pressed"));
    await expect(getComputedStyle(canvas.getByRole("button", { name: "Disabled open" })).backgroundColor).not.toBe(pressed);
    await expect(getComputedStyle(canvas.getByRole("button", { name: "Loading open" })).backgroundColor).not.toBe(pressed);
  },
};

export const IconLoading: Story = {
  name: "Icon Button loading",
  tags: ["context-matrix"],
  parameters: { controls: { disable: true }, figma: { label: "Icon Button loading sizes in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8899-622" } },
  render: () => (
    <div className={styles.row}>
      {sizes.map((size) => (
        <div className={styles.intentPair} key={size}>
          <Button
            aria-label={`Save ${size}`}
            icon="general/check"
            intent="success"
            size={size}
            variant="primary"
          />
          <Button
            aria-label={`Saving ${size}`}
            icon="general/check"
            intent="success"
            loading
            size={size}
            variant="primary"
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const size of sizes) {
      const enabled = canvas.getByRole("button", { name: `Save ${size}` });
      const loading = canvas.getByRole("button", { name: `Saving ${size}` });
      const spinner = loading.querySelector<HTMLElement>("[data-spinner]");
      const enabledRect = enabled.getBoundingClientRect();
      const loadingRect = loading.getBoundingClientRect();
      const spinnerRect = spinner?.getBoundingClientRect();

      await expect(spinner).not.toBeNull();
      await expect(loading.querySelector("[data-icon-name]")).toBeNull();
      await expect(getComputedStyle(spinner!.parentElement!).position).toBe("static");
      await expect(loadingRect.width).toBe(enabledRect.width);
      await expect(loadingRect.height).toBe(enabledRect.height);
      await expect(loadingRect.width).toBe(loadingRect.height);
      await expect(Math.abs(spinnerRect!.left + spinnerRect!.width / 2 - (loadingRect.left + loadingRect.width / 2))).toBeLessThanOrEqual(0.5);
      await expect(Math.abs(spinnerRect!.top + spinnerRect!.height / 2 - (loadingRect.top + loadingRect.height / 2))).toBeLessThanOrEqual(0.5);
    }
  },
};

export const IconPadding: Story = {
  name: "Icon padding",
  parameters: { controls: { disable: true } },
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Icon-side optical compensation
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Only the occupied logical edge uses the next tighter spacing token.
        </Text>
      </header>
      <div className={styles.matrix}>
        {sizes.map((size) => (
          <div className={styles.treatment} key={size}>
            <Text className={styles.secondary} variant="technical-sm">
              {size.toUpperCase()}
            </Text>
            <div className={styles.row}>
              <Button intent="accent" size={size} variant="primary">
                No icon
              </Button>
              <Button
                intent="accent"
                leadingIcon="controls/plus-s"
                size={size}
                variant="primary"
              >
                Leading
              </Button>
              <Button
                intent="accent"
                size={size}
                trailingIcon="arrows/basic/right"
                variant="primary"
              >
                Trailing
              </Button>
              <Button
                intent="accent"
                leadingIcon="general/check"
                size={size}
                trailingIcon="arrows/basic/right"
                variant="primary"
              >
                Both
              </Button>
            </div>
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Overview: Story = {
  name: "Variants & intents",
  tags: ["context-matrix"],
  parameters: {
    a11y: {
      context: {
        exclude: [
          'button[data-intent="success"][data-variant="primary"] > span',
        ],
      },
    },
    controls: { disable: true },
  },
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Button
        </Text>
        <Text className={styles.secondary} variant="body-base">
          One native action with independent variant, intent, size, width and
          content shape.
        </Text>
      </header>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Variants and intents
        </Text>
        <Text className={styles.secondary} variant="body-sm">
          Every intent pairs the Text Button and Icon Button content shapes.
        </Text>
        <div className={styles.matrix}>
          {variants.map((variant) => (
            <div className={styles.treatment} key={variant}>
              <Text className={styles.secondary} variant="technical-sm">
                {variant}
              </Text>
              <div className={styles.row}>
                {intents.map((intent) => (
                  <div className={styles.intentPair} key={intent}>
                    <Button intent={intent} variant={variant}>
                      {intent}
                    </Button>
                    <Button
                      aria-label={
                        intent === "success" ? "Confirm" : `${intent} action`
                      }
                      icon={
                        intent === "success" ? "general/check" : "controls/plus-s"
                      }
                      intent={intent}
                      variant={variant}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Scale and composition
        </Text>
        <div className={styles.row}>
          {sizes.map((size) => (
            <Button intent="accent" key={size} size={size} variant="primary">
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
        <div className={styles.row}>
          <Button intent="neutral" leadingIcon="controls/plus-s" variant="secondary">
            Add item
          </Button>
          <Button intent="accent" trailingIcon="arrows/basic/right" variant="primary">
            Continue
          </Button>
          <Button
            intent="success"
            leadingIcon="general/check"
            trailingIcon="arrows/basic/right"
            variant="soft"
          >
            Review
          </Button>
          <Button
            aria-label="Add item"
            icon="controls/plus-s"
            intent="accent"
            variant="primary"
          />
          <Button intent="accent" loading variant="primary">
            Loading
          </Button>
        </div>
        <Button intent="accent" variant="primary" width="full">
          Full container width
        </Button>
      </section>

      <section className={styles.section}>
        <Text as="h2" variant="heading-sm">
          Universal disabled state
        </Text>
        <Text className={styles.secondary} variant="body-sm">
          Intent color is removed and no treatment responds to hover or press.
        </Text>
        <div className={styles.row}>
          {variants.map((variant) => (
            <Button disabled intent="destructive" key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </section>
    </main>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("button")).toHaveLength(variants.length * intents.length * 2 + sizes.length + 6 + variants.length);
  },
};


/** Reset remains a native Button; the scrim and non-overlapping target slots belong to the caller. */
export const OnScrim: Story = {
  render: () => <div className={styles.matrix}>{(["light", "dark"] as const).map(theme =>
    <section key={theme} data-hito-color-scheme={theme} className={styles.cornerTheme}>
      <Text as="h2" tabIndex={-1} variant="heading-sm">{theme}</Text>
      <div className={styles.row}>{["white", "black", "photo"].map(background =>
        <div key={background} className={styles.scrimPhoto} data-background={background}>
          {/* Native fixture photo deliberately bypasses production image processing. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {background === "photo" ? <img alt="Busy photo contrast sample" src={new URL("../../storybook/fixtures/avatar-portrait.jpg", import.meta.url).href} /> : null}
          <div className={styles.scrimTargets}>{[false, true].map(disabled =>
            <span key={String(disabled)} className={styles.targetSlot}><span className={styles.scrimBackdrop}>
              <Button context="on-scrim" size="sm" variant="ghost" intent="neutral" icon="controls/refresh" hitArea="minimum"
                disabled={disabled} aria-label={`${theme} ${background} Reset${disabled ? " disabled" : ""}`} />
            </span></span>)}</div>
        </div>)}</div>
    </section>)}</div>,
  play: async ({ canvas }) => {
    const reset = canvas.getByRole("button", { name: "light white Reset" });
    const disabled = canvas.getByRole("button", { name: "light white Reset disabled" });
    await userEvent.hover(reset); await expect(reset).toHaveAttribute("data-hito-color-scheme", "dark");
    await userEvent.pointer({ target: reset, keys: "[MouseLeft>]" });
    // Synthetic DOM input checks control events/reachability; native pseudo-state paint needs trusted browser input.
    await userEvent.pointer({ keys: "[/MouseLeft]" });
    canvas.getByRole("heading", { name: "light" }).focus();
    await userEvent.tab();
    await expect(reset).toHaveFocus();
    const buttonBounds = reset.getBoundingClientRect(), wrapperBounds = reset.parentElement!.getBoundingClientRect();
    await expect(wrapperBounds.width).toBe(buttonBounds.width); await expect(wrapperBounds.height).toBe(buttonBounds.height);
    await expect(disabled).toBeDisabled();
  },
};
