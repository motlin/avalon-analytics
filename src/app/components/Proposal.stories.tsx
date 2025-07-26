import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {ProposalComponent} from './Proposal';

const meta: Meta<typeof ProposalComponent> = {
	title: 'Components/Proposal',
	component: ProposalComponent,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
	argTypes: {
		proposalNumber: {
			control: {type: 'number', min: 1, max: 5},
		},
		missionNumber: {
			control: {type: 'number', min: 1, max: 5},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ApprovedProposal: Story = {
	args: {
		proposal: {
			proposer: 'Alice',
			team: ['Alice', 'Bob', 'Charlie'],
			votes: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
			state: 'APPROVED',
		},
		proposalNumber: 1,
	},
};

export const RejectedProposal: Story = {
	args: {
		proposal: {
			proposer: 'Bob',
			team: ['Bob', 'Diana', 'Frank'],
			votes: ['Bob', 'Diana'],
			state: 'REJECTED',
		},
		proposalNumber: 2,
	},
};

export const LargeTeamProposal: Story = {
	args: {
		proposal: {
			proposer: 'Charlie',
			team: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'],
			votes: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'],
			state: 'APPROVED',
		},
		proposalNumber: 3,
	},
};

export const NoVotesYet: Story = {
	args: {
		proposal: {
			proposer: 'Diana',
			team: ['Diana', 'Eve', 'Frank', 'George'],
			votes: [],
			state: 'REJECTED',
		},
		proposalNumber: 4,
	},
};

export const MinimalApproval: Story = {
	args: {
		proposal: {
			proposer: 'Eve',
			team: ['Alice', 'Bob', 'Charlie'],
			votes: ['Alice', 'Bob', 'Charlie'],
			state: 'APPROVED',
		},
		proposalNumber: 5,
	},
};
