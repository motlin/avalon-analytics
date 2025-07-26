import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {VotingPanel} from './VotingPanel';
import type {Proposal} from '../models/game';

const meta = {
	title: 'Components/VotingPanel',
	component: VotingPanel,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		missionNumber: {
			control: 'number',
			description: 'Mission number to display in the header',
		},
		title: {
			control: 'text',
			description: 'Title displayed in the panel header',
		},
	},
} satisfies Meta<typeof VotingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const singleApprovedProposal: Proposal = {
	proposer: 'Alice',
	team: ['Alice', 'Bob', 'Charlie'],
	votes: ['Alice', 'Bob', 'Charlie'],
	state: 'APPROVED',
};

const singleRejectedProposal: Proposal = {
	proposer: 'David',
	team: ['David', 'Eve', 'Frank'],
	votes: ['David'],
	state: 'REJECTED',
};

const multipleProposals: Proposal[] = [
	{
		proposer: 'Alice',
		team: ['Alice', 'Bob', 'Charlie'],
		votes: ['Alice', 'Bob'],
		state: 'REJECTED',
	},
	{
		proposer: 'David',
		team: ['David', 'Eve', 'Frank'],
		votes: ['David', 'Eve', 'Frank'],
		state: 'APPROVED',
	},
];

const largeTeamProposal: Proposal = {
	proposer: 'Alice',
	team: ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace'],
	votes: ['Alice', 'Bob', 'Charlie', 'David'],
	state: 'APPROVED',
};

const closeVoteProposal: Proposal = {
	proposer: 'Charlie',
	team: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
	votes: ['Charlie', 'David', 'Eve'],
	state: 'APPROVED',
};

export const SingleApprovedProposal: Story = {
	args: {
		proposals: [singleApprovedProposal],
		title: 'Mission Voting Results',
	},
};

export const SingleRejectedProposal: Story = {
	args: {
		proposals: [singleRejectedProposal],
		title: 'Failed Proposal',
	},
};

export const MultipleProposals: Story = {
	args: {
		proposals: multipleProposals,
		missionNumber: 1,
		title: 'Voting Results',
	},
};

export const LargeTeam: Story = {
	args: {
		proposals: [largeTeamProposal],
		missionNumber: 3,
		title: 'Large Team Vote',
	},
};

export const CloseVote: Story = {
	args: {
		proposals: [closeVoteProposal],
		title: 'Close Vote (3-2)',
	},
};

export const EmptyProposals: Story = {
	args: {
		proposals: [],
		title: 'No Proposals Yet',
	},
};

export const MissionWithFiveProposals: Story = {
	args: {
		proposals: [
			{
				proposer: 'Alice',
				team: ['Alice', 'Bob'],
				votes: ['Alice'],
				state: 'REJECTED',
			},
			{
				proposer: 'Bob',
				team: ['Bob', 'Charlie'],
				votes: ['Bob'],
				state: 'REJECTED',
			},
			{
				proposer: 'Charlie',
				team: ['Charlie', 'David'],
				votes: ['Charlie'],
				state: 'REJECTED',
			},
			{
				proposer: 'David',
				team: ['David', 'Eve'],
				votes: ['David'],
				state: 'REJECTED',
			},
			{
				proposer: 'Eve',
				team: ['Eve', 'Alice'],
				votes: ['Eve', 'Alice', 'Bob', 'Charlie', 'David'],
				state: 'APPROVED',
			},
		],
		missionNumber: 2,
		title: 'Multiple Failed Proposals',
	},
};

export const UnanimousApproval: Story = {
	args: {
		proposals: [
			{
				proposer: 'Alice',
				team: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
				votes: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
				state: 'APPROVED',
			},
		],
		missionNumber: 1,
		title: 'Unanimous Decision',
	},
};
