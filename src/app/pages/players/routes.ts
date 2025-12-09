import {route} from 'rwsdk/router';
import {PlayerDetailPage} from './PlayerDetailPage';
import {PlayersPage} from './PlayersPage';

export const playersRoutes = [route('/players', [PlayersPage]), route('/players/:playerId', [PlayerDetailPage])];
