import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text, type TextEmphasis, type TextVariant } from "./Text";
import styles from "./Text.stories.module.css";

type Specimen = Readonly<{
  id: string;
  metrics: string;
  purpose: string;
  sample: string;
  variant: TextVariant;
}>;

const uiSpecimens: readonly Specimen[] = [
  {
    id: "UI/SM",
    metrics: "12 / 16 · 400 · normal",
    purpose: "Compact controls",
    sample: "Add note",
    variant: "ui-sm",
  },
  {
    id: "UI/MD",
    metrics: "14 / 20 · 400 · normal",
    purpose: "Default controls",
    sample: "Save changes",
    variant: "ui-md",
  },
  {
    id: "UI/LG",
    metrics: "16 / 24 · 400 · normal",
    purpose: "Large controls",
    sample: "Confirm selection",
    variant: "ui-lg",
  },
  {
    id: "UI/XL",
    metrics: "20 / 28 · 400 · normal",
    purpose: "Extra-large controls",
    sample: "Continue to checkout",
    variant: "ui-xl",
  },
];

const bodySpecimens: readonly Specimen[] = [
  {
    id: "Body/SM",
    metrics: "14 / 20 · 400 · normal",
    purpose: "Compact descriptions",
    sample: "Preparation starts after confirmation.",
    variant: "body-sm",
  },
  {
    id: "Body/Base",
    metrics: "16 / 24 · 400 · normal",
    purpose: "Default reading text",
    sample: "Keep the main message direct and easy to scan.",
    variant: "body-base",
  },
  {
    id: "Body/MD",
    metrics: "20 / 28 · 400 · normal",
    purpose: "Supporting lead text",
    sample: "A little more presence for important context.",
    variant: "body-md",
  },
  {
    id: "Body/LG",
    metrics: "24 / 36 · 400 · normal",
    purpose: "Editorial lead",
    sample:
      "Long-form introductions can breathe without becoming display text.",
    variant: "body-lg",
  },
];

const headingSpecimens: readonly Specimen[] = [
  {
    id: "Heading/SM",
    metrics: "20 / 24 · 600 · slightly tight",
    purpose: "Small section",
    sample: "Order details",
    variant: "heading-sm",
  },
  {
    id: "Heading/Base",
    metrics: "24 / 32 · 600 · slightly tight",
    purpose: "Section",
    sample: "Kitchen overview",
    variant: "heading-base",
  },
  {
    id: "Heading/MD",
    metrics: "28 / 36 · 600 · slightly tight",
    purpose: "Large section",
    sample: "Today’s deliveries",
    variant: "heading-md",
  },
  {
    id: "Heading/LG",
    metrics: "32 / 40 · 600 · slightly tight",
    purpose: "Page heading",
    sample: "Operational dashboard",
    variant: "heading-lg",
  },
  {
    id: "Heading/XL",
    metrics: "40 / 48 · 600 · slightly tight",
    purpose: "Large page heading",
    sample: "Service performance",
    variant: "heading-xl",
  },
];

const labelSpecimens: readonly Specimen[] = [
  {
    id: "Label/SM",
    metrics: "12 / 16 · 500 · normal",
    purpose: "Compact metadata label",
    sample: "Updated now",
    variant: "label-sm",
  },
  {
    id: "Label/Base",
    metrics: "14 / 20 · 500 · normal",
    purpose: "Default external label",
    sample: "Customer name",
    variant: "label-base",
  },
  {
    id: "Label/LG",
    metrics: "16 / 24 · 500 · normal",
    purpose: "Large external label",
    sample: "Delivery address",
    variant: "label-lg",
  },
  {
    id: "Label/Eyebrow",
    metrics: "10 / 12 · 600 · caps",
    purpose: "Short category",
    sample: "New order",
    variant: "label-eyebrow",
  },
];

const technicalSpecimens: readonly Specimen[] = [
  {
    id: "Technical/SM",
    metrics: "12 / 16 · 400 · normal",
    purpose: "Compact legal notes and system metadata",
    sample: "Offer terms apply · Updated 08:45",
    variant: "technical-sm",
  },
];

