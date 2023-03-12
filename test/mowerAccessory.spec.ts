import { PlatformAccessory } from 'homebridge';
import { Mock, Times } from 'moq.ts';

import { Activity, Battery, Mower, MowerConnection, MowerState, State } from '../src/model';
import { AutomowerAccessory, MowerAccessory, MowerContext } from '../src/mowerAccessory';
import { AccessoryInformation } from '../src/services/accessoryInformation';
import { ArrivingSensor } from '../src/services/arrivingSensor';
import { BatteryInformation } from '../src/services/batteryInformation';
import { NameMode } from '../src/services/homebridge/abstractSwitch';
import { LeavingSensor } from '../src/services/leavingSensor';
import { AutomowerMainSwitch, MainSwitch } from '../src/services/mainSwitch';
import { MotionSensor } from '../src/services/motionSensor';
import { PauseSwitch } from '../src/services/pauseSwitch';

describe('MowerAccessory', () => {
    let accessory: Mock<PlatformAccessory<MowerContext>>;
    let batteryService: Mock<BatteryInformation>;
    let informationService: Mock<AccessoryInformation>;
    let motionSensorService: Mock<MotionSensor>;
    let arrivingSensor: Mock<ArrivingSensor>;
    let leavingSensor: Mock<LeavingSensor>;
    let pauseSwitch: Mock<PauseSwitch>;
    let mainSwitch: Mock<MainSwitch>;

    let target: MowerAccessory;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<MowerContext>>();
        batteryService = new Mock<BatteryInformation>();
        informationService = new Mock<AccessoryInformation>();    
        motionSensorService = new Mock<MotionSensor>();
        pauseSwitch = new Mock<PauseSwitch>();
        arrivingSensor = new Mock<ArrivingSensor>();
        leavingSensor = new Mock<LeavingSensor>();
        mainSwitch = new Mock<MainSwitch>();
    
        target = new MowerAccessory(accessory.object(), batteryService.object(), 
            informationService.object(), motionSensorService.object(), arrivingSensor.object(),
            leavingSensor.object(), pauseSwitch.object(), mainSwitch.object());
    });

    it('should return the underlying platform accessory', () => {
        const actual = target.getUnderlyingAccessory();

        expect(actual).toBe(accessory.object());
    });

    it('should initialize all services', () => {
        batteryService.setup(o => o.init()).returns(undefined);
        informationService.setup(o => o.init()).returns(undefined);
        motionSensorService.setup(o => o.init()).returns(undefined);
        arrivingSensor.setup(o => o.init()).returns(undefined);
        leavingSensor.setup(o => o.init()).returns(undefined);
        pauseSwitch.setup(o => o.init(NameMode.DEFAULT)).returns(undefined);
        mainSwitch.setup(o => o.init(NameMode.DISPLAY_NAME)).returns(undefined);

        target.init();
        
        batteryService.verify(o => o.init(), Times.Once());
        informationService.verify(o => o.init(), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        leavingSensor.verify(o => o.init(), Times.Once());
        motionSensorService.verify(o => o.init(), Times.Once());
        pauseSwitch.verify(o => o.init(NameMode.DEFAULT), Times.Once());
        mainSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
    });

    it('should refresh the services', () => {
        const battery: Battery = {
            level: 100
        };

        const state: MowerState = {
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        };        
        
        const connection: MowerConnection = {
            connected: true
        };

        const mower: Mower = {
            id: '12345',
            attributes: {
                battery: battery,
                connection: connection,
                mower: state,
                location: undefined,
                metadata: {
                    manufacturer: 'Husqvarna',
                    model: 'model',
                    name: 'name',
                    serialNumber: '1234'
                },
                schedule: undefined,
                settings: undefined
            }
        };

        batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
        batteryService.setup(o => o.setChargingState(state)).returns(undefined);
        mainSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        mainSwitch.setup(o => o.setMowerConnection(connection)).returns(undefined);
        pauseSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        pauseSwitch.setup(o => o.setMowerConnection(connection)).returns(undefined);
        arrivingSensor.setup(o => o.setMowerState(state)).returns(undefined);
        arrivingSensor.setup(o => o.setMowerConnection(connection)).returns(undefined);
        leavingSensor.setup(o => o.setMowerState(state)).returns(undefined);
        leavingSensor.setup(o => o.setMowerConnection(connection)).returns(undefined);
        motionSensorService.setup(o => o.setMowerState(state)).returns(undefined);
        motionSensorService.setup(o => o.setMowerConnection(connection)).returns(undefined);        
        
        target.refresh(mower);

        batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
        batteryService.verify(o => o.setChargingState(state), Times.Once());
        mainSwitch.verify(o => o.setMowerState(state), Times.Once());
        mainSwitch.verify(o => o.setMowerConnection(connection), Times.Once());
        pauseSwitch.verify(o => o.setMowerState(state), Times.Once());
        pauseSwitch.verify(o => o.setMowerConnection(connection), Times.Once());
        arrivingSensor.verify(o => o.setMowerState(state), Times.Once());
        arrivingSensor.verify(o => o.setMowerConnection(connection), Times.Once());
        leavingSensor.verify(o => o.setMowerState(state), Times.Once());
        leavingSensor.verify(o => o.setMowerConnection(connection), Times.Once());
        motionSensorService.verify(o => o.setMowerState(state), Times.Once());
        motionSensorService.verify(o => o.setMowerConnection(connection), Times.Once());
    });

    it('returns the accessory uuid', () => {
        const id = '12345';
        
        accessory.setup(x => x.context.mowerId).returns(id);

        const result = target.getId();
        expect(result).toBe(id);
    });

    // TODO: Clean this up.
    // it('should not refresh the calendar when settings event is received with no calendar data', () => {
    //     batteryService.setup(o => o.init()).returns(undefined);
    //     informationService.setup(o => o.init()).returns(undefined);
    //     scheduleSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
    //     scheduleSwitch.setup(o => o.setCalendar(It.IsAny())).returns(undefined);
    //     pauseSwitch.setup(o => o.init(NameMode.DEFAULT)).returns(undefined);
    //     arrivingSensor.setup(o => o.init()).returns(undefined);
    //     leavingSensor.setup(o => o.init()).returns(undefined);
    //     motionSensorService.setup(o => o.init()).returns(undefined);

    //     target.init();
    //     target.onSettingsEventReceived({
    //         id: '1234',
    //         type: AutomowerEventTypes.SETTINGS,
    //         attributes: {
    //             calendar: undefined
    //         }
    //     });
        
    //     scheduleSwitch.verify(o => o.setCalendar(It.IsAny()), Times.Never());
    // });

    // it('should refresh the cutting height when settings event is received', () => {    
    //     batteryService.setup(o => o.init()).returns(undefined);
    //     informationService.setup(o => o.init()).returns(undefined);
    //     scheduleSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
    //     scheduleSwitch.setup(o => o.setCuttingHeight(1)).returns(undefined);
    //     pauseSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
    //     arrivingSensor.setup(o => o.init()).returns(undefined);
    //     leavingSensor.setup(o => o.init()).returns(undefined);
    //     motionSensorService.setup(o => o.init()).returns(undefined);        

    //     target.init();
    //     target.onSettingsEventReceived({
    //         id: '1234',
    //         type: AutomowerEventTypes.SETTINGS,
    //         attributes: {
    //             cuttingHeight: 1
    //         }
    //     });
        
    //     scheduleSwitch.verify(o => o.setCuttingHeight(1), Times.Once());
    // });

    // TODO: Clean this up.
    // it('should refresh the calendar when settings event is received', () => {
    //     const calendar: Calendar = {
    //         tasks: [
    //             {
    //                 start: 1,
    //                 duration: 1,
    //                 sunday: true,
    //                 monday: true,
    //                 tuesday: true,
    //                 wednesday: true,
    //                 thursday: true,
    //                 friday: true,
    //                 saturday: true                    
    //             }
    //         ]            
    //     };

    //     batteryService.setup(o => o.init()).returns(undefined);
    //     informationService.setup(o => o.init()).returns(undefined);
    //     scheduleSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
    //     scheduleSwitch.setup(o => o.setCalendar(calendar)).returns(undefined);
    //     pauseSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
    //     arrivingSensor.setup(o => o.init()).returns(undefined);
    //     leavingSensor.setup(o => o.init()).returns(undefined);
    //     motionSensorService.setup(o => o.init()).returns(undefined);

    //     target.init();
    //     target.onSettingsEventReceived({
    //         id: '1234',
    //         type: AutomowerEventTypes.SETTINGS,
    //         attributes: {
    //             calendar: calendar
    //         }
    //     });
        
    //     scheduleSwitch.verify(o => o.setCalendar(calendar), Times.Once());
    // });

    // TODO: Clean this up.
    // it('should refresh all services when status event is received', () => {
    //     const battery: Battery = {
    //         batteryPercent: 100
    //     };

    //     const state: MowerState = {
    //         activity: Activity.MOWING,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.HOME,
    //         state: State.NOT_APPLICABLE
    //     };

    //     const metadata: MowerMetadata = {
    //         connected: true,
    //         statusTimestamp: 1
    //     };

    //     const planner: Planner = {
    //         nextStartTimestamp: 0,
    //         override: { },
    //         restrictedReason: RestrictedReason.NONE
    //     };

    //     const event: StatusEvent = {
    //         id: '12345',
    //         type: AutomowerEventTypes.STATUS,
    //         attributes: {
    //             battery: battery,
    //             metadata: metadata,
    //             mower: state,
    //             planner: planner,
    //         }
    //     };

    //     batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
    //     batteryService.setup(o => o.setChargingState(state)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setPlanner(planner)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setMowerState(state)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     pauseSwitch.setup(o => o.setMowerState(state)).returns(undefined);
    //     pauseSwitch.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     arrivingSensor.setup(o => o.setMowerState(state)).returns(undefined);
    //     arrivingSensor.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     leavingSensor.setup(o => o.setMowerState(state)).returns(undefined);
    //     leavingSensor.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     motionSensorService.setup(o => o.setMowerState(state)).returns(undefined);
    //     motionSensorService.setup(o => o.setMowerMetadata(metadata)).returns(undefined);

    //     target.onStatusEventReceived(event);

    //     batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
    //     batteryService.verify(o => o.setChargingState(state), Times.Once());
    //     scheduleSwitch.verify(o => o.setPlanner(planner), Times.Once());
    //     scheduleSwitch.verify(o => o.setMowerState(state), Times.Once());
    //     scheduleSwitch.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     pauseSwitch.verify(o => o.setMowerState(state), Times.Once());
    //     pauseSwitch.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     arrivingSensor.verify(o => o.setMowerState(state), Times.Once());
    //     arrivingSensor.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     leavingSensor.verify(o => o.setMowerState(state), Times.Once());
    //     leavingSensor.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     motionSensorService.verify(o => o.setMowerState(state), Times.Once());
    //     motionSensorService.verify(o => o.setMowerMetadata(metadata), Times.Once());
    // });
});

