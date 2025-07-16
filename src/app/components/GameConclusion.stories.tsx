import type {Meta, StoryObj} from '@storybook/react-vite';
import {GameConclusionComponent} from './GameConclusion';

const meta: Meta<typeof GameConclusionComponent> = {
	title: 'Components/GameConclusion',
	component: GameConclusionComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		winner: {
			control: {type: 'radio'},
			options: ['GOOD', 'EVIL'],
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GoodWinSimple: Story = {
	args: {
		winner: 'GOOD',
		reason: 'Good team completed 3 successful missions',
	},
};

export const EvilWinSimple: Story = {
	args: {
		winner: 'EVIL',
		reason: 'Evil team sabotaged 3 missions',
	},
};

export const AssassinationVictory: Story = {
	args: {
		winner: 'EVIL',
		reason: 'Assassin correctly identified Merlin',
		assassinated: 'Alice',
	},
};

export const GoodWinWithRoles: Story = {
	args: {
		winner: 'GOOD',
		reason: 'Good team completed 3 successful missions',
		roles: [
			{name: 'Alice', role: 'Merlin'},
			{name: 'Bob', role: 'Percival'},
			{name: 'Charlie', role: 'Loyal Servant of Arthur'},
			{name: 'Diana', role: 'Mordred'},
			{name: 'Eve', role: 'Morgana'},
			{name: 'Frank', role: 'Assassin', assassin: true},
		],
	},
};

export const EvilWinWithRoles: Story = {
	args: {
		winner: 'EVIL',
		reason: 'Evil team sabotaged 3 missions',
		roles: [
			{name: 'Alice', role: 'Merlin'},
			{name: 'Bob', role: 'Percival'},
			{name: 'Charlie', role: 'Loyal Servant of Arthur'},
			{name: 'Diana', role: 'Mordred'},
			{name: 'Eve', role: 'Morgana'},
			{name: 'Frank', role: 'Assassin', assassin: true},
		],
	},
};

export const AssassinationWithFullRoles: Story = {
	args: {
		winner: 'EVIL',
		reason: 'Assassin correctly identified Merlin',
		assassinated: 'Player 1',
		roles: [
			{name: 'Player 1', role: 'Merlin'},
			{name: 'Player 2', role: 'Percival'},
			{name: 'Player 3', role: 'Loyal Servant of Arthur'},
			{name: 'Player 4', role: 'Loyal Servant of Arthur'},
			{name: 'Player 5', role: 'Mordred'},
			{name: 'Player 6', role: 'Assassin', assassin: true},
			{name: 'Player 7', role: 'Minion of Mordred'},
		],
	},
};

export const TenPlayerGame: Story = {
	args: {
		winner: 'GOOD',
		reason: 'Good team completed 3 successful missions',
		roles: [
			{name: 'Player 1', role: 'Merlin'},
			{name: 'Player 2', role: 'Percival'},
			{name: 'Player 3', role: 'Loyal Servant of Arthur'},
			{name: 'Player 4', role: 'Loyal Servant of Arthur'},
			{name: 'Player 5', role: 'Loyal Servant of Arthur'},
			{name: 'Player 6', role: 'Loyal Servant of Arthur'},
			{name: 'Player 7', role: 'Mordred'},
			{name: 'Player 8', role: 'Morgana'},
			{name: 'Player 9', role: 'Assassin', assassin: true},
			{name: 'Player 10', role: 'Oberon'},
		],
	},
};

export const FiveFailedProposals: Story = {
	args: {
		winner: 'EVIL',
		reason: 'Five proposals rejected in a row - Evil wins!',
		roles: [
			{name: 'Alice', role: 'Merlin'},
			{name: 'Bob', role: 'Loyal Servant of Arthur'},
			{name: 'Charlie', role: 'Loyal Servant of Arthur'},
			{name: 'Diana', role: 'Mordred'},
			{name: 'Eve', role: 'Assassin', assassin: true},
		],
	},
};

export const LongPlayerNames: Story = {
	args: {
		winner: 'GOOD',
		reason: 'Good team completed 3 successful missions',
		roles: [
			{name: 'Alexander the Great', role: 'Merlin'},
			{name: 'Christopher Columbus', role: 'Percival'},
			{name: 'Leonardo da Vinci', role: 'Loyal Servant of Arthur'},
			{name: 'Napoleon Bonaparte', role: 'Mordred'},
			{name: 'Queen Elizabeth I', role: 'Morgana'},
			{name: 'William Shakespeare', role: 'Assassin', assassin: true},
		],
	},
};
