import styles from './GameConclusion.module.css';

interface GameConclusionProps {
	winner: 'GOOD' | 'EVIL';
	reason: string;
	assassinated?: string;
	roles?: Array<{
		name: string;
		role: string;
		assassin?: boolean;
	}>;
}

export function GameConclusionComponent({winner, reason, assassinated, roles}: GameConclusionProps) {
	const isGoodWin = winner === 'GOOD';
	const assassin = roles?.find((r) => r.assassin)?.name;

	const getTitle = () => {
		if (isGoodWin) {
			return 'Good wins!';
		}
		return 'Evil wins!';
	};

	return (
		<div className={styles.container}>
			<div className={styles.title}>
				<h2>{getTitle()}</h2>
			</div>
			<div className={styles.content}>
				<p className={styles.message}>{reason}</p>
				{assassinated && (
					<p className={styles.assassinationInfo}>
						{assassinated} was assassinated by {assassin || 'The Assassin'}
					</p>
				)}
			</div>
		</div>
	);
}
