import type { CSSProperties } from "react";
import type { ReferenceColorFamily } from "@hito-ds/react/tokens/types";
import { FoundationStorySection, FoundationSpecimenGrid, FoundationSpecimen } from "./FoundationStoryLayout";
import styles from "./ColorScale.module.css";

export function ColorSample({ cssVariable, label }: { cssVariable: string; label: string }) {
  return <div role="img" aria-label={label} className={styles.sample} style={{ "--primitive-color": `var(${cssVariable})` } as CSSProperties} />;
}

export function ColorReferenceScale({ family }: { family: ReferenceColorFamily }) {
  return <FoundationStorySection title={family.displayName} description="Twelve fixed reference steps. Labels sit outside the chip; raw swatches do not imply accessible foreground pairings.">
    <div className={styles.region} role="region" aria-label={`${family.displayName} reference color scale`} tabIndex={0}>
      <FoundationSpecimenGrid minItemWidth="compact">
        {family.tokens.map(token => <FoundationSpecimen key={token.id} data-reference-color={token.id} label={String(token.step)} value={token.value} token={token.id}>
          <ColorSample cssVariable={token.cssVariable} label={`${family.displayName} ${token.step} swatch`} />
        </FoundationSpecimen>)}
      </FoundationSpecimenGrid>
    </div>
  </FoundationStorySection>;
}
