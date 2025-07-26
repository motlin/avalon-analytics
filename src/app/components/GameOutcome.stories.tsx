import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {GameOutcomeComponent} from './GameOutcome';

const meta: Meta<typeof GameOutcomeComponent> = {
	title: 'Components/GameOutcome',
	component: GameOutcomeComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GoodWin: Story = {
	args: {
		outcome: {
			state: 'GOOD_WIN',
			message: 'Good team completed 3 successful missions',
		},
	},
};

export const EvilWin: Story = {
	args: {
		outcome: {
			state: 'EVIL_WIN',
			message: 'Evil team sabotaged 3 missions',
		},
	},
};

export const AssassinationWin: Story = {
	args: {
		outcome: {
			state: 'EVIL_WIN',
			message: 'Assassin correctly identified Merlin',
			assassinated: 'Alice',
		},
	},
};

export const WithRevealedRoles: Story = {
	args: {
		outcome: {
			state: 'GOOD_WIN',
			message: 'Good team completed 3 successful missions',
			roles: [
				{name: 'Alice', role: 'Merlin'},
				{name: 'Bob', role: 'Percival'},
				{name: 'Charlie', role: 'Loyal Servant of Arthur'},
				{name: 'Diana', role: 'Mordred'},
				{name: 'Eve', role: 'Morgana'},
				{name: 'Frank', role: 'Assassin', assassin: true},
			],
		},
	},
};

export const LargeGame: Story = {
	args: {
		outcome: {
			state: 'EVIL_WIN',
			message: 'Evil team sabotaged 3 missions',
			roles: [
				{name: 'Player 1', role: 'Merlin'},
				{name: 'Player 2', role: 'Percival'},
				{name: 'Player 3', role: 'Loyal Servant of Arthur'},
				{name: 'Player 4', role: 'Loyal Servant of Arthur'},
				{name: 'Player 5', role: 'Loyal Servant of Arthur'},
				{name: 'Player 6', role: 'Mordred'},
				{name: 'Player 7', role: 'Morgana'},
				{name: 'Player 8', role: 'Assassin', assassin: true},
				{name: 'Player 9', role: 'Minion of Mordred'},
				{name: 'Player 10', role: 'Oberon'},
			],
		},
	},
};
