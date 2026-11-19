import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = { staticDirs: ['../public'], stories: ['../src/**/*.stories.@(ts|tsx)'], framework: '@storybook/react-vite' };
export default config;
