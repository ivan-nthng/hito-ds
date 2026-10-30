import { createContext } from "react";

/** An enclosing Field already owns the visible label and group semantics. */
export const RangeSliderCompositionContext = createContext<string | null>(null);
