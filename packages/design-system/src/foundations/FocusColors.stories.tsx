import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent } from "storybook/test";
import { Icon } from "../components/Icon/Icon";
import { Text } from "../components/Text/Text";
import {
  FoundationStoryGroup,
  FoundationStoryPage,
  FoundationStorySection,
} from "./FoundationStoryLayout";
import styles from "./FocusColors.stories.module.css";

const contexts = [
  { className: styles.canvas, id: "canvas", label: "Canvas" },
  { className: styles.base, id: "base", label: "Base" },
  { className: styles.subtle, id: "subtle", label: "Subtle" },
  { className: styles.accent, id: "accent", label: "Accent strong" },
  { className: styles.info, id: "info", label: "Info strong" },
  { className: styles.success, id: "success", label: "Success strong" },
  { className: styles.warning, id: "warning", label: "Warning strong" },
  {
    className: styles.destructive,
    id: "destructive",
    label: "Destructive strong",
  },
] as const;

function StaticTarget({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`${styles.target} ${className ?? ""}`}>
      Focus target
    </div>
  );
}

const meta = {
  id: "foundations-color-focus",
  title: "Foundations/Color/Focus",
  tags: ["test"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Indicator: Story = {
  render: () => (
    <FoundationStoryPage
      description="A 2px outer outline with a 2px offset. The perimeter Surface selects an opaque light or dark contrast color."
      title="Focus indicator"
      width="wide"
    >
      <div className={styles.page}>
        <aside className={styles.decisionNote}>
          <Text as="strong" variant="ui-md">
            Accepted mechanism · outer outline
          </Text>
          <Text className={styles.secondary} variant="body-sm">
            Focus identifies the current keyboard target. It is not hover,
            selected, pressed, invalid, elevation or a structural border. It
            never changes component geometry.
          </Text>
        </aside>

        <FoundationStorySection
          description="The color follows the Surface under the outline: dark on light perimeters, light on dark perimeters. Strong intent surfaces use the opposite polarity in each theme."
          title="Surface contexts"
        >
          <div className={styles.contextGrid}>
            {contexts.map((context) => (
              <article
                className={`${styles.contextCard} ${context.className}`}
                data-focus-context={context.id}
                key={context.id}
              >
                <Text
                  className={styles.contextLabel}
                  as="h3"
                  variant="label-sm"
                >
                  {context.label}
                </Text>
                <StaticTarget className={styles.staticFocus} />
              </article>
            ))}
          </div>
          <Text className={styles.policyNote} variant="technical-sm">
            color/focus/on-light → neutral/950 · color/focus/on-dark →
            basic/white. Both are opaque. The nearest perimeter Surface owns
            the choice; there is no intent-specific focus matrix.
          </Text>
        </FoundationStorySection>

        <FoundationStorySection
          description="The indicator follows the perceived interactive boundary, not the text or icon artwork inside it."
          title="Control shapes"
        >
          <div className={styles.controlGrid}>
            <FoundationStoryGroup title="Actions">
              <div className={styles.controlRow}>
                <button
                  className={`${styles.control} ${styles.filled} ${styles.staticFocus}`}
                  type="button"
                >
                  Filled
                </button>
                <button
                  className={`${styles.control} ${styles.outlined} ${styles.staticFocus}`}
                  type="button"
                >
                  Outlined
                </button>
                <button
                  className={`${styles.control} ${styles.ghost} ${styles.staticFocus}`}
                  type="button"
                >
                  Ghost
                </button>
                <button
                  aria-label="More actions"
                  className={`${styles.control} ${styles.iconButton} ${styles.staticFocus}`}
                  type="button"
                >
                  <Icon name="controls/more" size="md" />
                </button>
              </div>
            </FoundationStoryGroup>

            <FoundationStoryGroup title="Fields and links">
              <div className={styles.controlRow}>
                <input
                  aria-label="Default field specimen"
                  className={`${styles.field} ${styles.staticFocus}`}
                  defaultValue="Default field"
                  readOnly
                />
                <input
                  aria-invalid="true"
                  aria-label="Invalid field specimen"
                  className={`${styles.field} ${styles.invalid} ${styles.staticFocus}`}
                  defaultValue="Invalid remains visible"
                  readOnly
                />
                <a
                  className={`${styles.link} ${styles.staticFocus}`}
                  href="#focus-usage"
                >
                  Multiline links keep their underline and receive a separate
                  focus outline.
                </a>
              </div>
            </FoundationStoryGroup>

            <FoundationStoryGroup title="Composite boundaries">
              <div className={styles.controlRow}>
                <button
                  className={`${styles.listRow} ${styles.staticFocus}`}
                  type="button"
                >
                  <span>
                    <Text as="span" variant="ui-md">
                      Interactive list row
                    </Text>
                    <Text className={styles.secondary} variant="body-sm">
                      The whole row is the target.
                    </Text>
                  </span>
                  <Icon name="arrows/basic/right" size="md" />
                </button>
                <div
                  aria-label="Focus and selection comparison"
                  className={styles.composite}
                  role="group"
                >
                  <Text className={styles.secondary} variant="technical-sm">
                    Selection stays independent
                  </Text>
                  <div className={styles.compositeItems}>
                    <button
                      className={`${styles.compositeItem} ${styles.staticFocus}`}
                      type="button"
                    >
                      Focused
                    </button>
                    <button
                      aria-pressed="true"
                      className={`${styles.compositeItem} ${styles.selected}`}
                      type="button"
                    >
                      Selected
                    </button>
                  </div>
                </div>
              </div>
            </FoundationStoryGroup>
          </div>
        </FoundationStorySection>

        <section className={styles.keyboardSection} id="focus-usage">
          <Text as="h2" variant="heading-sm">
            Keyboard check
          </Text>
          <Text className={styles.secondary} variant="body-sm">
            Press Tab through these controls. Real focus appears only through
            :focus-visible and does not change their border width.
          </Text>
          <div className={styles.keyboardRow}>
            <button className={styles.keyboardTarget} type="button">
              First target
            </button>
            <input
              aria-label="Keyboard focus field"
              className={styles.keyboardField}
              defaultValue="Second target"
              readOnly
            />
            <a className={styles.keyboardLink} href="#focus-usage">
              Third target
            </a>
          </div>
        </section>
      </div>
    </FoundationStoryPage>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll("[data-focus-context]"),
    ).toHaveLength(8);

    const focused = Array.from(
      canvasElement.querySelectorAll<HTMLElement>(`.${styles.staticFocus}`),
    );
    await expect(focused.length).toBeGreaterThan(8);

    for (const target of focused) {
      const style = getComputedStyle(target);
      await expect(style.outlineStyle).toBe("solid");
      await expect(style.outlineWidth).toBe("2px");
      await expect(style.outlineOffset).toBe("2px");
      await expect(style.boxShadow).toBe("none");
    }

    const keyboardTarget = canvasElement.querySelector<HTMLButtonElement>(
      `.${styles.keyboardTarget}`,
    );
    await expect(keyboardTarget).not.toBeNull();

    if (keyboardTarget) {
      keyboardTarget.focus();
      await userEvent.keyboard("{Tab}{Shift>}{Tab}{/Shift}");
      await expect(keyboardTarget).toHaveFocus();
      const keyboardStyle = getComputedStyle(keyboardTarget);
      await expect(keyboardStyle.outlineStyle).toBe("solid");
      await expect(keyboardStyle.outlineWidth).toBe("2px");
      await expect(keyboardStyle.outlineOffset).toBe("2px");
      await expect(keyboardStyle.boxShadow).toBe("none");
    }
  },
};
