import { API } from 'homebridge';
import { AutomowerPlatform } from './automowerPlatform';
import { PLATFORM_NAME } from './constants';

export = (api: API) => { 
    api.registerPlatform(PLATFORM_NAME, AutomowerPlatform);
};