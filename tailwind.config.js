/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./.storybook/**/*.{js,ts,jsx,tsx}"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					50: "hsl(210, 100%, 98%)",
					100: "hsl(210, 100%, 96%)",
					200: "hsl(210, 95%, 90%)",
					300: "hsl(210, 90%, 80%)",
					400: "hsl(210, 85%, 65%)",
					500: "hsl(210, 80%, 50%)",
					600: "hsl(210, 85%, 45%)",
					700: "hsl(210, 90%, 40%)",
					800: "hsl(210, 95%, 35%)",
					900: "hsl(210, 100%, 30%)",
				},
				gray: {
					50: "hsl(var(--gray-50))",
					100: "hsl(var(--gray-100))",
					200: "hsl(var(--gray-200))",
					300: "hsl(var(--gray-300))",
					400: "hsl(var(--gray-400))",
					500: "hsl(var(--gray-500))",
					600: "hsl(var(--gray-600))",
					700: "hsl(var(--gray-700))",
					800: "hsl(var(--gray-800))",
					900: "hsl(var(--gray-900))",
					950: "hsl(var(--gray-950))",
				},
				success: {
					50: "hsl(var(--success-50))",
					100: "hsl(var(--success-100))",
					200: "hsl(var(--success-200))",
					300: "hsl(var(--success-300))",
					400: "hsl(var(--success-400))",
					500: "hsl(var(--success-500))",
					600: "hsl(var(--success-600))",
					700: "hsl(var(--success-700))",
					800: "hsl(var(--success-800))",
					900: "hsl(var(--success-900))",
					950: "hsl(var(--success-950))",
				},
				warning: {
					50: "hsl(var(--warning-50))",
					100: "hsl(var(--warning-100))",
					200: "hsl(var(--warning-200))",
					300: "hsl(var(--warning-300))",
					400: "hsl(var(--warning-400))",
					500: "hsl(var(--warning-500))",
					600: "hsl(var(--warning-600))",
					700: "hsl(var(--warning-700))",
					800: "hsl(var(--warning-800))",
					900: "hsl(var(--warning-900))",
					950: "hsl(var(--warning-950))",
				},
				error: {
					50: "hsl(var(--error-50))",
					100: "hsl(var(--error-100))",
					200: "hsl(var(--error-200))",
					300: "hsl(var(--error-300))",
					400: "hsl(var(--error-400))",
					500: "hsl(var(--error-500))",
					600: "hsl(var(--error-600))",
					700: "hsl(var(--error-700))",
					800: "hsl(var(--error-800))",
					900: "hsl(var(--error-900))",
					950: "hsl(var(--error-950))",
				},
			},
			spacing: {
				// Content spacing
				"content-xs": "var(--spacing-content-xs)",
				"content-sm": "var(--spacing-content-sm)",
				"content-md": "var(--spacing-content-md)",
				"content-lg": "var(--spacing-content-lg)",
				"content-xl": "var(--spacing-content-xl)",
				"content-2xl": "var(--spacing-content-2xl)",

				// Layout spacing
				"layout-gutter": "var(--spacing-layout-gutter)",
				"layout-margin": "var(--spacing-layout-margin)",
				"layout-gap": "var(--spacing-layout-gap)",

				// Component spacing
				"component-xs": "var(--spacing-component-xs)",
				"component-sm": "var(--spacing-component-sm)",
				"component-md": "var(--spacing-component-md)",
				"component-lg": "var(--spacing-component-lg)",
				"component-xl": "var(--spacing-component-xl)",

				// Section spacing
				"section-sm": "var(--spacing-section-sm)",
				"section-md": "var(--spacing-section-md)",
				"section-lg": "var(--spacing-section-lg)",
				"section-xl": "var(--spacing-section-xl)",
			},
			fontFamily: {
				sans: "var(--font-sans)",
				serif: "var(--font-serif)",
				mono: "var(--font-mono)",
			},
			fontSize: {
				xs: ["var(--font-size-xs)", { lineHeight: "var(--line-height-normal)" }],
				sm: ["var(--font-size-sm)", { lineHeight: "var(--line-height-normal)" }],
				base: ["var(--font-size-base)", { lineHeight: "var(--line-height-normal)" }],
				lg: ["var(--font-size-lg)", { lineHeight: "var(--line-height-normal)" }],
				xl: ["var(--font-size-xl)", { lineHeight: "var(--line-height-normal)" }],
				"2xl": ["var(--font-size-2xl)", { lineHeight: "var(--line-height-normal)" }],
				"3xl": ["var(--font-size-3xl)", { lineHeight: "var(--line-height-normal)" }],
				"4xl": ["var(--font-size-4xl)", { lineHeight: "var(--line-height-normal)" }],
				"5xl": ["var(--font-size-5xl)", { lineHeight: "var(--line-height-normal)" }],
			},
			fontWeight: {
				thin: "var(--font-weight-thin)",
				extralight: "var(--font-weight-extralight)",
				light: "var(--font-weight-light)",
				normal: "var(--font-weight-normal)",
				medium: "var(--font-weight-medium)",
				semibold: "var(--font-weight-semibold)",
				bold: "var(--font-weight-bold)",
				extrabold: "var(--font-weight-extrabold)",
				black: "var(--font-weight-black)",
			},
			lineHeight: {
				none: "var(--line-height-none)",
				tight: "var(--line-height-tight)",
				snug: "var(--line-height-snug)",
				normal: "var(--line-height-normal)",
				relaxed: "var(--line-height-relaxed)",
				loose: "var(--line-height-loose)",
			},
			letterSpacing: {
				tighter: "var(--letter-spacing-tighter)",
				tight: "var(--letter-spacing-tight)",
				normal: "var(--letter-spacing-normal)",
				wide: "var(--letter-spacing-wide)",
				wider: "var(--letter-spacing-wider)",
				widest: "var(--letter-spacing-widest)",
			},
		},
	},
	plugins: [],
};
