import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { MowerContext } from '../../src/automowerAccessory';
import { Activity, MowerConnection, MowerState, State } from '../../src/model';
import { PlatformLogger } from '../../src/diagnostics/platformLogger';
import { MowerFaultedPolicy } from '../../src/services/policies/mowerFaultedPolicy';
import { MowerInMotionPolicy } from '../../src/services/policies/mowerInMotionPolicy';
import { MowerTamperedPolicy } from '../../src/services/policies/mowerTamperedPolicy';
import { MotionSensorImplSpy } from './motionSensorImplSpy';

describe('MotionSensorImpl', () => {
    let target: MotionSensorImplSpy;
    let motionPolicy: Mock<MowerInMotionPolicy>;
    let faultedPolicy: Mock<MowerFaultedPolicy>;
    let tamperedPolicy: Mock<MowerTamperedPolicy>;
    let platformAccessory: Mock<PlatformAccessory<MowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;

    beforeEach(() => {
        motionPolicy = new Mock<MowerInMotionPolicy>();
        faultedPolicy = new Mock<MowerFaultedPolicy>();
        tamperedPolicy = new Mock<MowerTamperedPolicy>();

        platformAccessory = new Mock<PlatformAccessory<MowerContext>>();
        log = new Mock<PlatformLogger>();
        
        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object()); 

        target = new MotionSensorImplSpy('Motion Sensor', motionPolicy.object(), faultedPolicy.object(),
            tamperedPolicy.object(), platformAccessory.object(), api.object(), log.object());
    });

    it('should create a new service instance', () => {
        const result = target.unsafeCreateService('My Service');

        expect(result).toBeDefined();
    });
    
    it('should be initialized with an existing service', () => {
        const motionDetected = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());

        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        target.init();

        service.verify(o => o.getCharacteristic(Characteristic.MotionDetected), Times.Once());
    });

    it('should create a new service on init', () => {
        const displayName = 'Motion Sensor';
        const motionDetected = new Mock<Characteristic>();
        
        const service = new Mock<Service>();
        service.setup(o => o.setCharacteristic(Characteristic.ConfiguredName, displayName)).returns(service.object());
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());

        platformAccessory.setup(o => o.addService(It.IsAny())).returns(service.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, displayName)).returns(undefined);

        target.service = service.object();
        target.init();

        expect(target.displayName).toBe(displayName);
        service.verify(o => o.setCharacteristic(Characteristic.ConfiguredName, displayName), Times.Once());
        service.verify(o => o.getCharacteristic(Characteristic.MotionDetected), Times.Once());
    });

    it('should throw an error when fault service has not been initialized on set mower state', () => {                
        const service = new Mock<Service>();
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());
        service.setup(o => o.getCharacteristic(It.IsAny())).returns(undefined!);

        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);

        target.init();
        
        expect(() => target.setMowerState({
            activity: Activity.CHARGING,
            state: State.IN_OPERATION,
            enabled: true
        })).toThrowError();
    });

    it('should throw an error when tampered service has not been initialized on set mower state', () => {
        const faulted = new Mock<Characteristic>();
        faulted.setup(o => o.updateValue(It.IsAny())).returns(faulted.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        faultedPolicy.setup(o => o.check()).returns(false);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        
        target.unsafeSetLastFaultedValue(false);
        target.init();

        expect(() => target.setMowerState({
            activity: Activity.CHARGING,
            state: State.IN_OPERATION,
            enabled: true
        })).toThrowError();
    });

    it('should throw an error when motion service has not been initialized on set mower state', () => {
        const faulted = new Mock<Characteristic>();
        faulted.setup(o => o.updateValue(It.IsAny())).returns(faulted.object());

        const tampered = new Mock<Characteristic>();
        tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(undefined!);        
        service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
        service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        faultedPolicy.setup(o => o.check()).returns(false);
        tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        tamperedPolicy.setup(o => o.check()).returns(false);
        motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        
        target.unsafeSetLastFaultedValue(false);
        target.unsafeSetLastTamperedValue(false);
        target.init();

        expect(() => target.setMowerState({
            activity: Activity.CHARGING,
            state: State.IN_OPERATION,
            enabled: true
        })).toThrowError();
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
            state: State.IN_OPERATION,
            enabled: true
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
        target.init();

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
            state: State.IN_OPERATION,
            enabled: true
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
        target.init();

        target.setMowerState(state);

        const result = target.unsafeGetLastMotionValue();
        expect(result).toBeTruthy();

        motionDetected.verify(o => o.updateValue(true), Times.Once());
    });

    // TODO: Clean this
    // it('should refresh the faulted characteristic when the value has changed from undefined to false', () => {
    //     log.setup(o => o.info(It.IsAny())).returns(undefined);

    //     const motionDetected = new Mock<Characteristic>();
    //     motionDetected.setup(o => o.updateValue(It.IsAny())).returns(motionDetected.object());

    //     const faulted = new Mock<Characteristic>();
    //     faulted.setup(o => o.updateValue(false)).returns(faulted.object());

    //     const tampered = new Mock<Characteristic>();
    //     tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

    //     const state: MowerState = {
    //         activity: Activity.GOING_HOME,
    //         errorCode: 10,
    //         errorCodeTimestamp: 10000,
    //         mode: Mode.MAIN_AREA,
    //         state: State.ERROR
    //     };
        
    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
    //     platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

    //     motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     motionPolicy.setup(o => o.check()).returns(false);
    //     faultedPolicy.setup(o => o.setMowerState(state)).returns(undefined);
    //     faultedPolicy.setup(o => o.check()).returns(false);
    //     tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     tamperedPolicy.setup(o => o.check()).returns(false);

    //     target.unsafeSetLastFaultedValue(undefined);
    //     target.unsafeSetLastMotionValue(false);
    //     target.init();

    //     target.setMowerState(state);

    //     const result = target.unsafeGetLastFaultedValue();
    //     expect(result).toBeFalsy();

    //     faulted.verify(o => o.updateValue(Characteristic.StatusFault.NO_FAULT), Times.Once());
    // });

    // it('should refresh the faulted characteristic when the value has changed from false to true', () => {
    //     log.setup(o => o.info(It.IsAny())).returns(undefined);

    //     const motionDetected = new Mock<Characteristic>();
    //     motionDetected.setup(o => o.updateValue(It.IsAny())).returns(motionDetected.object());

    //     const faulted = new Mock<Characteristic>();
    //     faulted.setup(o => o.updateValue(true)).returns(faulted.object());

    //     const tampered = new Mock<Characteristic>();
    //     tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

    //     const state: MowerState = {
    //         activity: Activity.GOING_HOME,
    //         errorCode: 10,
    //         errorCodeTimestamp: 10000,
    //         mode: Mode.MAIN_AREA,
    //         state: State.ERROR
    //     };
        
    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
    //     platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

    //     motionPolicy.setup(o => o.setMowerState(state)).returns(undefined);
    //     motionPolicy.setup(o => o.check()).returns(false);
    //     faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     faultedPolicy.setup(o => o.check()).returns(true);
    //     tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     tamperedPolicy.setup(o => o.check()).returns(false);

    //     target.unsafeSetLastFaultedValue(false);
    //     target.unsafeSetLastMotionValue(false);
    //     target.init();

    //     target.setMowerState(state);

    //     const result = target.unsafeGetLastFaultedValue();
    //     expect(result).toBeTruthy();

    //     faulted.verify(o => o.updateValue(Characteristic.StatusFault.GENERAL_FAULT), Times.Once());
    // });

    // it('should refresh the tampered characteristic when the value has changed from undefined to false', () => {
    //     log.setup(o => o.info(It.IsAny())).returns(undefined);

    //     const motionDetected = new Mock<Characteristic>();
    //     motionDetected.setup(o => o.updateValue(It.IsAny())).returns(motionDetected.object());

    //     const faulted = new Mock<Characteristic>();
    //     faulted.setup(o => o.updateValue(false)).returns(faulted.object());

    //     const tampered = new Mock<Characteristic>();
    //     tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

    //     const state: MowerState = {
    //         activity: Activity.GOING_HOME,
    //         errorCode: 10,
    //         errorCodeTimestamp: 10000,
    //         mode: Mode.MAIN_AREA,
    //         state: State.ERROR
    //     };
        
    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
    //     platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

    //     motionPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     motionPolicy.setup(o => o.check()).returns(false);
    //     faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     faultedPolicy.setup(o => o.check()).returns(false);
    //     tamperedPolicy.setup(o => o.setMowerState(state)).returns(undefined);
    //     tamperedPolicy.setup(o => o.check()).returns(false);

    //     target.unsafeSetLastFaultedValue(false);
    //     target.unsafeSetLastMotionValue(false);
    //     target.unsafeSetLastTamperedValue(undefined);
    //     target.init();

    //     target.setMowerState(state);

    //     const result = target.unsafeGetLastTamperedValue();
    //     expect(result).toBeFalsy();

    //     tampered.verify(o => o.updateValue(Characteristic.StatusTampered.NOT_TAMPERED), Times.Once());
    // });

    // it('should refresh the tampered characteristic when the value has changed from false to true', () => {
    //     log.setup(o => o.info(It.IsAny())).returns(undefined);

    //     const motionDetected = new Mock<Characteristic>();
    //     motionDetected.setup(o => o.updateValue(It.IsAny())).returns(motionDetected.object());

    //     const faulted = new Mock<Characteristic>();
    //     faulted.setup(o => o.updateValue(true)).returns(faulted.object());

    //     const tampered = new Mock<Characteristic>();
    //     tampered.setup(o => o.updateValue(It.IsAny())).returns(tampered.object());

    //     const state: MowerState = {
    //         activity: Activity.GOING_HOME,
    //         errorCode: 10,
    //         errorCodeTimestamp: 10000,
    //         mode: Mode.MAIN_AREA,
    //         state: State.ERROR
    //     };
        
    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusFault)).returns(faulted.object());
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusTampered)).returns(tampered.object());
    //     platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

    //     motionPolicy.setup(o => o.setMowerState(state)).returns(undefined);
    //     motionPolicy.setup(o => o.check()).returns(false);
    //     faultedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     faultedPolicy.setup(o => o.check()).returns(false);
    //     tamperedPolicy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
    //     tamperedPolicy.setup(o => o.check()).returns(true);

    //     target.unsafeSetLastFaultedValue(false);
    //     target.unsafeSetLastMotionValue(false);
    //     target.unsafeSetLastTamperedValue(false);
    //     target.init();

    //     target.setMowerState(state);

    //     const result = target.unsafeGetLastTamperedValue();
    //     expect(result).toBeTruthy();

    //     tampered.verify(o => o.updateValue(Characteristic.StatusTampered.TAMPERED), Times.Once());
    // });

    it('should throw an error when not initialized on set mower metadata', () => {
        const metadata: MowerConnection = {
            connected: false
        };

        expect(() => target.setMowerConnection(metadata)).toThrowError();
    });

    it('should set active status to true when connected', () => {
        const statusActive = new Mock<Characteristic>();
        statusActive.setup(o => o.updateValue(It.IsAny())).returns(statusActive.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        target.init();
        target.setMowerConnection({
            connected: true
        });

        statusActive.verify(o => o.updateValue(true), Times.Once());
    });

    it('should set active status to false when not connected', () => {
        const statusActive = new Mock<Characteristic>();
        statusActive.setup(o => o.updateValue(It.IsAny())).returns(statusActive.object());

        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        target.init();
        target.setMowerConnection({
            connected: false
        });

        statusActive.verify(o => o.updateValue(false), Times.Once());
    });
});