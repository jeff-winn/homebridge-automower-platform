import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../src/automowerAccessory';
import { Activity, Mode, MowerState, State } from '../../src/clients/automower/automowerClient';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { CONTACT_SENSOR_CLOSED, CONTACT_SENSOR_OPEN } from '../../src/services/homebridge/abstractContactSensor';
import { MowerIsArrivingPolicy } from '../../src/services/policies/mowerIsArrivingPolicy';
import { ArrivingContactSensorImplSpy } from './arrivingContactSensorImplSpy';

describe('ArrivingContactSensorImpl', () => {
    let target: ArrivingContactSensorImplSpy;
    let policy: Mock<MowerIsArrivingPolicy>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;

    beforeEach(() => {
        policy = new Mock<MowerIsArrivingPolicy>();

        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();
        log = new Mock<PlatformLogger>();
        
        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object()); 

        target = new ArrivingContactSensorImplSpy('Arriving Sensor', policy.object(), 
            platformAccessory.object(), api.object(), log.object());
    });
    
    it('should be initialized with an existing service', () => {
        const contactState = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());

        platformAccessory.setup(o => o.getServiceById(Service.ContactSensor, 'Arriving Sensor')).returns(service.object());

        target.init();

        service.verify(o => o.getCharacteristic(Characteristic.ContactSensorState), Times.Once());
    });

    it('should create a new service on init', () => {
        const displayName = 'Arriving Sensor';
        const contactState = new Mock<Characteristic>();
        const statusActive = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.setCharacteristic(Characteristic.ConfiguredName, displayName)).returns(service.object());
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());

        platformAccessory.setup(o => o.addService(It.IsAny())).returns(service.object());
        platformAccessory.setup(o => o.getServiceById(Service.ContactSensor, displayName)).returns(undefined);

        target.service = service.object();
        target.init();

        expect(target.displayName).toBe(displayName);
        service.verify(o => o.setCharacteristic(Characteristic.ConfiguredName, displayName), Times.Once());
        service.verify(o => o.getCharacteristic(Characteristic.ContactSensorState), Times.Once());
        service.verify(o => o.getCharacteristic(Characteristic.StatusActive), Times.Once());
    });

    it('should throw an error when not initialized on set mower state', () => {
        policy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        
        expect(() => target.setMowerState({
            activity: Activity.CHARGING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA, 
            state: State.IN_OPERATION
        })).toThrowError();
    });

    it('should refresh the contact state when value has changed from undefined to false', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED)).returns(contactState.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        platformAccessory.setup(o => o.getServiceById(Service.ContactSensor, 'Arriving Sensor')).returns(service.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        policy.setup(o => o.setMowerState(state)).returns(undefined);
        policy.setup(o => o.check()).returns(false);

        target.unsafeSetLastValue(undefined);
        target.init();

        target.setMowerState(state);

        const result = target.unsafeGetLastValue();
        expect(result).toBeFalsy();

        contactState.verify(o => o.updateValue(CONTACT_SENSOR_CLOSED), Times.Once());
    });

    it('should refresh the contact state when value has changed from false to true', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const contactState = new Mock<Characteristic>();
        contactState.setup(o => o.updateValue(Characteristic.ContactSensorState.CONTACT_NOT_DETECTED)).returns(contactState.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.ContactSensorState)).returns(contactState.object());
        platformAccessory.setup(o => o.getServiceById(Service.ContactSensor, 'Arriving Sensor')).returns(service.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        policy.setup(o => o.setMowerState(state)).returns(undefined);
        policy.setup(o => o.check()).returns(true);

        target.unsafeSetLastValue(0);
        target.init();

        target.setMowerState(state);

        const result = target.unsafeGetLastValue();
        expect(result).toBeTruthy();

        contactState.verify(o => o.updateValue(CONTACT_SENSOR_OPEN), Times.Once());
    });   
});