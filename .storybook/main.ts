import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
	addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	docs: {
		autodocs: true,
		defaultName: "Documentation",
	},
	core: {
		builder: "@storybook/builder-vite",
		disableTelemetry: true,
	},
	typescript: {
		reactDocgen: "react-docgen",
		check: false,
	},
	async viteFinal(config) {
		return mergeConfig(config, {
			define: {
				global: "window",
			},
			resolve: {
				alias: {
					"@": "/src",
				},
			},
			optimizeDeps: {
				include: ["react", "react-dom"],
			},
		});
	},
};

export default config;
