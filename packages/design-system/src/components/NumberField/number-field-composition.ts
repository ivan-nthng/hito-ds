import { createContext } from "react";
import type { getNumberConstraintIssue } from "./number-value";

/** Private adapter for committed-value compositions; standalone fields use null. */
export const NumberFieldCompositionContext = createContext<{
  acceptedRevision: string;
  constraintIssue: typeof getNumberConstraintIssue;
  stepValue: (value: number | null, direction: -1 | 1) => number | null;
} | null>(null);
