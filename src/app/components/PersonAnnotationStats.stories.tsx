import type {Meta, StoryObj} from '@storybook/react-vite';
import type {AlignmentIndicator, PersonAnnotationProfile} from '../models/annotationStatistics';
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

interface StatisticParams {
	predicateName: string;
	rarity: Rarity;
	goodRate: number;
	evilRate: number;
	goodSample: number;
	evilSample: number;
	popSuggests: AlignmentIndicator;
	popConfidence: number;
	playerGoodRate: number | null;
	playerGoodFires: number;
	playerGoodOpportunities: number;
	playerEvilRate: number | null;
	playerEvilFires: number;
	playerEvilOpportunities: number;
	playerSuggests: AlignmentIndicator;
	playerConfidence: number;
}

function computeLikelihoodRatio(goodRate: number | null, evilRate: number | null): number {
	if (goodRate === null || evilRate === null) return 1;
	if (goodRate > 0 && evilRate > 0) {
		return goodRate > evilRate ? goodRate / evilRate : evilRate / goodRate;
	}
	if (goodRate > 0 && evilRate === 0) return Number.POSITIVE_INFINITY;
	if (evilRate > 0 && goodRate === 0) return Number.POSITIVE_INFINITY;
	return 1;
}

interface EvilOnlyStatisticParams {
	predicateName: string;
	rarity: Rarity;
	evilRate: number;
	evilSample: number;
	playerEvilRate: number | null;
	playerEvilFires: number;
	playerEvilOpportunities: number;
}

function createStatistic(params: StatisticParams) {
	const fires = params.playerGoodFires + params.playerEvilFires;
	const opportunities = params.playerGoodOpportunities + params.playerEvilOpportunities;
	const rawRate = opportunities > 0 ? fires / opportunities : 0;
	const popLikelihoodRatio = computeLikelihoodRatio(params.goodRate, params.evilRate);
	const playerLikelihoodRatio = computeLikelihoodRatio(params.playerGoodRate, params.playerEvilRate);
	return {
		predicateName: params.predicateName,
		rarity: params.rarity,
		fires,
		opportunities,
		rawRate,
		goodBaselineRate: params.goodRate,
		evilBaselineRate: params.evilRate,
		goodBaselineSample: params.goodSample,
		evilBaselineSample: params.evilSample,
		popSuggestsAlignment: params.popSuggests,
		popConfidence: params.popConfidence,
		popHasDiagnosticValue: params.popConfidence >= 95,
		popLikelihoodRatio,
		goodBaselineFires: Math.round(params.goodRate * params.goodSample),
		evilBaselineFires: Math.round(params.evilRate * params.evilSample),
		playerGoodRate: params.playerGoodRate,
		playerGoodFires: params.playerGoodFires,
		playerGoodOpportunities: params.playerGoodOpportunities,
		playerEvilRate: params.playerEvilRate,
		playerEvilFires: params.playerEvilFires,
		playerEvilOpportunities: params.playerEvilOpportunities,
		playerSuggestsAlignment: params.playerSuggests,
		playerConfidence: params.playerConfidence,
		playerHasTell: params.playerConfidence >= 95,
		playerLikelihoodRatio,
		baselineRate: (params.goodRate + params.evilRate) / 2,
		interestingRoles: undefined,
		roleStats: [],
	};
}

function createEvilOnlyStatistic(params: EvilOnlyStatisticParams) {
	return {
		predicateName: params.predicateName,
		rarity: params.rarity,
		fires: params.playerEvilFires,
		opportunities: params.playerEvilOpportunities,
		rawRate: params.playerEvilOpportunities > 0 ? params.playerEvilFires / params.playerEvilOpportunities : 0,
		goodBaselineRate: 0,
		evilBaselineRate: params.evilRate,
		goodBaselineSample: 0,
		evilBaselineSample: params.evilSample,
		popSuggestsAlignment: 'evil' as AlignmentIndicator,
		popConfidence: 99,
		popHasDiagnosticValue: true,
		popLikelihoodRatio: Number.POSITIVE_INFINITY,
		goodBaselineFires: 0,
		evilBaselineFires: Math.round(params.evilRate * params.evilSample),
		playerGoodRate: null,
		playerGoodFires: 0,
		playerGoodOpportunities: 0,
		playerEvilRate: params.playerEvilRate,
		playerEvilFires: params.playerEvilFires,
		playerEvilOpportunities: params.playerEvilOpportunities,
		playerSuggestsAlignment: 'neither' as AlignmentIndicator,
		playerConfidence: 0,
		playerHasTell: false,
		playerLikelihoodRatio: 1,
		baselineRate: params.evilRate,
		interestingRoles: 'evil' as const,
		roleStats: [],
	};
}

