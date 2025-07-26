import type React from 'react';
import GameAnalysis from '../avalon-analysis.ts';
import styles from './Achievements.module.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrophy} from '@fortawesome/free-solid-svg-icons';

interface Badge {
	title: string;
	body: string;
}

interface Mission {
	state: string;
	team: string[];
	proposals: any[];
	evilOnTeam?: string[];
	failsRequired: number;
	numFails: number;
}

interface OutcomeRole {
	name: string;
	role: string;
}

interface GameOutcome {
	state: string;
	roles: OutcomeRole[];
	assassinated?: string;
}

interface Game {
	players: string[];
	missions: Mission[];
	outcome: GameOutcome;
}

interface RoleInfo {
	team: string;
}

interface Config {
	roleMap: Record<string, RoleInfo>;
}

interface Lobby {
	game: Game;
}

interface AvalonProps {
	lobby: Lobby;
	config: Config;
}

interface AchievementsProps {
	avalon: AvalonProps;
}

const Achievements: React.FC<AchievementsProps> = ({avalon}) => {
	const getBadges = (): Badge[] => {
		if (avalon.lobby.game.outcome.state === 'CANCELED') return [];

		const gameAnalysis = new GameAnalysis(avalon.lobby.game, avalon.config.roleMap);
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
