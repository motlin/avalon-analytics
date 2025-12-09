import type {Meta, StoryObj} from '@storybook/react-vite';
import GameInterface from './GameInterface';

const meta: Meta<typeof GameInterface> = {
	title: 'Gameplay/GameInterface',
	component: GameInterface,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component: `
The GameInterface component is the main coordinator for the Avalon game interface. It orchestrates the three primary game areas:

### Component Structure

1. **Missions** - Displays the five missions with their current status and history
2. **Game Participants** - Shows player lists and role information in a tabbed interface
3. **Action Pane** - Dynamic interface for current player actions based on game phase

### State Management

The GameInterface component manages the selectedPlayers state, which tracks which players are currently selected for team proposals. This state is shared between the GameParticipants component (where selections are made) and the ActionPane component (where selections are used for actions).

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
		id: '1',
		players: ['CRAIGM', 'ZEHUA', 'VINAY', 'LUKEE', 'KEN'],
		timeCreated: new Date(),
		currentMissionIdx: missionIdx,
		phase: gamePhase,
		roles: ['merlin', 'percival', 'loyal', 'morgana', 'assassin'],
		currentProposer: 'CRAIGM',
		currentProposalIdx: 0,
		currentProposal: {
			team: ['CRAIGM', 'ZEHUA'],
			votes: [],
			state: 'PENDING',
		},
		currentMission: {
			teamSize: 2,
			team: [],
			votes: [],
			state: 'PENDING',
			failsRequired: 1,
			proposals: [],
		},
	},
	user: {
		name: 'CRAIGM',
	},
	lobby: {
		game: {
			missions: [],
			players: [],
			id: '1',
			timeCreated: new Date(),
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
		avalon: createMockAvalon('TEAM_PROPOSAL', 0) as any,
	},
};

export const ProposalVote: Story = {
	args: {
		avalon: createMockAvalon('PROPOSAL_VOTE', 0) as any,
	},
};

export const MissionVote: Story = {
	args: {
		avalon: createMockAvalon('MISSION_VOTE', 0) as any,
	},
};

export const Assassination: Story = {
	args: {
		avalon: createMockAvalon('ASSASSINATION', 4, true) as any,
	},
};