describe('AutomowerAccessory', () => {
    let accessory: Mock<PlatformAccessory<MowerContext>>;
    let batteryService: Mock<BatteryInformation>;
    let informationService: Mock<AccessoryInformation>;
    let motionSensorService: Mock<MotionSensor>;
    let arrivingSensor: Mock<ArrivingSensor>;
    let leavingSensor: Mock<LeavingSensor>;
    let pauseSwitch: Mock<PauseSwitch>;
    let mainSwitch: Mock<AutomowerMainSwitch>;

    let target: AutomowerAccessory;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<MowerContext>>();
        batteryService = new Mock<BatteryInformation>();
        informationService = new Mock<AccessoryInformation>();    
        motionSensorService = new Mock<MotionSensor>();
        pauseSwitch = new Mock<PauseSwitch>();
        arrivingSensor = new Mock<ArrivingSensor>();
        leavingSensor = new Mock<LeavingSensor>();
        mainSwitch = new Mock<AutomowerMainSwitch>();
    
        target = new AutomowerAccessory(accessory.object(), batteryService.object(), 
            informationService.object(), motionSensorService.object(), arrivingSensor.object(),
            leavingSensor.object(), pauseSwitch.object(), mainSwitch.object());
    });

    it('should refresh the services including cutting height', () => {
        const battery: Battery = {
            level: 100
        };

        const state: MowerState = {
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        };        
        
        const connection: MowerConnection = {
            connected: true
        };

        const mower: Mower = {
            id: '12345',
            attributes: {
                battery: battery,
                connection: connection,
                mower: state,
                location: undefined,
                metadata: {
                    manufacturer: 'Husqvarna',
                    model: 'model',
                    name: 'name',
                    serialNumber: '1234'
                },
                schedule: undefined,
                settings: {
                    cuttingHeight: 1
                }
            }
        };

        batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
        batteryService.setup(o => o.setChargingState(state)).returns(undefined);
        mainSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        mainSwitch.setup(o => o.setMowerConnection(connection)).returns(undefined);
        mainSwitch.setup(o => o.setCuttingHeight(1)).returns(undefined);
        pauseSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        pauseSwitch.setup(o => o.setMowerConnection(connection)).returns(undefined);
        arrivingSensor.setup(o => o.setMowerState(state)).returns(undefined);
        arrivingSensor.setup(o => o.setMowerConnection(connection)).returns(undefined);
        leavingSensor.setup(o => o.setMowerState(state)).returns(undefined);
        leavingSensor.setup(o => o.setMowerConnection(connection)).returns(undefined);
        motionSensorService.setup(o => o.setMowerState(state)).returns(undefined);
        motionSensorService.setup(o => o.setMowerConnection(connection)).returns(undefined);        
        
        target.refresh(mower);

        batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
        batteryService.verify(o => o.setChargingState(state), Times.Once());
        mainSwitch.verify(o => o.setMowerState(state), Times.Once());
        mainSwitch.verify(o => o.setMowerConnection(connection), Times.Once());
        mainSwitch.verify(o => o.setCuttingHeight(1), Times.Once());
        pauseSwitch.verify(o => o.setMowerState(state), Times.Once());
        pauseSwitch.verify(o => o.setMowerConnection(connection), Times.Once());
        arrivingSensor.verify(o => o.setMowerState(state), Times.Once());
        arrivingSensor.verify(o => o.setMowerConnection(connection), Times.Once());
        leavingSensor.verify(o => o.setMowerState(state), Times.Once());
        leavingSensor.verify(o => o.setMowerConnection(connection), Times.Once());
        motionSensorService.verify(o => o.setMowerState(state), Times.Once());
        motionSensorService.verify(o => o.setMowerConnection(connection), Times.Once());
    });
});