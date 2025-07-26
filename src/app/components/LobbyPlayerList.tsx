import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import type React from 'react';
import {useEffect, useState} from 'react';
import styles from './LobbyPlayerList.module.css';
import StarIcon from '@mui/icons-material/Star';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBars} from '@fortawesome/free-solid-svg-icons';

interface User {
	name: string;
}

interface Admin {
	name: string;
}

interface Config {
	playerList: string[];
	sortList: (newList: string[]) => void;
}

interface AvalonProps {
	config: Config;
	user: User;
	lobby: {
		admin: Admin;
	};
	isAdmin: boolean;
	isGameInProgress: boolean;
	kickPlayer: (player: string) => Promise<void>;
}

interface LobbyPlayerListProps {
	avalon: AvalonProps;
}

interface SortableItemProps {
	id: string;
	player: string;
	avalon: AvalonProps;
	canDrag: boolean;
	playersBeingKicked: string[];
	onKickPlayerConfirm: (player: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
	id,
	player,
	avalon,
	canDrag,
	playersBeingKicked,
	onKickPlayerConfirm,
}) => {
	const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	const getPlayerIcon = () => {
		if (player === avalon.lobby.admin.name) {
			return <StarIcon />;
		} else if (player === avalon.user.name) {
			return <PermIdentityIcon />;
		} else {
			return <PersonIcon />;
		}
	};

	const isKickable = avalon.isAdmin && player !== avalon.user.name && !avalon.isGameInProgress;

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={styles.listItem}
		>
			{canDrag && (
				<div
					className={styles.dragHandle}
					{...attributes}
					{...listeners}
				>
					<FontAwesomeIcon icon={faBars} />
				</div>
			)}
			<div className={styles.playerIcon}>{getPlayerIcon()}</div>
			<div className={styles.playerName}>{player}</div>
			{isKickable && (
				<button
					className={`${styles.kickButton} ${playersBeingKicked.includes(player) ? styles.loading : ''}`}
					onClick={() => onKickPlayerConfirm(player)}
					disabled={playersBeingKicked.includes(player)}
				>
					{playersBeingKicked.includes(player) ? <HourglassEmptyIcon /> : <ClearIcon />}
				</button>
			)}
		</div>
	);
};

const LobbyPlayerList: React.FC<LobbyPlayerListProps> = ({avalon}) => {
	const [playerList, setPlayerList] = useState<string[]>(avalon.config.playerList);
	const [kickPlayerDialog, setKickPlayerDialog] = useState(false);
	const [playerToKick, setPlayerToKick] = useState('');
	const [playersBeingKicked, setPlayersBeingKicked] = useState<string[]>([]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const canDrag = avalon.isAdmin && !avalon.isGameInProgress;

	// Update local state when avalon.config.playerList changes
	useEffect(() => {
		setPlayerList(avalon.config.playerList);
	}, [avalon.config.playerList]);

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event;

		if (active.id !== over?.id) {
			setPlayerList((items) => {
				const oldIndex = items.indexOf(active.id as string);
				const newIndex = items.indexOf(over?.id as string);
				const newList = arrayMove(items, oldIndex, newIndex);

				// Call the avalon config method to update the server
				avalon.config.sortList(newList);

				return newList;
			});
		}
	};

	const kickPlayerConfirm = (player: string) => {
		setPlayerToKick(player);
		setKickPlayerDialog(true);
	};

	const handleKickPlayer = async (player: string) => {
		setKickPlayerDialog(false);
		setPlayersBeingKicked((prev) => [...prev, player]);

		try {
			await avalon.kickPlayer(player);
		} finally {
			setPlayersBeingKicked((prev) => prev.filter((p) => p !== player));
		}
	};

	const handleCancelKick = () => {
		setKickPlayerDialog(false);
		setPlayerToKick('');
	};

	return (
		<div className={styles.container}>
			{/* Kick Player Dialog */}
			{kickPlayerDialog && (
				<div className={styles.dialogOverlay}>
					<div className={styles.dialog}>
						<div className={styles.dialogTitle}>
							<h3>Kick {playerToKick}?</h3>
						</div>
						<div className={styles.dialogContent}>Do you wish to kick {playerToKick} from the lobby?</div>
						<div className={styles.dialogActions}>
							<button
								className={styles.kickConfirmButton}
								onClick={() => handleKickPlayer(playerToKick)}
							>
								Kick {playerToKick}
							</button>
							<button
								className={styles.cancelButton}
								onClick={handleCancelKick}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Player List */}
			<div className={styles.playerList}>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={playerList}
						strategy={verticalListSortingStrategy}
					>
						{playerList.map((player) => (
							<SortableItem
								key={player}
								id={player}
								player={player}
								avalon={avalon}
								canDrag={canDrag}
								playersBeingKicked={playersBeingKicked}
								onKickPlayerConfirm={kickPlayerConfirm}
							/>
						))}
					</SortableContext>
				</DndContext>
			</div>
		</div>
	);
};

export default LobbyPlayerList;
