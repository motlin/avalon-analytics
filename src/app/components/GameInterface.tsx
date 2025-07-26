import React, {useState} from 'react';
import Missions from './Missions';
import GameParticipants from './GameParticipants';
import ActionPane from './ActionPane';
import styles from './GameInterface.module.css';

interface Role {
	name: string;
	team: 'good' | 'evil';
	description: string;
}

interface RoleConfig {
	[key: string]: Role;
}

interface Mission {
	state: 'PENDING' | 'SUCCESS' | 'FAIL';
	teamSize: number;
	failsRequired: number;
	numFails: number;
	team: {joinWithAnd: () => string};
	proposals?: Array<{
		proposer: string;
		team: string[];
		votes: string[];
		state: 'PENDING' | 'APPROVED' | 'REJECTED';
	}>;
}

interface GameData {
	missions: Mission[];
	currentMissionIdx: number;
	phase: string;
	players: string[];
	roles: string[];
	options?: {
		inGameLog: boolean;
	};
}

interface Config {
	roleMap: RoleConfig;
}

interface Lobby {
	game: {
		currentMissionIdx: number;
		roles: string[];
	};
}

interface AvalonData {
	game: GameData;
	lobby: Lobby;
	config: Config;
}

interface GameInterfaceProps {
	avalon: AvalonData;
}

const GameInterface: React.FC<GameInterfaceProps> = ({avalon}) => {
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

export default GameInterface;
