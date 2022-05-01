import { API, HAP, Logging, PlatformAccessory } from 'homebridge';
import { Characteristic, Service } from 'hap-nodejs';
import { Mock, Times } from 'moq.ts';
import { AutomowerContext } from '../src/automowerAccessory';
import { AutomowerAccessorySpy } from './automowerAccessorySpy';
import { AutomowerEventTypes } from '../src/events';
import { Activity, Mode, State } from '../src/model';

describe('AutomowerAccessory', () => {
    let service: typeof Service;
    let characteristic: typeof Characteristic;

    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<Logging>;

    let target: AutomowerAccessorySpy;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        api = new Mock<API>();
        hap = new Mock<HAP>();
        log = new Mock<Logging>();

        service = Service;
        characteristic = Characteristic;
        
        api.setup(x => x.hap).returns(hap.object());
        hap.setup(x => x.Characteristic).returns(characteristic);
        hap.setup(x => x.Service).returns(service);

        target = new AutomowerAccessorySpy(accessory.object(), api.object(), log.object());
    });

    it('should initialize all services', () => {
        target.shouldRun = false;

        target.init({
            id: '12345',
            type: '',
            attributes: {
                battery: {
                    batteryPercent: 0
                },
                calendar: {
                    tasks: []
                },
                metadata: {
                    connected: false,
                    statusTimestamp: 0
                },
                mower: {
                    activity: Activity.GOING_HOME,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.HOME,
                    state: State.OFF
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: ''
                    },
                    restrictedReason: ''
                },
                positions: [                    
                ],
                system: {
                    name: '',
                    model: '',
                    serialNumber: 1
                }
            }
        });

        expect(target.accessoryInformationInitialized).toBeTruthy();
        expect(target.batteryServiceInitialized).toBeTruthy();
    });

    it('initializes the accessory information correctly', () => {
        const serviceInstance = new Mock<Service>();
        
        const displayName = 'Bob';
        const mowerId = 'abcd1234';
        const manufacturer = 'manufacturer';
        const model = 'model';
        const serialNumber = '12345';

        accessory.setup(x => x.displayName).returns(displayName);
        accessory.setup(x => x.getService(service.AccessoryInformation)).returns(serviceInstance.object());
        accessory.setup(x => x.context).returns({
            mowerId: mowerId,
            manufacturer: manufacturer,
            model: model,
            serialNumber: serialNumber
        });

        serviceInstance.setup(x => x.setCharacteristic(characteristic.Manufacturer, manufacturer)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(characteristic.Model, model)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(characteristic.Name, displayName)).returns(serviceInstance.object());
        serviceInstance.setup(x => x.setCharacteristic(characteristic.SerialNumber, serialNumber)).returns(serviceInstance.object());

        target.unsafeInitAccessoryInformation();

        serviceInstance.verify(x => x.setCharacteristic(characteristic.Manufacturer, manufacturer), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(characteristic.Model, model), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(characteristic.Name, displayName), Times.Once());
        serviceInstance.verify(x => x.setCharacteristic(characteristic.SerialNumber, serialNumber), Times.Once());
    });

    it('returns the accessory uuid', () => {
        const id = '12345';
        
        accessory.setup(x => x.context.mowerId).returns(id);

        const result = target.getId();
        expect(result).toBe(id);
    });

    it('does nothing when the status event is received', async () => {
        await target.onStatusEventReceived({
            id: '12345',
            type: AutomowerEventTypes.STATUS,
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 0
                },
                mower: {
                    activity: Activity.CHARGING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.RESTRICTED
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: 'no'
                    },
                    restrictedReason: 'none'
                }
            }
        });
    });
});