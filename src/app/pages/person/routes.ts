import {route} from 'rwsdk/router';
import {PersonDetail} from './PersonDetail';

export const personRoutes = [route('/person/:personId', [PersonDetail])];
