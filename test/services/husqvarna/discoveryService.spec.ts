import { It, Mock, Times } from 'moq.ts';

import { AutomowerPlatform } from '../../../src/automowerPlatform';
import { PlatformLogger } from '../../../src/diagnostics/platformLogger';
import { MowerAccessory } from '../../../src/mowerAccessory';
import { MowerAccessoryFactory } from '../../../src/mowerAccessoryFactory';
import { DiscoveryServiceImpl, GetMowersService } from '../../../src/services/husqvarna/discoveryService';

import * as model from '../../../src/model';

describe('DiscoveryServiceImpl', () => {
    let getMowersService: Mock<GetMowersService>;
    let factory: Mock<MowerAccessoryFactory>;
    let log: Mock<PlatformLogger>;    
    let target: DiscoveryServiceImpl;

    beforeEach(() => {
        getMowersService = new Mock<GetMowersService>();
        factory = new Mock<MowerAccessoryFactory>();
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

        const mower1: model.Mower = {
            id: mower1Id,
            attributes: {
                battery: {
                    level: 0
                },
                connection: {
                    connected: true
                },
                location: undefined,
                metadata: {
                    manufacturer: 'HUSQVARNA',
                    model: 'AUTOMOWER 430XH',
                    name: mower1Name,
                    serialNumber: '0'
                },
                mower: {
                    activity: model.Activity.PARKED,
                    state: model.State.CHARGING
                },
                schedule: undefined,
                settings: undefined
            }
        };

        const mower2: model.Mower = {
            id: mower2Id,
            attributes: {
                battery: {
                    level: 0
                },
                connection: {
                    connected: true
                },
                location: undefined,
                metadata: {
                    manufacturer: 'HUSQVARNA',
                    model: 'AUTOMOWER 430XH',
                    name: mower2Name,
                    serialNumber: '0'
                },
                mower: {
                    activity: model.Activity.MOWING,
                    state: model.State.IN_OPERATION
                },
                schedule: undefined,
                settings: undefined
            }
        };

        const mower1Accessory = new Mock<MowerAccessory>();
        const mower2Accessory = new Mock<MowerAccessory>();

        log.setup(x => x.info(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        getMowersService.setup(o => o.getMowers()).returns(Promise.resolve([ mower1, mower2 ]));
        factory.setup(o => o.createAccessory(mower1)).returns(mower1Accessory.object());

        platform.setup(o => o.getMower(mower1Id)).returns(undefined);
        platform.setup(o => o.getMower(mower2Id)).returns(mower2Accessory.object());
        platform.setup(o => o.registerMowers(It.IsAny<MowerAccessory[]>())).returns(undefined);

        mower1Accessory.setup(o => o.refresh(mower1)).returns(undefined);
        mower2Accessory.setup(o => o.refresh(mower2)).returns(undefined);

        await target.discoverMowers(platform.object());

        mower1Accessory.verify(o => o.refresh(mower1), Times.Once());
        mower2Accessory.verify(o => o.refresh(mower2), Times.Once());
        platform.verify(x => x.registerMowers(It.Is<MowerAccessory[]>(o => 
            o.length === 1 && o[0] === mower1Accessory.object()))
        , Times.Once());
    });

    it('should discover both mowers', async () => {
        const platform = new Mock<AutomowerPlatform>();

        const mower1Id = '12345';
        const mower1Name = 'Bert';

        const mower2Id = '678910';
        const mower2Name = 'Ernie';

        const mower1: model.Mower = {
            id: mower1Id,
            attributes: {
                battery: {
                    level: 0
                },
                connection: {
                    connected: true
                },
                location: undefined,
                metadata: {
                    manufacturer: 'HUSQVARNA',
                    model: 'AUTOMOWER 430XH',
                    name: mower1Name,
                    serialNumber: '0'
                },
                mower: {
                    activity: model.Activity.PARKED,
                    state: model.State.CHARGING
                },
                schedule: undefined,
                settings: undefined
            }
        };

        const mower2: model.Mower = {
            id: mower2Id,
            attributes: {
                battery: {
                    level: 0
                },
                connection: {
                    connected: true
                },
                location: undefined,
                metadata: {
                    manufacturer: 'HUSQVARNA',
                    model: 'AUTOMOWER 430XH',
                    name: mower2Name,
                    serialNumber: '0'
                },
                mower: {
                    activity: model.Activity.PARKED,
                    state: model.State.CHARGING
                },
                schedule: undefined,
                settings: undefined
            }
        };
        
        const mower1Accessory = new Mock<MowerAccessory>();
        const mower2Accessory = new Mock<MowerAccessory>();

        log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);
        log.setup(o => o.debug(It.IsAny(), It.IsAny())).returns(undefined);

        getMowersService.setup(x => x.getMowers()).returns(Promise.resolve([ mower1, mower2 ]));
        factory.setup(o => o.createAccessory(mower1)).returns(mower1Accessory.object());
        factory.setup(o => o.createAccessory(mower2)).returns(mower2Accessory.object());

        platform.setup(o => o.getMower(mower1Id)).returns(undefined);
        platform.setup(o => o.getMower(mower2Id)).returns(undefined);
        platform.setup(o => o.registerMowers(It.IsAny<MowerAccessory[]>())).returns(undefined);
        mower1Accessory.setup(o => o.refresh(mower1)).returns(undefined);
        mower2Accessory.setup(o => o.refresh(mower2)).returns(undefined);

        await target.discoverMowers(platform.object());

        mower1Accessory.verify(o => o.refresh(mower1), Times.Once());
        mower2Accessory.verify(o => o.refresh(mower2), Times.Once());
        platform.verify(o => o.registerMowers(It.Is<MowerAccessory[]>(x => 
            x.length === 2 && x[0] === mower1Accessory.object() && x[1] === mower2Accessory.object()))
        , Times.Once());
    });
});