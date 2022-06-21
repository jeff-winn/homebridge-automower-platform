import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerContext } from '../../src/automowerAccessory';
import { InvalidStateError } from '../../src/errors/invalidStateError';
import { Activity, Mode, MowerState, State } from '../../src/model';
import { MowerInMotionPolicy } from '../../src/services/policies/mowerInMotionPolicy';
import { MotionSensorServiceImplSpy } from './motionSensorServiceImplSpy';

describe('MotionSensorServiceImpl', () => {
    let target: MotionSensorServiceImplSpy;
    let policy: Mock<MowerInMotionPolicy>;
    let platformAccessory: Mock<PlatformAccessory<AutomowerContext>>;
    let api: Mock<API>;
    let hap: Mock<HAP>;

    beforeEach(() => {
        policy = new Mock<MowerInMotionPolicy>();
        platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();
        
        hap = new Mock<HAP>();
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object()); 

        target = new MotionSensorServiceImplSpy('Motion Sensor', policy.object(), 
            platformAccessory.object(), api.object());
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
        policy.setup(o => o.setMowerState(It.IsAny())).returns(undefined);
        
        expect(() => target.setMowerState({
            activity: Activity.CHARGING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA, 
            state: State.IN_OPERATION
        })).toThrowError(InvalidStateError);
    });

    it('should refresh the characteristic when the value has changed from undefined to false', () => {
        const motionDetected = new Mock<Characteristic>();
        motionDetected.setup(o => o.updateValue(false)).returns(motionDetected.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        policy.setup(o => o.setMowerState(state)).returns(undefined);
        policy.setup(o => o.check()).returns(false);

        target.unsafeSetLastValue(undefined);
        target.init(false);

        target.setMowerState(state);

        const result = target.unsafeGetLastValue();
        expect(result).toBeFalsy();

        motionDetected.verify(o => o.updateValue(false), Times.Once());
    });

    it('should refresh the characteristic when the value has changed from false to true', () => {
        const motionDetected = new Mock<Characteristic>();
        motionDetected.setup(o => o.updateValue(true)).returns(motionDetected.object());

        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };
        
        const service = new Mock<Service>();
        service.setup(o => o.getCharacteristic(Characteristic.MotionDetected)).returns(motionDetected.object());        
        platformAccessory.setup(o => o.getServiceById(Service.MotionSensor, 'Motion Sensor')).returns(service.object());

        policy.setup(o => o.setMowerState(state)).returns(undefined);
        policy.setup(o => o.check()).returns(true);

        target.unsafeSetLastValue(false);
        target.init(false);

        target.setMowerState(state);

        const result = target.unsafeGetLastValue();
        expect(result).toBeTruthy();

        motionDetected.verify(o => o.updateValue(true), Times.Once());
    });
});