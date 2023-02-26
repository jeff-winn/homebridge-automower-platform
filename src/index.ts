import 'reflect-metadata';

import { config } from 'dotenv';
import { API } from 'homebridge';
import { AutomowerPlatform } from './automowerPlatform';
import { isDevelopmentEnvironment } from './primitives/environment';
import { PLATFORM_NAME } from './settings';

if (isDevelopmentEnvironment()) {
    config();
}

export default (api: API) => { 
    api.registerPlatform(PLATFORM_NAME, AutomowerPlatform);
};
