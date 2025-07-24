import type {Meta, StoryObj} from '@storybook/react-vite';
import StatsDisplay from './StatsDisplay';

const meta: Meta<typeof StatsDisplay> = {
	title: 'UI/StatsDisplay',
	component: StatsDisplay,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `StatsDisplay shows player statistics and win rates in a clean, informative format.

## Features
- Games played count
- Win percentage with visual progress bar
- Good vs Evil role distribution
- Total playtime tracking
- Optional global statistics comparison
- Responsive design for various contexts

## Statistics Explained
- **Games**: Total number of games played
- **Wins**: Games won (regardless of team)
- **Good**: Times played on the good team
- **Good Wins**: Games won while playing good
- **Win Rate**: Percentage of games won
- **Good Win Rate**: Global good team win percentage (if available)

## Usage
\`\`\`tsx
import StatsDisplay from './StatsDisplay';

function Profile() {
  return (
    <StatsDisplay
      stats={userStats}
      globalStats={globalStats} // optional
    />
  );
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		stats: {
			control: 'object',
			description: 'Player statistics object containing games, wins, good team plays, and playtime',
		},
		globalStats: {
			control: 'object',
			description: 'Optional global statistics for comparison. Shows overall good win rate across all games',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicStats: Story = {
	args: {
		stats: {
			games: 50,
			good: 25,
			wins: 30,
			good_wins: 18,
			playtimeSeconds: 7200, // 2 hours
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Standard player statistics showing a 60% win rate with balanced good/evil distribution.',
			},
		},
	},
};

export const WithGlobalStats: Story = {
	args: {
		stats: {
			games: 75,
			good: 40,
			wins: 45,
			good_wins: 28,
			playtimeSeconds: 10800, // 3 hours
		},
		globalStats: {
			games: 10000,
			good_wins: 5500,
		},
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows player stats alongside global statistics. The global good win rate (55%) provides context for game balance.',
			},
		},
	},
};

export const EmptyStats: Story = {
	args: {
		stats: {},
	},
	parameters: {
		docs: {
			description: {
				story: 'Handles missing or incomplete statistics gracefully. Common for new players or when stats fail to load.',
			},
		},
	},
};
