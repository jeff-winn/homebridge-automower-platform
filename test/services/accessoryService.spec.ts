import { API, HAP, Logging, PlatformAccessory } from 'homebridge';
import { Characteristic, Service } from 'hap-nodejs';
import { It, Mock, Times } from 'moq.ts';
import { AutomowerAccessory, AutomowerContext } from '../../src/automowerAccessory';
import { Activity, Mode, Mower, State } from '../../src/model';

import { AccessoryFactory } from '../../src/primitives/accessoryFactory';
import { AccessoryServiceImplSpy } from './accessoryServiceImplSpy';

describe('AccessoryService', () => {
    let service: typeof Service;
    let characteristic: typeof Characteristic;

    let factory: Mock<AccessoryFactory>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<Logging>;

    let target: AccessoryServiceImplSpy;

    beforeEach(() => {
        factory = new Mock<AccessoryFactory>();
        api = new Mock<API>();
        hap = new Mock<HAP>();
        log = new Mock<Logging>();

        service = Service;
        characteristic = Characteristic;

        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(characteristic);
        hap.setup(x => x.Service).returns(service);

        target = new AccessoryServiceImplSpy(factory.object(), api.object(), log.object());
    });

    it('should initialize and return a new accessory', () => {
        const mowerId = '12345';
        const uuid = '67890';
        const mowerName = 'Bob';
        const serialNumber = 1;
        const model = 'HUSQVARNA AUTOMOWER 430XH';

        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();
        
        const newAccessory = new Mock<AutomowerAccessory>();
        newAccessory.setup(o => o.init()).returns(undefined);
        newAccessory.setup(o => o.getUnderlyingAccessory()).returns(platformAccessory.object());

        target.newAccessory = newAccessory.object();

        factory.setup(o => o.generateUuid(mowerId)).returns(uuid);
        factory.setup(o => o.create(mowerName, uuid)).returns(platformAccessory.object());

        const mower = {
            id: mowerId,
            type: '',
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: []
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 0
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
                        action: ''
                    },
                    restrictedReason: ''
                },
                positions: [],
                system: {
                    model: model,
                    name: mowerName,
                    serialNumber: serialNumber
                }
            }
        };

        const result = target.createAccessory(mower);

        const ra = result.getUnderlyingAccessory();
        expect(ra).toBeDefined();
        expect(ra.context.mowerId).toBe(mowerId);
        expect(ra.context.manufacturer).toBe('HUSQVARNA');
        expect(ra.context.model).toBe('AUTOMOWER 430XH');
        expect(ra.context.serialNumber).toBe(serialNumber.toString());

        newAccessory.verify(o => o.init(), Times.Once());
    });
});