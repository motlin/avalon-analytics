import type {Meta, StoryObj} from '@storybook/react-vite';
import {VoteList} from './VoteList';

const meta = {
	title: 'Components/VoteList',
	component: VoteList,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		title: {
			control: 'text',
			description: 'Title displayed above the vote list',
		},
	},
} satisfies Meta<typeof VoteList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnanimousApproval: Story = {
	args: {
		votes: {
			Alice: true,
			Bob: true,
			Charlie: true,
			David: true,
			Eve: true,
		},
		title: 'Mission Vote',
	},
};

export const MixedVotes: Story = {
	args: {
		votes: {
			Alice: true,
			Bob: false,
			Charlie: true,
			David: false,
			Eve: true,
		},
		title: 'Proposal Vote',
	},
};

export const UnanimousRejection: Story = {
	args: {
		votes: {
			Alice: false,
			Bob: false,
			Charlie: false,
			David: false,
			Eve: false,
		},
		title: 'Failed Proposal',
	},
};

export const SingleVote: Story = {
	args: {
		votes: {
			Alice: true,
		},
		title: 'Solo Decision',
	},
};

export const LargeVoteList: Story = {
	args: {
		votes: {
			Alice: true,
			Bob: false,
			Charlie: true,
			David: true,
			Eve: false,
			Frank: true,
			Grace: false,
			Henry: true,
			Iris: true,
			Jack: false,
		},
		title: 'Large Game Vote',
	},
};

export const NoTitle: Story = {
	args: {
		votes: {
			Alice: true,
			Bob: false,
			Charlie: true,
		},
	},
};

export const CloseVote: Story = {
	args: {
		votes: {
			Alice: true,
			Bob: true,
			Charlie: true,
			David: false,
			Eve: false,
		},
		title: 'Close Decision (3-2)',
	},
};
