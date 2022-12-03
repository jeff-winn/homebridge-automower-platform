import { Characteristic, Service } from 'hap-nodejs';
import { API, HAP, PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';
import { AutomowerAccessory, AutomowerContext } from '../src/automowerAccessory';
import { PlatformLogger } from '../src/diagnostics/platformLogger';
import { Activity, HeadlightMode, Mode, Mower, OverrideAction, RestrictedReason, State } from '../src/model';
import { Localization } from '../src/primitives/localization';
import { PlatformAccessoryFactory } from '../src/primitives/platformAccessoryFactory';
import { PlatformContainer } from '../src/primitives/platformContainer';
import { AccessoryInformation, AccessoryInformationImpl } from '../src/services/accessoryInformation';
import { ArrivingContactSensorImpl, ArrivingSensor } from '../src/services/arrivingSensor';
import { BatteryInformation, BatteryInformationImpl } from '../src/services/batteryInformation';
import { NameMode } from '../src/services/homebridge/abstractSwitch';
import { MowerControlServiceImpl } from '../src/services/husqvarna/automower/mowerControlService';
import { LeavingContactSensorImpl, LeavingSensor } from '../src/services/leavingSensor';
import { MotionSensor, MotionSensorImpl } from '../src/services/motionSensor';
import { PauseSwitch, PauseSwitchImpl } from '../src/services/pauseSwitch';
import { DeterministicMowerFaultedPolicy } from '../src/services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from '../src/services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from '../src/services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsLeavingPolicy } from '../src/services/policies/mowerIsLeavingPolicy';
import { DeterministicMowerIsPausedPolicy } from '../src/services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from '../src/services/policies/mowerTamperedPolicy';
import { DeterministicScheduleEnabledPolicy } from '../src/services/policies/scheduleEnabledPolicy';
import { ScheduleSwitch, ScheduleSwitchImpl } from '../src/services/scheduleSwitch';
import { AutomowerAccessoryFactorySpy } from './automowerAccessoryFactorySpy';

describe('AutomowerAccessoryFactoryImpl', () => {
    let factory: Mock<PlatformAccessoryFactory>;
    let api: Mock<API>;
    let hap: Mock<HAP>;
    let log: Mock<PlatformLogger>;
    let container: Mock<PlatformContainer>;
    let locale: Mock<Localization>;

    let target: AutomowerAccessoryFactorySpy;

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

        target = new AutomowerAccessoryFactorySpy(
            factory.object(), 
            api.object(), 
            log.object(), 
            container.object(), 
            locale.object());
    });

    it('should create the accessory from mower data', () => {        
        const mowerName = 'Test';
        const mowerId = '1234';

        const mower: Mower = {
            type: 'mower',
            id: mowerId,
            attributes: {
                system: {
                    name: mowerName,
                    model: 'HUSQVARNA AUTOMOWER® 430XH',
                    serialNumber: 123456
                },
                battery: {
                    batteryPercent: 100
                },
                mower: {
                    mode: Mode.MAIN_AREA,
                    activity: Activity.NOT_APPLICABLE,
                    state: State.STOPPED,
                    errorCode: 0,
                    errorCodeTimestamp: 0
                },
                calendar: {
                    tasks: []
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NOT_ACTIVE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
                },
                metadata: {
                    connected: false,
                    statusTimestamp: 1670007077108
                },
                positions: [],
                settings: {
                    cuttingHeight: 8,
                    headlight: {
                        mode: HeadlightMode.EVENING_AND_NIGHT
                    }
                },
                statistics: {
                    numberOfChargingCycles: 275,
                    numberOfCollisions: 9370,
                    totalChargingTime: 928800,
                    totalCuttingTime: 2779200,
                    totalRunningTime: 3027600,
                    totalSearchingTime: 248400
                }
            }
        };

        const uuid = 'my-uuid';
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        factory.setup(o => o.generateUuid(mowerId)).returns(uuid);
        factory.setup(o => o.create(mowerName, uuid)).returns(platformAccessory.object());

        const expected = new Mock<AutomowerAccessory>();
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
        const expected = new Mock<AutomowerAccessory>();
        expected.setup(o => o.init()).returns(undefined);

        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        target.setAccessory(expected.object());

        const actual = target.createAutomowerAccessory(platformAccessory.object());

        expect(actual).toBe(expected.object());            
        expected.verify(o => o.init(), Times.Once());
    });

    it('should create the mower accessory', () => {
        const scheduleSwitch = new Mock<ScheduleSwitch>();
        scheduleSwitch.setup(o => o.init(It.IsAny())).returns(undefined);

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

        target.setScheduleSwitch(scheduleSwitch.object());
        target.setPauseSwitch(pauseSwitch.object());
        target.setArrivingSensor(arrivingSensor.object());
        target.setLeavingSensor(leavingSensor.object());
        target.setMotionSensor(motionSensor.object());
        target.setBatteryInformation(batteryInformation.object());
        target.setAccessoryInformation(accessoryInformation.object());

        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const actual = target.createAutomowerAccessory(platformAccessory.object());

        expect(actual).toBeDefined();
        scheduleSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
        pauseSwitch.verify(o => o.init(NameMode.DEFAULT), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        leavingSensor.verify(o => o.init(), Times.Once());
        motionSensor.verify(o => o.init(), Times.Once());
        batteryInformation.verify(o => o.init(), Times.Once());
        accessoryInformation.verify(o => o.init(), Times.Once());
    });
    
    it('should create the schedule switch', () => {
        const service = new Mock<MowerControlServiceImpl>();
        const policy = new Mock<DeterministicScheduleEnabledPolicy>();
        container.setup(o => o.resolve(MowerControlServiceImpl)).returns(service.object());
        container.setup(o => o.resolve(DeterministicScheduleEnabledPolicy)).returns(policy.object());

        locale.setup(o => o.format('SCHEDULE')).returns('Schedule');
        
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreateScheduleSwitch(platformAccessory.object()) as ScheduleSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(ScheduleSwitchImpl);
    });
    
    it('should create a pause switch', () => {
        const service = new Mock<MowerControlServiceImpl>();
        const policy = new Mock<DeterministicMowerIsPausedPolicy>();
        container.setup(o => o.resolve(MowerControlServiceImpl)).returns(service.object());
        container.setup(o => o.resolve(DeterministicMowerIsPausedPolicy)).returns(policy.object());

        locale.setup(o => o.format('PAUSE')).returns('Pause');
        
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreatePauseSwitch(platformAccessory.object()) as PauseSwitchImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(PauseSwitchImpl);
    });

    it('should create an arriving sensor', () => {
        const policy = new Mock<DeterministicMowerIsArrivingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsArrivingPolicy)).returns(policy.object());

        locale.setup(o => o.format('ARRIVING_SENSOR')).returns('Arriving');
        
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreateArrivingSensor(platformAccessory.object()) as ArrivingContactSensorImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(ArrivingContactSensorImpl);
    });

    it('should create an leaving sensor', () => {
        const policy = new Mock<DeterministicMowerIsLeavingPolicy>();
        container.setup(o => o.resolve(DeterministicMowerIsLeavingPolicy)).returns(policy.object());

        locale.setup(o => o.format('LEAVING_SENSOR')).returns('Leaving');
        
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreateLeavingSensor(platformAccessory.object()) as LeavingContactSensorImpl;

        expect(result).toBeDefined();
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
        
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreateMotionSensor(platformAccessory.object()) as MotionSensorImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(MotionSensorImpl);
    });

    it('should create battery information', () => {
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreateBatteryInformation(platformAccessory.object()) as BatteryInformationImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(BatteryInformationImpl);
    });

    it('should create accessory information', () => {
        const platformAccessory = new Mock<PlatformAccessory<AutomowerContext>>();

        const result = target.unsafeCreateAccessoryInformation(platformAccessory.object()) as AccessoryInformationImpl;

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(AccessoryInformationImpl);
    });
});