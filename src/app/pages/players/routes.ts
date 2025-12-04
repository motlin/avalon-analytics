import {route} from 'rwsdk/router';
import {PlayersPage} from './PlayersPage';

export const playersRoutes = [route('/players', [PlayersPage])];
