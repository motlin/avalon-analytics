import React, {useState, useEffect} from 'react';
import Achievements from './Achievements';
import {MissionSummaryTable} from './MissionSummaryTable';
import styles from './EndGameEventHandler.module.css';
import type {AvalonApi} from './types';

interface EndGameEventHandlerProps {
	avalon: AvalonApi;
}

const EndGameEventHandler: React.FC<EndGameEventHandlerProps> = ({avalon}) => {
	const [endGameDialog, setEndGameDialog] = useState(false);

	useEffect(() => {
		if (!avalon.onEvent) return;

		const unsubscribe = avalon.onEvent((event: string) => {
			if (event === 'GAME_ENDED') {
				setEndGameDialog(true);
			} else if (event === 'GAME_STARTED') {
				setEndGameDialog(false);
			}
		});

		return unsubscribe;
	}, [avalon]);

	const handleClose = () => {
		setEndGameDialog(false);
	};

	const getTitle = () => {
		if (!avalon.lobby.game?.outcome?.state) return '';

		switch (avalon.lobby.game.outcome.state) {
			case 'GOOD_WIN':
				return 'Good wins!';
			case 'EVIL_WIN':
				return 'Evil wins!';
			case 'CANCELED':
				return 'Game Canceled';
			default:
				return avalon.lobby.game.outcome.state;
		}
	};

	if (!avalon.lobby.game?.outcome) {
		return null;
	}

	if (!endGameDialog) {
		return null;
	}

	return (
		<div className={styles.overlay}>
			<div className={styles.dialog}>
				<div className={styles.card}>
					<div className={styles.title}>
						<h2>{getTitle()}</h2>
					</div>
					<div className={styles.content}>
						<p className={styles.message}>{avalon.lobby.game.outcome.message || ''}</p>
						{avalon.lobby.game.outcome.assassinated && (
							<p className={styles.assassinationInfo}>
								{avalon.lobby.game.outcome.assassinated} was assassinated by{' '}
								{avalon.lobby.game.outcome.roles?.find((r: any) => r.assassin)?.name}
							</p>
						)}
						<div className={styles.tableContainer}>
							<MissionSummaryTable game={avalon.game} />
						</div>
						<Achievements avalon={avalon} />
					</div>
					<div className={styles.actions}>
						<button
							onClick={handleClose}
							className={styles.button}
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EndGameEventHandler;
