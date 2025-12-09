import {route} from 'rwsdk/router';
import {GameCombined} from './GameCombined';
import {GamesList} from './GamesList';
import {GameSummary} from './GameSummary';

export const gameRoutes = [
	route('/games', [GamesList]),
	route('/game/:gameId', [GameSummary]),
	route('/game/:gameId/annotated', [GameCombined]),
];
