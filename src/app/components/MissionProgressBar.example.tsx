import * as React from 'react';
import {MissionProgressBarComponent} from './MissionProgressBar';
import {Mission} from '../models/game';

export function MissionProgressBarExamples() {
	const exampleMissions: Mission[] = [
		{
			failsRequired: 1,
			teamSize: 2,
			proposals: [],
			state: 'SUCCESS',
			numFails: 0,
			team: ['Alice', 'Bob'],
		},
		{
			failsRequired: 1,
			teamSize: 3,
			proposals: [],
			state: 'SUCCESS',
			numFails: 0,
			team: ['Charlie', 'David', 'Eve'],
		},
		{
			failsRequired: 1,
			teamSize: 2,
			proposals: [],
			state: 'FAIL',
			numFails: 1,
			team: ['Frank', 'Grace'],
		},
		{
			failsRequired: 1,
			teamSize: 3,
			proposals: [],
			state: 'PENDING',
			team: [],
		},
		{
			failsRequired: 2,
			teamSize: 3,
			proposals: [],
			state: 'PENDING',
			team: [],
		},
	];

	return (
		<div style={{padding: '20px', backgroundColor: '#f9fafb'}}>
			<h1>MissionProgressBar Examples</h1>

			<h2>Basic Progress Bar</h2>
			<MissionProgressBarComponent missions={exampleMissions} />

			<h2 style={{marginTop: '40px'}}>With Current Mission Highlighted</h2>
			<MissionProgressBarComponent
				missions={exampleMissions}
				currentMissionIndex={3}
			/>

			<h2 style={{marginTop: '40px'}}>With Mission Details</h2>
			<MissionProgressBarComponent
				missions={exampleMissions}
				currentMissionIndex={3}
				showDetails={true}
			/>

			<h2 style={{marginTop: '40px'}}>All Missions Completed</h2>
			<MissionProgressBarComponent
				missions={[
					{...exampleMissions[0], state: 'SUCCESS'},
					{...exampleMissions[1], state: 'SUCCESS'},
					{...exampleMissions[2], state: 'FAIL'},
					{...exampleMissions[3], state: 'SUCCESS', numFails: 0, team: ['Henry', 'Ivy', 'Jack']},
					{...exampleMissions[4], state: 'FAIL', numFails: 2, team: ['Kelly', 'Leo', 'Max']},
				]}
				showDetails={true}
			/>
		</div>
	);
}
