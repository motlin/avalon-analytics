import {route} from 'rwsdk/router';
import {PeoplePage} from './PeoplePage';

export const peopleRoutes = [route('/people', [PeoplePage])];
