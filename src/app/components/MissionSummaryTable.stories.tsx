import type {Meta, StoryObj} from '@storybook/react-vite';
import {MissionSummaryTable} from './MissionSummaryTable';
import type {Game} from '../models/game';

const meta = {
	title: 'Components/MissionSummaryTable',
	component: MissionSummaryTable,
	parameters: {
		layout: 'padded',
	},
} satisfies Meta<typeof MissionSummaryTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleGame: Game = {
	id: 'game-123',
	timeCreated: new Date('2024-01-15T14:30:00'),
	timeFinished: new Date('2024-01-15T15:15:00'),
	players: [
		{uid: 'player1', name: 'Alice', role: 'Merlin'},
		{uid: 'player2', name: 'Bob', role: 'Assassin'},
		{uid: 'player3', name: 'Charlie', role: 'Loyal'},
		{uid: 'player4', name: 'Diana', role: 'Morgana'},
		{uid: 'player5', name: 'Eve', role: 'Loyal'},
	],
	missions: [
		{
			teamSize: 2,
			failsRequired: 1,
			state: 'SUCCESS',
			numFails: 0,
			team: ['Alice', 'Charlie'],
			proposals: [
				{
					proposer: 'Alice',
					team: ['Alice', 'Bob'],
					votes: ['Alice', 'Bob', 'Diana'],
					state: 'REJECTED',
				},
				{
					proposer: 'Bob',
					team: ['Alice', 'Charlie'],
					votes: ['Alice', 'Bob', 'Charlie', 'Eve'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'FAIL',
			numFails: 1,
			team: ['Bob', 'Diana', 'Eve'],
			proposals: [
				{
					proposer: 'Charlie',
					team: ['Bob', 'Diana', 'Eve'],
					votes: ['Bob', 'Charlie', 'Diana', 'Eve'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 2,
			failsRequired: 1,
			state: 'SUCCESS',
			numFails: 0,
			team: ['Alice', 'Eve'],
			proposals: [
				{
					proposer: 'Diana',
					team: ['Bob', 'Diana'],
					votes: ['Bob', 'Diana'],
					state: 'REJECTED',
				},
				{
					proposer: 'Eve',
					team: ['Charlie', 'Diana'],
					votes: ['Charlie', 'Diana'],
					state: 'REJECTED',
				},
				{
					proposer: 'Alice',
					team: ['Alice', 'Eve'],
					votes: ['Alice', 'Charlie', 'Eve'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 3,
			failsRequired: 2,
			state: 'FAIL',
			numFails: 2,
			team: ['Bob', 'Charlie', 'Diana'],
			proposals: [
				{
					proposer: 'Bob',
					team: ['Bob', 'Charlie', 'Diana'],
					votes: ['Bob', 'Charlie', 'Diana', 'Eve'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'PENDING',
			team: [],
			proposals: [],
		},
	],
	outcome: {
		state: 'EVIL_WIN',
		winner: 'EVIL',
		reason: 'Evil achieved 3 failed missions',
	},
	options: {
		enableLancelot: false,
		enableTwoFailProtection: false,
		enableLadyOfTheLake: false,
	},
};

export const CompleteGame: Story = {
	args: {
		game: sampleGame,
	},
};

export const GameInProgress: Story = {
	args: {
		game: {
			...sampleGame,
			timeFinished: undefined,
			outcome: undefined,
			missions: sampleGame.missions.slice(0, 3),
		},
	},
};

export const SingleMission: Story = {
	args: {
		game: {
			...sampleGame,
			missions: [sampleGame.missions[0]],
			outcome: undefined,
		},
	},
};
