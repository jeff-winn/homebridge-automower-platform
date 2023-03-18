import 'reflect-metadata';

import { API } from 'homebridge';
import { AutomowerPlatform } from './automowerPlatform';
import { PLATFORM_NAME } from './settings';

export default (api: API) => { 
    api.registerPlatform(PLATFORM_NAME, AutomowerPlatform);
};