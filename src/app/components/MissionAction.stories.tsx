import type {Meta, StoryObj} from '@storybook/react-vite';
import MissionAction from './MissionAction';

const meta = {
	component: MissionAction,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The MissionAction component is where team members secretly decide the fate of missions. This is the core mechanic that determines the outcome of each round.

### Mission Rules

- **Good Players** - Can only choose SUCCESS ✓
- **Evil Players** - Can choose SUCCESS ✓ or FAIL ✗
- **Secret Ballots** - Choices are shuffled before reveal
- **Fail Threshold** - Usually 1 fail = mission failure (2 required on 4th mission with 7+ players)

### Component States

1. **Active Voting** - Shows success/fail buttons for team members
2. **Waiting** - Non-team members see waiting message
3. **Already Voted** - Confirmation after submitting your choice

### Strategic Depth

Mission voting creates complex decisions:
- Evil players must decide when to fail missions
- Failing too early reveals your identity
- Failing too late may lose the game
- Good players have no choice but provide cover for evil
- The number of fails can reveal team composition
        `,
			},
		},
	},
	argTypes: {
		avalon: {
			description: 'Avalon game state object with mission voting interface',
		},
	},
	tags: ['autodocs'],
} satisfies Meta<typeof MissionAction>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDoMission = (vote: boolean) => {
	console.log('Mission vote:', vote);
};

export const NeedsToVote: Story = {
	args: {
		avalon: {
			user: {
				name: 'CRAIGM',
			},
			game: {
				missions: [],
				players: [],
				id: '1',
				timeCreated: new Date(),
			},
			config: {
				roleMap: {},
			},
			lobby: {
				game: {
					missions: [],
					players: [],
					id: '1',
					timeCreated: new Date(),
					currentProposal: {
						team: ['CRAIGM', 'ZEHUA', 'VINAY'],
						votes: [],
						state: 'APPROVED',
					},
					currentMission: {
						team: [],
						votes: [],
						state: 'PENDING',
						failsRequired: 1,
						teamSize: 3,
						proposals: [],
					},
				},
			},
			doMission: mockDoMission,
		},
	},
};

export const WaitingForOthers: Story = {
	args: {
		avalon: {
			user: {
				name: 'LUKEE',
			},
			game: {
				missions: [],
				players: [],
				id: '1',
				timeCreated: new Date(),
			},
			config: {
				roleMap: {},
			},
			lobby: {
				game: {
					missions: [],
					players: [],
					id: '1',
					timeCreated: new Date(),
					currentProposal: {
						team: ['CRAIGM', 'ZEHUA', 'VINAY'],
						votes: [],
						state: 'APPROVED',
					},
					currentMission: {
						team: ['CRAIGM'],
						votes: [],
						state: 'PENDING',
						failsRequired: 1,
						teamSize: 3,
						proposals: [],
					},
				},
			},
			doMission: mockDoMission,
		},
	},
};

export const SinglePlayerWaiting: Story = {
	args: {
		avalon: {
			user: {
				name: 'LUKEE',
			},
			game: {
				missions: [],
				players: [],
				id: '1',
				timeCreated: new Date(),
			},
			config: {
				roleMap: {},
			},
			lobby: {
				game: {
					missions: [],
					players: [],
					id: '1',
					timeCreated: new Date(),
					currentProposal: {
						team: ['CRAIGM', 'ZEHUA'],
						votes: [],
						state: 'APPROVED',
					},
					currentMission: {
						team: ['CRAIGM'],
						votes: [],
						state: 'PENDING',
						failsRequired: 1,
						teamSize: 2,
						proposals: [],
					},
				},
			},
			doMission: mockDoMission,
		},
	},
};
