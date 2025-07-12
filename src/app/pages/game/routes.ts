import {route} from 'rwsdk/router';
import {GameDetail} from './GameDetail';
import {GamesList} from './GamesList';

export const gameRoutes = [route('/games', [GamesList]), route('/game/:gameId', [GameDetail])];
