import { API, HAP, Logging, PlatformAccessory, CharacteristicValue } from 'homebridge';
import { Characteristic, Service } from 'hap-nodejs';
import { It, Mock, Times } from 'moq.ts';
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

    it('should return the underlying platform accessory', () => {
        const actual = target.getUnderlyingAccessory();

        expect(actual).toBe(accessory.object());
    });

    it('should automatically create a battery service if not existing', () => {
        const batteryService = new Mock<Service>();
        
        accessory.setup(o => o.getService(service.Battery)).returns(undefined);
        accessory.setup(o => o.addService(service.Battery)).returns(batteryService.object());

        const actual = target.unsafeGetBatteryService();

        expect(actual).toBe(batteryService.object());
    });

    it('should initialize all services', () => {
        target.shouldRun = false;

        target.init();

        expect(target.accessoryInformationInitialized).toBeTruthy();
        expect(target.batteryServiceInitialized).toBeTruthy();
    });

    it('sets the battery service as 20 percent and low battery', () => {
        const serviceInstance = new Mock<Service>();
        
        const lowBattery = new Mock<Characteristic>();
        lowBattery.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());

        const batteryLevel = new Mock<Characteristic>();
        batteryLevel.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());

        const chargingState = new Mock<Characteristic>();
        chargingState.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.ChargingState)).returns(chargingState.object());

        target.unsafeInitBatteryService();
        target.unsafeSetBatteryLevel({
            batteryPercent: 20
        });

        lowBattery.verify(o => o.setValue(characteristic.StatusLowBattery.BATTERY_LEVEL_LOW), Times.Once());
        batteryLevel.verify(o => o.setValue(20), Times.Once());
    });

    it('sets the battery service as normal battery with 100 percent', () => {
        const serviceInstance = new Mock<Service>();
        
        const lowBattery = new Mock<Characteristic>();
        lowBattery.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());

        const batteryLevel = new Mock<Characteristic>();
        batteryLevel.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());

        const chargingState = new Mock<Characteristic>();
        chargingState.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.ChargingState)).returns(chargingState.object());

        target.unsafeInitBatteryService();
        target.unsafeSetBatteryLevel({
            batteryPercent: 100
        });

        lowBattery.verify(o => o.setValue(characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL), Times.Once());
        batteryLevel.verify(o => o.setValue(100), Times.Once());
    });

    it('sets the battery service as charging', () => {
        const serviceInstance = new Mock<Service>();
        
        const lowBattery = new Mock<Characteristic>();
        lowBattery.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());

        const batteryLevel = new Mock<Characteristic>();
        batteryLevel.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());

        const chargingState = new Mock<Characteristic>();
        chargingState.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.ChargingState)).returns(chargingState.object());

        target.unsafeInitBatteryService();

        target.unsafeSetChargingState({
            activity: Activity.CHARGING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.OFF
        });

        chargingState.verify(o => o.setValue(characteristic.ChargingState.CHARGING), Times.Once());
    });

    it('sets the battery service as not charging', () => {
        const serviceInstance = new Mock<Service>();
        
        const lowBattery = new Mock<Characteristic>();
        lowBattery.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());

        const batteryLevel = new Mock<Characteristic>();
        batteryLevel.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());

        const chargingState = new Mock<Characteristic>();
        chargingState.setup(o => o.setValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(characteristic.ChargingState)).returns(chargingState.object());

        target.unsafeInitBatteryService();
        
        target.unsafeSetChargingState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.OFF
        });

        chargingState.verify(o => o.setValue(characteristic.ChargingState.NOT_CHARGING), Times.Once());
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