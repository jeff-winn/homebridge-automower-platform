import 'reflect-metadata';

import { API, Logging } from 'homebridge';
import { Mock, It } from 'moq.ts';

import { PLATFORM_NAME, PLUGIN_ID } from '../src/constants';
import { AutomowerPlatformSpy } from './automowerPlatformSpy';
import { AutomowerPlatformConfig } from '../src/automowerPlatform';

describe('AutomowerPlatform', () => {
    let log: Mock<Logging>;
    let config: AutomowerPlatformConfig;
    let api: Mock<API>;

    let target: AutomowerPlatformSpy;

    beforeEach(() => {
        log = new Mock<Logging>();
        config = {            
            name: PLATFORM_NAME,
            platform: PLUGIN_ID,
            appKey: '12345',
            password: 'password',
            username: 'me'            
        };

        api = new Mock<API>();
        api.setup(o => o.on(It.IsAny<string>(), It.IsAny<() => Promise<void>>())).returns(api.object());

        target = new AutomowerPlatformSpy(log.object(), config, api.object());
    });

    it('should be created', () => {
        expect(target).toBeDefined();
    });

    it('should return false when the mower id has not been created', () => {
        const result = target.isMowerConfigured('does not exist');

        expect(result).toBeFalsy();
    });
});