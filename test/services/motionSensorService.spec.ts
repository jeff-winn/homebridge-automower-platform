import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../src/automowerAccessory';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { InvalidStateError } from '../../src/errors/invalidStateError';
import { Activity, Mode, MowerState, State } from '../../src/model';
import { MowerFaultedPolicy } from '../../src/services/policies/mowerFaultedPolicy';
import { MowerInMotionPolicy } from '../../src/services/policies/mowerInMotionPolicy';
import { MowerTamperedPolicy } from '../../src/services/policies/mowerTamperedPolicy';
import { MotionSensorServiceImplSpy } from './motionSensorServiceImplSpy';

describe('MotionSensorServiceImpl', () => {
    let target: MotionSensorServiceImplSpy;
    let motionPolicy: Mock<MowerInMotionPolicy>;
    let faultedPolicy: Mock<MowerFaultedPolicy>;
    let tamperedPolicy: Mock<MowerTamperedPolicy>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;

    beforeEach(() => {
        motionPolicy = new Mock<MowerInMotionPolicy>();
        faultedPolicy = new Mock<MowerFaultedPolicy>();
        tamperedPolicy = new Mock<MowerTamperedPolicy>();

        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();
        log = new Mock<PlatformLogger>();
        
        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object()); 

        target = new MotionSensorServiceImplSpy('Motion Sensor', motionPolicy.object(), faultedPolicy.object(),
            tamperedPolicy.object(), platformAccessory.object(), api.object(), log.object());
    });
    
    it('should be initialized with an existing service', () => {
        const motionDetected = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());

        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        target.init(false);

        service.verify(o => o.getCharacteristic(Characteristic.MotionDetected), Times.Once());
    });

    it('should create a new service with the name prepended on init', () => {
        const motionDetected = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());
        platformAccessory.setup(o => o.addService(It.IsAny())).returns(service.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(undefined);
        platformAccessory.setup(o => o.displayName).returns('Mower');

        target.service = service.object();
        target.init(true);

        expect(target.displayName).toBe('Mower Motion Sensor');
        service.verify(o => o.getCharacteristic(Characteristic.MotionDetected), Times.Once());
    });

    it('should create a new service without the name prepended on init', () => {
        const motionDetected = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());
        platformAccessory.setup(o => o.addService(It.IsAny())).returns(service.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(undefined);

        target.service = service.object();
        target.init(false);

        expect(target.displayName).toBe('Motion Sensor');
        service.verify(o => o.getCharacteristic(Characteristic.MotionDetected), Times.Once());
    });

    it('should throw an error when service has not been initialized on set mower state', () => {
        motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        
        expect(() => target.setMowerState({
            activity: Activity.CHARGING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA, 
            state: State.IN_OPERATION
        })).toThrowError(InvalidStateError);
    });

    it('should refresh the motion characteristic when the value has changed from undefined to false', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const motionDetected = new Mock<Characteristic>();
        motionDetected.setup(o => o.updateValue(false)).returns(motionDetected.object());

        const faulted = new Mock<Characteristic>();
        faulted.setup(o => o.updateValue(It.IsAny())).returns(faulted.object());

        const tampered = new Mock<Characteristic>();
        tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
        service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        motionPolicy.setup(o => o.setMowerState(state)).returns(undefined);
        motionPolicy.setup(o => o.check()).returns(false);
        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        faultedPolicy.setup(o => o.check()).returns(false);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.check()).returns(false);

        target.unsafeSetLastMotionValue(undefined);
        target.init(false);

        target.setMowerState(state);

        const result = target.unsafeGetLastMotionValue();
        expect(result).toBeFalsy();

        motionDetected.verify(o => o.updateValue(false), Times.Once());
    });

    it('should refresh the motion characteristic when the value has changed from false to true', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const motionDetected = new Mock<Characteristic>();
        motionDetected.setup(o => o.updateValue(true)).returns(motionDetected.object());

        const faulted = new Mock<Characteristic>();
        faulted.setup(o => o.updateValue(It.IsAny())).returns(faulted.object());

        const tampered = new Mock<Characteristic>();
        tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
        service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        motionPolicy.setup(o => o.setMowerState(state)).returns(undefined);
        motionPolicy.setup(o => o.check()).returns(true);
        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        faultedPolicy.setup(o => o.check()).returns(false);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.check()).returns(false);

        target.unsafeSetLastMotionValue(false);
        target.init(false);

        target.setMowerState(state);

        const result = target.unsafeGetLastMotionValue();
        expect(result).toBeTruthy();

        motionDetected.verify(o => o.updateValue(true), Times.Once());
    });

    it('should refresh the faulted characteristic when the value has changed from undefined to false', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const motionDetected = new Mock<Characteristic>();
        motionDetected.setup(o => o.updateValue(It.IsAny())).returns(motionDetected.object());

        const faulted = new Mock<Characteristic>();
        faulted.setup(o => o.updateValue(false)).returns(faulted.object());

        const tampered = new Mock<Characteristic>();
        tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 10,
            errorCodeTimestamp: 10000,
            mode: Mode.MAIN_AREA,
            state: State.ERROR
        };
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
        service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        motionPolicy.setup(o => o.check()).returns(false);
        faultedPolicy.setup(o => o.setMowerState(state)).returns(undefined);
        faultedPolicy.setup(o => o.check()).returns(false);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.check()).returns(false);

        target.unsafeSetLastFaultedValue(undefined);
        target.unsafeSetLastMotionValue(false);
        target.init(false);

        target.setMowerState(state);

        const result = target.unsafeGetLastFaultedValue();
        expect(result).toBeFalsy();

        faulted.verify(o => o.updateValue(Characteristic.StatusFault.NO_FAULT), Times.Once());
    });

    it('should refresh the faulted characteristic when the value has changed from false to true', () => {
        log.setup(o => o.info(It.IsAny())).returns(undefined);

        const motionDetected = new Mock<Characteristic>();
        motionDetected.setup(o => o.updateValue(It.IsAny())).returns(motionDetected.object());

        const faulted = new Mock<Characteristic>();
        faulted.setup(o => o.updateValue(true)).returns(faulted.object());

        const tampered = new Mock<Characteristic>();
        tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 10,
            errorCodeTimestamp: 10000,
            mode: Mode.MAIN_AREA,
            state: State.ERROR
        };
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
        service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        motionPolicy.setup(o => o.setMowerState(state)).returns(undefined);
        motionPolicy.setup(o => o.check()).returns(false);
        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        faultedPolicy.setup(o => o.check()).returns(true);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.check()).returns(false);

        target.unsafeSetLastFaultedValue(false);
        target.unsafeSetLastMotionValue(false);
        target.init(false);

        target.setMowerState(state);

        const result = target.unsafeGetLastFaultedValue();
        expect(result).toBeTruthy();

        faulted.verify(o => o.updateValue(Characteristic.StatusFault.GENERAL_FAULT), Times.Once());
    });
});