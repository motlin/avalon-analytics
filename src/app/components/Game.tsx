import React, {useState} from 'react';
import Missions from './Missions';
import GameParticipants from './GameParticipants';
import ActionPane from './ActionPane';
import styles from './Game.module.css';
import type {AvalonApi} from './types';

interface GameProps {
	avalon: AvalonApi;
}

const Game: React.FC<GameProps> = ({avalon}) => {
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

	const updateSelectedPlayers = (newList: string[]) => {
		setSelectedPlayers(newList);
	};

	return (
		<div className={styles.root}>
			<div className={styles.container}>
				<Missions avalon={avalon} />
			</div>
			<div className={styles.container}>
				<GameParticipants
					avalon={avalon}
					onSelectedPlayers={updateSelectedPlayers}
				/>
			</div>
			<div className={styles.container}>
				<ActionPane
					avalon={avalon}
					selectedPlayers={selectedPlayers}
				/>
			</div>
		</div>
	);
};

export default Game;
