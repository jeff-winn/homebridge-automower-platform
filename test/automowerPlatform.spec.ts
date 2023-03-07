import 'reflect-metadata';

import { API, Logging } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerPlatform, AutomowerPlatformConfig } from '../src/automowerPlatform';
import { BadConfigurationError } from '../src/errors/badConfigurationError';
import { DiscoveryServiceFactoryImpl } from '../src/factories/discoveryServiceFactory';
import { EventStreamServiceFactoryImpl } from '../src/factories/eventStreamServiceFactory';
import { AuthenticationMode, DeviceType } from '../src/model';
import { PlatformContainer } from '../src/primitives/platformContainer';
import { DiscoveryService } from '../src/services/husqvarna/discoveryService';
import { EventStreamService } from '../src/services/husqvarna/eventStreamService';
import { PLATFORM_NAME, PLUGIN_ID } from '../src/settings';
import { AutomowerPlatformSpy } from './automowerPlatformSpy';

describe('AutomowerPlatform', () => {
    let log: Mock<Logging>;
    let config: AutomowerPlatformConfig;
    let container: Mock<PlatformContainer>;
    let api: Mock<API>;

    let target: AutomowerPlatformSpy;

    beforeEach(() => {
        log = new Mock<Logging>();
        container = new Mock<PlatformContainer>();
        config = new AutomowerPlatformConfig({            
            name: PLATFORM_NAME,
            platform: PLUGIN_ID,
            appKey: '12345',
            password: 'password',
            username: 'me'
        });

        api = new Mock<API>();
        api.setup(o => o.on(It.IsAny<string>(), It.IsAny<() => Promise<void>>())).returns(api.object());

        target = new AutomowerPlatformSpy(log.object(), config, api.object());
        target.platformContainer = container.object();
    });

    it('should return password authentication mode when not specified', () => {
        const t = new AutomowerPlatformConfig({
            platform: PLATFORM_NAME
        });

        expect(t.getAuthenticationModeOrDefault()).toBe(AuthenticationMode.PASSWORD);
    });
    
    it('should return password authentication mode when specified', () => {
        const t = new AutomowerPlatformConfig({
            platform: PLATFORM_NAME,
            authentication_mode: 'password'
        });

        expect(t.getAuthenticationModeOrDefault()).toBe(AuthenticationMode.PASSWORD);
    });

    it('should return client credentials authentication mode when specified', () => {
        const t = new AutomowerPlatformConfig({
            platform: PLATFORM_NAME,
            authentication_mode: 'client_credentials'
        });

        expect(t.getAuthenticationModeOrDefault()).toBe(AuthenticationMode.CLIENT_CREDENTIALS);
    });

    it('should return device type specified', () => {
        const t = new AutomowerPlatformConfig({
            platform: PLATFORM_NAME,
            device_type: 'automower'
        });

        expect(t.getDeviceTypeOrDefault()).toBe(DeviceType.AUTOMOWER);
    });

    it('should return automower as the default device type when unspecified', () => {
        const t = new AutomowerPlatformConfig({
            platform: PLATFORM_NAME
        });

        expect(t.getDeviceTypeOrDefault()).toBe(DeviceType.AUTOMOWER);
    });

    it('should return undefined when the mower has not been created', () => {
        const result = target.getMower('does not exist');

        expect(result).toBeUndefined();
    });

    it('should catch configuration errors that occur while finishing launching', async () => {
        log.setup(o => o.error(It.IsAny<string>(), It.IsAny<Error>())).returns(undefined);
        container.setup(o => o.registerEverything()).returns(undefined);

        const discoveryService = new Mock<DiscoveryService>();
        discoveryService.setup(o => o.discoverMowers(It.IsAny<AutomowerPlatform>())).throws(new BadConfigurationError('Ouch', 'ERR0000'));

        const discoveryServiceFactory = new Mock<DiscoveryServiceFactoryImpl>();
        discoveryServiceFactory.setup(o => o.create(container.object())).returns(discoveryService.object());
        container.setup(o => o.resolve(DiscoveryServiceFactoryImpl)).returns(discoveryServiceFactory.object());
        
        await target.unsafeOnFinishedLaunching();

        log.verify(o => o.error('Ouch'), Times.Once());
    });

    /** Required for compliance with homebridge verified status */
    it('should catch errors that occur while finishing launching', async () => {
        log.setup(o => o.error(It.IsAny<string>(), It.IsAny<Error>())).returns(undefined);
        container.setup(o => o.registerEverything()).returns(undefined);

        const discoveryService = new Mock<DiscoveryService>();
        discoveryService.setup(o => o.discoverMowers(It.IsAny<AutomowerPlatform>())).throws(new Error('Ouch'));

        const discoveryServiceFactory = new Mock<DiscoveryServiceFactoryImpl>();
        discoveryServiceFactory.setup(o => o.create(container.object())).returns(discoveryService.object());
        container.setup(o => o.resolve(DiscoveryServiceFactoryImpl)).returns(discoveryServiceFactory.object());
        
        await target.unsafeOnFinishedLaunching();

        log.verify(o => o.error(It.IsAny<string>(), It.IsAny<Error>()), Times.Once());
    });

    it('should finish launching as expected', async () => {
        container.setup(o => o.registerEverything()).returns(undefined);

        const discoveryService = new Mock<DiscoveryService>();
        discoveryService.setup(o => o.discoverMowers(It.IsAny<AutomowerPlatform>())).returns(Promise.resolve(undefined));

        const eventStreamService = new Mock<EventStreamService>();
        eventStreamService.setup(o => o.onStatusEventReceived(It.IsAny<((e) => Promise<void>)>())).returns(undefined);
        eventStreamService.setup(o => o.onSettingsEventReceived(It.IsAny<((e) => Promise<void>)>())).returns(undefined);
        eventStreamService.setup(o => o.start()).returns(Promise.resolve(undefined));

        const discoveryServiceFactory = new Mock<DiscoveryServiceFactoryImpl>();
        discoveryServiceFactory.setup(o => o.create(container.object())).returns(discoveryService.object());
        container.setup(o => o.resolve(DiscoveryServiceFactoryImpl)).returns(discoveryServiceFactory.object());

        const eventStreamServiceFactory = new Mock<EventStreamServiceFactoryImpl>();
        eventStreamServiceFactory.setup(o => o.create(container.object())).returns(eventStreamService.object());
        container.setup(o => o.resolve(EventStreamServiceFactoryImpl)).returns(eventStreamServiceFactory.object());

        await target.unsafeOnFinishedLaunching();

        expect(target.containerConfigured).toBeTruthy();

        discoveryService.verify(o => o.discoverMowers(target), Times.Once());
        eventStreamService.verify(o => o.start(), Times.Once());
    });

    /** Required for compliance with homebridge verified status */
    it('should catch errors that occur while shutting down the plugin', async () => {
        log.setup(o => o.error(It.IsAny<string>(), It.IsAny<Error>())).returns(undefined);
        container.setup(o => o.registerEverything()).returns(undefined);
        
        const eventStreamService = new Mock<EventStreamService>();
        eventStreamService.setup(o => o.stop()).throws(new Error('Ouch'));

        const eventStreamServiceFactory = new Mock<EventStreamServiceFactoryImpl>();
        eventStreamServiceFactory.setup(o => o.create(container.object())).returns(eventStreamService.object());
        container.setup(o => o.resolve(EventStreamServiceFactoryImpl)).returns(eventStreamServiceFactory.object());

        await target.unsafeOnShutdown();

        log.verify(o => o.error(It.IsAny<string>(), It.IsAny<Error>()), Times.Once());
    });
});