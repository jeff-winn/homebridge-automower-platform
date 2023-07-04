import { Characteristic, CharacteristicValue, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { Activity, State } from '../../src/model';
import { MowerContext } from '../../src/mowerAccessory';
import { BatteryInformationImpl } from '../../src/services/batteryInformation';

describe('BatteryServiceImpl', () => {
    let accessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    let target: BatteryInformationImpl;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<MowerContext>>();

        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);        

        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());
        
        target = new BatteryInformationImpl(accessory.object(), api.object());
    });

    it('should throw an error when not initialized on set battery level', () => {
        expect(() => target.setBatteryLevel({
            level: 99
        })).toThrowError();
    });

    it('should throw an error when not initialized on set charging state', () => {
        expect(() => target.setChargingState({
            activity: Activity.MOWING,            
            state: State.IN_OPERATION
        })).toThrowError();
    });

    it('should use the existing battery service', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());

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

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(undefined);
        accessory.setup(o => o.addService(Service.Battery)).returns(serviceInstance.object());

        target.init();

        expect(target.getUnderlyingService()).toBe(serviceInstance.object());
        accessory.verify(o => o.addService(Service.Battery), Times.Once());
    });
    
    it('sets the battery service as 20 percent and low battery', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
        target.init();

        target.setBatteryLevel({
            level: 20
        });

        lowBattery.verify(o => o.updateValue(Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW), Times.Once());
        batteryLevel.verify(o => o.updateValue(20), Times.Once());
    });

    it('sets the battery service as normal battery with 100 percent', () => {
        const serviceInstance = new Mock<Service>();        
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());

        target.init();

        target.setBatteryLevel({
            level: 100
        });

        lowBattery.verify(o => o.updateValue(Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL), Times.Once());
        batteryLevel.verify(o => o.updateValue(100), Times.Once());
    });

    it('sets the battery service as charging while parked with less than 100 percent battery', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
 
        target.init();

        target.setBatteryLevel({
            level: 99
        });

        target.setChargingState({
            activity: Activity.PARKED,
            state: State.IDLE
        });

        chargingState.verify(o => o.updateValue(Characteristic.ChargingState.CHARGING), Times.Once());
        lowBattery.verify(o => o.updateValue(Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL), Times.Once());
    });

    it('sets the battery service as not charging while parked with 100 percent battery', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
 
        target.init();        

        target.setChargingState({
            activity: Activity.PARKED,
            state: State.IDLE
        });

        target.setBatteryLevel({
            level: 100
        });

        chargingState.verify(o => o.updateValue(Characteristic.ChargingState.NOT_CHARGING), Times.Exactly(2));
        lowBattery.verify(o => o.updateValue(Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL), Times.Once());
    });

    it('sets the battery service as charging', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());
 
        target.init();

        target.setChargingState({
            activity: Activity.PARKED,
            state: State.CHARGING
        });

        chargingState.verify(o => o.updateValue(Characteristic.ChargingState.CHARGING), Times.Once());
    });

    it('sets the battery service as not charging', () => {
        const serviceInstance = new Mock<Service>();
        const lowBattery = new Mock<Characteristic>();
        const batteryLevel = new Mock<Characteristic>();
        const chargingState = new Mock<Characteristic>();

        lowBattery.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(lowBattery.object());
        batteryLevel.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(batteryLevel.object());
        chargingState.setup(o => o.updateValue(It.IsAny<CharacteristicValue>())).returns(chargingState.object());

        accessory.setup(o => o.getService(Service.Battery)).returns(serviceInstance.object());

        serviceInstance.setup(o => o.getCharacteristic(Characteristic.StatusLowBattery)).returns(lowBattery.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.BatteryLevel)).returns(batteryLevel.object());
        serviceInstance.setup(o => o.getCharacteristic(Characteristic.ChargingState)).returns(chargingState.object());

        target.init();
        
        target.setChargingState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        chargingState.verify(o => o.updateValue(Characteristic.ChargingState.NOT_CHARGING), Times.Once());
    });
});