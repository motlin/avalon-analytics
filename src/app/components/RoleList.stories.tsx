import type {Meta, StoryObj} from '@storybook/react-vite';
import RoleList from './RoleList';

const meta: Meta<typeof RoleList> = {
	title: 'Lobby/RoleList',
	component: RoleList,
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
The RoleList component displays all available roles in Avalon with their team affiliations and abilities. It can function as both a reference guide and an interactive selection interface.

### Display Modes

- **Reference Mode** - Shows role information without interaction
- **Selection Mode** - Includes checkboxes for role configuration in lobby

### Role Categories

**Good Team (Blue)**
- **Merlin** - Knows evil (except Mordred), but can be assassinated
- **Percival** - Sees Merlin and Morgana, but not which is which
- **Loyal Follower** - No special knowledge

**Evil Team (Red)**
- **Morgana** - Appears as Merlin to Percival
- **Mordred** - Hidden from Merlin's sight
- **Oberon** - Works alone, unknown to other evil players
- **Assassin** - Gets one chance to identify Merlin
- **Evil Minion** - Standard evil team member

### Visual Design

- Color-coded by team (blue for good, red for evil)
- Icons represent each role's unique abilities
- Hover effects provide additional context
- Selected roles are highlighted when in selection mode
        `,
			},
		},
	},
	argTypes: {
		allowSelect: {
			control: 'boolean',
			description: 'Allow selecting roles with checkboxes',
		},
	},
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleRoles = [
	{
		name: 'MERLIN',
		team: 'good' as const,
		description: 'Merlin sees all evil people (except for Mordred), but can also be assassinated.',
		selected: false,
	},
	{
		name: 'PERCIVAL',
		team: 'good' as const,
		description: 'Percival can see Merlin and Morgana but does not know which one is which.',
		selected: false,
	},
	{
		name: 'LOYAL FOLLOWER',
		team: 'good' as const,
		description: 'Loyal Follower is a genuinely good person.',
		selected: true,
	},
	{
		name: 'MORGANA',
		team: 'evil' as const,
		description:
			'Morgana appears indistinguishable from Merlin to Percival. She sees other evil people (except Oberon)',
		selected: false,
	},
	{
		name: 'MORDRED',
		team: 'evil' as const,
		description: 'Mordred is invisible to Merlin. Mordred can see other evil people (except Oberon)',
		selected: false,
	},
	{
		name: 'OBERON',
		team: 'evil' as const,
		description: 'Oberon does not see anyone on his team and his teammates do not see him.',
		selected: false,
	},
	{
		name: 'EVIL MINION',
		team: 'evil' as const,
		description: 'Evil Minion is pretty evil. He can see other evil people (except Oberon)',
		selected: true,
	},
];

export const Default: Story = {
	args: {
		roles: sampleRoles,
		allowSelect: false,
	},
};

export const WithSelection: Story = {
	args: {
		roles: sampleRoles,
		allowSelect: true,
	},
};

export const OnlyGoodRoles: Story = {
	args: {
		roles: sampleRoles.filter((role) => role.team === 'good'),
		allowSelect: false,
	},
};

export const OnlyEvilRoles: Story = {
	args: {
		roles: sampleRoles.filter((role) => role.team === 'evil'),
		allowSelect: true,
	},
};