interface GoodOnlyStatisticParams {
	predicateName: string;
	rarity: Rarity;
	goodRate: number;
	goodSample: number;
	playerGoodRate: number | null;
	playerGoodFires: number;
	playerGoodOpportunities: number;
	role?: string;
}

function createGoodOnlyStatistic(params: GoodOnlyStatisticParams) {
	return {
		predicateName: params.predicateName,
		rarity: params.rarity,
		fires: params.playerGoodFires,
		opportunities: params.playerGoodOpportunities,
		rawRate: params.playerGoodOpportunities > 0 ? params.playerGoodFires / params.playerGoodOpportunities : 0,
		goodBaselineRate: params.goodRate,
		evilBaselineRate: 0,
		goodBaselineSample: params.goodSample,
		evilBaselineSample: 0,
		popSuggestsAlignment: 'good' as AlignmentIndicator,
		popConfidence: 99,
		popHasDiagnosticValue: true,
		popLikelihoodRatio: Number.POSITIVE_INFINITY,
		goodBaselineFires: Math.round(params.goodRate * params.goodSample),
		evilBaselineFires: 0,
		playerGoodRate: params.playerGoodRate,
		playerGoodFires: params.playerGoodFires,
		playerGoodOpportunities: params.playerGoodOpportunities,
		playerEvilRate: null,
		playerEvilFires: 0,
		playerEvilOpportunities: 0,
		playerSuggestsAlignment: 'neither' as AlignmentIndicator,
		playerConfidence: 0,
		playerHasTell: false,
		playerLikelihoodRatio: 1,
		baselineRate: params.goodRate,
		interestingRoles: params.role ? [params.role] : ('good' as const),
		roleStats: params.role
			? [
					{
						role: params.role,
						playerFires: params.playerGoodFires,
						playerOpportunities: params.playerGoodOpportunities,
						playerRate: params.playerGoodRate,
						populationFires: Math.round(params.goodRate * params.goodSample),
						populationOpportunities: params.goodSample,
						populationRate: params.goodRate,
						deviation: params.playerGoodRate !== null ? params.playerGoodRate - params.goodRate : null,
					},
				]
			: [],
	};
}

