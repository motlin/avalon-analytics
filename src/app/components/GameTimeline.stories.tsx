import type {Meta, StoryObj} from '@storybook/react-vite';
import {GameTimelineComponent} from './GameTimeline';
import type {Game} from '../models/game';

const meta = {
	title: 'Components/GameTimeline',
	component: GameTimelineComponent,
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		showSecrets: {
			control: 'boolean',
			description: 'Show or hide secret information',
		},
	},
} satisfies Meta<typeof GameTimelineComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleGame: Game = {
	id: 'game-123',
	timeCreated: new Date('2024-01-15T10:00:00Z'),
	timeFinished: new Date('2024-01-15T11:30:00Z'),
	players: [
		{uid: '1', name: 'CRAIGM', role: 'Morgana'},
		{uid: '2', name: 'JUSTIN', role: 'Oberon'},
		{uid: '3', name: 'ROB', role: 'Evil Minion'},
		{uid: '4', name: 'KEN', role: 'Merlin'},
		{uid: '5', name: 'STEVEN', role: 'Percival'},
		{uid: '6', name: 'LUKE', role: 'Loyal'},
		{uid: '7', name: 'JOSH', role: 'Loyal'},
		{uid: '8', name: 'FLORA', role: 'Loyal'},
	],
	missions: [
		{
			failsRequired: 1,
			teamSize: 3,
			state: 'SUCCESS',
			numFails: 0,
			team: ['ROB', 'FLORA', 'CRAIGM'],
			proposals: [
				{
					proposer: 'ROB',
					team: ['ROB', 'FLORA', 'CRAIGM'],
					votes: ['FLORA', 'CRAIGM', 'ROB', 'KEN', 'JUSTIN'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 1,
			teamSize: 4,
			state: 'SUCCESS',
			numFails: 0,
			team: ['KEN', 'JOSH', 'FLORA', 'LUKE'],
			proposals: [
				{
					proposer: 'STEVEN',
					team: ['CRAIGM', 'FLORA', 'ROB', 'STEVEN'],
					votes: ['STEVEN', 'FLORA', 'ROB'],
					state: 'REJECTED',
				},
				{
					proposer: 'JOSH',
					team: ['JOSH', 'JUSTIN', 'LUKE', 'KEN'],
					votes: ['JOSH', 'JUSTIN', 'KEN'],
					state: 'REJECTED',
				},
				{
					proposer: 'JUSTIN',
					team: ['JUSTIN', 'LUKE', 'CRAIGM', 'ROB'],
					votes: ['JUSTIN', 'ROB', 'LUKE'],
					state: 'REJECTED',
				},
				{
					proposer: 'LUKE',
					team: ['LUKE', 'CRAIGM', 'FLORA', 'ROB'],
					votes: ['FLORA', 'LUKE', 'KEN'],
					state: 'REJECTED',
				},
				{
					proposer: 'KEN',
					team: ['KEN', 'JOSH', 'FLORA', 'LUKE'],
					votes: ['ROB', 'JUSTIN', 'FLORA', 'LUKE', 'KEN', 'JOSH', 'CRAIGM', 'STEVEN'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 1,
			teamSize: 4,
			state: 'FAIL',
			numFails: 1,
			team: ['CRAIGM', 'FLORA', 'LUKE', 'KEN'],
			proposals: [
				{
					proposer: 'CRAIGM',
					team: ['CRAIGM', 'FLORA', 'LUKE', 'KEN'],
					votes: ['CRAIGM', 'FLORA', 'ROB', 'KEN', 'LUKE'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 2,
			teamSize: 5,
			state: 'SUCCESS',
			numFails: 0,
			team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
			proposals: [
				{
					proposer: 'FLORA',
					team: ['FLORA', 'ROB', 'KEN', 'CRAIGM', 'LUKE'],
					votes: ['FLORA', 'ROB'],
					state: 'REJECTED',
				},
				{
					proposer: 'ROB',
					team: ['STEVEN', 'JOSH', 'ROB', 'JUSTIN', 'LUKE'],
					votes: ['ROB'],
					state: 'REJECTED',
				},
				{
					proposer: 'STEVEN',
					team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
					votes: ['STEVEN', 'JOSH', 'FLORA', 'KEN', 'LUKE'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 1,
			teamSize: 5,
			state: 'PENDING',
			team: [],
			proposals: [],
		},
	],
	outcome: {
		winner: 'EVIL',
		reason: 'Merlin Assassinated',
		message: 'ROB (Evil Assassin) correctly identified KEN as Merlin',
		outcome: 'EVIL',
	},
	options: {
		enableLancelot: false,
		enableTwoFailProtection: true,
		enableLadyOfTheLake: false,
	},
};

export const Default: Story = {
	args: {
		game: sampleGame,
		showSecrets: false,
	},
};

export const WithSecretsRevealed: Story = {
	args: {
		game: sampleGame,
		showSecrets: true,
	},
};

export const InProgressGame: Story = {
	args: {
		game: {
			...sampleGame,
			missions: sampleGame.missions.slice(0, 3),
			outcome: undefined,
			timeFinished: undefined,
		},
		showSecrets: false,
	},
};

export const GoodVictory: Story = {
	args: {
		game: {
			...sampleGame,
			missions: [
				...sampleGame.missions.slice(0, 3),
				{
					...sampleGame.missions[3],
					state: 'SUCCESS',
					numFails: 1,
				},
				{
					failsRequired: 1,
					teamSize: 5,
					state: 'SUCCESS',
					numFails: 0,
					team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
					proposals: [
						{
							proposer: 'JOSH',
							team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
							votes: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
							state: 'APPROVED',
						},
					],
				},
			],
			outcome: {
				winner: 'GOOD',
				reason: 'Three Successful Missions',
				outcome: 'GOOD',
			},
		},
		showSecrets: false,
	},
};
