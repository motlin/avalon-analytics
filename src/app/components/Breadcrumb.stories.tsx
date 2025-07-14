import type {Meta, StoryObj} from '@storybook/react-vite';
import {Breadcrumb} from './Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
	title: 'Components/Breadcrumb',
	component: Breadcrumb,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		items: {
			description: 'Array of breadcrumb items with label and optional href',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		items: [{label: 'Home', href: '/'}, {label: 'Games', href: '/games'}, {label: 'Game Detail'}],
	},
};

export const TwoItems: Story = {
	args: {
		items: [{label: 'Dashboard', href: '/dashboard'}, {label: 'Settings'}],
	},
};

export const SingleItem: Story = {
	args: {
		items: [{label: 'Current Page'}],
	},
};

export const LongPath: Story = {
	args: {
		items: [
			{label: 'Home', href: '/'},
			{label: 'Games', href: '/games'},
			{label: 'Avalon', href: '/games/avalon'},
			{label: 'Session 123', href: '/games/avalon/123'},
			{label: 'Mission 3'},
		],
	},
};

export const NoLinks: Story = {
	args: {
		items: [{label: 'Step 1'}, {label: 'Step 2'}, {label: 'Step 3'}],
	},
};
