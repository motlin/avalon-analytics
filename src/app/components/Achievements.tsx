import type React from 'react';
import GameAnalysis from '../avalon-analysis';
import styles from './Achievements.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrophy} from '@fortawesome/free-solid-svg-icons';
import type {AvalonApi} from './types';

interface Badge {
	title: string;
	body: string;
}

interface AchievementsProps {
	avalon: AvalonApi;
}

const Achievements: React.FC<AchievementsProps> = ({avalon}) => {
	const getBadges = (): Badge[] => {
		if (!avalon.lobby.game.outcome?.state || avalon.lobby.game.outcome.state === 'CANCELED') return [];

		const gameWithPlayerNames = {
			...avalon.game,
			players: (avalon.game.players as any[]).map((p: any) => (typeof p === 'string' ? p : p.name)),
		};

		const gameAnalysis = new GameAnalysis(gameWithPlayerNames as any, avalon.config.roleMap);
		return gameAnalysis.getBadges();
	};

	const badges = getBadges();

	if (!badges.length) {
		return null;
	}

	return (
		<div className={styles.container}>
			<div className={styles.title}>Achievements</div>
			{badges.map((badge) => (
				<div
					key={badge.title}
					className={styles.badgeContainer}
				>
					<div className={styles.card}>
						<div className={styles.cardTitle}>
							<FontAwesomeIcon
								icon={faTrophy}
								className={styles.trophyIcon}
								style={{color: 'yellow'}}
							/>
							<div className={styles.badgeTitle}>{badge.title}</div>
						</div>
						<div className={styles.cardText}>{badge.body}</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default Achievements;
