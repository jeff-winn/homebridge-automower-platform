import { It, Mock, Times } from 'moq.ts';

import { GetMowersService } from '../../src/services/automower/getMowersService';
import { AutomowerAccessoryFactory } from '../../src/primitives/automowerAccessoryFactory';
import { DiscoveryServiceImpl } from '../../src/services/discoveryService';
import { AutomowerPlatform } from '../../src/automowerPlatform';
import { AutomowerAccessory } from '../../src/automowerAccessory';
import { Activity, Mode, Mower, OverrideAction, RestrictedReason, State } from '../../src/model';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';

describe('DiscoveryServiceImpl', () => {
    let getMowersService: Mock<GetMowersService>;
    let factory: Mock<AutomowerAccessoryFactory>;
    let log: Mock<PlatformLogger>;    
    let target: DiscoveryServiceImpl;

    beforeEach(() => {
        getMowersService = new Mock<GetMowersService>();
        factory = new Mock<AutomowerAccessoryFactory>();
        log = new Mock<PlatformLogger>();

        target = new DiscoveryServiceImpl(getMowersService.object(), factory.object(), log.object());
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

    it('should discover only one new mower', async () => {
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
                    activity: Activity.CHARGING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.HOME,
                    state: State.RESTRICTED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NO_SOURCE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
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
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NOT_ACTIVE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
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

        const mower1Accessory = new Mock<AutomowerAccessory>();
        const mower2Accessory = new Mock<AutomowerAccessory>();

        log.setup(x => x.info(It.IsAny(), It.IsAny())).returns(undefined);

        getMowersService.setup(o => o.getMowers()).returns(Promise.resolve([ mower1, mower2 ]));
        factory.setup(o => o.createAccessory(mower1)).returns(mower1Accessory.object());

        platform.setup(o => o.getMower(mower1Id)).returns(undefined);
        platform.setup(o => o.getMower(mower2Id)).returns(mower2Accessory.object());
        platform.setup(o => o.registerMowers(It.IsAny<AutomowerAccessory[]>())).returns(undefined);

        mower1Accessory.setup(o => o.refresh(mower1)).returns(undefined);
        mower2Accessory.setup(o => o.refresh(mower2)).returns(undefined);

        await target.discoverMowers(platform.object());

        mower1Accessory.verify(o => o.refresh(mower1), Times.Once());
        mower2Accessory.verify(o => o.refresh(mower2), Times.Once());
        platform.verify(x => x.registerMowers(It.Is<AutomowerAccessory[]>(o => 
            o.length === 1 && o[0] === mower1Accessory.object()))
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
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NOT_ACTIVE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
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
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NOT_ACTIVE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
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

        const mower1Accessory = new Mock<AutomowerAccessory>();
        const mower2Accessory = new Mock<AutomowerAccessory>();

        log.setup(x => x.info(It.IsAny(), It.IsAny())).returns(undefined);

        getMowersService.setup(x => x.getMowers()).returns(Promise.resolve([ mower1, mower2 ]));
        factory.setup(o => o.createAccessory(mower1)).returns(mower1Accessory.object());
        factory.setup(o => o.createAccessory(mower2)).returns(mower2Accessory.object());

        platform.setup(x => x.getMower(mower1Id)).returns(undefined);
        platform.setup(x => x.getMower(mower2Id)).returns(undefined);
        platform.setup(x => x.registerMowers(It.IsAny<AutomowerAccessory[]>())).returns(undefined);
        mower1Accessory.setup(o => o.refresh(mower1)).returns(undefined);
        mower2Accessory.setup(o => o.refresh(mower2)).returns(undefined);

        await target.discoverMowers(platform.object());

        mower1Accessory.verify(o => o.refresh(mower1), Times.Once());
        mower2Accessory.verify(o => o.refresh(mower2), Times.Once());
        platform.verify(x => x.registerMowers(It.Is<AutomowerAccessory[]>(x => 
            x.length === 2 && x[0] === mower1Accessory.object() && x[1] === mower2Accessory.object()))
        , Times.Once());
    });
});