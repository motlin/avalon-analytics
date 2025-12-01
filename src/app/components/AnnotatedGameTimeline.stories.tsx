import type {Meta, StoryObj} from '@storybook/react-vite';
import {AnnotatedGameTimelineComponent} from './AnnotatedGameTimeline';
import type {Game} from '../models/game';

const meta = {
	title: 'Components/AnnotatedGameTimeline',
	component: AnnotatedGameTimelineComponent,
	parameters: {
		layout: 'fullscreen',
	},
	argTypes: {
		showSecrets: {
			control: 'boolean',
			description: 'Show or hide secret information including annotations',
		},
	},
} satisfies Meta<typeof AnnotatedGameTimelineComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample game with rich data for annotations
const sampleGame: Game = {
	id: 'game-annotated-123',
	timeCreated: new Date('2024-01-15T10:00:00Z'),
	timeFinished: new Date('2024-01-15T11:30:00Z'),
	players: [
		{uid: '1', name: 'CRAIG', role: 'Morgana'},
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
			team: ['KEN', 'STEVEN', 'LUKE'],
			proposals: [
				{
					proposer: 'KEN',
					team: ['KEN', 'STEVEN', 'LUKE'],
					votes: ['KEN', 'STEVEN', 'LUKE', 'JOSH', 'FLORA'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 1,
			teamSize: 4,
			state: 'FAIL',
			numFails: 1,
			team: ['CRAIG', 'KEN', 'STEVEN', 'FLORA'],
			proposals: [
				{
					proposer: 'STEVEN',
					team: ['CRAIG', 'STEVEN', 'KEN', 'FLORA'],
					votes: ['STEVEN', 'KEN', 'FLORA'],
					state: 'REJECTED',
				},
				{
					proposer: 'JOSH',
					team: ['JOSH', 'JUSTIN', 'LUKE', 'KEN'],
					votes: ['JOSH', 'KEN'],
					state: 'REJECTED',
				},
				{
					proposer: 'JUSTIN',
					team: ['CRAIG', 'KEN', 'STEVEN', 'FLORA'],
					votes: ['CRAIG', 'JUSTIN', 'ROB', 'STEVEN', 'KEN'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 1,
			teamSize: 4,
			state: 'FAIL',
			numFails: 1,
			team: ['ROB', 'KEN', 'JOSH', 'LUKE'],
			proposals: [
				{
					proposer: 'LUKE',
					team: ['ROB', 'KEN', 'JOSH', 'LUKE'],
					votes: ['ROB', 'KEN', 'JOSH', 'LUKE', 'JUSTIN'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 2,
			teamSize: 5,
			state: 'SUCCESS',
			numFails: 1,
			team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
			proposals: [
				{
					proposer: 'FLORA',
					team: ['FLORA', 'ROB', 'KEN', 'CRAIG', 'LUKE'],
					votes: ['FLORA', 'ROB'],
					state: 'REJECTED',
				},
				{
					proposer: 'ROB',
					team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
					votes: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
					state: 'APPROVED',
				},
			],
		},
		{
			failsRequired: 1,
			teamSize: 5,
			state: 'SUCCESS',
			numFails: 0,
			team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
			proposals: [
				{
					proposer: 'STEVEN',
					team: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN'],
					votes: ['JOSH', 'STEVEN', 'FLORA', 'LUKE', 'KEN', 'ROB', 'CRAIG', 'JUSTIN'],
					state: 'APPROVED',
				},
			],
		},
	],
	outcome: {
		winner: 'EVIL',
		reason: 'Merlin Assassinated',
		message: 'ROB (Evil Assassin) correctly identified KEN as Merlin',
		assassinated: 'KEN',
		state: 'EVIL_WIN',
		roles: [
			{name: 'CRAIG', role: 'Morgana', assassin: false},
			{name: 'JUSTIN', role: 'Oberon', assassin: false},
			{name: 'ROB', role: 'Evil Minion', assassin: true},
			{name: 'KEN', role: 'Merlin', assassin: false},
			{name: 'STEVEN', role: 'Percival', assassin: false},
			{name: 'LUKE', role: 'Loyal', assassin: false},
			{name: 'JOSH', role: 'Loyal', assassin: false},
			{name: 'FLORA', role: 'Loyal', assassin: false},
		],
		votes: [
			{KEN: true, STEVEN: true, LUKE: true},
			{CRAIG: false, KEN: true, STEVEN: true, FLORA: true},
			{ROB: false, KEN: true, JOSH: true, LUKE: true},
			{JOSH: true, STEVEN: true, FLORA: true, LUKE: true, KEN: true},
			{JOSH: true, STEVEN: true, FLORA: true, LUKE: true, KEN: true},
		],
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

// Game where Percival proposes Morgana
const percivalMorganaGame: Game = {
	...sampleGame,
	id: 'percival-morgana-game',
	missions: [
		{
			failsRequired: 1,
			teamSize: 3,
			state: 'FAIL',
			numFails: 1,
			team: ['STEVEN', 'CRAIG', 'LUKE'],
			proposals: [
				{
					proposer: 'STEVEN', // Percival
					team: ['STEVEN', 'CRAIG', 'LUKE'], // Craig is Morgana
					votes: ['STEVEN', 'CRAIG', 'LUKE', 'ROB'],
					state: 'APPROVED',
				},
			],
		},
		...sampleGame.missions.slice(1),
	],
};

export const PercivalProposingMorgana: Story = {
	args: {
		game: percivalMorganaGame,
		showSecrets: true,
	},
};

// Game with protest vote
const protestVoteGame: Game = {
	...sampleGame,
	id: 'protest-vote-game',
	missions: [
		{
			failsRequired: 1,
			teamSize: 3,
			state: 'SUCCESS',
			numFails: 0,
			team: ['KEN', 'STEVEN', 'LUKE'],
			proposals: [
				{
					proposer: 'CRAIG',
					team: ['CRAIG', 'ROB', 'JUSTIN'],
					votes: ['CRAIG', 'ROB', 'JUSTIN'],
					state: 'REJECTED',
				},
				{proposer: 'JUSTIN', team: ['JUSTIN', 'ROB', 'FLORA'], votes: ['JUSTIN', 'ROB'], state: 'REJECTED'},
				{proposer: 'ROB', team: ['ROB', 'CRAIG', 'JOSH'], votes: ['ROB', 'CRAIG'], state: 'REJECTED'},
				{proposer: 'KEN', team: ['KEN', 'CRAIG', 'LUKE'], votes: ['KEN', 'CRAIG', 'LUKE'], state: 'REJECTED'},
				{
					proposer: 'STEVEN',
					team: ['KEN', 'STEVEN', 'LUKE'],
					votes: ['KEN', 'STEVEN', 'LUKE', 'JOSH', 'FLORA', 'ROB'], // Craig protest voted!
					state: 'APPROVED',
				},
			],
		},
		...sampleGame.missions.slice(1),
	],
};

export const WithProtestVote: Story = {
	args: {
		game: protestVoteGame,
		showSecrets: true,
	},
};
