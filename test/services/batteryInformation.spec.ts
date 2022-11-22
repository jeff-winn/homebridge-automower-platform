import { Characteristic, CharacteristicValue, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../src/automowerAccessory';
import { Activity, Mode, State } from '../../src/model';
import { Localization } from '../../src/primitives/localization';
import { BatteryInformationImpl } from '../../src/services/batteryInformation';
import { CustomCharacteristicDefinitions } from '../../src/services/homebridge/customCharacteristicDefinitions';

describe('BatteryServiceImpl', () => {
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let locale: Mock<Localization>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    let target: BatteryInformationImpl;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        locale = new Mock<Localization>();

        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        
        target = new BatteryInformationImpl(locale.object(), accessory.object(), api.object());
    });

    it('should throw an error when not initialized on set battery level', () => {
        expect(() => target.setBatteryLevel({
            batteryPercent: 99
        })).toThrowError();
    });

    it('should throw an error when not initialized on set charging state', () => {
        expect(() => target.setChargingState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.NOT_APPLICABLE
        })).toThrowError();
    });

    it('should throw an error when not initialized on set statistics', () => {
        expect(() => target.setStatistics({
            cuttingBladeUsageTime: 0,
            numberOfChargingCycles: 0,
            numberOfCollisions: 0,
            totalChargingTime: 0,
            totalCuttingTime: 0,
            totalRunningTime: 0,
            totalSearchingTime: 0
        })).toThrowError();
    });

    it('should use the existing battery service', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();
        const chargingTime = new Mock<Characteristic>();

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(chargingCycles.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(chargingTime.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        target.init();

        expect(target.getUnderlyingService()).toBe(serviceInstance.object());
        accessory.verify(o => o.getService(Service.Battery), Times.Once());
    });

    it('should automatically create a battery service if not existing', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(false);
        serviceInstance.setup(o => o.addCharacteristic(It.IsAny())).returns(chargingCycles.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(undefined);
        accessory.setup(o => o.addService(Service.Battery)).returns(serviceInstance.object());

        locale.setup(o => o.format('Charging Cycles')).returns('Hello');
        locale.setup(o => o.format('cycles')).returns('worlds');
        locale.setup(o => o.format('Total Charging Time')).returns('charging time');
        locale.setup(o => o.format('seconds')).returns('secs');

        target.init();

        expect(target.getUnderlyingService()).toBe(serviceInstance.object());
        accessory.verify(o => o.addService(Service.Battery), Times.Once());
    });
    
    it('sets the battery service as 20 percent and low battery', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();
        const chargingTime = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(chargingCycles.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(chargingTime.object());
        target.init();

        target.setBatteryLevel({
            batteryPercent: 20
        });

        lowBattery.verify(o => o.updateValue(Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW), Times.Once());
        batteryLevel.verify(o => o.updateValue(20), Times.Once());
    });

    it('sets the battery service as normal battery with 100 percent', () => {
        const serviceInstance = new Mock<Service>();        
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();
        const chargingTime = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(chargingCycles.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(chargingTime.object());

        target.init();

        target.setBatteryLevel({
            batteryPercent: 100
        });

        lowBattery.verify(o => o.updateValue(Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL), Times.Once());
        batteryLevel.verify(o => o.updateValue(100), Times.Once());
    });

    it('sets the battery service as charging', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();
        const chargingTime = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(chargingCycles.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(chargingTime.object());

        target.init();

        target.setChargingState({
            activity: Activity.CHARGING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.OFF
        });

        chargingState.verify(o => o.updateValue(Characteristic.ChargingState.CHARGING), Times.Once());
    });

    it('sets the battery service as not charging', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();
        const chargingTime = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(chargingCycles.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(chargingTime.object());

        target.init();
        
        target.setChargingState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.OFF
        });

        chargingState.verify(o => o.updateValue(Characteristic.ChargingState.NOT_CHARGING), Times.Once());
    });

    it('sets the battery service statistics', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();
        const chargingCycles = new Mock<Characteristic>();
        const chargingTime = new Mock<Characteristic>();

        chargingCycles.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingCycles.object());
        chargingTime.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingTime.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.ChargingCycles)).returns(chargingCycles.object());
        serviceInstance.setup(o => o.testCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(true);
        serviceInstance.setup(o => o.getCharacteristic(CustomCharacteristicDefinitions.TotalChargingTime)).returns(chargingTime.object());

        target.init();

        target.setStatistics({
            cuttingBladeUsageTime: 0,
            numberOfChargingCycles: 1,
            numberOfCollisions: 0,
            totalChargingTime: 2,
            totalCuttingTime: 0,
            totalRunningTime: 0,
            totalSearchingTime: 0
        });

        chargingCycles.verify(o => o.updateValue(1), Times.Once());
        chargingTime.verify(o => o.updateValue(2), Times.Once());
    });
});