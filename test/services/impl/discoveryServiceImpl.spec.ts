import { Logging, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { GetMowersService } from '../../../src/services/automower/getMowersService';
import { DiscoveryServiceImpl } from '../../../src/services/impl/discoveryServiceImpl';
import { AutomowerPlatform } from '../../../src/automowerPlatform';
import { AccessoryFactory } from '../../../src/primitives/accessoryFactory';
import { AutomowerContext } from '../../../src/automowerAccessory';
import { Mower } from '../../../src/clients/model';

describe('discovery service', () => {
    let getMowersService: Mock<GetMowersService>;
    let log: Mock<Logging>;    
    let accessoryFactory: Mock<AccessoryFactory>;
    let target: DiscoveryServiceImpl;

    beforeEach(() => {
        getMowersService = new Mock<GetMowersService>();
        log = new Mock<Logging>();
        accessoryFactory = new Mock<AccessoryFactory>();

        target = new DiscoveryServiceImpl(getMowersService.object(), log.object(), accessoryFactory.object());
    });
    
    it('should do nothing when no mowers are found', async () => {
        const platform = new Mock<AutomowerPlatform>();

        log.setup(x => x.info(It.IsAny(), It.IsAny())).returns(undefined);
        getMowersService.setup(x => x.getMowers()).returns(Promise.resolve([ ]));
        platform.setup(x => x.registerMowers(It.IsAny()));

        await target.discoverMowers(platform.object());

        getMowersService.verify(x => x.getMowers(), Times.Once());
        platform.verify(x => x.registerMowers(It.IsAny()), Times.Never());
    });

    it('should discover only one of the mowers', async () => {
        const platform = new Mock<AutomowerPlatform>();

        const mower1Id = '12345';
        const mower1Name = 'Bert';

        const mower2Id = '678910';
        const mower2Name = 'Ernie';

        const mower1: Mower = {
            id: mower1Id,
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 0
                },
                calendar: {
                    tasks: []
                },
                mower: {
                    activity: 'activity',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'state'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'
                },
                positions: [],
                system: {
                    model: 'HUSQVARNA AUTOMOWER 430XH',
                    name: mower1Name,
                    serialNumber: 0
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                }
            }
        };

        const mower2: Mower = {
            id: mower2Id,
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 0
                },
                calendar: {
                    tasks: []
                },
                mower: {
                    activity: 'activity',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'state'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'
                },
                positions: [],
                system: {
                    model: 'HUSQVARNA AUTOMOWER 430XH',
                    name: mower2Name,
                    serialNumber: 0
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                }
            }
        };

        const mower1Uuid = 'abcd1234';
        const mower2Uuid = 'efgh5678';
        
        accessoryFactory.setup(x => x.generateUuid(mower1Id)).returns(mower1Uuid);
        accessoryFactory.setup(x => x.generateUuid(mower2Id)).returns(mower2Uuid);

        const mower1Accessory = new Mock<PlatformAccessory<AutomowerContext>>();

        log.setup(x => x.info(It.IsAny(), It.IsAny())).returns(undefined);

        getMowersService.setup(x => x.getMowers()).returns(Promise.resolve([ mower1, mower2 ]));
        accessoryFactory.setup(x => x.create(mower1Name, mower1Uuid)).returns(mower1Accessory.object());

        platform.setup(x => x.isMowerConfigured(mower1Uuid)).returns(false);
        platform.setup(x => x.isMowerConfigured(mower2Uuid)).returns(true);
        platform.setup(x => x.registerMowers(It.IsAny<PlatformAccessory[]>())).returns(undefined);
        
        await target.discoverMowers(platform.object());

        platform.verify(x => x.registerMowers(It.Is<PlatformAccessory[]>(x => 
            x.length === 1 && x[0] === mower1Accessory.object()))
        , Times.Once());
    });

    it('should discover both mowers', async () => {
        const platform = new Mock<AutomowerPlatform>();

        const mower1Id = '12345';
        const mower1Name = 'Bert';

        const mower2Id = '678910';
        const mower2Name = 'Ernie';

        const mower1: Mower = {
            id: mower1Id,
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 0
                },
                calendar: {
                    tasks: []
                },
                mower: {
                    activity: 'activity',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'state'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'
                },
                positions: [],
                system: {
                    model: 'HUSQVARNA AUTOMOWER 430XH',
                    name: mower1Name,
                    serialNumber: 0
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                }
            }
        };

        const mower2: Mower = {
            id: mower2Id,
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 0
                },
                calendar: {
                    tasks: []
                },
                mower: {
                    activity: 'activity',
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: 'mode',
                    state: 'state'
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'
                },
                positions: [],
                system: {
                    model: 'HUSQVARNA AUTOMOWER 430XH',
                    name: mower2Name,
                    serialNumber: 0
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                }
            }
        };

        const mower1Uuid = 'abcd1234';
        const mower2Uuid = 'efgh5678';
        
        accessoryFactory.setup(x => x.generateUuid(mower1Id)).returns(mower1Uuid);
        accessoryFactory.setup(x => x.generateUuid(mower2Id)).returns(mower2Uuid);

        const mower1Accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        const mower2Accessory = new Mock<PlatformAccessory<AutomowerContext>>();

        log.setup(x => x.info(It.IsAny(), It.IsAny())).returns(undefined);

        getMowersService.setup(x => x.getMowers()).returns(Promise.resolve([ mower1, mower2 ]));
        accessoryFactory.setup(x => x.create(mower1Name, mower1Uuid)).returns(mower1Accessory.object());
        accessoryFactory.setup(x => x.create(mower2Name, mower2Uuid)).returns(mower2Accessory.object());

        platform.setup(x => x.isMowerConfigured(mower1Uuid)).returns(false);
        platform.setup(x => x.isMowerConfigured(mower2Uuid)).returns(false);
        platform.setup(x => x.registerMowers(It.IsAny<PlatformAccessory[]>())).returns(undefined);
        
        await target.discoverMowers(platform.object());

        platform.verify(x => x.registerMowers(It.Is<PlatformAccessory[]>(x => 
            x.length === 2 && x[0] === mower1Accessory.object() && x[1] === mower2Accessory.object()))
        , Times.Once());
    });
});