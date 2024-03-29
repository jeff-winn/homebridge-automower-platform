import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerPlatformConfig } from '../src/automowerPlatform';
import { PlatformLogger } from '../src/diagnostics/platformLogger';
import { Activity, DeviceType, Mower, SensorMode, State } from '../src/model';
import { MowerAccessory, MowerContext } from '../src/mowerAccessory';
import { Localization } from '../src/primitives/localization';
import { PlatformAccessoryFactory } from '../src/primitives/platformAccessoryFactory';
import { PlatformContainer } from '../src/primitives/platformContainer';
import { AccessoryInformation, AccessoryInformationImpl } from '../src/services/accessoryInformation';
import { ArrivingContactSensorImpl, ArrivingSensor } from '../src/services/arrivingSensor';
import { BatteryInformation, BatteryInformationImpl } from '../src/services/batteryInformation';
import { NameMode } from '../src/services/homebridge/abstractSwitch';
import { AutomowerMowerControlService } from '../src/services/husqvarna/automower/automowerMowerControlService';
import { GardenaManualMowerControlService } from '../src/services/husqvarna/gardena/gardenaMowerControlService';
import { LeavingContactSensorImpl, LeavingSensor } from '../src/services/leavingSensor';
import { AutomowerMainSwitchImpl, MainSwitch, MainSwitchImpl, SupportsCuttingHeightCharacteristic, SupportsMowerScheduleInformation } from '../src/services/mainSwitch';
import { MotionSensor, MotionSensorImpl } from '../src/services/motionSensor';
import { PauseSwitch, PauseSwitchImpl } from '../src/services/pauseSwitch';
import { DeterministicMowerFaultedPolicy } from '../src/services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from '../src/services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from '../src/services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsActivePolicy } from '../src/services/policies/mowerIsEnabledPolicy';
import { DeterministicMowerIsLeavingPolicy } from '../src/services/policies/mowerIsLeavingPolicy';
import { DeterministicMowerIsPausedPolicy } from '../src/services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from '../src/services/policies/mowerTamperedPolicy';
import { MowerAccessoryFactorySpy } from './mowerAccessoryFactorySpy';

