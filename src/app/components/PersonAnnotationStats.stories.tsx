import type {Meta, StoryObj} from '@storybook/react-vite';
import type {PersonAnnotationProfile} from '../models/annotationStatistics';
import {PersonAnnotationStats} from './PersonAnnotationStats';

const meta: Meta<typeof PersonAnnotationStats> = {
	title: 'Statistics/PersonAnnotationStats',
	component: PersonAnnotationStats,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `PersonAnnotationStats displays a player's behavioral patterns compared to population baselines.

## Features
- Behavioral statistics sorted by rarity (rarest first)
- Color-coded rows indicating deviation from baseline (green = below, red = above)
- Wilson score confidence intervals
- Percentile ranks with significance markers
- Summary counts of deviations

## Visual Indicators
- **Rarity dots**: Color-coded by predicate rarity (legendary, epic, rare, uncommon, common)
- **Row background**: Green (below average) to white (average) to red (above average)
- **Direction arrows**: Up arrow for above baseline, down for below
- **Significance marker**: Asterisk (*) for statistically significant deviations

## Usage
\`\`\`tsx
import {PersonAnnotationStats} from './PersonAnnotationStats';

function PlayerProfile({profile}: {profile: PersonAnnotationProfile}) {
  return <PersonAnnotationStats profile={profile} />;
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
	argTypes: {
		profile: {
			control: 'object',
			description: 'Complete annotation profile with statistics and summary',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Profile with many significant deviations from baseline.
 * Represents a player with distinctive behavioral tells.
 */
const manyDeviationsProfile: PersonAnnotationProfile = {
	annotations: [
		{
			predicateName: 'PercivalExcludingMerlinWithoutMorganaProposalPredicate',
			rarity: 'legendary',
			fires: 8,
			opportunities: 12,
			rawRate: 0.667,
			smoothedRate: 0.523,
			confidenceInterval: {lower: 0.354, upper: 0.886},
			baselineRate: 0.15,
			zScore: 3.82,
			percentileRank: 99.9,
			deviationDirection: 'above',
			isSignificant: true,
		},
		{
			predicateName: 'KnownEvilHammerProposalPredicate',
			rarity: 'legendary',
			fires: 1,
			opportunities: 18,
			rawRate: 0.056,
			smoothedRate: 0.103,
			confidenceInterval: {lower: 0.003, upper: 0.268},
			baselineRate: 0.22,
			zScore: -2.95,
			percentileRank: 0.2,
			deviationDirection: 'below',
			isSignificant: true,
		},
		{
			predicateName: 'ProtestVoteProposalVotePredicate',
			rarity: 'epic',
			fires: 25,
			opportunities: 45,
			rawRate: 0.556,
			smoothedRate: 0.487,
			confidenceInterval: {lower: 0.407, upper: 0.696},
			baselineRate: 0.28,
			zScore: 4.12,
			percentileRank: 99.9,
			deviationDirection: 'above',
			isSignificant: true,
		},
		{
			predicateName: 'OberonDucked',
			rarity: 'epic',
			fires: 0,
			opportunities: 8,
			rawRate: 0.0,
			smoothedRate: 0.072,
			confidenceInterval: {lower: 0.0, upper: 0.369},
			baselineRate: 0.35,
			zScore: -2.08,
			percentileRank: 1.9,
			deviationDirection: 'below',
			isSignificant: true,
		},
		{
			predicateName: 'EvilVotedAgainstEvilProposalVotePredicate',
			rarity: 'common',
			fires: 85,
			opportunities: 150,
			rawRate: 0.567,
			smoothedRate: 0.541,
			confidenceInterval: {lower: 0.486, upper: 0.643},
			baselineRate: 0.42,
			zScore: 3.65,
			percentileRank: 99.9,
			deviationDirection: 'above',
			isSignificant: true,
		},
		{
			predicateName: 'SwitchedVoteProposalVotePredicate',
			rarity: 'common',
			fires: 12,
			opportunities: 180,
			rawRate: 0.067,
			smoothedRate: 0.089,
			confidenceInterval: {lower: 0.035, upper: 0.113},
			baselineRate: 0.18,
			zScore: -3.94,
			percentileRank: 0.0,
			deviationDirection: 'below',
			isSignificant: true,
		},
	],
	summary: {
		totalPredicates: 6,
		significantDeviations: 6,
		aboveBaseline: 3,
		belowBaseline: 3,
	},
};

export const ManySignificantDeviations: Story = {
	args: {
		profile: manyDeviationsProfile,
	},
	parameters: {
		docs: {
			description: {
				story: 'A player with distinctive behavioral tells. Every tracked behavior shows statistically significant deviation from the population baseline, making this player highly predictable to opponents who study their patterns.',
			},
		},
	},
};

/**
 * Profile with mostly average behavior.
 * Represents a player who blends in with the population.
 */
const averageBehaviorProfile: PersonAnnotationProfile = {
	annotations: [
		{
			predicateName: 'MerlinMorganaProposalPredicate',
			rarity: 'epic',
			fires: 5,
			opportunities: 22,
			rawRate: 0.227,
			smoothedRate: 0.218,
			confidenceInterval: {lower: 0.077, upper: 0.457},
			baselineRate: 0.21,
			zScore: 0.19,
			percentileRank: 57.5,
			deviationDirection: 'neutral',
			isSignificant: false,
		},
		{
			predicateName: 'PercivalVotedForMerlinAndMorganaProposalVotePredicate',
			rarity: 'rare',
			fires: 14,
			opportunities: 62,
			rawRate: 0.226,
			smoothedRate: 0.221,
			confidenceInterval: {lower: 0.131, upper: 0.35},
			baselineRate: 0.24,
			zScore: -0.26,
			percentileRank: 39.7,
			deviationDirection: 'neutral',
			isSignificant: false,
		},
		{
			predicateName: 'FirstAllGoodTeamVotePredicate',
			rarity: 'common',
			fires: 42,
			opportunities: 95,
			rawRate: 0.442,
			smoothedRate: 0.439,
			confidenceInterval: {lower: 0.343, upper: 0.545},
			baselineRate: 0.45,
			zScore: -0.16,
			percentileRank: 43.6,
			deviationDirection: 'neutral',
			isSignificant: false,
		},
		{
			predicateName: 'ApproveWhenNextLeaderProposalVotePredicate',
			rarity: 'common',
			fires: 38,
			opportunities: 88,
			rawRate: 0.432,
			smoothedRate: 0.431,
			confidenceInterval: {lower: 0.329, upper: 0.54},
			baselineRate: 0.44,
			zScore: -0.15,
			percentileRank: 44.0,
			deviationDirection: 'neutral',
			isSignificant: false,
		},
		{
			predicateName: 'HammerPanderingProposalPredicate',
			rarity: 'common',
			fires: 18,
			opportunities: 52,
			rawRate: 0.346,
			smoothedRate: 0.342,
			confidenceInterval: {lower: 0.22, upper: 0.494},
			baselineRate: 0.35,
			zScore: -0.06,
			percentileRank: 47.6,
			deviationDirection: 'neutral',
			isSignificant: false,
		},
	],
	summary: {
		totalPredicates: 5,
		significantDeviations: 0,
		aboveBaseline: 0,
		belowBaseline: 0,
	},
};

export const MostlyAverageBehavior: Story = {
	args: {
		profile: averageBehaviorProfile,
	},
	parameters: {
		docs: {
			description: {
				story: 'A player whose behavior closely matches the population baseline. No significant deviations detected, making this player difficult to read based on behavioral patterns alone.',
			},
		},
	},
};

/**
 * Profile with few opportunities (wide confidence intervals).
 * Represents a new player or one with limited data.
 */
const wideConfidenceIntervalsProfile: PersonAnnotationProfile = {
	annotations: [
		{
			predicateName: 'SameTeamFailedMissionProposalPredicate',
			rarity: 'legendary',
			fires: 1,
			opportunities: 3,
			rawRate: 0.333,
			smoothedRate: 0.227,
			confidenceInterval: {lower: 0.008, upper: 0.906},
			baselineRate: 0.18,
			zScore: 0.56,
			percentileRank: 71.2,
			deviationDirection: 'above',
			isSignificant: false,
		},
		{
			predicateName: 'FailureToCoordinate',
			rarity: 'epic',
			fires: 0,
			opportunities: 2,
			rawRate: 0.0,
			smoothedRate: 0.075,
			confidenceInterval: {lower: 0.0, upper: 0.842},
			baselineRate: 0.09,
			zScore: -0.44,
			percentileRank: 33.0,
			deviationDirection: 'below',
			isSignificant: false,
		},
		{
			predicateName: 'OneEvilTeamFirstProposalPredicate',
			rarity: 'rare',
			fires: 2,
			opportunities: 5,
			rawRate: 0.4,
			smoothedRate: 0.293,
			confidenceInterval: {lower: 0.053, upper: 0.853},
			baselineRate: 0.22,
			zScore: 0.9,
			percentileRank: 81.6,
			deviationDirection: 'above',
			isSignificant: false,
		},
		{
			predicateName: 'RiskingLossProposalPredicate',
			rarity: 'uncommon',
			fires: 1,
			opportunities: 4,
			rawRate: 0.25,
			smoothedRate: 0.207,
			confidenceInterval: {lower: 0.006, upper: 0.806},
			baselineRate: 0.17,
			zScore: 0.4,
			percentileRank: 65.5,
			deviationDirection: 'above',
			isSignificant: false,
		},
		{
			predicateName: 'RiskingGoodLossProposalVotePredicate',
			rarity: 'common',
			fires: 3,
			opportunities: 8,
			rawRate: 0.375,
			smoothedRate: 0.309,
			confidenceInterval: {lower: 0.085, upper: 0.755},
			baselineRate: 0.26,
			zScore: 0.67,
			percentileRank: 74.9,
			deviationDirection: 'above',
			isSignificant: false,
		},
	],
	summary: {
		totalPredicates: 5,
		significantDeviations: 0,
		aboveBaseline: 4,
		belowBaseline: 1,
	},
};

export const WideConfidenceIntervals: Story = {
	args: {
		profile: wideConfidenceIntervalsProfile,
	},
	parameters: {
		docs: {
			description: {
				story: 'A player with limited data (few opportunities per predicate). Wide confidence intervals indicate high uncertainty in the statistics. More games are needed before drawing conclusions about behavioral patterns.',
			},
		},
	},
};

/**
 * Empty profile with no annotation data.
 */
const emptyProfile: PersonAnnotationProfile = {
	annotations: [],
	summary: {
		totalPredicates: 0,
		significantDeviations: 0,
		aboveBaseline: 0,
		belowBaseline: 0,
	},
};

export const NoAnnotationData: Story = {
	args: {
		profile: emptyProfile,
	},
	parameters: {
		docs: {
			description: {
				story: 'Handles the case where no annotation data is available. This may occur for players who have not been mapped or have no games with annotation data.',
			},
		},
	},
};
