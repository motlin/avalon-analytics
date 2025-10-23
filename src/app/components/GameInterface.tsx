import React, {useState} from 'react';
import Missions from './Missions';
import GameParticipants from './GameParticipants';
import ActionPane from './ActionPane';
import styles from './GameInterface.module.css';
import type {AvalonData} from './types';

interface GameInterfaceProps {
	avalon: AvalonData;
}

const GameInterface: React.FC<GameInterfaceProps> = ({avalon}: GameInterfaceProps) => {
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

	const updateSelectedPlayers = (newList: string[]) => {
		setSelectedPlayers(newList);
	};

	return (
		<div className={styles.root}>
			<div className={styles.container}>
				<Missions avalon={avalon as any} />
			</div>
			<div className={styles.container}>
				<GameParticipants
					avalon={avalon as any}
					onSelectedPlayers={updateSelectedPlayers}
				/>
			</div>
			<div className={styles.container}>
				<ActionPane
					avalon={avalon as any}
					selectedPlayers={selectedPlayers}
				/>
			</div>
		</div>
	);
};

export default GameInterface;
