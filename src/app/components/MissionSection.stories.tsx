import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {MissionSection} from './MissionSection';
import type {Mission, Game} from '../models/game';

const meta: Meta<typeof MissionSection> = {
	title: 'Game/MissionSection',
	component: MissionSection,
	parameters: {
		layout: 'padded',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockGame = (missions: Mission[]): Game => ({
	id: 'game-1',
	missions,
	players: [
		{uid: 'p1', name: 'Alice'},
		{uid: 'p2', name: 'Bob'},
		{uid: 'p3', name: 'Charlie'},
		{uid: 'p4', name: 'Diana'},
		{uid: 'p5', name: 'Eve'},
	],
	timeCreated: new Date('2024-01-01'),
});

const pendingMission: Mission = {
	failsRequired: 1,
	teamSize: 2,
	proposals: [
		{
			proposer: 'Alice',
			team: ['Alice', 'Bob'],
			votes: ['Alice', 'Bob', 'Charlie'],
			state: 'REJECTED',
		},
		{
			proposer: 'Bob',
			team: ['Bob', 'Charlie'],
			votes: ['Alice', 'Bob', 'Charlie', 'Diana'],
			state: 'APPROVED',
		},
	],
	state: 'PENDING',
	team: ['Bob', 'Charlie'],
};

const successMission: Mission = {
	failsRequired: 1,
	teamSize: 3,
	proposals: [
		{
			proposer: 'Alice',
			team: ['Alice', 'Bob', 'Charlie'],
			votes: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
			state: 'APPROVED',
		},
	],
	state: 'SUCCESS',
	numFails: 0,
	team: ['Alice', 'Bob', 'Charlie'],
};

const failedMission: Mission = {
	failsRequired: 1,
	teamSize: 3,
	proposals: [
		{
			proposer: 'Diana',
			team: ['Diana', 'Eve', 'Alice'],
			votes: ['Diana', 'Eve', 'Alice'],
			state: 'APPROVED',
		},
	],
	state: 'FAIL',
	numFails: 2,
	team: ['Diana', 'Eve', 'Alice'],
};

export const PendingMission: Story = {
	args: {
		mission: pendingMission,
		missionNumber: 1,
		game: createMockGame([pendingMission]),
		showProgressBar: true,
	},
};

export const SuccessfulMission: Story = {
	args: {
		mission: successMission,
		missionNumber: 2,
		game: createMockGame([successMission]),
		showProgressBar: true,
	},
};

export const FailedMission: Story = {
	args: {
		mission: failedMission,
		missionNumber: 3,
		game: createMockGame([failedMission]),
		showProgressBar: true,
	},
};

export const WithoutProgressBar: Story = {
	args: {
		mission: successMission,
		missionNumber: 1,
		game: createMockGame([successMission]),
		showProgressBar: false,
	},
};

export const MultipleProposals: Story = {
	args: {
		mission: {
			...pendingMission,
			proposals: [
				{
					proposer: 'Alice',
					team: ['Alice', 'Bob'],
					votes: ['Alice', 'Bob'],
					state: 'REJECTED',
				},
				{
					proposer: 'Charlie',
					team: ['Charlie', 'Diana'],
					votes: ['Charlie'],
					state: 'REJECTED',
				},
				{
					proposer: 'Eve',
					team: ['Eve', 'Alice'],
					votes: ['Eve', 'Alice', 'Bob', 'Charlie'],
					state: 'APPROVED',
				},
			],
		},
		missionNumber: 2,
		game: createMockGame([pendingMission]),
		showProgressBar: true,
	},
};
