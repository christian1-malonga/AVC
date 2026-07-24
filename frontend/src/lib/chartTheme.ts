import type { CSSProperties } from "react";

/*
 * Shared chart design tokens that keep every dashboard consistent with the
 * polished reference look: smooth curves, subtle gradient fills, no grid
 * lines, airy whitespace, and restrained colors.
 */

export const CHART_COLORS = {
  primary: "oklch(0.35 0.14 268)",
  primarySoft: "oklch(0.45 0.12 268)",
  gold: "oklch(0.72 0.14 72)",
  goldSoft: "oklch(0.8 0.12 75)",
  red: "oklch(0.58 0.2 25)",
  redSoft: "oklch(0.68 0.18 28)",
  slate: "oklch(0.5 0.05 255)",
  slateSoft: "oklch(0.6 0.04 255)",
  teal: "oklch(0.55 0.1 170)",
  tealSoft: "oklch(0.65 0.1 170)",
  navy: "oklch(0.25 0.08 260)",
  navyLight: "oklch(0.35 0.06 260)",
} as const;

export const DEBT_COLORS = [CHART_COLORS.navy, CHART_COLORS.gold, CHART_COLORS.red] as const;

/*
 * Gradient fill for area charts — subtle fade from the line color to transparent.
 * Injected once into a single <defs> block per chart container.
 */
export const AREA_GRADIENT_ID = "avc-area-gradient";

export function areaGradientProps(): {
  id: string;
  stops: { offset: string; stopColor: string; stopOpacity: number }[];
} {
  return {
    id: AREA_GRADIENT_ID,
    stops: [
      { offset: "0%", stopColor: CHART_COLORS.primary, stopOpacity: 0.28 },
      { offset: "100%", stopColor: CHART_COLORS.primary, stopOpacity: 0.0 },
    ],
  };
}

/* Shared axis + tooltip styling so every chart feels the same */
export const axisStyle: CSSProperties = {
  fontSize: "0.75rem",
  fill: "oklch(0.45 0.02 260)",
};

export const tooltipContainerStyle: CSSProperties = {
  background: "oklch(0.99 0 0)",
  border: "1px solid oklch(0.9 0.006 255)",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 12px oklch(0.15 0.02 260 / 0.08)",
  fontSize: "0.75rem",
};
