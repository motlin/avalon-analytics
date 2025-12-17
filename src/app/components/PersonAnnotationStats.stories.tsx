import type {Meta, StoryObj} from '@storybook/react-vite';
import type {
	AlignmentIndicator,
	PersonAnnotationProfile,
	PersonAnnotationStatistic,
} from '../models/annotationStatistics';
import type {Rarity} from '../models/predicateRarity';
import {PersonAnnotationStats} from './PersonAnnotationStats';

const meta: Meta<typeof PersonAnnotationStats> = {
	title: 'Statistics/PersonAnnotationStats',
	component: PersonAnnotationStats,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: `PersonAnnotationStats displays a player's behavioral tells compared to good/evil baselines.

## Features
- Shows good and evil baseline rates for each behavior
- Indicates which alignment the behavior suggests (if diagnostic)
- Color-coded rows: green for "suggests good", red for "suggests evil"
- Significance marker (*) for behaviors with diagnostic value

## Key Concept: Diagnostic Value
A behavior has "diagnostic value" if good players do it at a significantly different rate than evil players.
For example, if good players propose all-good teams 45% of the time but evil players only do it 20% of the time,
then proposing an all-good team suggests the player is good.

## Usage
\`\`\`tsx
import {PersonAnnotationStats} from './PersonAnnotationStats';

function PlayerProfile({profile}: {profile: PersonAnnotationProfile}) {
  return <PersonAnnotationStats profile={profile} personId="player-123" />;
}
\`\`\``,
			},
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

function createStatistic(
	predicateName: string,
	rarity: Rarity,
	fires: number,
	opportunities: number,
	goodRate: number,
	evilRate: number,
	goodSample: number,
	evilSample: number,
	suggestsAlignment: AlignmentIndicator,
	hasDiagnosticValue: boolean,
): PersonAnnotationStatistic {
	const rawRate = opportunities > 0 ? fires / opportunities : 0;
	return {
		predicateName,
		rarity,
		fires,
		opportunities,
		rawRate,
		goodBaselineRate: goodRate,
		evilBaselineRate: evilRate,
		goodBaselineSample: goodSample,
		evilBaselineSample: evilSample,
		suggestsAlignment,
		diagnosticZScore: hasDiagnosticValue ? 2.5 : 0.5,
		hasDiagnosticValue,
		smoothedRate: rawRate,
		confidenceInterval: {lower: rawRate * 0.8, upper: Math.min(1, rawRate * 1.2)},
		baselineRate: (goodRate + evilRate) / 2,
		zScore: 0,
		percentileRank: 50,
		deviationDirection: 'neutral',
		isSignificant: false,
	};
}

const diagnosticBehaviorsProfile: PersonAnnotationProfile = {
	annotations: [
		createStatistic('AllGoodTeamWithoutSelfProposalPredicate', 'rare', 15, 36, 0.45, 0.2, 1200, 800, 'good', true),
		createStatistic('KnownEvilHammerProposalPredicate', 'legendary', 3, 38, 0.05, 0.35, 500, 400, 'evil', true),
		createStatistic('ProtestVoteProposalVotePredicate', 'epic', 25, 45, 0.28, 0.45, 900, 700, 'evil', true),
		createStatistic('FirstProposalAllGoodPredicate', 'common', 42, 95, 0.52, 0.38, 1500, 1100, 'good', true),
		createStatistic('VotedAgainstOwnProposalPredicate', 'uncommon', 8, 120, 0.08, 0.06, 600, 500, 'neither', false),
	],
	summary: {
		totalPredicates: 5,
		significantDeviations: 4,
		aboveBaseline: 2,
		belowBaseline: 2,
	},
};

export const DiagnosticBehaviors: Story = {
	args: {
		profile: diagnosticBehaviorsProfile,
		personId: 'test-person-id',
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows behaviors that have diagnostic value - they help distinguish good from evil players. Green rows suggest the player is good when they do the behavior, red rows suggest evil.',
			},
		},
	},
};

const noDiagnosticValueProfile: PersonAnnotationProfile = {
	annotations: [
		createStatistic('ApproveWhenNextLeaderPredicate', 'common', 38, 88, 0.44, 0.42, 1000, 900, 'neither', false),
		createStatistic('HammerPanderingPredicate', 'common', 18, 52, 0.35, 0.33, 800, 700, 'neither', false),
		createStatistic('VotedForFailedMissionPredicate', 'rare', 5, 22, 0.24, 0.22, 400, 350, 'neither', false),
	],
	summary: {
		totalPredicates: 3,
		significantDeviations: 0,
		aboveBaseline: 0,
		belowBaseline: 0,
	},
};

export const NoDiagnosticValue: Story = {
	args: {
		profile: noDiagnosticValueProfile,
		personId: 'test-person-id',
	},
	parameters: {
		docs: {
			description: {
				story: 'Shows behaviors with no diagnostic value - good and evil players do them at similar rates, so they do not help distinguish alignment.',
			},
		},
	},
};

const mixedProfile: PersonAnnotationProfile = {
	annotations: [
		createStatistic('PercivalExcludingMerlinPredicate', 'legendary', 8, 12, 0.67, 0.15, 300, 200, 'good', true),
		createStatistic('OberonDuckedMissionPredicate', 'epic', 0, 8, 0.35, 0.02, 250, 180, 'good', true),
		createStatistic('SameTeamAfterFailPredicate', 'rare', 1, 3, 0.18, 0.45, 400, 350, 'evil', true),
		createStatistic('ApproveOwnProposalPredicate', 'common', 85, 95, 0.88, 0.9, 1200, 1000, 'neither', false),
		createStatistic('FirstVoteRejectPredicate', 'common', 12, 180, 0.07, 0.08, 1100, 900, 'neither', false),
	],
	summary: {
		totalPredicates: 5,
		significantDeviations: 3,
		aboveBaseline: 1,
		belowBaseline: 2,
	},
};

export const MixedDiagnosticValue: Story = {
	args: {
		profile: mixedProfile,
		personId: 'test-person-id',
	},
	parameters: {
		docs: {
			description: {
				story: 'A realistic mix of behaviors - some with diagnostic value (suggests good or evil), some without.',
			},
		},
	},
};

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
		personId: 'test-person-id',
	},
	parameters: {
		docs: {
			description: {
				story: 'Handles the case where no annotation data is available.',
			},
		},
	},
};
