import {route} from 'rwsdk/router';
import {PredicateDetail} from './PredicateDetail';

export const predicateRoutes = [route('/predicate/:predicateName', [PredicateDetail])];