const dataSpecimens: readonly Specimen[] = [
  {
    id: "Data/SM",
    metrics: "12 / 16 · 400 · normal",
    purpose: "Compact aligned values",
    sample: "08:45 · R$ 1.248,90 · ORD-2026-1048",
    variant: "data-sm",
  },
  {
    id: "Data/Base",
    metrics: "14 / 20 · 400 · normal",
    purpose: "Default values",
    sample: "R$ 1.248,90",
    variant: "data-base",
  },
  {
    id: "Data/LG",
    metrics: "16 / 24 · 400 · normal",
    purpose: "Prominent values",
    sample: "ORD-2026-1048",
    variant: "data-lg",
  },
];

const displaySpecimens: readonly Specimen[] = [
  {
    id: "Display/Hero",
    metrics: "40 / 48 → 64 / 64 · 600 · tight",
    purpose: "Expressive landing hero",
    sample: "Good food, thoughtfully made",
    variant: "display-hero",
  },
  {
    id: "Display/Section",
    metrics: "32 / 40 → 48 / 56 · 600 · slightly tight",
    purpose: "Expressive section",
    sample: "Made for everyday moments",
    variant: "display-section",
  },
  {
    id: "Display/Subtitle",
    metrics: "24 / 32 · 400 · normal",
    purpose: "Display supporting text",
    sample: "A softer line beneath expressive headings",
    variant: "display-subtitle",
  },
  {
    id: "Display/Eyebrow",
    metrics: "12 / 16 · 600 · caps",
    purpose: "Short display category",
    sample: "Our approach",
    variant: "display-eyebrow",
  },
];

const overviewSpecimens: readonly Specimen[] = [
  uiSpecimens[1],
  bodySpecimens[1],
  headingSpecimens[3],
  labelSpecimens[1],
  technicalSpecimens[0],
  dataSpecimens[1],
  displaySpecimens[1],
];

const familySpecimens = [
  {
    family: "Instrument Sans",
    role: "Base",
    sample: "Operational interfaces should stay clear and quiet.",
    variant: "body-lg" as const,
  },
  {
    family: "Poppins",
    role: "Display",
    sample: "A distinct voice for hierarchy and expression.",
    variant: "heading-lg" as const,
  },
  {
    family: "Fira Mono",
    role: "Data",
    sample: "08:45  ·  R$ 1.248,90  ·  ORD-2026-1048",
    variant: "data-base" as const,
  },
] as const;

const emphases: readonly TextEmphasis[] = [
  "regular",
  "medium",
  "strong",
  "bold",
];

function StoryIntro({ children, title }: { children: string; title: string }) {
  return (
    <header className={styles.intro}>
      <Text as="h1" variant="heading-lg">
        {title}
      </Text>
      <Text className={styles.secondary} variant="body-base">
        {children}
      </Text>
    </header>
  );
}

function SpecimenRows({ specimens }: { specimens: readonly Specimen[] }) {
  return (
    <div className={styles.rows}>
      {specimens.map((specimen) => (
        <section
          className={styles.row}
          data-text-specimen={specimen.id}
          key={specimen.id}
        >
          <div className={styles.identity}>
            <Text as="h2" variant="technical-sm">
              {specimen.id}
            </Text>
            <Text className={styles.muted} variant="body-sm">
              {specimen.purpose}
            </Text>
          </div>
          <Text className={styles.metrics} variant="technical-sm">
            {specimen.metrics}
          </Text>
          <Text as="p" className={styles.specimen} variant={specimen.variant}>
            {specimen.sample}
          </Text>
        </section>
      ))}
    </div>
  );
}

function SpecimenPage({
  description,
  specimens,
  title,
}: {
  description: string;
  specimens: readonly Specimen[];
  title: string;
}) {
  return (
    <main className={styles.page}>
      <StoryIntro title={title}>{description}</StoryIntro>
      <SpecimenRows specimens={specimens} />
    </main>
  );
}

