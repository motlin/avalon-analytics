import type {Meta, StoryObj} from '@storybook/react-vite';
import {ThemeProvider} from '../contexts/ThemeContext';
import {ThemeToggle} from './ThemeToggle';

const meta: Meta<typeof ThemeToggle> = {
	title: 'Components/ThemeToggle',
	component: ThemeToggle,
	parameters: {
		layout: 'centered',
	},
	decorators: [
		(Story) => (
			<ThemeProvider>
				<Story />
			</ThemeProvider>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithText: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<span>Toggle theme:</span>
			<ThemeToggle />
		</div>
	),
};

export const DarkBackground: Story = {
	parameters: {
		backgrounds: {
			default: 'dark',
		},
	},
	decorators: [
		(Story) => (
			<div className="dark">
				<div className="bg-background text-foreground p-4 rounded">
					<Story />
				</div>
			</div>
		),
	],
};
