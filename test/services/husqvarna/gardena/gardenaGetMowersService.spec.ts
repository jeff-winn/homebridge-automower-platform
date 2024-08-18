import { It, Mock, Times } from 'moq.ts';

import {
    BatteryState, CommonServiceDataItem, DeviceDataItem, GardenaClient, ItemType, MowerActivity,
    MowerError, MowerServiceDataItem, RFLinkState, ServiceState
} from '../../../../src/clients/gardena/gardenaClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken, Activity, State } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { GardenaMowerStateConverter } from '../../../../src/services/husqvarna/gardena/converters/gardenaMowerStateConverter';
import { GardenaGetMowersService } from '../../../../src/services/husqvarna/gardena/gardenaGetMowersService';

describe('GardenaGetMowersService', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let mowerStateConverter: Mock<GardenaMowerStateConverter>;    
    let client: Mock<GardenaClient>;
    let log: Mock<PlatformLogger>;
    let target: GardenaGetMowersService;

    beforeEach(() => {
        tokenManager = new Mock<AccessTokenManager>();
        client = new Mock<GardenaClient>();
        mowerStateConverter = new Mock<GardenaMowerStateConverter>();

        log = new Mock<PlatformLogger>();

        target = new GardenaGetMowersService(tokenManager.object(), mowerStateConverter.object(), client.object(), log.object());
    });

    it('should flag the token as invalid if not authorized', async () => {
        tokenManager.setup(o => o.getCurrentTokenAsync()).throws(new NotAuthorizedError('Unable to authenticate', 'ERR0000'));
        tokenManager.setup(o => o.flagAsInvalid()).returns(undefined);

        await expect(target.getMowers()).rejects.toThrowError(NotAuthorizedError);

        tokenManager.verify(o => o.flagAsInvalid(), Times.Once());
    });

    it('should return an empty array when no locations are found', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: '12345'
        };

        tokenManager.setup(o => o.getCurrentTokenAsync()).returnsAsync(token);
        client.setup(o => o.getLocations(token)).returnsAsync({
            data: []
        });        

        const result = await target.getMowers();
        expect(result).toBeDefined();
        expect(result).toHaveLength(0);
    });

    it('should return an empty array when common is not provided', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: '12345'
        };

        const mowerDevice: DeviceDataItem = {
            id: '12345',
            type: ItemType.DEVICE,
            relationships: {
                location: {
                    data: {
                        id: 'abcd1234',
                        type: ItemType.LOCATION
                    }
                },
                services: {
                    data: [
                        {
                            id: '12345',
                            type: ItemType.MOWER
                        },
                        {
                            id: '12345',
                            type: ItemType.COMMON
                        }
                    ]
                }
            }
        };

        const mowerService: MowerServiceDataItem = {
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
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                activity: {
                    value: MowerActivity.OK_CHARGING,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                lastErrorCode: {
                    value: MowerError.OFF_DISABLED,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                operatingHours: {
                    value: 12345
                }
            }
        };

        tokenManager.setup(o => o.getCurrentTokenAsync()).returnsAsync(token);
        client.setup(o => o.getLocations(token)).returnsAsync({
            data: [
                {
                    id: 'abcd1234',
                    type: ItemType.LOCATION,
                    attributes: {
                        name: 'My Garden'
                    }
                }
            ]
        });

        client.setup(o => o.getLocation('abcd1234', token)).returnsAsync({
            data: {
                id: 'abcd1234',
                type: ItemType.LOCATION,
                relationships: {
                    devices: {
                        data: [
                            {
                                id: '12345',
                                type: ItemType.DEVICE
                            }
                        ]
                    }
                },
                attributes: {
                    name: 'My Garden'
                }
            },
            included: [
                mowerDevice,
                mowerService
            ]
        });

        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.warn(It.IsAny(), It.IsAny())).returns(undefined);

        const mowers = await target.getMowers();
        expect(mowers).toBeDefined();
        expect(mowers.length).toBe(0);

        log.verify(o => o.warn('GARDENA_MISSING_REQUIRED_COMMON_SERVICE', '12345'), Times.Once());
    });

    it('should return an array of values', async () => {
        const token: AccessToken = {
            provider: 'husqvarna',
            value: '12345'
        };

        const mowerDevice: DeviceDataItem = {
            id: '12345',
            type: ItemType.DEVICE,
            relationships: {
                location: {
                    data: {
                        id: 'abcd1234',
                        type: ItemType.LOCATION
                    }
                },
                services: {
                    data: [
                        {
                            id: '12345',
                            type: ItemType.MOWER
                        },
                        {
                            id: '12345',
                            type: ItemType.COMMON
                        }
                    ]
                }
            }
        };

        const mowerService: MowerServiceDataItem = {
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
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                activity: {
                    value: MowerActivity.OK_CHARGING,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                lastErrorCode: {
                    value: MowerError.OFF_DISABLED,
                    timestamp: '2022-12-09T09:59:16.505+00:00'
                },
                operatingHours: {
                    value: 12345
                }
            }
        };

        const commonService: CommonServiceDataItem = {
            id: '12345',
            type: ItemType.COMMON,
            relationships: {
                device: {
                    data: {
                        id: '12345',
                        type: ItemType.DEVICE
                    }    
                }
            },
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

        tokenManager.setup(o => o.getCurrentTokenAsync()).returnsAsync(token);
        client.setup(o => o.getLocations(token)).returnsAsync({
            data: [
                {
                    id: 'abcd1234',
                    type: ItemType.LOCATION,
                    attributes: {
                        name: 'My Garden'
                    }
                }
            ]
        });

        client.setup(o => o.getLocation('abcd1234', token)).returnsAsync({
            data: {
                id: 'abcd1234',
                type: ItemType.LOCATION,
                relationships: {
                    devices: {
                        data: [
                            {
                                id: '12345',
                                type: ItemType.DEVICE
                            }
                        ]
                    }
                },
                attributes: {
                    name: 'My Garden'
                }
            },
            included: [
                mowerDevice,
                mowerService,
                commonService
            ]
        });

        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.warn(It.IsAny(), It.IsAny())).returns(undefined);

        mowerStateConverter.setup(o => o.convert(mowerService)).returns({
            activity: Activity.PARKED,
            state: State.CHARGING
        });

        const mowers = await target.getMowers();
        expect(mowers).toBeDefined();

        const result = mowers[0];
        expect(result.id).toBe('12345');
        expect(result.attributes.battery.level).toBe(100);
        expect(result.attributes.connection.connected).toBeTruthy();
        expect(result.attributes.location!.id).toBe('abcd1234');
        expect(result.attributes.metadata.manufacturer).toBe('GARDENA');
        expect(result.attributes.metadata.model).toBe('smart Mower');
        expect(result.attributes.metadata.name).toBe('SILENO');
        expect(result.attributes.metadata.serialNumber).toBe('1234567890');
        expect(result.attributes.mower.activity).toBe(Activity.PARKED);
        expect(result.attributes.mower.state).toBe(State.CHARGING);
    });
});