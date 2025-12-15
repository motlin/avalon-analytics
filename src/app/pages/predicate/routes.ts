import {route} from 'rwsdk/router';
import {PredicateDetail} from './PredicateDetail';
import {PredicateList} from './PredicateList';

export const predicateRoutes = [
	route('/predicates', [PredicateList]),
	route('/predicate/:predicateName', [PredicateDetail]),
];
