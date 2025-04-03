import { Typography } from "./primitives/typography";

/**
 * Typography Tokens
 * Define semantic typography styles using primitives from primitives/typography.ts.
 * These tokens provide consistent text styles for different purposes.
 *
 * Usage:
 * - For direct usage: text-sm font-bold
 * - For semantic usage: text-body font-heading
 */

export const TypographyTokens = {
	// Headings
	heading: {
		h1: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes["5xl"],
			fontWeight: Typography.fontWeights.bold,
			lineHeight: Typography.lineHeights.tight,
			letterSpacing: Typography.letterSpacing.tight,
		},
		h2: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes["4xl"],
			fontWeight: Typography.fontWeights.bold,
			lineHeight: Typography.lineHeights.tight,
			letterSpacing: Typography.letterSpacing.tight,
		},
		h3: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes["3xl"],
			fontWeight: Typography.fontWeights.semibold,
			lineHeight: Typography.lineHeights.snug,
			letterSpacing: Typography.letterSpacing.normal,
		},
		h4: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes["2xl"],
			fontWeight: Typography.fontWeights.semibold,
			lineHeight: Typography.lineHeights.snug,
			letterSpacing: Typography.letterSpacing.normal,
		},
	},

	// Body text
	body: {
		large: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes.lg,
			fontWeight: Typography.fontWeights.normal,
			lineHeight: Typography.lineHeights.relaxed,
			letterSpacing: Typography.letterSpacing.normal,
		},
		base: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes.base,
			fontWeight: Typography.fontWeights.normal,
			lineHeight: Typography.lineHeights.normal,
			letterSpacing: Typography.letterSpacing.normal,
		},
		small: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes.sm,
			fontWeight: Typography.fontWeights.normal,
			lineHeight: Typography.lineHeights.normal,
			letterSpacing: Typography.letterSpacing.normal,
		},
	},

	// Interactive elements
	interactive: {
		button: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes.base,
			fontWeight: Typography.fontWeights.medium,
			lineHeight: Typography.lineHeights.none,
			letterSpacing: Typography.letterSpacing.wide,
		},
		link: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes.base,
			fontWeight: Typography.fontWeights.medium,
			lineHeight: Typography.lineHeights.normal,
			letterSpacing: Typography.letterSpacing.normal,
		},
	},

	// Utility text styles
	utility: {
		caption: {
			fontFamily: Typography.fonts.sans,
			fontSize: Typography.fontSizes.xs,
			fontWeight: Typography.fontWeights.normal,
			lineHeight: Typography.lineHeights.normal,
			letterSpacing: Typography.letterSpacing.normal,
		},
		code: {
			fontFamily: Typography.fonts.mono,
			fontSize: Typography.fontSizes.sm,
			fontWeight: Typography.fontWeights.normal,
			lineHeight: Typography.lineHeights.normal,
			letterSpacing: Typography.letterSpacing.normal,
		},
	},
};
