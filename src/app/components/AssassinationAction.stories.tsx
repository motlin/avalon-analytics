import type {Meta, StoryObj} from '@storybook/react-vite';
import AssassinationAction from './AssassinationAction';

const meta: Meta<typeof AssassinationAction> = {
	title: 'Endgame/AssassinationAction',
	component: AssassinationAction,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The AssassinationAction component handles the final phase of an Avalon game where the Assassin attempts to identify Merlin after the good team completes three missions.

### Game Context

This component only appears when:
- The good team has successfully completed three missions
- The game phase is set to 'ASSASSINATION'
- The current player is the Assassin

### Interaction

- **Assassin players** see a button to select and assassinate their target
- **Other players** see a waiting message while the Assassin makes their choice
- The component validates that exactly one target is selected
- Players cannot target themselves

### Victory Conditions

- If the Assassin correctly identifies Merlin, the evil team wins
- If the Assassin chooses incorrectly, the good team wins
- This makes the assassination phase crucial for determining the final outcome
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockAssassinate = async (target: string) => {
	console.log('Assassinating:', target);
	await new Promise((resolve) => setTimeout(resolve, 1000));
};

const mockGame = {
	id: 'game-1',
	timeCreated: new Date('2024-01-01'),
	players: [{uid: '1', name: 'CRAIGM'}],
	missions: [],
};

export const AssassinView: Story = {
	args: {
		avalon: {
			game: mockGame,
			lobby: {
				game: mockGame,
				role: {
					role: {
						name: 'ASSASSIN',
						team: 'evil',
						description: 'You can see evil players and must identify Merlin',
					},
					assassin: true,
					sees: ['MORGANA', 'EVIL MINION'],
				},
			},
			user: {
				name: 'CRAIGM',
			},
			config: {
				roleMap: {},
			},
			assassinate: mockAssassinate,
		},
		playerList: ['ZEHUA'],
	},
};

export const AssassinNoTarget: Story = {
	args: {
		avalon: {
			game: mockGame,
			lobby: {
				game: mockGame,
				role: {
					role: {
						name: 'ASSASSIN',
						team: 'evil',
						description: 'You can see evil players and must identify Merlin',
					},
					assassin: true,
					sees: ['MORGANA', 'EVIL MINION'],
				},
			},
			user: {
				name: 'CRAIGM',
			},
			config: {
				roleMap: {},
			},
			assassinate: mockAssassinate,
		},
		playerList: [],
	},
};

export const AssassinSelfSelected: Story = {
	args: {
		avalon: {
			game: mockGame,
			lobby: {
				game: mockGame,
				role: {
					role: {
						name: 'ASSASSIN',
						team: 'evil',
						description: 'You can see evil players and must identify Merlin',
					},
					assassin: true,
					sees: ['MORGANA', 'EVIL MINION'],
				},
			},
			user: {
				name: 'CRAIGM',
			},
			config: {
				roleMap: {},
			},
			assassinate: mockAssassinate,
		},
		playerList: ['CRAIGM'],
	},
};

export const NonAssassinView: Story = {
	args: {
		avalon: {
			game: mockGame,
			lobby: {
				game: mockGame,
				role: {
					role: {
						name: 'LOYAL FOLLOWER',
						team: 'good',
						description: 'You serve Arthur loyally',
					},
					assassin: false,
					sees: [],
				},
			},
			user: {
				name: 'ZEHUA',
			},
			config: {
				roleMap: {},
			},
			assassinate: mockAssassinate,
		},
		playerList: ['CRAIGM'],
	},
};
