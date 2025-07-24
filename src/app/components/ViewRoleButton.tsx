import React, {useState, useEffect} from 'react';
import styles from './ViewRoleButton.module.css';
import StatsDisplay from './StatsDisplay';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faOldRepublic} from '@fortawesome/free-brands-svg-icons';
import {faEmpire} from '@fortawesome/free-brands-svg-icons';

interface User {
	name: string;
	stats: {
		games?: number;
		good?: number;
		wins?: number;
		good_wins?: number;
		playtimeSeconds?: number;
	};
}

interface Role {
	role: {
		name: string;
		team: string;
		description: string;
	};
	assassin: boolean;
	sees: string[];
}

interface Lobby {
	role: Role;
}

interface GlobalStats {
	games: number;
	good_wins: number;
}

interface AvalonProps {
	user: User;
	lobby: Lobby;
	globalStats: GlobalStats;
	isGameInProgress: boolean;
	onEvent?: (callback: (event: string, ...args: any[]) => void) => () => void;
}

interface ViewRoleButtonProps {
	avalon: AvalonProps;
}

function joinWithAnd(array: string[]): string {
	if (array.length === 0) return '';
	if (array.length === 1) return array[0];
	const arrCopy = array.slice(0);
	const lastElement = arrCopy.pop();
	return arrCopy.join(', ') + ' and ' + lastElement;
}

const ViewRoleButton: React.FC<ViewRoleButtonProps> = ({avalon}) => {
	const [sheet, setSheet] = useState(false);

	useEffect(() => {
		if (!avalon.onEvent) {
			return;
		}

		const unsubscribe = avalon.onEvent((event: string) => {
			if (event === 'show-role') {
				setSheet(true);
			} else if (event === 'GAME_ENDED') {
				setSheet(false);
			}
		});

		return unsubscribe;
	}, [avalon]);

	const handleButtonClick = () => {
		setSheet(true);
	};

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			setSheet(false);
		}
	};

	if (!sheet) {
		return (
			<button
				className={styles.activatorButton}
				onClick={handleButtonClick}
			>
				<PermIdentityIcon />
				{avalon.user.name}
			</button>
		);
	}

	return (
		<div
			className={styles.overlay}
			onClick={handleOverlayClick}
		>
			<div className={styles.bottomSheet}>
				{!avalon.isGameInProgress ? (
					<div className={styles.card}>
						<div className={styles.cardTitle}>
							<div className={styles.titleContent}>
								<div className={styles.fontWeightBold}>
									When the game starts, you will see your role here.
								</div>
							</div>
						</div>
						<div className={styles.cardText}>
							<div className={styles.statsContent}>
								<p className={styles.subheading}>Your Stats</p>
								<StatsDisplay
									stats={avalon.user.stats}
									globalStats={avalon.globalStats}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className={styles.card}>
						<div className={`${styles.cardTitle} ${styles.roleTitle}`}>
							<span
								className={styles.roleIcon}
								style={avalon.lobby.role.role.team === 'evil' ? {color: 'red'} : undefined}
							>
								<FontAwesomeIcon
									icon={avalon.lobby.role.role.team === 'good' ? faOldRepublic : faEmpire}
								/>
							</span>
							<span className={styles.roleName}>{avalon.lobby.role.role.name}</span>
						</div>
						<div className={styles.cardText}>
							<p>
								Your role is{' '}
								<span className={styles.fontWeightMedium}>{avalon.lobby.role.role.name}</span>.
							</p>
							<p>
								You are on the{' '}
								<span className={styles.fontWeightMedium}>{avalon.lobby.role.role.team}</span> team.
							</p>
							<p>{avalon.lobby.role.role.description}</p>
							{avalon.lobby.role.assassin && (
								<p>
									You are also the <span className={styles.fontWeightMedium}>ASSASSIN</span>! It will
									be up to you to identify MERLIN if the good team succeeds 3 missions.
								</p>
							)}
							{avalon.lobby.role.sees.length > 0 ? (
								<div>
									<p>
										You see{' '}
										<span className={styles.fontWeightBold}>
											{joinWithAnd(avalon.lobby.role.sees)}
										</span>
										.
									</p>
								</div>
							) : (
								<p>You do not see anyone.</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ViewRoleButton;
