import type {Meta, StoryObj} from '@storybook/react-vite';
import {TeamDisplayComponent} from './TeamDisplay';
import type {Player} from '../models/game';

const samplePlayers: Player[] = [
	{uid: '1', name: 'Alice', role: 'Merlin'},
	{uid: '2', name: 'Bob', role: 'Percival'},
	{uid: '3', name: 'Charlie', role: 'Loyal Servant'},
	{uid: '4', name: 'Diana', role: 'Mordred'},
	{uid: '5', name: 'Eve', role: 'Morgana'},
	{uid: '6', name: 'Frank', role: 'Assassin'},
	{uid: '7', name: 'Grace', role: 'Loyal Servant'},
];

const meta: Meta<typeof TeamDisplayComponent> = {
	title: 'Components/TeamDisplay',
	component: TeamDisplayComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		team: {
			description: 'Array of player names on the team',
		},
		players: {
			description: 'Optional array of player objects for enhanced display',
		},
		title: {
			description: 'Title for the team display',
			control: {type: 'text'},
		},
		showRoles: {
			description: 'Whether to show player roles (requires players prop)',
			control: {type: 'boolean'},
		},
		size: {
			description: 'Size of the player pills',
			control: {type: 'select'},
			options: ['small', 'medium', 'large'],
		},
		onPlayerClick: {
			description: 'Click handler for player pills',
			action: 'playerClicked',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie'],
	},
};

export const WithTitle: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie', 'Diana'],
		title: 'Mission Team',
	},
};

export const WithPlayers: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie'],
		players: samplePlayers,
	},
};

export const WithRoles: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie', 'Diana'],
		players: samplePlayers,
		showRoles: true,
		title: 'Mission Team',
	},
};

export const SmallSize: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
		players: samplePlayers,
		size: 'small',
		showRoles: true,
		title: 'Compact Team View',
	},
};

export const LargeSize: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie'],
		players: samplePlayers,
		size: 'large',
		showRoles: true,
		title: 'Large Team Display',
	},
};

export const Clickable: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie', 'Diana'],
		players: samplePlayers,
		title: 'Interactive Team',
		onPlayerClick: (playerName: string) => console.log(`Clicked on ${playerName}`),
	},
};

export const LargeTeam: Story = {
	args: {
		team: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'],
		players: samplePlayers,
		showRoles: true,
		title: 'Full Game Team',
	},
};

export const EmptyTeam: Story = {
	args: {
		team: [],
		title: 'No Team Selected',
	},
};

export const MissingPlayerData: Story = {
	args: {
		team: ['Alice', 'Unknown Player', 'Charlie'],
		players: samplePlayers.slice(0, 3),
		showRoles: true,
		title: 'Mixed Player Data',
	},
};
