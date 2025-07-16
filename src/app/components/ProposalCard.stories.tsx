import type {Meta, StoryObj} from '@storybook/react-vite';
import {ProposalCardComponent} from './ProposalCard';

const meta: Meta<typeof ProposalCardComponent> = {
	title: 'Components/ProposalCard',
	component: ProposalCardComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ApprovedProposal: Story = {
	args: {
		proposal: {
			proposer: 'Alice',
			team: ['Alice', 'Bob', 'Charlie'],
			votes: ['Alice', 'Bob', 'Charlie'],
			state: 'APPROVED',
		},
		proposalNumber: 1,
	},
};

export const RejectedProposal: Story = {
	args: {
		proposal: {
			proposer: 'Bob',
			team: ['Bob', 'Diana', 'Eve'],
			votes: ['Bob'],
			state: 'REJECTED',
		},
		proposalNumber: 2,
	},
};

export const LargeTeamProposal: Story = {
	args: {
		proposal: {
			proposer: 'Charlie',
			team: ['Charlie', 'Alice', 'Bob', 'Diana', 'Eve'],
			votes: ['Charlie', 'Alice', 'Bob'],
			state: 'REJECTED',
		},
		proposalNumber: 3,
	},
};

export const WithMissionNumber: Story = {
	args: {
		proposal: {
			proposer: 'Diana',
			team: ['Diana', 'Eve', 'Frank', 'Grace'],
			votes: ['Diana', 'Eve', 'Frank', 'Grace'],
			state: 'APPROVED',
		},
		proposalNumber: 1,
		missionNumber: 3,
	},
};

export const NoVotes: Story = {
	args: {
		proposal: {
			proposer: 'Eve',
			team: ['Eve', 'Frank'],
			votes: [],
			state: 'REJECTED',
		},
		proposalNumber: 5,
	},
};

export const PartialApproval: Story = {
	args: {
		proposal: {
			proposer: 'Frank',
			team: ['Frank', 'Grace', 'Harry', 'Ivy', 'Jack'],
			votes: ['Frank', 'Grace', 'Harry'],
			state: 'APPROVED',
		},
		proposalNumber: 2,
		missionNumber: 4,
	},
};