const meta = {
  id: "foundations-typography",
  title: "Foundations/Typography",
  tags: ["test"],
  parameters: {
    figma: { label: "Text Styles in Figma", url: "https://www.figma.com/design/C8ymDNFqGISrgIe6iGimHX/Hito-DS?node-id=8213-23" },
    docs: {
      description: {
        component:
          "Purpose-first typography. Semantic text colors live separately under Foundations/Color/Text; language is content, never a Design System mode.",
      },
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  name: "Roles",
  render: () => (
    <SpecimenPage
      description="Seven purpose-first roles. Color remains an independent contextual choice."
      specimens={overviewSpecimens}
      title="Text system"
    />
  ),
};

export const Families: Story = {
  render: () => (
    <main className={styles.page}>
      <StoryIntro title="Font families">
        Three replaceable family slots. Components consume roles, never font
        names directly.
      </StoryIntro>
      <div className={styles.familyList}>
        {familySpecimens.map((specimen) => (
          <section className={styles.familyRow} key={specimen.role}>
            <div className={styles.identity}>
              <Text as="h2" variant="label-base">
                {specimen.role}
              </Text>
              <Text className={styles.muted} variant="technical-sm">
                {specimen.family}
              </Text>
            </div>
            <Text as="p" variant={specimen.variant}>
              {specimen.sample}
            </Text>
          </section>
        ))}
      </div>
    </main>
  ),
};

export const UI: Story = {
  render: () => (
    <SpecimenPage
      description="Text inside controls and interactive items."
      specimens={uiSpecimens}
      title="UI text"
    />
  ),
};

export const Body: Story = {
  render: () => (
    <SpecimenPage
      description="Prose, descriptions and editorial content."
      specimens={bodySpecimens}
      title="Body text"
    />
  ),
};

export const Heading: Story = {
  render: () => (
    <SpecimenPage
      description="Interface and content hierarchy, separate from expressive display text."
      specimens={headingSpecimens}
      title="Headings"
    />
  ),
};

export const Label: Story = {
  render: () => (
    <SpecimenPage
      description="External labels, metadata names and short categories."
      specimens={labelSpecimens}
      title="Labels"
    />
  ),
};

export const Technical: Story = {
  render: () => (
    <SpecimenPage
      description="Compact legal notes, Design System labels and system metadata. It stays proportional and readable; it is not Data or code."
      specimens={technicalSpecimens}
      title="Technical text"
    />
  ),
};

export const Data: Story = {
  render: () => (
    <SpecimenPage
      description="Alignment-sensitive values, amounts, times and identifiers using Fira Mono."
      specimens={dataSpecimens}
      title="Data text"
    />
  ),
};

export const Display: Story = {
  render: () => (
    <SpecimenPage
      description="Expressive typography for landing and client-facing surfaces."
      specimens={displaySpecimens}
      title="Display text"
    />
  ),
};

export const Emphasis: Story = {
  render: () => (
    <main className={styles.page}>
      <StoryIntro title="Emphasis">
        Weight changes independently without duplicating typography roles.
      </StoryIntro>
      <div className={styles.rows}>
        {emphases.map((emphasis) => (
          <section
            className={styles.row}
            data-text-emphasis={emphasis}
            key={emphasis}
          >
            <Text as="h2" variant="technical-sm">
              {emphasis}
            </Text>
            <Text emphasis={emphasis} variant="body-base">
              The same role with {emphasis} emphasis.
            </Text>
          </section>
        ))}
      </div>
    </main>
  ),
};

export const ResponsiveAccessibility: Story = {
  name: "Responsive & Accessibility",
  render: () => (
    <main className={styles.page}>
      <StoryIntro title="Responsive and accessible type">
        Typography roles stay fixed except expressive Hero and Section. Layout
        reflows around the text; it does not silently replace a role.
      </StoryIntro>
      <div className={styles.guidance}>
        <section className={styles.guidanceSection}>
          <Text as="h2" variant="heading-sm">
            Content stress
          </Text>
          <Text variant="body-base">
            Confirmação da disponibilidade para amanhã às 08:45 — customer
            names, accents, currency and longer copy must wrap without clipping.
          </Text>
          <Text variant="technical-sm">
            PT and EN are validation fixtures, never typography modes.
          </Text>
        </section>
        <section className={styles.guidanceSection}>
          <Text as="h2" variant="heading-sm">
            Usage rules
          </Text>
          <ul className={styles.rules}>
            <li>Heading level and visual Heading role remain independent.</li>
            <li>Body/Base is the default for sustained reading.</li>
            <li>Technical/SM and Data/SM are not long-form text.</li>
            <li>At 200% zoom, content must reflow without clipping.</li>
            <li>Weight changes through Emphasis without changing metrics.</li>
          </ul>
        </section>
      </div>
    </main>
  ),
};
