'use client';

import {useState, type ReactNode} from 'react';
import styles from './SpoilerReveal.module.css';

interface GameSummaryContentProps {
	winner: 'GOOD' | 'EVIL' | null;
	reason: string;
	assassinationInfo: ReactNode;
	missionTable: ReactNode;
	missionTableWithSpoilers: ReactNode;
	achievements: ReactNode;
	initialRevealed?: boolean;
}

export function GameSummaryContent({
	winner,
	reason,
	assassinationInfo,
	missionTable,
	missionTableWithSpoilers,
	achievements,
	initialRevealed = false,
}: GameSummaryContentProps) {
	const [revealed, setRevealed] = useState(initialRevealed);

	return (
		<>
			{!revealed && (
				<button
					type="button"
					className={styles.revealButton}
					onClick={() => setRevealed(true)}
				>
					Reveal Outcome
				</button>
			)}

			{revealed && winner && (
				<h2 style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '16px 0'}}>
					{winner === 'GOOD' ? 'Good wins!' : 'Evil wins!'}
				</h2>
			)}

			{revealed && reason && (
				<p style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px'}}>{reason}</p>
			)}

			{revealed && assassinationInfo}

			<div style={{overflowX: 'auto', width: '100%', display: 'flex', justifyContent: 'center'}}>
				{revealed ? missionTableWithSpoilers : missionTable}
			</div>

			{revealed && achievements}
		</>
	);
}
