import { Colors } from "./primitives/colors";

/**
 * Color Tokens
 * Light and Dark themes are defined here, using primitives from primitives/colors.ts.
 * To customize the theme, modify the values in primitives/colors.ts.
 *
 * Usage:
 * - For direct color usage: `bg-primary-500`
 * - For theme-aware usage: `bg-primary dark:bg-primary-dark`
 */

export const LightTheme = {
	// Base colors
	background: Colors.white,
	foreground: Colors.black,

	// Primary colors
	primary: {
		50: Colors.blue[50],
		100: Colors.blue[100],
		200: Colors.blue[200],
		300: Colors.blue[300],
		400: Colors.blue[400],
		500: Colors.blue[500],
		600: Colors.blue[600],
		700: Colors.blue[700],
		800: Colors.blue[800],
		900: Colors.blue[900],
		950: Colors.blue[950],
	},

	// Gray scale
	gray: Colors.gray,

	// Semantic colors
	success: Colors.brand.primary,
	warning: Colors.brand.secondary,
	error: Colors.brand.accent,

	// UI Elements
	border: Colors.gray[200],
	divider: Colors.gray[200],
	ring: Colors.blue[200],
	focus: Colors.blue[500],
};

export const DarkTheme = {
	// Base colors
	background: Colors.gray[950],
	foreground: Colors.white,

	// Primary colors - same as light theme
	primary: {
		50: Colors.blue[50],
		100: Colors.blue[100],
		200: Colors.blue[200],
		300: Colors.blue[300],
		400: Colors.blue[400],
		500: Colors.blue[500],
		600: Colors.blue[600],
		700: Colors.blue[700],
		800: Colors.blue[800],
		900: Colors.blue[900],
		950: Colors.blue[950],
	},

	// Gray scale
	gray: Colors.gray,

	// Semantic colors
	success: Colors.brand.primary,
	warning: Colors.brand.secondary,
	error: Colors.brand.accent,

	// UI Elements
	border: Colors.gray[800],
	divider: Colors.gray[800],
	ring: Colors.blue[900],
	focus: Colors.blue[500],
};
