import type {Meta, StoryObj} from '@storybook/react-vite';
import GameParticipants from './GameParticipants';

const meta: Meta<typeof GameParticipants> = {
	title: 'Game/GameParticipants',
	component: GameParticipants,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `GameParticipants displays the list of players in an Avalon game with their roles and status.

## Features
- Shows all players in the game
- Displays current proposer and hammer
- Highlights team members during proposals
- Shows vote status during voting phases
- Provides role information for each player
- Supports player selection for team proposals

## Usage

\`\`\`tsx
import GameParticipants from './GameParticipants';

function Game() {
  return (
    <GameParticipants
      avalon={avalonApi}
      onSelectedPlayers={(players) => console.log('Selected:', players)}
    />
  );
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		avalon: {
			description: 'The Avalon game API object containing game state, user info, and configuration',
			control: {type: 'object'},
		},
		onSelectedPlayers: {
			description: 'Callback function triggered when players are selected during team proposal phase',
			action: 'onSelectedPlayers',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (overrides = {}) => ({
	game: {
		players: ['ALICE', 'BOB', 'CHARLIE', 'DIANA', 'EVE'],
		phase: 'TEAM_PROPOSAL',
		currentProposer: 'ALICE',
		currentProposalIdx: 0,
		currentMission: {
			teamSize: 3,
		},
		currentProposal: {
			team: ['ALICE', 'BOB', 'CHARLIE'],
			votes: ['ALICE', 'BOB'],
		},
		lastProposal: null,
		hammer: 'EVE',
		roles: ['merlin', 'percival', 'loyal_follower', 'morgana', 'evil_minion'],
	},
	user: {
		name: 'ALICE',
	},
	lobby: {
		role: {
			assassin: false,
		},
		game: {
			players: ['ALICE', 'BOB', 'CHARLIE', 'DIANA', 'EVE'],
			phase: 'TEAM_PROPOSAL',
			currentProposer: 'ALICE',
			currentProposalIdx: 0,
			currentMission: {
				teamSize: 3,
			},
			currentProposal: {
				team: ['ALICE', 'BOB', 'CHARLIE'],
				votes: ['ALICE', 'BOB'],
			},
			lastProposal: null,
			hammer: 'EVE',
			roles: ['merlin', 'percival', 'loyal_follower', 'morgana', 'evil_minion'],
		},
	},
	config: {
		roleMap: {
			merlin: {
				name: 'Merlin',
				team: 'good' as const,
				description: 'Merlin sees all evil people (except for Mordred), but can also be assassinated.',
			},
			percival: {
				name: 'Percival',
				team: 'good' as const,
				description: 'Percival can see Merlin and Morgana but does not know which one is which.',
			},
			loyal_follower: {
				name: 'Loyal Follower',
				team: 'good' as const,
				description: 'Loyal Follower is a genuinely good person.',
			},
			morgana: {
				name: 'Morgana',
				team: 'evil' as const,
				description:
					'Morgana appears indistinguishable from Merlin to Percival. She sees other evil people (except Oberon)',
			},
			evil_minion: {
				name: 'Evil Minion',
				team: 'evil' as const,
				description: 'Evil Minion is pretty evil. He can see other evil people (except Oberon)',
			},
		},
	},
	...overrides,
});

export const Default: Story = {
	args: {
		avalon: createMockAvalon(),
		onSelectedPlayers: (players: string[]) => console.log('Selected players:', players),
	},
	parameters: {
		docs: {
			description: {
				story: 'The default state during team proposal phase with the current proposer (ALICE) selecting team members.',
			},
		},
	},
};

export const DuringMission: Story = {
	args: {
		avalon: createMockAvalon({
			game: {
				players: ['ALICE', 'BOB', 'CHARLIE', 'DIANA', 'EVE'],
				phase: 'MISSION',
				currentProposer: 'BOB',
				currentProposalIdx: 1,
				currentMission: {
					teamSize: 4,
				},
				currentProposal: {
					team: ['BOB', 'CHARLIE', 'DIANA', 'EVE'],
					votes: ['ALICE', 'BOB', 'CHARLIE', 'DIANA', 'EVE'],
				},
				lastProposal: {
					team: ['ALICE', 'BOB', 'CHARLIE'],
					votes: ['ALICE', 'BOB'],
				},
				hammer: 'CHARLIE',
				roles: ['merlin', 'percival', 'loyal_follower', 'morgana', 'evil_minion'],
			},
		}),
		onSelectedPlayers: (players: string[]) => console.log('Selected players:', players),
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows the component during an active mission phase. The team has been approved and is on a mission. Players cannot be selected during this phase.',
			},
		},
	},
};

export const HammerTime: Story = {
	args: {
		avalon: createMockAvalon({
			game: {
				players: ['ALICE', 'BOB', 'CHARLIE', 'DIANA', 'EVE'],
				phase: 'TEAM_PROPOSAL',
				currentProposer: 'EVE',
				currentProposalIdx: 4,
				currentMission: {
					teamSize: 3,
				},
				currentProposal: {
					team: ['EVE', 'ALICE', 'BOB'],
					votes: [],
				},
				lastProposal: {
					team: ['CHARLIE', 'DIANA', 'EVE'],
					votes: ['CHARLIE', 'DIANA'],
				},
				hammer: 'EVE',
				roles: ['merlin', 'percival', 'loyal_follower', 'morgana', 'evil_minion'],
			},
		}),
		onSelectedPlayers: (players: string[]) => console.log('Selected players:', players),
	},
	parameters: {
		docs: {
			description: {
				story: 'The hammer scenario - this is the 5th proposal for a mission. EVE is both the current proposer and the hammer. If this proposal is rejected, the mission automatically fails and evil wins.',
			},
		},
	},
};
