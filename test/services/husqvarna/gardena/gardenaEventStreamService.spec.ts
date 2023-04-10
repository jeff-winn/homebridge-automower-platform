import { It, Mock, Times } from 'moq.ts';

import { GardenaClient, ItemType, LocationsResponse } from '../../../../src/clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { InvalidStateError } from '../../../../src/errors/invalidStateError';
import { GardenaEventStreamServiceFactory } from '../../../../src/factories/gardenaEventStreamServiceFactory';
import { AccessToken } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { EventStreamService } from '../../../../src/services/husqvarna/eventStreamService';
import { CompositeGardenaEventStreamService } from '../../../../src/services/husqvarna/gardena/gardenaEventStreamService';

describe('CompositeGardenaEventStreamService', () => {
    let client: Mock<GardenaClient>;
    let serviceFactory: Mock<GardenaEventStreamServiceFactory>;
    let tokenManager: Mock<AccessTokenManager>;
    let log: Mock<PlatformLogger>;
    let target: CompositeGardenaEventStreamService;

    beforeEach(() => {
        client = new Mock<GardenaClient>();
        serviceFactory = new Mock<GardenaEventStreamServiceFactory>();
        tokenManager = new Mock<AccessTokenManager>();
        log = new Mock<PlatformLogger>();

        target = new CompositeGardenaEventStreamService(client.object(), serviceFactory.object(), tokenManager.object(), log.object());
    });
    
    it('should throw an exception when onSettingsEventCallback is null on start', async () => {
        target.setOnStatusEventCallback(_ => Promise.resolve(undefined));

        await expect(target.start()).rejects.toThrowError(InvalidStateError);
    });

    it('should throw an exception when onStatusEventCallback is null on start', async () => {
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        await expect(target.start()).rejects.toThrowError(InvalidStateError);
    });

    it('should initialize start and stop services as expected', async () => {
        target.setOnStatusEventCallback(_ => Promise.resolve(undefined));
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'hello world'
        };

        tokenManager.setup(o => o.getCurrentToken()).returnsAsync(token);

        const locations: LocationsResponse = {
            data: [
                {
                    id: '12345',
                    type: ItemType.LOCATION,
                    attributes: {
                        name: 'Hello World'
                    }
                }
            ]
        };

        client.setup(o => o.getLocations(token)).returnsAsync(locations);

        const service = new Mock<EventStreamService>();
        service.setup(o => o.setOnSettingsEventCallback(It.IsAny())).returns(undefined);
        service.setup(o => o.setOnStatusEventCallback(It.IsAny())).returns(undefined);
        service.setup(o => o.start()).returnsAsync(undefined);
        service.setup(o => o.stop()).returnsAsync(undefined);

        serviceFactory.setup(o => o.create('12345')).returns(service.object());

        await expect(target.start()).resolves.toBeUndefined();

        service.verify(o => o.setOnStatusEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.setOnSettingsEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.start(), Times.Once());

        await expect(target.stop()).resolves.toBeUndefined();

        service.verify(o => o.stop(), Times.Once());
    });

    it('should only initialize once', async () => {
        target.setOnStatusEventCallback(_ => Promise.resolve(undefined));
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'hello world'
        };

        tokenManager.setup(o => o.getCurrentToken()).returnsAsync(token);

        const locations: LocationsResponse = {
            data: [
                {
                    id: '12345',
                    type: ItemType.LOCATION,
                    attributes: {
                        name: 'Hello World'
                    }
                }
            ]
        };

        client.setup(o => o.getLocations(token)).returnsAsync(locations);

        const service = new Mock<EventStreamService>();
        service.setup(o => o.setOnSettingsEventCallback(It.IsAny())).returns(undefined);
        service.setup(o => o.setOnStatusEventCallback(It.IsAny())).returns(undefined);
        service.setup(o => o.start()).returnsAsync(undefined);

        serviceFactory.setup(o => o.create('12345')).returns(service.object());

        await expect(target.start()).resolves.toBeUndefined();
        await expect(target.start()).resolves.toBeUndefined();

        service.verify(o => o.setOnStatusEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.setOnSettingsEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.start(), Times.Exactly(2));
    });
    
    it('should do nothing when not initialized', async () => {
        await expect(target.stop()).resolves.toBeUndefined();
    });
});