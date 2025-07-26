import React from 'react';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {TimelineSection} from './TimelineSection';
import type {Game} from '../models/game';

const meta: Meta<typeof TimelineSection> = {
	title: 'Components/TimelineSection',
	component: TimelineSection,
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'light',
		},
	},
	argTypes: {
		showPlayerNames: {
			control: 'boolean',
			description: 'Whether to show player names in the timeline',
		},
		expandedByDefault: {
			control: 'boolean',
			description: 'Whether timeline events are expanded by default',
		},
	},
};

export default meta;
type Story = StoryObj<typeof TimelineSection>;

const sampleGame: Game = {
	id: 'game-123',
	timeCreated: new Date('2024-01-15T10:00:00'),
	timeFinished: new Date('2024-01-15T10:45:00'),
	players: [
		{uid: 'player1', name: 'Alice', role: 'Merlin'},
		{uid: 'player2', name: 'Bob', role: 'Percival'},
		{uid: 'player3', name: 'Charlie', role: 'Loyal Servant'},
		{uid: 'player4', name: 'Diana', role: 'Morgana'},
		{uid: 'player5', name: 'Eve', role: 'Assassin'},
	],
	missions: [
		{
			teamSize: 2,
			failsRequired: 1,
			state: 'SUCCESS',
			numFails: 0,
			team: ['player1', 'player2'],
			proposals: [
				{
					proposer: 'player1',
					team: ['player1', 'player3'],
					votes: ['player1', 'player3'],
					state: 'REJECTED',
				},
				{
					proposer: 'player2',
					team: ['player1', 'player2'],
					votes: ['player1', 'player2', 'player3'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'FAIL',
			numFails: 1,
			team: ['player2', 'player3', 'player4'],
			proposals: [
				{
					proposer: 'player3',
					team: ['player2', 'player3', 'player4'],
					votes: ['player1', 'player2', 'player3', 'player4'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 2,
			failsRequired: 1,
			state: 'SUCCESS',
			numFails: 0,
			team: ['player1', 'player5'],
			proposals: [
				{
					proposer: 'player4',
					team: ['player3', 'player4'],
					votes: ['player4', 'player5'],
					state: 'REJECTED',
				},
				{
					proposer: 'player5',
					team: ['player1', 'player5'],
					votes: ['player1', 'player2', 'player3', 'player5'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'FAIL',
			numFails: 2,
			team: ['player2', 'player4', 'player5'],
			proposals: [
				{
					proposer: 'player1',
					team: ['player2', 'player4', 'player5'],
					votes: ['player1', 'player2', 'player4', 'player5'],
					state: 'APPROVED',
				},
			],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'PENDING',
			proposals: [],
			team: [],
		},
	],
	outcome: {
		state: 'EVIL_WIN',
		winner: 'EVIL',
		reason: 'Evil won by failing 2 missions',
	},
	options: {
		enableLancelot: false,
		enableTwoFailProtection: false,
		enableLadyOfTheLake: false,
	},
};

const inProgressGame: Game = {
	...sampleGame,
	timeFinished: undefined,
	outcome: undefined,
	missions: [
		...sampleGame.missions.slice(0, 2),
		{
			teamSize: 2,
			failsRequired: 1,
			state: 'PENDING',
			proposals: [
				{
					proposer: 'player4',
					team: ['player3', 'player4'],
					votes: ['player4', 'player5'],
					state: 'REJECTED',
				},
			],
			team: [],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'PENDING',
			proposals: [],
			team: [],
		},
		{
			teamSize: 3,
			failsRequired: 1,
			state: 'PENDING',
			proposals: [],
			team: [],
		},
	],
};

export const Default: Story = {
	args: {
		game: sampleGame,
		showPlayerNames: true,
		expandedByDefault: false,
	},
};

export const WithoutPlayerNames: Story = {
	args: {
		game: sampleGame,
		showPlayerNames: false,
		expandedByDefault: false,
	},
};

export const ExpandedByDefault: Story = {
	args: {
		game: sampleGame,
		showPlayerNames: true,
		expandedByDefault: true,
	},
};

export const InProgressGame: Story = {
	args: {
		game: inProgressGame,
		showPlayerNames: true,
		expandedByDefault: false,
	},
};

export const ShortGame: Story = {
	args: {
		game: {
			...sampleGame,
			timeFinished: new Date('2024-01-15T10:15:00'),
			missions: [
				sampleGame.missions[0],
				{
					...sampleGame.missions[1],
					state: 'SUCCESS',
					numFails: 0,
				},
				{
					...sampleGame.missions[2],
					state: 'SUCCESS',
					numFails: 0,
				},
			],
			outcome: {
				state: 'GOOD_WIN',
				winner: 'GOOD',
				reason: 'Good won by succeeding 3 missions',
			},
		},
		showPlayerNames: true,
		expandedByDefault: false,
	},
};
