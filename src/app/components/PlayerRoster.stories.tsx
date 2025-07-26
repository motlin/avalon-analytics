import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {PlayerRosterComponent} from './PlayerRoster';
import type {Player} from '../models/game';

const examplePlayers: Player[] = [
	{uid: '1', name: 'Alice'},
	{uid: '2', name: 'Bob', role: 'Merlin'},
	{uid: '3', name: 'Charlie'},
	{uid: '4', name: 'Diana', role: 'Mordred'},
	{uid: '5', name: 'Eve'},
	{uid: '6', name: 'Frank', role: 'Percival'},
];

const smallRoster: Player[] = [
	{uid: '1', name: 'Alice'},
	{uid: '2', name: 'Bob', role: 'Merlin'},
	{uid: '3', name: 'Charlie'},
];

const largeRoster: Player[] = [
	{uid: '1', name: 'Alice'},
	{uid: '2', name: 'Bob', role: 'Merlin'},
	{uid: '3', name: 'Charlie'},
	{uid: '4', name: 'Diana', role: 'Mordred'},
	{uid: '5', name: 'Eve'},
	{uid: '6', name: 'Frank', role: 'Percival'},
	{uid: '7', name: 'Grace', role: 'Lancelot'},
	{uid: '8', name: 'Henry'},
	{uid: '9', name: 'Iris', role: 'Morgana'},
	{uid: '10', name: 'Jack'},
];

const meta: Meta<typeof PlayerRosterComponent> = {
	title: 'Components/PlayerRoster',
	component: PlayerRosterComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		players: {
			description: 'Array of players to display in the roster',
		},
		showRoles: {
			description: 'Whether to show player roles in the roster',
			control: {type: 'boolean'},
		},
		size: {
			description: 'Size of the player pills',
			control: {type: 'select'},
			options: ['small', 'medium', 'large'],
		},
		onPlayerClick: {
			description: 'Click handler for when a player is clicked',
			action: 'player-clicked',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		players: examplePlayers,
	},
};

export const WithRoles: Story = {
	args: {
		players: examplePlayers,
		showRoles: true,
	},
};

export const SmallSize: Story = {
	args: {
		players: examplePlayers,
		size: 'small',
		showRoles: true,
	},
};

export const LargeSize: Story = {
	args: {
		players: examplePlayers,
		size: 'large',
		showRoles: true,
	},
};

export const SmallRoster: Story = {
	args: {
		players: smallRoster,
		showRoles: true,
	},
};

export const LargeRoster: Story = {
	args: {
		players: largeRoster,
		showRoles: true,
	},
};

export const EmptyRoster: Story = {
	args: {
		players: [],
	},
};

export const Clickable: Story = {
	args: {
		players: examplePlayers,
		showRoles: true,
		onPlayerClick: (player) => console.log('Clicked player:', player.name),
	},
};

export const WithLongNames: Story = {
	args: {
		players: [
			{uid: '1', name: 'Alexandria the Great'},
			{uid: '2', name: 'Bartholomew', role: 'Merlin the Wise'},
			{uid: '3', name: 'Constantine'},
			{uid: '4', name: 'Maximilian', role: 'Mordred the Betrayer'},
		],
		showRoles: true,
	},
};
