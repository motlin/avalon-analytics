import type {Meta, StoryObj} from '@storybook/react-vite';
import MissionSummaryTable from './MissionSummaryTable';
import {realGame} from '../test-data/realGameData';

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
- **Player Name** - Each row represents a player
- **Role** - Shows player's role when game is complete
- **Proposal Cells** - Each proposal shows proposer (yellow), team members (blue circle), and vote (thumbs up/down)
- **Mission Result** - Check/X showing if player passed/failed the mission

### Visual Indicators

- **Yellow circle** - Player was the proposer
- **Blue circle** - Player was on the proposed team
- **Thumbs up (green)** - Player approved the proposal
- **Thumbs down (red)** - Player rejected the proposal
- **Green check** - Player passed the mission
- **Red X** - Player failed the mission

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
		game: {
			control: 'object',
			description: 'The complete game object from Firebase',
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const RealGameComplete: Story = {
	args: {
		game: realGame,
	},
};

export const RealGameNoRoles: Story = {
	args: {
		game: {
			...realGame,
			outcome: {
				...realGame.outcome!,
				roles: undefined,
			},
		},
	},
};
