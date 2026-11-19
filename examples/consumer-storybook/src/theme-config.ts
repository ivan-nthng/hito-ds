import type { ThemeConfig } from '@hito-ds/react/theme-config';
// The app and Storybook import this ONE application-owned configuration.
export const themeConfig = {
  version: 1, preset: 'neutral', scheme: 'light',
  colors: { primary: '#2563EB' },
  geometry: { radius: 1, density: 'default' },
  fonts: {},
} satisfies ThemeConfig;