describe('AutomowerAccessoryFactoryImpl', () => {
    let factory: Mock<PlatformAccessoryFactory>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let container: Mock<PlatformContainer>;
    let locale: Mock<Localization>;
    let config: AutomowerPlatformConfig;

    let target: MowerAccessoryFactorySpy;

    beforeEach(() => {
        factory = new Mock<PlatformAccessoryFactory>();

        hap = new Mock<HAP>();        
        hap.setup(o => o.Service).returns(Service);
        hap.setup(o => o.Characteristic).returns(Characteristic);
        
        api = new Mock<API>();
        api.setup(o => o.hap).returns(hap.object());

        log = new Mock<PlatformLogger>();
        container = new Mock<PlatformContainer>();
        locale = new Mock<Localization>();

        config = new AutomowerPlatformConfig({
            platform: 'Homebridge Automower Platform'
        });

        target = new MowerAccessoryFactorySpy(
            factory.object(), 
            api.object(), 
            log.object(), 
            container.object(), 
            locale.object(),
            config);
    });

    it('should create the automower accessory from mower data', () => {
        config.device_type = undefined;

        const mowerName = 'Test';
        const mowerId = '1234';

        const mower: Mower = {
            id: mowerId,
            attributes: {
                battery: {
                    level: 100
                },
                connection: {
                    connected: false                    
                },
                location: undefined,
                metadata: {
                    manufacturer: 'HUSQVARNA',
                    model: 'AUTOMOWER® 430XH',
                    name: mowerName,
                    serialNumber: '123456'
                },
                mower: {
                    activity: Activity.MOWING,
                    state: State.IN_OPERATION
                },
                schedule: undefined,
                settings: undefined
            }
        };        

        const uuid = 'my-uuid';
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        factory.setup(o => o.generateUuid(mowerId)).returns(uuid);
        factory.setup(o => o.create(mowerName, uuid)).returns(platformAccessory.object());

        const expected = new Mock<MowerAccessory>();
        expected.setup(o => o.init()).returns(undefined);
        expected.setup(o => o.getUnderlyingAccessory()).returns(platformAccessory.object());
        target.setAccessory(expected.object());

        const actual = target.createAccessory(mower);

        const underlyingAccessory = actual.getUnderlyingAccessory();
        expect(underlyingAccessory.context.mowerId).toBe(mowerId);
        expect(underlyingAccessory.context.manufacturer).toBe('HUSQVARNA');
        expect(underlyingAccessory.context.model).toBe('AUTOMOWER® 430XH');
        expect(underlyingAccessory.context.serialNumber).toBe('123456');

        expect(actual).toBe(expected.object());
        expected.verify(o => o.init(), Times.Once());
    });

    it('should create the automower accessory from mower data when device type is gardena', () => {
        config.device_type = DeviceType.GARDENA;
              
        const mowerName = 'Test';
        const mowerId = '1234';

        const mower: Mower = {
            id: mowerId,
            attributes: {
                battery: {
                    level: 100
                },
                connection: {
                    connected: false                    
                },
                location: {
                    id: '12345'
                },
                metadata: {
                    manufacturer: 'HUSQVARNA',
                    model: 'AUTOMOWER® 430XH',
                    name: mowerName,
                    serialNumber: '123456'
                },
                mower: {
                    activity: Activity.MOWING,
                    state: State.IN_OPERATION
                },
                schedule: undefined,
                settings: undefined
            }
        };        

        const uuid = 'my-uuid';
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        factory.setup(o => o.generateUuid(mowerId)).returns(uuid);
        factory.setup(o => o.create(mowerName, uuid)).returns(platformAccessory.object());

        const expected = new Mock<MowerAccessory>();
        expected.setup(o => o.init()).returns(undefined);
        expected.setup(o => o.getUnderlyingAccessory()).returns(platformAccessory.object());
        target.setAccessory(expected.object());

        const actual = target.createAccessory(mower);

        const underlyingAccessory = actual.getUnderlyingAccessory();
        expect(underlyingAccessory.context.mowerId).toBe(mowerId);
        expect(underlyingAccessory.context.manufacturer).toBe('HUSQVARNA');
        expect(underlyingAccessory.context.model).toBe('AUTOMOWER® 430XH');
        expect(underlyingAccessory.context.serialNumber).toBe('123456');

        expect(actual).toBe(expected.object());
        expected.verify(o => o.init(), Times.Once());
    });

    it('should initialize the accessory instance', () => {
        const expected = new Mock<MowerAccessory>();
        expected.setup(o => o.init()).returns(undefined);

        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        target.setAccessory(expected.object());

        const actual = target.createAccessoryFromCache(platformAccessory.object());

        expect(actual).toBe(expected.object());            
        expected.verify(o => o.init(), Times.Once());
    });

    it('should create the automower device accessory by default', () => {
        const mainSwitch = new Mock<MainSwitch & SupportsCuttingHeightCharacteristic & SupportsMowerScheduleInformation>();
        mainSwitch.setup(o => o.init(It.IsAny())).returns(undefined);

        const pauseSwitch = new Mock<PauseSwitch>();
        pauseSwitch.setup(o => o.init(It.IsAny())).returns(undefined);

        const arrivingSensor = new Mock<ArrivingSensor>();
        arrivingSensor.setup(o => o.init()).returns(undefined);

        const leavingSensor = new Mock<LeavingSensor>();
        leavingSensor.setup(o => o.init()).returns(undefined);

        const motionSensor = new Mock<MotionSensor>();
        motionSensor.setup(o => o.init()).returns(undefined);

        const batteryInformation = new Mock<BatteryInformation>();
        batteryInformation.setup(o => o.init()).returns(undefined);

        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);

        target.setAutomowerMainSwitch(mainSwitch.object());
        target.setPauseSwitch(pauseSwitch.object());
        target.setArrivingSensor(arrivingSensor.object());
        target.setLeavingSensor(leavingSensor.object());
        target.setMotionSensor(motionSensor.object());
        target.setBatteryInformation(batteryInformation.object());
        target.setAccessoryInformation(accessoryInformation.object());

        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const actual = target.createAccessoryFromCache(platformAccessory.object());

        expect(actual).toBeDefined();
        mainSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
        pauseSwitch.verify(o => o.init(NameMode.DEFAULT), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        leavingSensor.verify(o => o.init(), Times.Once());
        motionSensor.verify(o => o.init(), Times.Once());
        batteryInformation.verify(o => o.init(), Times.Once());
        accessoryInformation.verify(o => o.init(), Times.Once());
    });

    it('should create the automower device accessory when specified', () => {
        config.device_type = DeviceType.AUTOMOWER;

        const mainSwitch = new Mock<MainSwitch & SupportsCuttingHeightCharacteristic & SupportsMowerScheduleInformation>();
        mainSwitch.setup(o => o.init(It.IsAny())).returns(undefined);

        const pauseSwitch = new Mock<PauseSwitch>();
        pauseSwitch.setup(o => o.init(It.IsAny())).returns(undefined);

        const arrivingSensor = new Mock<ArrivingSensor>();
        arrivingSensor.setup(o => o.init()).returns(undefined);

        const leavingSensor = new Mock<LeavingSensor>();
        leavingSensor.setup(o => o.init()).returns(undefined);

        const motionSensor = new Mock<MotionSensor>();
        motionSensor.setup(o => o.init()).returns(undefined);

        const batteryInformation = new Mock<BatteryInformation>();
        batteryInformation.setup(o => o.init()).returns(undefined);

        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);

        target.setAutomowerMainSwitch(mainSwitch.object());
        target.setPauseSwitch(pauseSwitch.object());
        target.setArrivingSensor(arrivingSensor.object());
        target.setLeavingSensor(leavingSensor.object());
        target.setMotionSensor(motionSensor.object());
        target.setBatteryInformation(batteryInformation.object());
        target.setAccessoryInformation(accessoryInformation.object());

        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const actual = target.createAccessoryFromCache(platformAccessory.object());

        expect(actual).toBeDefined();
        mainSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
        pauseSwitch.verify(o => o.init(NameMode.DEFAULT), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        leavingSensor.verify(o => o.init(), Times.Once());
        motionSensor.verify(o => o.init(), Times.Once());
        batteryInformation.verify(o => o.init(), Times.Once());
        accessoryInformation.verify(o => o.init(), Times.Once());
    });
    
    it('should create the gardena device accessory when specified', () => {
        config.device_type = DeviceType.GARDENA;

        const mainSwitch = new Mock<MainSwitch>();
        mainSwitch.setup(o => o.init(It.IsAny())).returns(undefined);

        const arrivingSensor = new Mock<ArrivingSensor>();
        arrivingSensor.setup(o => o.init()).returns(undefined);

        const leavingSensor = new Mock<LeavingSensor>();
        leavingSensor.setup(o => o.init()).returns(undefined);

        const motionSensor = new Mock<MotionSensor>();
        motionSensor.setup(o => o.init()).returns(undefined);

        const batteryInformation = new Mock<BatteryInformation>();
        batteryInformation.setup(o => o.init()).returns(undefined);

        const accessoryInformation = new Mock<AccessoryInformation>();
        accessoryInformation.setup(o => o.init()).returns(undefined);

        target.setMainSwitch(mainSwitch.object());
        target.setArrivingSensor(arrivingSensor.object());
        target.setLeavingSensor(leavingSensor.object());
        target.setMotionSensor(motionSensor.object());
        target.setBatteryInformation(batteryInformation.object());
        target.setAccessoryInformation(accessoryInformation.object());

        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const actual = target.createAccessoryFromCache(platformAccessory.object());

        expect(actual).toBeDefined();
        mainSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        leavingSensor.verify(o => o.init(), Times.Once());
        motionSensor.verify(o => o.init(), Times.Once());
        batteryInformation.verify(o => o.init(), Times.Once());
        accessoryInformation.verify(o => o.init(), Times.Once());
    });

    it('should create a schedule switch for a gardena mower', () => {
        config.device_type = DeviceType.GARDENA;

        const service = new Mock<GardenaManualMowerControlService>();
        const policy = new Mock<DeterministicMowerIsActivePolicy>();
        container.setup(o => o.resolve(GardenaManualMowerControlService)).returns(service.object());
        container.setup(o => o.resolve(DeterministicMowerIsActivePolicy)).returns(policy.object());

        locale.setup(o => o.format('SCHEDULE')).returns('Schedule');        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateMainSwitch(platformAccessory.object()) as MainSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(MainSwitchImpl);
    });

    it('should create an schedule switch for automower', () => {
        config.device_type = DeviceType.AUTOMOWER;

        const service = new Mock<AutomowerMowerControlService>();
        const policy = new Mock<DeterministicMowerIsActivePolicy>();
        container.setup(o => o.resolve(AutomowerMowerControlService)).returns(service.object());
        container.setup(o => o.resolve(DeterministicMowerIsActivePolicy)).returns(policy.object());

        locale.setup(o => o.format('SCHEDULE')).returns('Schedule');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateAutomowerMainSwitch(platformAccessory.object()) as AutomowerMainSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(AutomowerMainSwitchImpl);
    });

    it('should create a pause switch for automower by default', () => {
        config.device_type = undefined;

        const service = new Mock<AutomowerMowerControlService>();
        const policy = new Mock<DeterministicMowerIsPausedPolicy>();
        container.setup(o => o.resolve(AutomowerMowerControlService)).returns(service.object());
        container.setup(o => o.resolve(DeterministicMowerIsPausedPolicy)).returns(policy.object());

        locale.setup(o => o.format('PAUSE')).returns('Pause');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreatePauseSwitch(platformAccessory.object()) as PauseSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(PauseSwitchImpl);
    });

    it('should create a pause switch for automower', () => {
        config.device_type = DeviceType.AUTOMOWER;
        
        const service = new Mock<AutomowerMowerControlService>();
        const policy = new Mock<DeterministicMowerIsPausedPolicy>();
        container.setup(o => o.resolve(AutomowerMowerControlService)).returns(service.object());
        container.setup(o => o.resolve(DeterministicMowerIsPausedPolicy)).returns(policy.object());

        locale.setup(o => o.format('PAUSE')).returns('Pause');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreatePauseSwitch(platformAccessory.object()) as PauseSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(PauseSwitchImpl);
    });

    it('should create a pause switch for gardena', () => {
        config.device_type = DeviceType.GARDENA;
        
        const service = new Mock<GardenaManualMowerControlService>();
        const policy = new Mock<DeterministicMowerIsPausedPolicy>();
        container.setup(o => o.resolve(GardenaManualMowerControlService)).returns(service.object());
        container.setup(o => o.resolve(DeterministicMowerIsPausedPolicy)).returns(policy.object());

        locale.setup(o => o.format('PAUSE')).returns('Pause');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreatePauseSwitch(platformAccessory.object()) as PauseSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(PauseSwitchImpl);
    });

    it('should create an arriving sensor', () => {
        const policy = new Mock<DeterministicMowerIsArrivingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsArrivingPolicy)).returns(policy.object());

        locale.setup(o => o.format('ARRIVING_SENSOR')).returns('Arriving');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateArrivingSensor(platformAccessory.object()) as ArrivingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(ArrivingContactSensorImpl);
    });

    it('should create a disabled arriving sensor when sensor mode is motion only', () => {
        config.sensor_mode = SensorMode.MOTION_ONLY;

        const policy = new Mock<DeterministicMowerIsArrivingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsArrivingPolicy)).returns(policy.object());

        locale.setup(o => o.format('ARRIVING_SENSOR')).returns('Arriving');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateArrivingSensor(platformAccessory.object()) as ArrivingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result.isDisabled()).toBeTruthy();
        expect(result).toBeInstanceOf(ArrivingContactSensorImpl);
    });

    it('should create a disabled arriving sensor when sensor mode is none', () => {
        config.sensor_mode = SensorMode.NONE;

        const policy = new Mock<DeterministicMowerIsArrivingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsArrivingPolicy)).returns(policy.object());

        locale.setup(o => o.format('ARRIVING_SENSOR')).returns('Arriving');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateArrivingSensor(platformAccessory.object()) as ArrivingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result.isDisabled()).toBeTruthy();
        expect(result).toBeInstanceOf(ArrivingContactSensorImpl);
    });

    it('should create an leaving sensor', () => {
        const policy = new Mock<DeterministicMowerIsLeavingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(policy.object());

        locale.setup(o => o.format('LEAVING_SENSOR')).returns('Leaving');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateLeavingSensor(platformAccessory.object()) as LeavingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(LeavingContactSensorImpl);
    });

    it('should create a disabled leaving sensor when sensor mode is motion only', () => {
        config.sensor_mode = SensorMode.MOTION_ONLY;

        const policy = new Mock<DeterministicMowerIsLeavingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(policy.object());

        locale.setup(o => o.format('LEAVING_SENSOR')).returns('Leaving');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateLeavingSensor(platformAccessory.object()) as LeavingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result.isDisabled()).toBeTruthy();
        expect(result).toBeInstanceOf(LeavingContactSensorImpl);
    });

    it('should create a disabled leaving sensor when sensor mode is none', () => {
        config.sensor_mode = SensorMode.NONE;

        const policy = new Mock<DeterministicMowerIsLeavingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(policy.object());

        locale.setup(o => o.format('LEAVING_SENSOR')).returns('Leaving');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateLeavingSensor(platformAccessory.object()) as LeavingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result.isDisabled()).toBeTruthy();
        expect(result).toBeInstanceOf(LeavingContactSensorImpl);
    });

    it('should create a motion sensor', () => {
        const motionPolicy = new Mock<DeterministicMowerInMotionPolicy>();
        const faultedPolicy = new Mock<DeterministicMowerFaultedPolicy>();
        const tamperedPolicy = new Mock<DeterministicMowerTamperedPolicy>();

        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(motionPolicy.object());
        container.setup(o => o.resolve(DeterministicMowerFaultedPolicy)).returns(faultedPolicy.object());
        container.setup(o => o.resolve(DeterministicMowerTamperedPolicy)).returns(tamperedPolicy.object());

        locale.setup(o => o.format('MOTION_SENSOR')).returns('Motion');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateMotionSensor(platformAccessory.object()) as MotionSensorImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(MotionSensorImpl);
    });

    it('should create a disabled motion sensor when sensor mode is contact only', () => {
        config.sensor_mode = SensorMode.CONTACT_ONLY;

        const motionPolicy = new Mock<DeterministicMowerInMotionPolicy>();
        const faultedPolicy = new Mock<DeterministicMowerFaultedPolicy>();
        const tamperedPolicy = new Mock<DeterministicMowerTamperedPolicy>();

        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(motionPolicy.object());
        container.setup(o => o.resolve(DeterministicMowerFaultedPolicy)).returns(faultedPolicy.object());
        container.setup(o => o.resolve(DeterministicMowerTamperedPolicy)).returns(tamperedPolicy.object());

        locale.setup(o => o.format('MOTION_SENSOR')).returns('Motion');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateMotionSensor(platformAccessory.object()) as MotionSensorImpl;

        expect(result).toBeDefined();
        expect(result.isDisabled()).toBeTruthy();
        expect(result).toBeInstanceOf(MotionSensorImpl);
    });

    it('should create a disabled motion sensor when sensor mode is none', () => {
        config.sensor_mode = SensorMode.NONE;

        const motionPolicy = new Mock<DeterministicMowerInMotionPolicy>();
        const faultedPolicy = new Mock<DeterministicMowerFaultedPolicy>();
        const tamperedPolicy = new Mock<DeterministicMowerTamperedPolicy>();

        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(motionPolicy.object());
        container.setup(o => o.resolve(DeterministicMowerFaultedPolicy)).returns(faultedPolicy.object());
        container.setup(o => o.resolve(DeterministicMowerTamperedPolicy)).returns(tamperedPolicy.object());

        locale.setup(o => o.format('MOTION_SENSOR')).returns('Motion');
        
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateMotionSensor(platformAccessory.object()) as MotionSensorImpl;

        expect(result).toBeDefined();
        expect(result.isDisabled()).toBeTruthy();
        expect(result).toBeInstanceOf(MotionSensorImpl);
    });

    it('should create battery information', () => {
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateBatteryInformation(platformAccessory.object()) as BatteryInformationImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(BatteryInformationImpl);
    });

    it('should create accessory information', () => {
        const platformAccessory = new Mock<PlatformAccessory<MowerContext>>();

        const result = target.unsafeCreateAccessoryInformation(platformAccessory.object()) as AccessoryInformationImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(AccessoryInformationImpl);
    });
});