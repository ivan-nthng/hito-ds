"use client";

import { createContext, type ReactNode } from "react";

/** Shares Field-owned explanatory copy with an adaptive modal control. */
export const FieldDescriptionContext = createContext<{ hint?: ReactNode; error?: ReactNode; describedBy?: string } | null>(null);

export function FieldDescriptionProvider({ hint, error, describedBy, children }: {
  hint?: ReactNode; error?: ReactNode; describedBy?: string; children: ReactNode;
}) {
  return <FieldDescriptionContext.Provider value={{hint,error,describedBy}}>{children}</FieldDescriptionContext.Provider>;
}
