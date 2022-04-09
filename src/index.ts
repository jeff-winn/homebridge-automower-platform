import 'reflect-metadata';

import { API } from 'homebridge';
import { AutomowerPlatform } from './automowerPlatform';
import { PLATFORM_NAME } from './constants';

export default (api: API) => { 
    api.registerPlatform(PLATFORM_NAME, AutomowerPlatform);
};