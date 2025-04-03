/**
 * Primitive Color Values
 * These are the raw color values used as the base for all tokens.
 * Colors are defined in HSL format for better theme manipulation.
 * Modify these values to customize the overall palette.
 */

export const Colors = {
	white: "hsl(0, 0%, 100%)",
	black: "hsl(0, 0%, 0%)",
	blue: {
		50: "hsl(213, 100%, 96%)", // #EFF6FF
		100: "hsl(214, 95%, 93%)", // #DBEAFE
		200: "hsl(213, 97%, 87%)", // #BFDBFE
		300: "hsl(212, 96%, 78%)", // #93C5FD
		400: "hsl(213, 94%, 68%)", // #60A5FA
		500: "hsl(217, 91%, 60%)", // #3B82F6
		600: "hsl(221, 83%, 53%)", // #2563EB
		700: "hsl(224, 76%, 48%)", // #1D4ED8
		800: "hsl(226, 71%, 40%)", // #1E40AF
		900: "hsl(224, 64%, 33%)", // #1E3A8A
		950: "hsl(226, 57%, 21%)", // #172554
	},
	gray: {
		50: "hsl(0, 0%, 98%)",
		100: "hsl(0, 0%, 96%)",
		200: "hsl(0, 0%, 90%)",
		300: "hsl(0, 0%, 83%)",
		400: "hsl(0, 0%, 64%)",
		500: "hsl(0, 0%, 45%)",
		600: "hsl(0, 0%, 32%)",
		700: "hsl(0, 0%, 25%)",
		800: "hsl(0, 0%, 15%)",
		900: "hsl(0, 0%, 9%)",
		950: "hsl(0, 0%, 4%)",
	},
	brand: {
		primary: "var(--primary-500)", // References Tailwind CSS variable
		secondary: "var(--gray-600)", // References Tailwind CSS variable
		accent: "var(--primary-400)", // References Tailwind CSS variable
	},
};
