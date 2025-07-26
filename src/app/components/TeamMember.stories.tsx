import * as React from 'react';
const {useState} = React;
import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {TeamMemberComponent} from './TeamMember';

const meta: Meta<typeof TeamMemberComponent> = {
	title: 'Components/TeamMember',
	component: TeamMemberComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		player: {
			description: 'Player object with uid, name, and optional role',
		},
		variant: {
			description: 'Display variant of the team member',
			control: {type: 'select'},
			options: ['default', 'compact', 'detailed'],
		},
		showRole: {
			description: 'Whether to show the player role',
			control: {type: 'boolean'},
		},
		isSelected: {
			description: 'Whether the team member is selected',
			control: {type: 'boolean'},
		},
		isProposer: {
			description: 'Whether the team member is the proposer',
			control: {type: 'boolean'},
		},
		onClick: {
			description: 'Click handler for interactive team members',
			action: 'clicked',
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
	},
};

export const Compact: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		variant: 'compact',
	},
};

export const Detailed: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		variant: 'detailed',
	},
};

export const WithRole: Story = {
	args: {
		player: {
			uid: '5678',
			name: 'Bob',
			role: 'Merlin',
		},
		showRole: true,
	},
};

export const Selected: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		isSelected: true,
	},
};

export const Proposer: Story = {
	args: {
		player: {
			uid: '5678',
			name: 'Bob',
			role: 'Merlin',
		},
		isProposer: true,
		showRole: true,
	},
};

export const SelectedProposer: Story = {
	args: {
		player: {
			uid: '5678',
			name: 'Bob',
			role: 'Merlin',
		},
		isSelected: true,
		isProposer: true,
		showRole: true,
	},
};

export const Clickable: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		onClick: () => console.log('Team member clicked'),
	},
};

export const LongNameWithRole: Story = {
	args: {
		player: {
			uid: '3456',
			name: 'Alexandria the Great',
			role: 'Percival',
		},
		showRole: true,
		variant: 'detailed',
	},
};

export const ProposalTeam: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '400px'}}>
			<TeamMemberComponent
				player={{uid: '1', name: 'Alice', role: 'Merlin'}}
				isProposer
				showRole
			/>
			<TeamMemberComponent
				player={{uid: '2', name: 'Bob'}}
				isSelected
			/>
			<TeamMemberComponent
				player={{uid: '3', name: 'Charlie'}}
				isSelected
			/>
			<TeamMemberComponent
				player={{uid: '4', name: 'Diana', role: 'Mordred'}}
				isSelected
				showRole
			/>
			<TeamMemberComponent player={{uid: '5', name: 'Eve'}} />
		</div>
	),
};

export const AllVariants: Story = {
	render: () => (
		<div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start'}}>
			<div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
				<span style={{minWidth: '80px', fontSize: '0.875rem', color: '#666'}}>Compact:</span>
				<TeamMemberComponent
					player={{uid: '1', name: 'Alice', role: 'Merlin'}}
					variant="compact"
					showRole
				/>
			</div>
			<div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
				<span style={{minWidth: '80px', fontSize: '0.875rem', color: '#666'}}>Default:</span>
				<TeamMemberComponent
					player={{uid: '1', name: 'Alice', role: 'Merlin'}}
					variant="default"
					showRole
				/>
			</div>
			<div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
				<span style={{minWidth: '80px', fontSize: '0.875rem', color: '#666'}}>Detailed:</span>
				<TeamMemberComponent
					player={{uid: '1', name: 'Alice', role: 'Merlin'}}
					variant="detailed"
					showRole
				/>
			</div>
		</div>
	),
};

export const InteractiveSelection: Story = {
	render: () => {
		const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

		const toggleSelection = (uid: string) => {
			setSelectedMembers((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]));
		};

		const players = [
			{uid: '1', name: 'Alice', role: 'Merlin'},
			{uid: '2', name: 'Bob'},
			{uid: '3', name: 'Charlie'},
			{uid: '4', name: 'Diana', role: 'Mordred'},
			{uid: '5', name: 'Eve'},
		];

		return (
			<div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', maxWidth: '400px'}}>
				{players.map((player, index) => (
					<TeamMemberComponent
						key={player.uid}
						player={player}
						isSelected={selectedMembers.includes(player.uid)}
						isProposer={index === 0}
						showRole
						onClick={() => toggleSelection(player.uid)}
					/>
				))}
			</div>
		);
	},
};
