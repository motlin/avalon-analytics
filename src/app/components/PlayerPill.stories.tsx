import type {Meta, StoryObj} from '@storybook/react-vite-vite';
import {PlayerPillComponent} from './PlayerPill';

const meta: Meta<typeof PlayerPillComponent> = {
	title: 'Components/PlayerPill',
	component: PlayerPillComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		player: {
			description: 'Player object with uid, name, and optional role',
		},
		size: {
			description: 'Size of the pill',
			control: {type: 'select'},
			options: ['small', 'medium', 'large'],
		},
		showRole: {
			description: 'Whether to show the player role',
			control: {type: 'boolean'},
		},
		onClick: {
			description: 'Click handler for interactive pills',
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

export const Small: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		size: 'small',
	},
};

export const Large: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		size: 'large',
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

export const Clickable: Story = {
	args: {
		player: {
			uid: '1234',
			name: 'Alice',
		},
		onClick: () => console.log('Player clicked'),
	},
};

export const ClickableWithRole: Story = {
	args: {
		player: {
			uid: '5678',
			name: 'Bob',
			role: 'Mordred',
		},
		showRole: true,
		onClick: () => console.log('Player clicked'),
	},
};

export const LongName: Story = {
	args: {
		player: {
			uid: '3456',
			name: 'Alexandria the Great',
			role: 'Percival',
		},
		showRole: true,
	},
};

export const MultipleInRow: Story = {
	render: () => (
		<div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
			<PlayerPillComponent
				player={{uid: '1', name: 'Alice'}}
				size="small"
			/>
			<PlayerPillComponent
				player={{uid: '2', name: 'Bob', role: 'Merlin'}}
				size="small"
				showRole
			/>
			<PlayerPillComponent
				player={{uid: '3', name: 'Charlie'}}
				size="small"
			/>
			<PlayerPillComponent
				player={{uid: '4', name: 'Diana', role: 'Mordred'}}
				size="small"
				showRole
			/>
			<PlayerPillComponent
				player={{uid: '5', name: 'Eve'}}
				size="small"
			/>
		</div>
	),
};

export const AllSizes: Story = {
	render: () => (
		<div style={{display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start'}}>
			<PlayerPillComponent
				player={{uid: '1', name: 'Alice'}}
				size="small"
			/>
			<PlayerPillComponent
				player={{uid: '1', name: 'Alice'}}
				size="medium"
			/>
			<PlayerPillComponent
				player={{uid: '1', name: 'Alice'}}
				size="large"
			/>
		</div>
	),
};
