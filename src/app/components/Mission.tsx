import type {ReactNode} from 'react';
import type {Mission} from '../models/game';

interface MissionProps {
	mission: Mission;
	missionNumber: number;
	children?: ReactNode;
}

function MissionComponent({mission, missionNumber, children}: MissionProps) {
	return (
		<div style={{border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem'}}>
			<h3>Mission {missionNumber}</h3>
			<p>Team Size: {mission.teamSize}</p>
			<p>Fails Required: {mission.failsRequired}</p>
			{children}
		</div>
	);
}

export default MissionComponent;
export {MissionComponent};
