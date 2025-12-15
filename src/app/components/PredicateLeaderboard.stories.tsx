import type {Meta, StoryObj} from '@storybook/react-vite';
import type {PredicateLeaderboardEntry} from './PredicateLeaderboard';
import {PredicateLeaderboard} from './PredicateLeaderboard';

const meta: Meta<typeof PredicateLeaderboard> = {
	title: 'Statistics/PredicateLeaderboard',
	component: PredicateLeaderboard,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `PredicateLeaderboard displays all mapped players ranked by their rate for a specific predicate behavior.

## Features
- Players ranked by smoothed rate (highest first)
- Color-coded rows indicating deviation from baseline (green = below, red = above)
- Percentile ranks with significance markers
- Links to individual player profiles

## Visual Indicators
- **Rarity dot**: Color-coded by predicate rarity tier
- **Row background**: Green (below average) to white (average) to red (above average)
- **Significance marker**: Asterisk (*) for statistically significant deviations

## Usage
\`\`\`tsx
import {PredicateLeaderboard} from './PredicateLeaderboard';

function PredicatePage({predicate}: {predicate: PredicateData}) {
  return (
    <PredicateLeaderboard
      predicateName={predicate.name}
      rarity={predicate.rarity}
      baselineRate={predicate.baselineRate}
      entries={predicate.leaderboardEntries}
    />
  );
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		predicateName: {
			control: 'text',
			description: 'The predicate being displayed',
		},
		rarity: {
			control: 'select',
			options: ['legendary', 'epic', 'rare', 'uncommon', 'common'],
			description: 'Rarity tier of the predicate',
		},
		baselineRate: {
			control: {type: 'number', min: 0, max: 1, step: 0.01},
			description: 'Population baseline rate',
		},
		entries: {
			control: 'object',
			description: 'List of people ranked by smoothed rate',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Leaderboard with significant deviations from baseline.
 * Shows players with distinct behavioral patterns.
 */
const significantDeviationsEntries: PredicateLeaderboardEntry[] = [
	{
		personId: 'person-1',
		personName: 'Alice',
		fires: 15,
		opportunities: 20,
		rawRate: 0.75,
		smoothedRate: 0.612,
		zScore: 4.2,
		percentileRank: 99.9,
		isSignificant: true,
	},
	{
		personId: 'person-2',
		personName: 'Bob',
		fires: 12,
		opportunities: 25,
		rawRate: 0.48,
		smoothedRate: 0.421,
		zScore: 2.8,
		percentileRank: 99.7,
		isSignificant: true,
	},
	{
		personId: 'person-3',
		personName: 'Charlie',
		fires: 8,
		opportunities: 30,
		rawRate: 0.267,
		smoothedRate: 0.256,
		zScore: 0.5,
		percentileRank: 69.1,
		isSignificant: false,
	},
	{
		personId: 'person-4',
		personName: 'Diana',
		fires: 5,
		opportunities: 22,
		rawRate: 0.227,
		smoothedRate: 0.231,
		zScore: 0.1,
		percentileRank: 54.0,
		isSignificant: false,
	},
	{
		personId: 'person-5',
		personName: 'Eve',
		fires: 4,
		opportunities: 28,
		rawRate: 0.143,
		smoothedRate: 0.172,
		zScore: -0.8,
		percentileRank: 21.2,
		isSignificant: false,
	},
	{
		personId: 'person-6',
		personName: 'Frank',
		fires: 1,
		opportunities: 35,
		rawRate: 0.029,
		smoothedRate: 0.091,
		zScore: -2.5,
		percentileRank: 0.6,
		isSignificant: true,
	},
];

export const SignificantDeviations: Story = {
	args: {
		predicateName: 'PercivalExcludingMerlinProposalPredicate',
		rarity: 'legendary',
		baselineRate: 0.22,
		entries: significantDeviationsEntries,
	},
	parameters: {
		docs: {
			description: {
				story: 'A legendary predicate leaderboard showing players with significant behavioral deviations. Alice and Bob show significantly higher rates (red backgrounds), while Frank shows significantly lower rate (green background).',
			},
		},
	},
};

/**
 * Leaderboard with mostly average behavior.
 * Shows players clustered around the baseline.
 */
const averageBehaviorEntries: PredicateLeaderboardEntry[] = [
	{
		personId: 'person-1',
		personName: 'Grace',
		fires: 18,
		opportunities: 50,
		rawRate: 0.36,
		smoothedRate: 0.352,
		zScore: 0.4,
		percentileRank: 65.5,
		isSignificant: false,
	},
	{
		personId: 'person-2',
		personName: 'Henry',
		fires: 15,
		opportunities: 45,
		rawRate: 0.333,
		smoothedRate: 0.331,
		zScore: 0.2,
		percentileRank: 57.9,
		isSignificant: false,
	},
	{
		personId: 'person-3',
		personName: 'Ivy',
		fires: 16,
		opportunities: 52,
		rawRate: 0.308,
		smoothedRate: 0.311,
		zScore: 0.0,
		percentileRank: 50.0,
		isSignificant: false,
	},
	{
		personId: 'person-4',
		personName: 'Jack',
		fires: 13,
		opportunities: 48,
		rawRate: 0.271,
		smoothedRate: 0.281,
		zScore: -0.3,
		percentileRank: 38.2,
		isSignificant: false,
	},
	{
		personId: 'person-5',
		personName: 'Kate',
		fires: 12,
		opportunities: 44,
		rawRate: 0.273,
		smoothedRate: 0.278,
		zScore: -0.4,
		percentileRank: 34.5,
		isSignificant: false,
	},
];

export const AverageBehavior: Story = {
	args: {
		predicateName: 'ApproveWhenNextLeaderProposalVotePredicate',
		rarity: 'common',
		baselineRate: 0.31,
		entries: averageBehaviorEntries,
	},
	parameters: {
		docs: {
			description: {
				story: 'A common predicate leaderboard where all players behave similarly to the population baseline. White backgrounds indicate no significant deviations.',
			},
		},
	},
};

/**
 * Leaderboard with limited data (wide confidence intervals).
 * Shows players with few opportunities for this predicate.
 */
const limitedDataEntries: PredicateLeaderboardEntry[] = [
	{
		personId: 'person-1',
		personName: 'Leo',
		fires: 2,
		opportunities: 4,
		rawRate: 0.5,
		smoothedRate: 0.317,
		zScore: 1.2,
		percentileRank: 88.5,
		isSignificant: false,
	},
	{
		personId: 'person-2',
		personName: 'Mia',
		fires: 1,
		opportunities: 3,
		rawRate: 0.333,
		smoothedRate: 0.254,
		zScore: 0.6,
		percentileRank: 72.6,
		isSignificant: false,
	},
	{
		personId: 'person-3',
		personName: 'Noah',
		fires: 0,
		opportunities: 2,
		rawRate: 0.0,
		smoothedRate: 0.158,
		zScore: -0.5,
		percentileRank: 30.9,
		isSignificant: false,
	},
];

export const LimitedData: Story = {
	args: {
		predicateName: 'SameTeamFailedMissionProposalPredicate',
		rarity: 'legendary',
		baselineRate: 0.19,
		entries: limitedDataEntries,
	},
	parameters: {
		docs: {
			description: {
				story: 'A legendary predicate with limited opportunity data. Few opportunities per player means the smoothed rates are heavily shrunk toward the baseline.',
			},
		},
	},
};

/**
 * Large leaderboard with many players.
 * Shows how the component handles longer lists.
 */
const manyPlayersEntries: PredicateLeaderboardEntry[] = [
	{
		personId: 'p1',
		personName: 'Player 1',
		fires: 45,
		opportunities: 80,
		rawRate: 0.563,
		smoothedRate: 0.528,
		zScore: 3.1,
		percentileRank: 99.9,
		isSignificant: true,
	},
	{
		personId: 'p2',
		personName: 'Player 2',
		fires: 38,
		opportunities: 75,
		rawRate: 0.507,
		smoothedRate: 0.482,
		zScore: 2.4,
		percentileRank: 99.2,
		isSignificant: true,
	},
	{
		personId: 'p3',
		personName: 'Player 3',
		fires: 35,
		opportunities: 82,
		rawRate: 0.427,
		smoothedRate: 0.418,
		zScore: 1.5,
		percentileRank: 93.3,
		isSignificant: false,
	},
	{
		personId: 'p4',
		personName: 'Player 4',
		fires: 30,
		opportunities: 78,
		rawRate: 0.385,
		smoothedRate: 0.381,
		zScore: 0.9,
		percentileRank: 81.6,
		isSignificant: false,
	},
	{
		personId: 'p5',
		personName: 'Player 5',
		fires: 28,
		opportunities: 85,
		rawRate: 0.329,
		smoothedRate: 0.334,
		zScore: 0.2,
		percentileRank: 57.9,
		isSignificant: false,
	},
	{
		personId: 'p6',
		personName: 'Player 6',
		fires: 25,
		opportunities: 80,
		rawRate: 0.313,
		smoothedRate: 0.321,
		zScore: 0.0,
		percentileRank: 50.0,
		isSignificant: false,
	},
	{
		personId: 'p7',
		personName: 'Player 7',
		fires: 24,
		opportunities: 82,
		rawRate: 0.293,
		smoothedRate: 0.301,
		zScore: -0.3,
		percentileRank: 38.2,
		isSignificant: false,
	},
	{
		personId: 'p8',
		personName: 'Player 8',
		fires: 22,
		opportunities: 79,
		rawRate: 0.278,
		smoothedRate: 0.289,
		zScore: -0.5,
		percentileRank: 30.9,
		isSignificant: false,
	},
	{
		personId: 'p9',
		personName: 'Player 9',
		fires: 18,
		opportunities: 77,
		rawRate: 0.234,
		smoothedRate: 0.252,
		zScore: -1.1,
		percentileRank: 13.6,
		isSignificant: false,
	},
	{
		personId: 'p10',
		personName: 'Player 10',
		fires: 12,
		opportunities: 81,
		rawRate: 0.148,
		smoothedRate: 0.182,
		zScore: -2.2,
		percentileRank: 1.4,
		isSignificant: true,
	},
	{
		personId: 'p11',
		personName: 'Player 11',
		fires: 8,
		opportunities: 76,
		rawRate: 0.105,
		smoothedRate: 0.148,
		zScore: -2.8,
		percentileRank: 0.3,
		isSignificant: true,
	},
	{
		personId: 'p12',
		personName: 'Player 12',
		fires: 5,
		opportunities: 83,
		rawRate: 0.06,
		smoothedRate: 0.108,
		zScore: -3.5,
		percentileRank: 0.0,
		isSignificant: true,
	},
];

export const ManyPlayers: Story = {
	args: {
		predicateName: 'ProtestVoteProposalVotePredicate',
		rarity: 'epic',
		baselineRate: 0.32,
		entries: manyPlayersEntries,
	},
	parameters: {
		docs: {
			description: {
				story: 'An epic predicate leaderboard with many players, demonstrating the full range of behavioral variation from significantly above baseline (top) to significantly below (bottom).',
			},
		},
	},
};

/**
 * Empty leaderboard with no data.
 */
export const NoData: Story = {
	args: {
		predicateName: 'RareUnseenPredicate',
		rarity: 'legendary',
		baselineRate: 0.0,
		entries: [],
	},
	parameters: {
		docs: {
			description: {
				story: 'Handles the case where no players have data for this predicate. This may occur for very rare predicates that have never been observed.',
			},
		},
	},
};
