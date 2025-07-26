import type {Meta, StoryObj} from '@storybook/react-vite';
import ActionPane from './ActionPane';

const meta: Meta<typeof ActionPane> = {
	component: ActionPane,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The ActionPane component is the primary interface for player actions during an Avalon game. It dynamically displays the appropriate action interface based on the current game state and the player's role.

### Action Types

The component handles four main action types:

1. **Team Proposal** - When you're the proposer, select team members for the mission
2. **Team Voting** - Vote to approve or reject the proposed team
3. **Mission Action** - If you're on the mission team, choose to succeed or fail
4. **Assassination** - If you're the Assassin and evil wins, attempt to identify Merlin

### Game Flow

The ActionPane automatically determines which action to display based on:
- Current game phase (proposal, voting, mission, assassination)
- Player's role and permissions
- Whether the player has already taken their action

### Spectator Mode

When viewing as a spectator or after taking your action, the component displays the current game state without interactive elements.
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		avalon: {
			game: {
				id: 'game-1',
				timeCreated: new Date('2024-01-01'),
				players: [{uid: '1', name: 'Alice'}],
				missions: [],
				currentProposalIdx: 0,
				currentProposer: 'Alice',
				currentMission: {
					teamSize: 3,
					failsRequired: 1,
					proposals: [],
					state: 'PENDING',
					team: [],
					votes: [],
				},
			},
			user: {name: 'Alice'},
			lobby: {
				game: {
					id: 'game-1',
					timeCreated: new Date('2024-01-01'),
					players: [{uid: '1', name: 'Alice'}],
					missions: [],
					phase: 'TEAM_PROPOSAL',
					currentMission: {
						teamSize: 3,
						failsRequired: 1,
						proposals: [],
						state: 'PENDING',
						team: [],
						votes: [],
					},
				},
			},
			config: {
				roleMap: {},
			},
			proposeTeam: () => {},
		},
		selectedPlayers: [],
	},
};
