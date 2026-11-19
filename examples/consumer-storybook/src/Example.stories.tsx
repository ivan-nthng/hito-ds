import type { Meta, StoryObj } from '@storybook/react-vite';
import { Example } from './Example';
const meta = { title: 'App/Example', component: Example, args: { actionLabel: 'Save' } } satisfies Meta<typeof Example>;
export default meta;
export const Default: StoryObj<typeof meta> = {};
