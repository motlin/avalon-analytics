import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge} from './Badge';

const meta: Meta<typeof Badge> = {
	title: 'Components/Badge',
	component: Badge,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		status: {
			description: 'Status of the badge',
			control: {type: 'select'},
			options: ['success', 'fail', 'pending', 'approved', 'rejected'],
		},
		text: {
			description: 'Custom text to display (optional)',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
	args: {
		status: 'success',
	},
};

export const Fail: Story = {
	args: {
		status: 'fail',
	},
};

export const Pending: Story = {
	args: {
		status: 'pending',
	},
};

export const Approved: Story = {
	args: {
		status: 'approved',
	},
};

export const Rejected: Story = {
	args: {
		status: 'rejected',
	},
};

export const CustomText: Story = {
	args: {
		status: 'success',
		text: 'Mission Complete',
	},
};

export const AllStatuses: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
			<Badge status="success" />
			<Badge status="fail" />
			<Badge status="pending" />
			<Badge status="approved" />
			<Badge status="rejected" />
		</div>
	),
};

export const WithCustomTexts: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
			<Badge
				status="success"
				text="Passed"
			/>
			<Badge
				status="fail"
				text="Failed"
			/>
			<Badge
				status="pending"
				text="In Progress"
			/>
			<Badge
				status="approved"
				text="✓ Verified"
			/>
			<Badge
				status="rejected"
				text="✗ Denied"
			/>
		</div>
	),
};
