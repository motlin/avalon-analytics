import {route} from 'rwsdk/router';
import {UidDetail} from './UidDetail';

export const uidRoutes = [route('/uid/:uid', [UidDetail])];