const diagnosticBehaviorsProfile: PersonAnnotationProfile = {
	annotations: [
		createStatistic({
			predicateName: 'Proposed an all good team without self',
			rarity: 'rare',
			goodRate: 0.45,
			evilRate: 0.2,
			goodSample: 1200,
			evilSample: 800,
			popSuggests: 'good',
			popConfidence: 98,
			playerGoodRate: 0.5,
			playerGoodFires: 10,
			playerGoodOpportunities: 20,
			playerEvilRate: 0.31,
			playerEvilFires: 5,
			playerEvilOpportunities: 16,
			playerSuggests: 'good',
			playerConfidence: 85,
		}),
		createStatistic({
			predicateName: 'Evil hammer proposed another known evil',
			rarity: 'legendary',
			goodRate: 0.05,
			evilRate: 0.35,
			goodSample: 500,
			evilSample: 400,
			popSuggests: 'evil',
			popConfidence: 99,
			playerGoodRate: 0.0,
			playerGoodFires: 0,
			playerGoodOpportunities: 20,
			playerEvilRate: 0.17,
			playerEvilFires: 3,
			playerEvilOpportunities: 18,
			playerSuggests: 'evil',
			playerConfidence: 96,
		}),
		createStatistic({
			predicateName: 'Protest voted on the 5th proposal',
			rarity: 'epic',
			goodRate: 0.28,
			evilRate: 0.45,
			goodSample: 900,
			evilSample: 700,
			popSuggests: 'evil',
			popConfidence: 97,
			playerGoodRate: 0.56,
			playerGoodFires: 14,
			playerGoodOpportunities: 25,
			playerEvilRate: 0.55,
			playerEvilFires: 11,
			playerEvilOpportunities: 20,
			playerSuggests: 'neither',
			playerConfidence: 5,
		}),
		createStatistic({
			predicateName: 'Proposed the first all good team',
			rarity: 'common',
			goodRate: 0.52,
			evilRate: 0.38,
			goodSample: 1500,
			evilSample: 1100,
			popSuggests: 'good',
			popConfidence: 95,
			playerGoodRate: 0.6,
			playerGoodFires: 30,
			playerGoodOpportunities: 50,
			playerEvilRate: 0.27,
			playerEvilFires: 12,
			playerEvilOpportunities: 45,
			playerSuggests: 'good',
			playerConfidence: 99,
		}),
		createStatistic({
			predicateName: 'Voted against their own proposal',
			rarity: 'uncommon',
			goodRate: 0.08,
			evilRate: 0.06,
			goodSample: 600,
			evilSample: 500,
			popSuggests: 'neither',
			popConfidence: 45,
			playerGoodRate: 0.07,
			playerGoodFires: 5,
			playerGoodOpportunities: 70,
			playerEvilRate: 0.06,
			playerEvilFires: 3,
			playerEvilOpportunities: 50,
			playerSuggests: 'neither',
			playerConfidence: 10,
		}),
	],
	summary: {
		totalPredicates: 5,
		popTellCount: 4,
		playerTellCount: 2,
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
		createStatistic({
			predicateName: 'Approved when they are the next leader',
			rarity: 'common',
			goodRate: 0.44,
			evilRate: 0.42,
			goodSample: 1000,
			evilSample: 900,
			popSuggests: 'neither',
			popConfidence: 30,
			playerGoodRate: 0.45,
			playerGoodFires: 22,
			playerGoodOpportunities: 49,
			playerEvilRate: 0.41,
			playerEvilFires: 16,
			playerEvilOpportunities: 39,
			playerSuggests: 'neither',
			playerConfidence: 15,
		}),
		createStatistic({
			predicateName: 'Pandered to the hammer',
			rarity: 'common',
			goodRate: 0.35,
			evilRate: 0.33,
			goodSample: 800,
			evilSample: 700,
			popSuggests: 'neither',
			popConfidence: 25,
			playerGoodRate: 0.36,
			playerGoodFires: 11,
			playerGoodOpportunities: 30,
			playerEvilRate: 0.32,
			playerEvilFires: 7,
			playerEvilOpportunities: 22,
			playerSuggests: 'neither',
			playerConfidence: 20,
		}),
		createStatistic({
			predicateName: 'Voted for a previously failed team',
			rarity: 'rare',
			goodRate: 0.24,
			evilRate: 0.22,
			goodSample: 400,
			evilSample: 350,
			popSuggests: 'neither',
			popConfidence: 15,
			playerGoodRate: 0.27,
			playerGoodFires: 3,
			playerGoodOpportunities: 11,
			playerEvilRate: 0.18,
			playerEvilFires: 2,
			playerEvilOpportunities: 11,
			playerSuggests: 'neither',
			playerConfidence: 40,
		}),
	],
	summary: {
		totalPredicates: 3,
		popTellCount: 0,
		playerTellCount: 0,
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
		createStatistic({
			predicateName: 'Percival excluded Merlin despite knowing who Merlin is',
			rarity: 'legendary',
			goodRate: 0.67,
			evilRate: 0.15,
			goodSample: 300,
			evilSample: 200,
			popSuggests: 'good',
			popConfidence: 99,
			playerGoodRate: 0.8,
			playerGoodFires: 8,
			playerGoodOpportunities: 10,
			playerEvilRate: null,
			playerEvilFires: 0,
			playerEvilOpportunities: 0,
			playerSuggests: 'neither',
			playerConfidence: 0,
		}),
		createStatistic({
			predicateName: 'Oberon ducked',
			rarity: 'epic',
			goodRate: 0.35,
			evilRate: 0.02,
			goodSample: 250,
			evilSample: 180,
			popSuggests: 'good',
			popConfidence: 99,
			playerGoodRate: null,
			playerGoodFires: 0,
			playerGoodOpportunities: 0,
			playerEvilRate: 0.0,
			playerEvilFires: 0,
			playerEvilOpportunities: 8,
			playerSuggests: 'neither',
			playerConfidence: 0,
		}),
		createStatistic({
			predicateName: 'Copied the team from a failed mission',
			rarity: 'rare',
			goodRate: 0.18,
			evilRate: 0.45,
			goodSample: 400,
			evilSample: 350,
			popSuggests: 'evil',
			popConfidence: 98,
			playerGoodRate: 0.5,
			playerGoodFires: 1,
			playerGoodOpportunities: 2,
			playerEvilRate: 0.0,
			playerEvilFires: 0,
			playerEvilOpportunities: 1,
			playerSuggests: 'good',
			playerConfidence: 70,
		}),
		createStatistic({
			predicateName: 'Approved their own proposal',
			rarity: 'common',
			goodRate: 0.88,
			evilRate: 0.9,
			goodSample: 1200,
			evilSample: 1000,
			popSuggests: 'neither',
			popConfidence: 40,
			playerGoodRate: 0.88,
			playerGoodFires: 45,
			playerGoodOpportunities: 51,
			playerEvilRate: 0.91,
			playerEvilFires: 40,
			playerEvilOpportunities: 44,
			playerSuggests: 'neither',
			playerConfidence: 20,
		}),
		createStatistic({
			predicateName: 'Rejected the first proposal',
			rarity: 'common',
			goodRate: 0.07,
			evilRate: 0.08,
			goodSample: 1100,
			evilSample: 900,
			popSuggests: 'neither',
			popConfidence: 25,
			playerGoodRate: 0.06,
			playerGoodFires: 6,
			playerGoodOpportunities: 100,
			playerEvilRate: 0.08,
			playerEvilFires: 6,
			playerEvilOpportunities: 80,
			playerSuggests: 'neither',
			playerConfidence: 30,
		}),
	],
	summary: {
		totalPredicates: 5,
		popTellCount: 3,
		playerTellCount: 0,
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
		popTellCount: 0,
		playerTellCount: 0,
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

const profileWithAlignmentRestrictedBehaviors: PersonAnnotationProfile = {
	annotations: [
		createStatistic({
			predicateName: 'Proposed an all good team without self',
			rarity: 'rare',
			goodRate: 0.45,
			evilRate: 0.2,
			goodSample: 1200,
			evilSample: 800,
			popSuggests: 'good',
			popConfidence: 98,
			playerGoodRate: 0.5,
			playerGoodFires: 10,
			playerGoodOpportunities: 20,
			playerEvilRate: 0.31,
			playerEvilFires: 5,
			playerEvilOpportunities: 16,
			playerSuggests: 'good',
			playerConfidence: 85,
		}),
		createStatistic({
			predicateName: 'Proposed the first all good team',
			rarity: 'common',
			goodRate: 0.52,
			evilRate: 0.38,
			goodSample: 1500,
			evilSample: 1100,
			popSuggests: 'good',
			popConfidence: 95,
			playerGoodRate: 0.6,
			playerGoodFires: 30,
			playerGoodOpportunities: 50,
			playerEvilRate: 0.27,
			playerEvilFires: 12,
			playerEvilOpportunities: 45,
			playerSuggests: 'good',
			playerConfidence: 99,
		}),
		createGoodOnlyStatistic({
			predicateName: 'Percival included Merlin and Morgana on the same team',
			rarity: 'legendary',
			goodRate: 0.18,
			goodSample: 280,
			playerGoodRate: 0.25,
			playerGoodFires: 3,
			playerGoodOpportunities: 12,
			role: 'Percival',
		}),
		createGoodOnlyStatistic({
			predicateName: 'Percival excluded Merlin despite knowing who Merlin is',
			rarity: 'legendary',
			goodRate: 0.12,
			goodSample: 320,
			playerGoodRate: 0.05,
			playerGoodFires: 1,
			playerGoodOpportunities: 20,
			role: 'Percival',
		}),
		createEvilOnlyStatistic({
			predicateName: 'Ducked',
			rarity: 'epic',
			evilRate: 0.36,
			evilSample: 500,
			playerEvilRate: 0.42,
			playerEvilFires: 8,
			playerEvilOpportunities: 19,
		}),
		createEvilOnlyStatistic({
			predicateName: 'Evil hammer proposed another known evil',
			rarity: 'legendary',
			evilRate: 0.22,
			evilSample: 350,
			playerEvilRate: 0.12,
			playerEvilFires: 2,
			playerEvilOpportunities: 17,
		}),
		createEvilOnlyStatistic({
			predicateName: 'Failed to coordinate',
			rarity: 'rare',
			evilRate: 0.15,
			evilSample: 420,
			playerEvilRate: 0.15,
			playerEvilFires: 3,
			playerEvilOpportunities: 20,
		}),
		createEvilOnlyStatistic({
			predicateName: 'Oberon ducked',
			rarity: 'legendary',
			evilRate: 0.08,
			evilSample: 180,
			playerEvilRate: null,
			playerEvilFires: 0,
			playerEvilOpportunities: 0,
		}),
	],
	summary: {
		totalPredicates: 8,
		popTellCount: 8,
		playerTellCount: 1,
	},
};

export const WithAlignmentRestrictedBehaviors: Story = {
	args: {
		profile: profileWithAlignmentRestrictedBehaviors,
		personId: 'test-person-id',
	},
	parameters: {
		docs: {
			description: {
				story: "Shows a profile with regular behaviors plus alignment-restricted behaviors. Good-only behaviors (like Percival actions) are separated into their own section, as are evil-only behaviors (like ducking). Each section compares the player's rate to other players of the same alignment.",
			},
		},
	},
};
