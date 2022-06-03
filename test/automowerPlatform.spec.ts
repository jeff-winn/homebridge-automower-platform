import 'reflect-metadata';

import { API, Logging } from 'homebridge';
import { Mock, It, Times } from 'moq.ts';

import { PLATFORM_NAME, PLUGIN_ID } from '../src/settings';
import { AutomowerPlatformSpy } from './automowerPlatformSpy';
import { AutomowerPlatform, AutomowerPlatformConfig } from '../src/automowerPlatform';
import { DiscoveryService } from '../src/services/automower/discoveryService';
import { EventStreamService } from '../src/services/automower/eventStreamService';
import { BadConfigurationError } from '../src/errors/badConfigurationError';

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

    it('should return undefined when the mower has not been created', () => {
        const result = target.getMower('does not exist');

        expect(result).toBeUndefined();
    });

    it('should catch configuration errors that occur while finishing launching', async () => {
        log.setup(o => o.error(It.IsAny<string>(), It.IsAny<Error>())).returns(undefined);

        const discoveryService = new Mock<DiscoveryService>();
        discoveryService.setup(o => o.discoverMowers(It.IsAny<AutomowerPlatform>())).throws(new BadConfigurationError('Ouch'));

        target.discoveryService = discoveryService.object();

        await target.unsafeOnFinishedLaunching();

        log.verify(o => o.error('Ouch'), Times.Once());
    });

    /** Required for compliance with homebridge verified status */
    it('should catch errors that occur while finishing launching', async () => {
        log.setup(o => o.error(It.IsAny<string>(), It.IsAny<Error>())).returns(undefined);

        const discoveryService = new Mock<DiscoveryService>();
        discoveryService.setup(o => o.discoverMowers(It.IsAny<AutomowerPlatform>())).throws(new Error('Ouch'));

        target.discoveryService = discoveryService.object();

        await target.unsafeOnFinishedLaunching();

        log.verify(o => o.error(It.IsAny<string>(), It.IsAny<Error>()), Times.Once());
    });

    it('should finish launching as expected', async () => {
        const discoveryService = new Mock<DiscoveryService>();
        discoveryService.setup(o => o.discoverMowers(It.IsAny<AutomowerPlatform>())).returns(Promise.resolve(undefined));

        const eventStreamService = new Mock<EventStreamService>();
        eventStreamService.setup(o => o.onStatusEventReceived(It.IsAny<((e) => Promise<void>)>())).returns(undefined);
        eventStreamService.setup(o => o.onSettingsEventReceived(It.IsAny<((e) => Promise<void>)>())).returns(undefined);
        eventStreamService.setup(o => o.start()).returns(Promise.resolve(undefined));

        target.eventStreamService = eventStreamService.object();
        target.discoveryService = discoveryService.object();

        await target.unsafeOnFinishedLaunching();

        expect(target.containerConfigured).toBeTruthy();

        discoveryService.verify(o => o.discoverMowers(target), Times.Once());
        eventStreamService.verify(o => o.start(), Times.Once());
    });

    /** Required for compliance with homebridge verified status */
    it('should catch errors that occur while shutting down the plugin', async () => {
        log.setup(o => o.error(It.IsAny<string>(), It.IsAny<Error>())).returns(undefined);

        const eventStreamService = new Mock<EventStreamService>();
        eventStreamService.setup(o => o.stop()).throws(new Error('Ouch'));

        target.eventStreamService = eventStreamService.object();

        await target.unsafeOnShutdown();

        log.verify(o => o.error(It.IsAny<string>(), It.IsAny<Error>()), Times.Once());
    });
});