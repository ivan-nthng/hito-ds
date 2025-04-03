import { Spacing } from "./primitives/spacing";

/**
 * Spacing Tokens
 * Define semantic spacing values using primitives from primitives/spacing.ts.
 * These tokens provide meaningful names for common spacing use cases.
 *
 * Usage:
 * - For direct spacing: p-4 m-4
 * - For semantic spacing: p-content m-section
 */

export const SpacingTokens = {
	// Content spacing
	content: {
		none: Spacing[0],
		xs: Spacing[1],
		sm: Spacing[2],
		md: Spacing[4],
		lg: Spacing[6],
		xl: Spacing[8],
		"2xl": Spacing[12],
	},

	// Layout spacing
	layout: {
		gutter: Spacing[4], // Space between grid columns
		margin: Spacing[4], // Page margins
		gap: Spacing[6], // Gap between sections
	},

	// Component spacing
	component: {
		xs: Spacing[1], // Minimal spacing (icons in buttons)
		sm: Spacing[2], // Small elements (between text and icons)
		md: Spacing[3], // Medium elements (buttons, inputs)
		lg: Spacing[4], // Large elements (cards, sections)
		xl: Spacing[6], // Extra large (between major sections)
	},

	// Section spacing
	section: {
		sm: Spacing[8], // Small sections
		md: Spacing[12], // Medium sections
		lg: Spacing[16], // Large sections
		xl: Spacing[20], // Extra large sections
	},
};
