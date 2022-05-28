import { API, HAP, PlatformAccessory } from 'homebridge';
import { Characteristic, Service } from 'hap-nodejs';
import { Mock } from 'moq.ts';

import { AutomowerAccessory, AutomowerContext } from '../../src/automowerAccessory';
import { Activity, Mode, OverrideAction, RestrictedReason, State } from '../../src/model';
import { PlatformAccessoryFactory } from '../../src/primitives/platformAccessoryFactory';
import { AutomowerAccessoryFactoryImplSpy } from './automowerAccessoryFactoryImplSpy';
import { PlatformContainer } from '../../src/primitives/platformContainer';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';

describe('AutomowerAccessoryFactoryImpl', () => {
    let service: typeof Service;
    let characteristic: typeof Characteristic;

    let factory: Mock<PlatformAccessoryFactory>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let container: Mock<PlatformContainer>;

    let target: AutomowerAccessoryFactoryImplSpy;

    beforeEach(() => {
        factory = new Mock<PlatformAccessoryFactory>();
        api = new Mock<API>();
        hap = new Mock<HAP>();
        log = new Mock<PlatformLogger>();
        container = new Mock<PlatformContainer>();

        service = Service;
        characteristic = Characteristic;

        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(characteristic);
        hap.setup(x => x.Service).returns(service);

        target = new AutomowerAccessoryFactoryImplSpy(factory.object(), api.object(), log.object(), container.object());
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
                        action: OverrideAction.NO_SOURCE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
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
    });
});