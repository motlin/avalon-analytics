import type {Meta, StoryObj} from '@storybook/react-vite';
import MissionSummaryTable from './MissionSummaryTable';
import {realGamePlayers, realGameRoles, realGameMissions, realGameMissionVotes} from '../test-data/realGameData';

const meta: Meta<typeof MissionSummaryTable> = {
	component: MissionSummaryTable,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The MissionSummaryTable provides a comprehensive overview of game history, showing all missions, proposals, votes, and outcomes in a structured table format. This is essential for analyzing gameplay patterns and making informed decisions.

### Table Structure

**Columns:**
- **Mission Number** - Shows mission 1-5 with team size requirements
- **Player Rows** - One row per player showing their participation
- **Proposal Tracking** - Numbered proposals with vote outcomes
- **Mission Results** - Success/Fail indicators with fail counts

### Visual Indicators

- **✓** - Player approved the proposal
- **✗** - Player rejected the proposal
- **👑** - Player was the proposer
- **Color Coding** - Green for success, red for failure
- **Team Highlights** - Selected team members are highlighted
- **Role Display** - Shows roles when game is complete

### Information Analysis

The table helps players:
- Track voting patterns to identify alliances
- See who proposed which teams
- Analyze mission participation and outcomes
- Review the complete game history at a glance
- Understand why certain decisions were made

### Post-Game Analysis

When roles are revealed, the table becomes a powerful tool for understanding the game dynamics and learning from player behaviors.
        `,
			},
		},
	},
	argTypes: {
		players: {
			control: 'object',
			description: 'Array of player names',
		},
		missions: {
			control: 'object',
			description: 'Array of mission objects with proposals and teams',
		},
		roles: {
			control: 'object',
			description: 'Optional array of player roles',
		},
		missionVotes: {
			control: 'object',
			description: 'Optional mission voting results',
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RealGameComplete: Story = {
	args: {
		players: realGamePlayers,
		missions: realGameMissions,
		roles: realGameRoles,
		missionVotes: realGameMissionVotes,
	},
};

export const RealGameNoRoles: Story = {
	args: {
		players: realGamePlayers,
		missions: realGameMissions,
		missionVotes: realGameMissionVotes,
	},
};
