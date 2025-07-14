import type {Meta, StoryObj} from '@storybook/react-vite';
import {PlayerComponent} from './Player';

const meta: Meta<typeof PlayerComponent> = {
	title: 'Components/Player',
	component: PlayerComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		player: {
			description: 'Player object with uid, name, and optional role',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
	},
};

export const WithRole: Story = {
	args: {
		player: {
			uid: '5678',
			name: 'Bob',
			role: 'Merlin',
		},
	},
};

export const EvilRole: Story = {
	args: {
		player: {
			uid: '9012',
			name: 'Charlie',
			role: 'Mordred',
		},
	},
};

export const LongName: Story = {
	args: {
		player: {
			uid: '3456',
			name: 'Alexandria the Great Wizard of Camelot',
			role: 'Percival',
		},
	},
};
