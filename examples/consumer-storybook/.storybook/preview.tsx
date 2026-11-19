import type { Preview } from '@storybook/react-vite';
import { ThemeRuntime } from '../src/ThemeRuntime';
import '../src/global.css';
const preview: Preview = {
  decorators: [(Story) => <ThemeRuntime><Story /></ThemeRuntime>],
  parameters: { layout: 'padded' },
};
export default preview;
