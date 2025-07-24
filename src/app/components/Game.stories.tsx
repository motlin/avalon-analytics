import type {Meta, StoryObj} from '@storybook/react-vite';
import Game from './Game';

const meta: Meta<typeof Game> = {
	component: Game,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
The Game component is the main coordinator for the Avalon game interface. It orchestrates the three primary game areas:

### Component Structure

1. **Missions** - Displays the five missions with their current status and history
2. **Game Participants** - Shows player lists and role information in a tabbed interface
3. **Action Pane** - Dynamic interface for current player actions based on game phase

### State Management

The Game component manages the selectedPlayers state, which tracks which players are currently selected for team proposals. This state is shared between the GameParticipants component (where selections are made) and the ActionPane component (where selections are used for actions).

### Game Flow Integration

The component receives the complete Avalon game state as props and passes the relevant portions to each child component, ensuring all parts of the interface stay in sync with the current game state.
        `,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockAvalon = (
	gamePhase: string = 'TEAM_PROPOSAL',
	missionIdx: number = 0,
	isAssassin: boolean = false,
) => ({
	game: {
		id: 'mock-game-id',
		timeCreated: new Date('2025-01-01T00:00:00Z'),
		missions: [
			{
				state: 'PENDING' as const,
				teamSize: 2,
				failsRequired: 1,
				numFails: 0,
				team: [],
				votes: [],
				proposals: [],
			},
			{
				state: 'PENDING' as const,
				teamSize: 3,
				failsRequired: 1,
				numFails: 0,
				team: [],
				votes: [],
				proposals: [],
			},
			{
				state: 'PENDING' as const,
				teamSize: 2,
				failsRequired: 1,
				numFails: 0,
				team: [],
				votes: [],
				proposals: [],
			},
			{
				state: 'PENDING' as const,
				teamSize: 3,
				failsRequired: 1,
				numFails: 0,
				team: [],
				votes: [],
				proposals: [],
			},
			{
				state: 'PENDING' as const,
				teamSize: 3,
				failsRequired: 1,
				numFails: 0,
				team: [],
				votes: [],
				proposals: [],
			},
		],
		currentMissionIdx: missionIdx,
		phase: gamePhase,
		players: [
			{uid: '1', name: 'CRAIGM'},
			{uid: '2', name: 'ZEHUA'},
			{uid: '3', name: 'VINAY'},
			{uid: '4', name: 'LUKEE'},
			{uid: '5', name: 'KEN'},
		],
		roles: ['merlin', 'percival', 'loyal', 'morgana', 'assassin'],
		currentProposer: 'CRAIGM',
		currentProposalIdx: 0,
		currentProposal: {
			team: ['CRAIGM', 'ZEHUA'],
			votes: [],
			proposer: 'CRAIGM',
			state: 'PENDING' as const,
		},
		lastProposal: null,
		hammer: 'KEN',
		currentMission: {
			teamSize: 2,
			team: [],
			failsRequired: 1,
			state: 'PENDING' as const,
		},
	},
	user: {
		name: 'CRAIGM',
	},
	lobby: {
		game: {
			id: 'mock-game-id',
			timeCreated: new Date('2025-01-01T00:00:00Z'),
			missions: [],
			players: [],
			currentMissionIdx: missionIdx,
			roles: ['merlin', 'percival', 'loyal', 'morgana', 'assassin'],
		},
		role: {
			assassin: isAssassin,
		},
	},
	config: {
		roleMap: {
			merlin: {name: 'Merlin', team: 'good' as const, description: 'Knows who the evil players are'},
			percival: {name: 'Percival', team: 'good' as const, description: 'Knows who Merlin and Morgana are'},
			loyal: {name: 'Loyal Servant', team: 'good' as const, description: 'A loyal servant of Arthur'},
			morgana: {name: 'Morgana', team: 'evil' as const, description: 'Appears as Merlin to Percival'},
			assassin: {name: 'Assassin', team: 'evil' as const, description: 'Can assassinate Merlin'},
		},
	},
});

export const TeamProposal: Story = {
	args: {
		avalon: createMockAvalon('TEAM_PROPOSAL', 0),
	},
};

export const ProposalVote: Story = {
	args: {
		avalon: createMockAvalon('PROPOSAL_VOTE', 0),
	},
};

export const MissionVote: Story = {
	args: {
		avalon: createMockAvalon('MISSION_VOTE', 0),
	},
};

export const Assassination: Story = {
	args: {
		avalon: createMockAvalon('ASSASSINATION', 4, true),
	},
};
