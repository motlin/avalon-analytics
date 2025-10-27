import type {Meta, StoryObj} from '@storybook/react-vite';
import GamePlayerList from './GamePlayerList';

const meta: Meta<typeof GamePlayerList> = {
	title: 'Game/GamePlayerList',
	component: GamePlayerList,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `GamePlayerList shows the status of all players during an active Avalon game.

## Features
- Displays all players in game order
- Shows current proposer with visual indicator
- Highlights team members in current proposal
- Tracks voting status with checkmarks
- Identifies the hammer (5th proposer)
- Enables player selection for certain actions

## Game Phases
The component adapts its display based on the current game phase:
- **Team Proposal**: Proposer can select team members
- **Proposal Vote**: Shows who has voted
- **Mission Vote**: Shows team members on mission
- **Assassination**: Assassin can select target

## Visual Indicators
- 📝 Current proposer
- 🔨 Hammer (forced approval on 5th proposal)
- ✅ Player has voted
- Highlighted background for team members

## Usage
\`\`\`tsx
import GamePlayerList from './GamePlayerList';

function Game() {
  return (
    <GamePlayerList
      avalon={avalonApi}
      onSelectedPlayers={(players) => handleSelection(players)}
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
			description: 'Avalon API object containing game state and player information',
			control: {type: 'object'},
		},
		onSelectedPlayers: {
			description: 'Callback function when players are selected (during team proposal or assassination)',
			action: 'onSelectedPlayers',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (overrides = {}) => ({
	game: {
		players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
		phase: 'TEAM_PROPOSAL',
		currentProposer: 'CRAIGM',
		currentProposalIdx: 0,
		currentMission: {
			teamSize: 3,
		},
		currentProposal: {
			team: ['CRAIGM', 'ZEHUA', 'VINAY'],
			votes: ['CRAIGM', 'ZEHUA'],
		},
		lastProposal: null,
		hammer: 'KEN',
	},
	user: {
		name: 'CRAIGM',
	},
	lobby: {
		role: {
			assassin: false,
		},
	},
	...overrides,
});

export const TeamProposal: Story = {
	args: {
		avalon: createMockAvalon(),
		onSelectedPlayers: (players: string[]) => {
			console.log('Selected players:', players);
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Team proposal phase where ALICE is selecting team members. Shows the proposer indicator and current team selection.',
			},
		},
	},
};

export const ProposalVoting: Story = {
	args: {
		avalon: createMockAvalon({
			game: {
				players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				phase: 'PROPOSAL_VOTE',
				currentProposer: 'CRAIGM',
				currentProposalIdx: 0,
				currentMission: {
					teamSize: 3,
				},
				currentProposal: {
					team: ['CRAIGM', 'ZEHUA', 'VINAY'],
					votes: ['CRAIGM', 'ZEHUA'],
				},
				lastProposal: null,
				hammer: 'KEN',
			},
		}),
		onSelectedPlayers: (players: string[]) => {
			console.log('Selected players:', players);
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Voting phase showing proposed team members highlighted and checkmarks for players who have already voted.',
			},
		},
	},
};

export const MissionVoting: Story = {
	args: {
		avalon: createMockAvalon({
			game: {
				players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				phase: 'MISSION_VOTE',
				currentProposer: 'CRAIGM',
				currentProposalIdx: 0,
				currentMission: {
					teamSize: 3,
				},
				currentProposal: {
					team: ['CRAIGM', 'ZEHUA', 'VINAY'],
					votes: ['CRAIGM', 'ZEHUA'],
				},
				lastProposal: null,
				hammer: 'KEN',
			},
		}),
		onSelectedPlayers: (players: string[]) => {
			console.log('Selected players:', players);
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Mission phase where team members are deciding to pass or fail. Shows which players have submitted their mission votes.',
			},
		},
	},
};

export const Assassination: Story = {
	args: {
		avalon: createMockAvalon({
			game: {
				players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				phase: 'ASSASSINATION',
				currentProposer: 'CRAIGM',
				currentProposalIdx: 0,
				currentMission: {
					teamSize: 3,
				},
				currentProposal: {
					team: ['CRAIGM', 'ZEHUA', 'VINAY'],
					votes: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				},
				lastProposal: {
					team: ['CRAIGM', 'ZEHUA', 'LUKEE'],
					votes: ['CRAIGM', 'ZEHUA', 'VINAY'],
				},
				hammer: 'KEN',
			},
			lobby: {
				role: {
					assassin: true,
				},
			},
		}),
		onSelectedPlayers: (players: string[]) => {
			console.log('Selected players:', players);
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Assassination phase where the assassin (viewing player) can select who they think is Merlin. Critical endgame moment.',
			},
		},
	},
};

export const HammerTime: Story = {
	args: {
		avalon: createMockAvalon({
			game: {
				players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
				phase: 'TEAM_PROPOSAL',
				currentProposer: 'KEN',
				currentProposalIdx: 4,
				currentMission: {
					teamSize: 3,
				},
				currentProposal: {
					team: [],
					votes: [],
				},
				lastProposal: {
					team: ['CRAIGM', 'ZEHUA', 'LUKEE'],
					votes: ['CRAIGM', 'ZEHUA'],
				},
				hammer: 'KEN',
			},
			user: {
				name: 'KEN',
			},
		}),
		onSelectedPlayers: (players: string[]) => {
			console.log('Selected players:', players);
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'The 5th and final proposal attempt. EVE is both proposer and hammer - if this proposal is rejected, evil wins automatically.',
			},
		},
	},
};
