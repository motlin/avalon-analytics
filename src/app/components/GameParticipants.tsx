import React, {useState} from 'react';
import GamePlayerList from './GamePlayerList';
import RoleList from './RoleList';
import styles from './GameParticipants.module.css';
import type {AvalonApi} from './types';

interface GameParticipantsProps {
	avalon: AvalonApi;
	onSelectedPlayers: (players: string[]) => void;
}

const GameParticipants: React.FC<GameParticipantsProps> = ({avalon, onSelectedPlayers}) => {
	const [activeTab, setActiveTab] = useState(0);

	const tabs = ['Players', 'Roles'];

	const roles = avalon.lobby.game.roles?.map((r) => avalon.config.roleMap[r]) || [];

	return (
		<div className={styles.gameParticipants}>
			<div className={styles.tabBar}>
				{tabs.map((tab, index) => (
					<button
						key={index}
						className={`${styles.tab} ${activeTab === index ? styles.activeTab : ''}`}
						onClick={() => setActiveTab(index)}
					>
						{tab}
					</button>
				))}
			</div>

			<div className={styles.tabContent}>
				{activeTab === 0 && (
					<GamePlayerList
						avalon={avalon}
						onSelectedPlayers={onSelectedPlayers}
					/>
				)}
				{activeTab === 1 && (
					<RoleList
						roles={roles}
						allowSelect={false}
					/>
				)}
			</div>
		</div>
	);
};

export default GameParticipants;
