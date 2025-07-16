export type BadgeStatus = 'success' | 'fail' | 'pending' | 'approved' | 'rejected';

interface BadgeProps {
	status: BadgeStatus;
	text?: string;
}

const statusConfig: Record<BadgeStatus, {backgroundColor: string; color: string; defaultText: string}> = {
	success: {
		backgroundColor: '#d4edda',
		color: '#155724',
		defaultText: 'Success',
	},
	fail: {
		backgroundColor: '#f8d7da',
		color: '#721c24',
		defaultText: 'Fail',
	},
	pending: {
		backgroundColor: '#fff3cd',
		color: '#856404',
		defaultText: 'Pending',
	},
	approved: {
		backgroundColor: '#d1ecf1',
		color: '#0c5460',
		defaultText: 'Approved',
	},
	rejected: {
		backgroundColor: '#f5c6cb',
		color: '#721c24',
		defaultText: 'Rejected',
	},
};

export function Badge({status, text}: BadgeProps) {
	const config = statusConfig[status];

	return (
		<span
			style={{
				display: 'inline-block',
				padding: '0.25rem 0.5rem',
				borderRadius: '0.25rem',
				fontSize: '0.875rem',
				fontWeight: 500,
				backgroundColor: config.backgroundColor,
				color: config.color,
				border: `1px solid ${config.color}`,
			}}
		>
			{text || config.defaultText}
		</span>
	);
}
