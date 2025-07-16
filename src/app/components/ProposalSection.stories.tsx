import type {Meta, StoryObj} from '@storybook/react-vite';
import {ProposalSectionComponent} from './ProposalSection';
import type {Mission} from '../models/game';

const meta: Meta<typeof ProposalSectionComponent> = {
	title: 'Game/ProposalSection',
	component: ProposalSectionComponent,
	parameters: {
		layout: 'padded',
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMission: Mission = {
	failsRequired: 1,
	teamSize: 3,
	state: 'SUCCESS',
	numFails: 0,
	team: ['Alice', 'Bob', 'Charlie'],
	proposals: [
		{
			proposer: 'Alice',
			team: ['Alice', 'Bob', 'David'],
			votes: ['Alice', 'Bob'],
			state: 'REJECTED',
		},
		{
			proposer: 'Bob',
			team: ['Bob', 'Charlie', 'Eve'],
			votes: ['Bob'],
			state: 'REJECTED',
		},
		{
			proposer: 'Charlie',
			team: ['Alice', 'Bob', 'Charlie'],
			votes: ['Alice', 'Bob', 'Charlie', 'David'],
			state: 'APPROVED',
		},
	],
};

const failedMission: Mission = {
	failsRequired: 1,
	teamSize: 3,
	state: 'FAIL',
	numFails: 2,
	team: ['Alice', 'Bob', 'Charlie'],
	proposals: [
		{
			proposer: 'Eve',
			team: ['Eve', 'Bob', 'Charlie'],
			votes: ['Eve', 'Bob', 'Charlie'],
			state: 'APPROVED',
		},
	],
};

const pendingMission: Mission = {
	failsRequired: 2,
	teamSize: 4,
	state: 'PENDING',
	team: [],
	proposals: [
		{
			proposer: 'Alice',
			team: ['Alice', 'Bob', 'Charlie', 'David'],
			votes: ['Alice', 'Bob'],
			state: 'REJECTED',
		},
		{
			proposer: 'Bob',
			team: ['Bob', 'Charlie', 'David', 'Eve'],
			votes: ['Bob', 'Charlie'],
			state: 'REJECTED',
		},
	],
};

export const SuccessfulMission: Story = {
	args: {
		mission: sampleMission,
		missionNumber: 1,
	},
};

export const FailedMission: Story = {
	args: {
		mission: failedMission,
		missionNumber: 2,
	},
};

export const PendingMission: Story = {
	args: {
		mission: pendingMission,
		missionNumber: 3,
	},
};

export const LaterMission: Story = {
	args: {
		mission: {
			...sampleMission,
			teamSize: 4,
			team: ['Alice', 'Bob', 'Charlie', 'David'],
			proposals: [
				{
					proposer: 'David',
					team: ['Alice', 'Bob', 'Charlie', 'David'],
					votes: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
					state: 'APPROVED',
				},
			],
		},
		missionNumber: 5,
	},
};
