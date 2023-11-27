import { It, Mock, Times } from 'moq.ts';

import * as model from '../../../../src/model';

import {
    BatteryState, CommonServiceDataItem,
    GardenaClient, ItemType, LocationsResponse, MowerActivity,
    MowerServiceDataItem, RFLinkState, ServiceState
} from '../../../../src/clients/gardena/gardenaClient';
import { GardenaEventStreamClient } from '../../../../src/clients/gardena/gardenaEventStreamClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { InvalidStateError } from '../../../../src/errors/invalidStateError';
import { GardenaEventStreamServiceFactory } from '../../../../src/factories/gardenaEventStreamServiceFactory';
import { AccessToken, Activity, MowerState, State } from '../../../../src/model';
import { Timer } from '../../../../src/primitives/timer';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { EventStreamService } from '../../../../src/services/husqvarna/eventStreamService';
import { GardenaMowerStateConverter } from '../../../../src/services/husqvarna/gardena/converters/gardenaMowerStateConverter';
import { CompositeGardenaEventStreamService } from '../../../../src/services/husqvarna/gardena/gardenaEventStreamService';
import { GardenaLocationEventStreamServiceSpy } from './gardenaEventStreamServiceSpy';

describe('GardenaLocationEventStreamService', () => {
    let stateConverter: Mock<GardenaMowerStateConverter>;
    let tokenManager: Mock<AccessTokenManager>;
    let stream: Mock<GardenaEventStreamClient>;
    let log: Mock<PlatformLogger>;
    let timer: Mock<Timer>;

    let target: GardenaLocationEventStreamServiceSpy;

    beforeEach(() => {
        stateConverter = new Mock<GardenaMowerStateConverter>();
        tokenManager = new Mock<AccessTokenManager>();
        stream = new Mock<GardenaEventStreamClient>();
        log = new Mock<PlatformLogger>();
        timer = new Mock<Timer>();

        target = new GardenaLocationEventStreamServiceSpy(
            stateConverter.object(),
            tokenManager.object(),
            stream.object(),
            log.object(),
            timer.object());
    });

    it('should get the token and login to the stream', async () => {
        const token: model.AccessToken = {
            value: 'abcd1234',
            provider: 'provider'
        };

        log.setup(o => o.debug(It.IsAny())).returns(undefined);
        
        stream.setup(o => o.setOnEventCallback(It.IsAny())).returns(undefined);
        stream.setup(o => o.setOnConnectedCallback(It.IsAny())).returns(undefined);
        stream.setup(o => o.setOnDisconnectedCallback(It.IsAny())).returns(undefined);
        stream.setup(o => o.setOnErrorCallback(It.IsAny())).returns(undefined);
        stream.setup(o => o.open(token)).returnsAsync(undefined);

        tokenManager.setup(o => o.getCurrentTokenAsync()).returns(Promise.resolve(token));       
        timer.setup(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>())).returns(undefined);

        await expect(target.startAsync()).resolves.toBeUndefined();
        
        timer.verify(o => o.start(It.IsAny<(() => void)>(), It.IsAny<number>()), Times.Once());
        stream.verify(o => o.setOnEventCallback(It.IsAny()), Times.Once());
        stream.verify(o => o.setOnConnectedCallback(It.IsAny()), Times.Once());
        stream.verify(o => o.setOnDisconnectedCallback(It.IsAny()), Times.Once());
        stream.verify(o => o.setOnErrorCallback(It.IsAny()), Times.Once());
        stream.verify(o => o.open(token), Times.Once());
    });

    it('should run the mower event callback when mower event is received', async () => {
        const newState: MowerState = {
            activity: Activity.PARKED,
            state: State.IN_OPERATION
        };

        const event: MowerServiceDataItem = {
            id: '12345',
            type: ItemType.MOWER,
            relationships: {
                device: {
                    data: {
                        id: '12345',
                        type: ItemType.DEVICE
                    }
                }
            },
            attributes: {
                state: {
                    value: ServiceState.WARNING,
                    timestamp: '2023-03-18T23:53:53.684+00:00'
                },
                activity: {
                    value: MowerActivity.OK_CHARGING,
                    timestamp: '2023-03-18T23:53:53.684+00:00'
                },
                operatingHours: {
                    value: 1053
                }
            }
        };

        stateConverter.setup(o => o.convert(event)).returns(newState);
        
        let executed = false;
        target.setOnStatusEventCallback(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        await expect(target.unsafeOnEventReceived(event)).resolves.toBeUndefined();

        expect(executed).toBeTruthy();
    });

    it('should raise the status changed event with the battery information', async () => {
        const event: CommonServiceDataItem = {
            id: '12345',
            type: ItemType.COMMON,
            attributes: {
                name: {
                    value: 'SILENO'
                },
                batteryLevel: {
                    value: 100,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                batteryState: {
                    value: BatteryState.OK,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                rfLinkLevel: {
                    value: 90,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                serial: {
                    value: '1234567890'
                },
                modelType: {
                    value: 'GARDENA smart Mower'
                },
                rfLinkState: {
                    value: RFLinkState.ONLINE
                }
            }            
        };

        let executed = false;
        target.setOnStatusEventCallback(() => {
            executed = true;
            return Promise.resolve(undefined);
        });

        await expect(target.unsafeOnEventReceived(event)).resolves.toBeUndefined();

        expect(executed).toBeTruthy();
    });

    it('should log a warning when the event is unknown', async () => {
        log.setup(o => o.warn(It.IsAny<string>(), It.IsAny())).returns(undefined);
        
        await target.unsafeOnEventReceived({
            id: '12345',
            type: ItemType.UNKNOWN
        });        

        log.verify(o => o.warn(It.IsAny<string>(), It.IsAny<string>()), Times.Once());
    });
});

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

        await expect(target.startAsync()).rejects.toThrowError(InvalidStateError);
    });

    it('should throw an exception when onStatusEventCallback is null on start', async () => {
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        await expect(target.startAsync()).rejects.toThrowError(InvalidStateError);
    });

    it('should log a warning when no locations detected', async () => {
        target.setOnStatusEventCallback(_ => Promise.resolve(undefined));
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'hello world'
        };

        tokenManager.setup(o => o.getCurrentTokenAsync()).returnsAsync(token);
        
        client.setup(o => o.getLocations(token)).returnsAsync(undefined);
        log.setup(o => o.warn('GARDENA_NO_LOCATIONS_FOUND')).returns(undefined);

        await expect(target.startAsync()).resolves.toBeUndefined();

        log.verify(o => o.warn('GARDENA_NO_LOCATIONS_FOUND'), Times.Once());
    });

    it('should initialize start and stop services as expected', async () => {
        target.setOnStatusEventCallback(_ => Promise.resolve(undefined));
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'hello world'
        };

        tokenManager.setup(o => o.getCurrentTokenAsync()).returnsAsync(token);

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
        service.setup(o => o.startAsync()).returnsAsync(undefined);
        service.setup(o => o.stopAsync()).returnsAsync(undefined);

        serviceFactory.setup(o => o.create('12345')).returns(service.object());

        await expect(target.startAsync()).resolves.toBeUndefined();

        service.verify(o => o.setOnStatusEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.setOnSettingsEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.startAsync(), Times.Once());

        await expect(target.stopAsync()).resolves.toBeUndefined();

        service.verify(o => o.stopAsync(), Times.Once());
    });

    it('should only initialize once', async () => {
        target.setOnStatusEventCallback(_ => Promise.resolve(undefined));
        target.setOnSettingsEventCallback(_ => Promise.resolve(undefined));

        const token: AccessToken = {
            provider: 'husqvarna',
            value: 'hello world'
        };

        tokenManager.setup(o => o.getCurrentTokenAsync()).returnsAsync(token);

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
        service.setup(o => o.startAsync()).returnsAsync(undefined);

        serviceFactory.setup(o => o.create('12345')).returns(service.object());

        await expect(target.startAsync()).resolves.toBeUndefined();
        await expect(target.startAsync()).resolves.toBeUndefined();

        service.verify(o => o.setOnStatusEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.setOnSettingsEventCallback(It.IsAny()), Times.Once());
        service.verify(o => o.startAsync(), Times.Exactly(2));
    });
    
    it('should do nothing when not initialized', async () => {
        await expect(target.stopAsync()).resolves.toBeUndefined();
    });
});