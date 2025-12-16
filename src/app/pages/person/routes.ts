import {route} from 'rwsdk/router';
import {PersonAnnotationGames} from './PersonAnnotationGames';
import {PersonDetail} from './PersonDetail';

export const personRoutes = [
	route('/person/:personId', [PersonDetail]),
	route('/person/:personId/predicate/:predicateName/games', [PersonAnnotationGames]),
];
