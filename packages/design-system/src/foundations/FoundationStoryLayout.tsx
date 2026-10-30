import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "../components/class-names";
import { Text, type TextProps } from "../components/Text/Text";
import styles from "./FoundationStoryLayout.module.css";

type StoryPageProps = {
  children: ReactNode;
  description: ReactNode;
  title: string;
  width?: "standard" | "wide";
};

type StorySectionProps = {
  children: ReactNode;
  description?: ReactNode;
  title: string;
  token?: string;
};

type StoryGroupProps = {
  children: ReactNode;
  note?: ReactNode;
  title: string;
};

type SpecimenGridProps = HTMLAttributes<HTMLDivElement> & {
  minItemWidth?: "compact" | "standard" | "wide" | "full";
};

type SpecimenProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  children?: ReactNode;
  details?: ReactNode;
  guidance?: ReactNode;
  label: ReactNode;
  layout?: "stack" | "row";
  token?: ReactNode;
  value?: ReactNode;
};

export function FoundationStoryPage({
  children,
  description,
  title,
  width = "standard",
}: StoryPageProps) {
  return (
    <main className={styles.page}>
      <div className={`${styles.content} ${styles[width]}`}>
        <header className={styles.intro}>
          <Text as="h1" variant="heading-lg">
            {title}
          </Text>
          <Text className={styles.description} variant="body-base">
            {description}
          </Text>
        </header>
        {children}
      </div>
    </main>
  );
}

export function FoundationStorySection({
  children,
  description,
  title,
  token,
}: StorySectionProps) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div className={styles.sectionIdentity}>
          <Text as="h2" variant="heading-sm">
            {title}
          </Text>
          {token ? (
            <Text className={styles.token} variant="technical-sm">
              {token}
            </Text>
          ) : null}
        </div>
        {description ? (
          <Text className={styles.description} variant="body-sm">
            {description}
          </Text>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function FoundationStoryGroup({
  children,
  note,
  title,
}: StoryGroupProps) {
  return (
    <div className={styles.group}>
      <header className={styles.groupHeader}>
        <div className={styles.groupIdentity}>
          <Text variant="label-sm">{title}</Text>
          {note ? (
            <Text className={styles.note} variant="technical-sm">
              {note}
            </Text>
          ) : null}
        </div>
      </header>
      {children}
    </div>
  );
}

export function FoundationStoryCopy({
  className,
  variant = "body-sm",
  ...props
}: TextProps) {
  return <Text {...props} className={classNames(styles.copy, className)} variant={variant} />;
}

export function FoundationSpecimenGrid({
  className,
  minItemWidth = "standard",
  ...props
}: SpecimenGridProps) {
  return (
    <div
      {...props}
      className={classNames(styles.specimenGrid, className)}
      data-min-item-width={minItemWidth}
    />
  );
}

export function FoundationSpecimen({
  children,
  className,
  details,
  guidance,
  label,
  layout = "stack",
  token,
  value,
  ...props
}: SpecimenProps) {
  return (
    <article
      {...props}
      className={classNames(styles.specimen, className)}
      data-specimen-layout={layout}
    >
      <header className={styles.specimenIdentity}>
        <Text variant="label-sm">{label}</Text>
        {token || value ? (
          <Text className={styles.copy} variant="technical-sm">
            {token}
            {token && value ? " · " : null}
            {value}
          </Text>
        ) : null}
        {guidance ? <FoundationStoryCopy>{guidance}</FoundationStoryCopy> : null}
        {details ? <div className={styles.specimenDetails}>{details}</div> : null}
      </header>
      {children ? <div className={styles.specimenContent}>{children}</div> : null}
    </article>
  );
}
