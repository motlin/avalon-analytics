import type {Meta, StoryObj} from '@storybook/react-vite';
import TeamProposalAction from './TeamProposalAction';

const meta: Meta<typeof TeamProposalAction> = {
	title: 'Game/Actions/TeamProposalAction',
	component: TeamProposalAction,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The TeamProposalAction component allows the current proposer to select team members for a mission. This is a critical game mechanic where strategy and deduction come into play.

### Functionality

- **Player Selection** - Click players to add/remove from the proposed team
- **Team Size Validation** - Enforces the required team size for the current mission
- **Submit Button** - Only enabled when exactly the right number of players are selected
- **Visual Feedback** - Selected players are highlighted for clarity

### Game Rules

- Only the current proposer can interact with this component
- Team size varies by mission number and player count
- Other players see a read-only view while waiting
- If rejected, the proposal passes to the next player

### Strategic Considerations

Team selection is crucial in Avalon:
- Good players want teams without evil members
- Evil players want to infiltrate teams
- Players must balance trust, deduction, and voting patterns
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockGame = {
	id: 'proposal-game-1',
	timeCreated: new Date('2024-01-01'),
	players: [{uid: '1', name: 'CRAIGM'}],
	missions: [],
	currentProposalIdx: 0,
	currentProposer: 'CRAIGM',
	currentMission: {
		teamSize: 3,
		failsRequired: 1,
		proposals: [],
		state: 'PENDING' as const,
		team: [],
		votes: [],
	},
};

const mockAvalon = {
	game: mockGame,
	user: {
		name: 'CRAIGM',
	},
	config: {
		roleMap: {},
	},
	lobby: {
		game: mockGame,
	},
	proposeTeam: (playerList: string[]) => {
		console.log('Proposing team:', playerList);
	},
};

const mockAvalonAsSpectator = {
	...mockAvalon,
	user: {
		name: 'ZEHUA',
	},
};

export const AsProposer: Story = {
	args: {
		avalon: mockAvalon,
		playerList: ['CRAIGM', 'ZEHUA', 'VINAY'],
	},
};

export const AsProposerInvalidSelection: Story = {
	args: {
		avalon: mockAvalon,
		playerList: ['CRAIGM', 'ZEHUA'],
	},
};

export const AsProposerEmptySelection: Story = {
	args: {
		avalon: mockAvalon,
		playerList: [],
	},
};

export const AsSpectator: Story = {
	args: {
		avalon: mockAvalonAsSpectator,
		playerList: [],
	},
};

export const LaterProposal: Story = {
	args: {
		avalon: {
			...mockAvalon,
			game: {
				...mockAvalon.game,
				currentProposalIdx: 3,
				currentMission: {
					teamSize: 4,
					failsRequired: 2,
					proposals: [],
					state: 'PENDING' as const,
					team: [],
					votes: [],
				},
			},
			lobby: {
				game: {
					...mockAvalon.game,
					currentProposalIdx: 3,
					currentMission: {
						teamSize: 4,
						failsRequired: 2,
						proposals: [],
						state: 'PENDING' as const,
						team: [],
						votes: [],
					},
				},
			},
		},
		playerList: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE'],
	},
};

export const Interactive: Story = {
	args: {
		avalon: {
			...mockAvalon,
			proposeTeam: (playerList: string[]) => {
				alert(`Proposing team: ${playerList.join(', ')}`);
			},
		},
		playerList: ['CRAIGM', 'ZEHUA', 'VINAY'],
	},
};
