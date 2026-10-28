import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { Text } from "../components/Text/Text";
import styles from "./ContentColors.stories.module.css";

const hierarchyColorRoles = [
  {
    className: styles.primary,
    dark: { base: "11.51:1", canvas: "14.92:1", reference: "Neutral/50" },
    id: "text/primary",
    light: { base: "16.52:1", canvas: "14.92:1", reference: "Neutral/950" },
    sample: "Primary text carries the message.",
  },
  {
    className: styles.secondary,
    dark: { base: "7.27:1", canvas: "9.42:1", reference: "Neutral/300" },
    id: "text/secondary",
    light: { base: "9.20:1", canvas: "8.31:1", reference: "Neutral/800" },
    sample: "Secondary text supports the hierarchy.",
  },
  {
    className: styles.muted,
    dark: { base: "5.51:1", canvas: "7.14:1", reference: "Neutral/400" },
    id: "text/muted",
    light: { base: "6.59:1", canvas: "5.96:1", reference: "Neutral/700" },
    sample: "Muted text carries non-critical metadata.",
  },
  {
    className: styles.disabled,
    dark: {
      base: "3.94:1",
      canvas: "4.46:1",
      reference: "Primary + Opacity/48",
    },
    id: "text/disabled",
    light: {
      base: "3.06:1",
      canvas: "2.99:1",
      reference: "Primary + Opacity/48",
    },
    sample: "Disabled text is reserved for inert controls.",
  },
] as const;

const intentStates = ["default", "hover"] as const;

const intentColorRoles = [
  {
    dark: {
      default: { base: "7.13:1", canvas: "9.24:1", reference: "Brand/400" },
      hover: { base: "8.23:1", canvas: "10.67:1", reference: "Brand/300" },
    },
    id: "accent",
    light: {
      default: { base: "6.76:1", canvas: "6.11:1", reference: "Brand/800" },
      hover: { base: "9.86:1", canvas: "8.91:1", reference: "Brand/900" },
    },
  },
  {
    dark: {
      default: { base: "6.21:1", canvas: "8.05:1", reference: "Blue/400" },
      hover: { base: "7.62:1", canvas: "9.88:1", reference: "Blue/300" },
    },
    id: "info",
    light: {
      default: { base: "5.05:1", canvas: "4.56:1", reference: "Blue/700" },
      hover: { base: "7.44:1", canvas: "6.72:1", reference: "Blue/800" },
    },
  },
  {
    dark: {
      default: { base: "7.37:1", canvas: "9.55:1", reference: "Green/300" },
      hover: { base: "9.12:1", canvas: "11.82:1", reference: "Green/200" },
    },
    id: "success",
    light: {
      default: { base: "5.88:1", canvas: "5.31:1", reference: "Green/700" },
      hover: { base: "8.47:1", canvas: "7.65:1", reference: "Green/800" },
    },
  },
  {
    dark: {
      default: { base: "7.29:1", canvas: "9.45:1", reference: "Red/300" },
      hover: { base: "9.00:1", canvas: "11.66:1", reference: "Red/200" },
    },
    id: "destructive",
    light: {
      default: { base: "5.77:1", canvas: "5.21:1", reference: "Red/700" },
      hover: { base: "8.03:1", canvas: "7.26:1", reference: "Red/800" },
    },
  },
  {
    dark: {
      default: { base: "7.59:1", canvas: "9.84:1", reference: "Orange/300" },
      hover: { base: "9.02:1", canvas: "11.70:1", reference: "Orange/200" },
    },
    id: "warning",
    light: {
      default: { base: "5.19:1", canvas: "4.69:1", reference: "Orange/700" },
      hover: { base: "7.53:1", canvas: "6.81:1", reference: "Orange/800" },
    },
  },
] as const;

function ModeValue({ dark, light }: { dark: string; light: string }) {
  return (
    <>
      <span className={styles.lightOnly}>{light}</span>
      <span className={styles.darkOnly}>{dark}</span>
    </>
  );
}

function HierarchyContext({ context }: { context: "base" | "canvas" }) {
  return (
    <section
      className={context === "base" ? styles.baseContext : styles.canvasContext}
    >
      <Text as="h2" variant="label-base">
        On surface/{context}
      </Text>
      <div className={styles.colorRows}>
        {hierarchyColorRoles.map((role) => (
          <div
            className={styles.colorRow}
            data-text-color={role.id}
            key={role.id}
          >
            <div className={styles.colorIdentity}>
              <Text
                as="h3"
                className={
                  role.id === "text/disabled" ? styles.primary : role.className
                }
                variant="technical-sm"
              >
                {role.id}
              </Text>
              <Text className={styles.muted} variant="technical-sm">
                <ModeValue
                  dark={role.dark.reference}
                  light={role.light.reference}
                />
              </Text>
            </div>
            {role.id === "text/disabled" ? (
              <button className={styles.disabledControl} disabled type="button">
                <Text as="span" className={role.className} variant="body-base">
                  {role.sample}
                </Text>
              </button>
            ) : (
              <Text className={role.className} variant="body-base">
                {role.sample}
              </Text>
            )}
            <Text className={styles.primary} variant="technical-sm">
              <ModeValue
                dark={`${role.dark[context]} · Dark`}
                light={`${role.light[context]} · Light`}
              />
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}

function IntentContext({ context }: { context: "base" | "canvas" }) {
  return (
    <section
      className={context === "base" ? styles.baseContext : styles.canvasContext}
    >
      <Text as="h2" variant="label-base">
        On surface/{context}
      </Text>
      <Text as="h3" variant="label-base">
        Interactive intent text
      </Text>
      <div className={styles.intentRows}>
        <div aria-hidden="true" className={styles.intentHeader}>
          <Text variant="technical-sm">Intent</Text>
          {intentStates.map((state) => (
            <Text key={state} variant="technical-sm">
              {state}
            </Text>
          ))}
        </div>
        {intentColorRoles.map((role) => (
          <div
            className={styles.intentRow}
            data-text-intent={role.id}
            key={role.id}
          >
            <Text variant="technical-sm">text/{role.id}</Text>
            {intentStates.map((state) => (
              <div className={styles.intentState} key={state}>
                <Text
                  style={{ color: `var(--color-text-${role.id}-${state})` }}
                  variant="body-base"
                >
                  {state === "hover" ? "View details" : "Open details"}
                </Text>
                <Text className={styles.muted} variant="technical-sm">
                  <ModeValue
                    dark={`${role.dark[state].reference} · ${role.dark[state][context]}`}
                    light={`${role.light[state].reference} · ${role.light[state][context]}`}
                  />
                </Text>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const meta = {
  id: "foundations-color-text",
  title: "Foundations/Color/Text",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hierarchy: Story = {
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Text hierarchy
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Primary, secondary, muted and disabled text measured on the active
          Canvas and Base surfaces.
        </Text>
      </header>
      <div className={styles.contexts}>
        <HierarchyContext context="canvas" />
        <HierarchyContext context="base" />
      </div>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-text-color]"),
    ).toHaveLength(8);
  },
};

export const Intent: Story = {
  render: () => (
    <main className={styles.page}>
      <header className={styles.intro}>
        <Text as="h1" variant="heading-lg">
          Text intent
        </Text>
        <Text className={styles.secondary} variant="body-base">
          Accent, information, success, warning and destructive text in default
          and hover states.
        </Text>
      </header>
      <div className={styles.contexts}>
        <IntentContext context="canvas" />
        <IntentContext context="base" />
      </div>
    </main>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-text-intent]"),
    ).toHaveLength(10);
  },
};
