import { PlatformAccessory } from 'homebridge';
import { Mock, Times } from 'moq.ts';

import { AutomowerAccessory, MowerContext } from '../src/automowerAccessory';
import { AccessoryInformation } from '../src/services/accessoryInformation';
import { ArrivingSensor } from '../src/services/arrivingSensor';
import { BatteryInformation } from '../src/services/batteryInformation';
import { NameMode } from '../src/services/homebridge/abstractSwitch';
import { LeavingSensor } from '../src/services/leavingSensor';
import { MotionSensor } from '../src/services/motionSensor';
import { PauseSwitch } from '../src/services/pauseSwitch';
import { ScheduleSwitch } from '../src/services/scheduleSwitch';

describe('AutomowerAccessory', () => {
    let accessory: Mock<PlatformAccessory<MowerContext>>;
    let batteryService: Mock<BatteryInformation>;
    let informationService: Mock<AccessoryInformation>;
    let motionSensorService: Mock<MotionSensor>;
    let arrivingSensor: Mock<ArrivingSensor>;
    let leavingSensor: Mock<LeavingSensor>;
    let pauseSwitch: Mock<PauseSwitch>;
    let scheduleSwitch: Mock<ScheduleSwitch>;

    let target: AutomowerAccessory;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<MowerContext>>();
        batteryService = new Mock<BatteryInformation>();
        informationService = new Mock<AccessoryInformation>();    
        motionSensorService = new Mock<MotionSensor>();
        pauseSwitch = new Mock<PauseSwitch>();
        arrivingSensor = new Mock<ArrivingSensor>();
        leavingSensor = new Mock<LeavingSensor>();
        scheduleSwitch = new Mock<ScheduleSwitch>();
    
        target = new AutomowerAccessory(accessory.object(), batteryService.object(), 
            informationService.object(), motionSensorService.object(), arrivingSensor.object(),
            leavingSensor.object(), pauseSwitch.object(), scheduleSwitch.object());
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
        scheduleSwitch.setup(o => o.init(NameMode.DISPLAY_NAME)).returns(undefined);

        target.init();
        
        batteryService.verify(o => o.init(), Times.Once());
        informationService.verify(o => o.init(), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        leavingSensor.verify(o => o.init(), Times.Once());
        motionSensorService.verify(o => o.init(), Times.Once());
        pauseSwitch.verify(o => o.init(NameMode.DEFAULT), Times.Once());
        scheduleSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
    });

    // TODO: Clean this up.
    // it('should refresh the services', () => {
    //     const battery: Battery = {
    //         batteryPercent: 100
    //     };

    //     const state: MowerState = {
    //         activity: Activity.MOWING,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.MAIN_AREA,
    //         state: State.NOT_APPLICABLE
    //     };

    //     const calendar: Calendar = {
    //         tasks: [
    //             {
    //                 start: 1,
    //                 duration: 1,
    //                 sunday: false,
    //                 monday: false,
    //                 tuesday: false,
    //                 wednesday: false,
    //                 thursday: false,
    //                 friday: false,
    //                 saturday: false
    //             }
    //         ]
    //     };

    //     const planner: Planner = {
    //         nextStartTimestamp: 0,
    //         override: {
    //             action: OverrideAction.NOT_ACTIVE
    //         },
    //         restrictedReason: RestrictedReason.NOT_APPLICABLE
    //     };

    //     const statistics: Statistics = {
    //         numberOfChargingCycles: 0,
    //         numberOfCollisions: 0,
    //         totalChargingTime: 0,
    //         totalCuttingTime: 0,
    //         totalRunningTime: 0,
    //         totalSearchingTime: 0
    //     };

    //     const metadata: MowerMetadata = {
    //         connected: true,
    //         statusTimestamp: 1
    //     };

    //     const mower: Mower = {
    //         id: '12345',
    //         type: 'abcd1234',
    //         attributes: {
    //             battery: battery,
    //             calendar: calendar,
    //             metadata: metadata,
    //             mower: state,
    //             planner: planner,
    //             positions: [],
    //             settings: {
    //                 cuttingHeight: 1,
    //                 headlight: {
    //                     mode: HeadlightMode.ALWAYS_ON
    //                 }
    //             },
    //             statistics: statistics,
    //             system: {
    //                 model: 'model',
    //                 name: 'name',
    //                 serialNumber: 1234                    
    //             }
    //         }
    //     };

    //     batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
    //     batteryService.setup(o => o.setChargingState(state)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setPlanner(planner)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setCalendar(calendar)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setMowerState(state)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     scheduleSwitch.setup(o => o.setCuttingHeight(1)).returns(undefined);
    //     pauseSwitch.setup(o => o.setMowerState(state)).returns(undefined);
    //     pauseSwitch.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     arrivingSensor.setup(o => o.setMowerState(state)).returns(undefined);
    //     arrivingSensor.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     leavingSensor.setup(o => o.setMowerState(state)).returns(undefined);
    //     leavingSensor.setup(o => o.setMowerMetadata(metadata)).returns(undefined);
    //     motionSensorService.setup(o => o.setMowerState(state)).returns(undefined);
    //     motionSensorService.setup(o => o.setMowerMetadata(metadata)).returns(undefined);        
        
    //     target.refresh(mower);

    //     batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
    //     batteryService.verify(o => o.setChargingState(state), Times.Once());
    //     scheduleSwitch.verify(o => o.setPlanner(planner), Times.Once());
    //     scheduleSwitch.verify(o => o.setCalendar(calendar), Times.Once());
    //     scheduleSwitch.verify(o => o.setMowerState(state), Times.Once());
    //     scheduleSwitch.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     scheduleSwitch.verify(o => o.setCuttingHeight(1), Times.Once());
    //     pauseSwitch.verify(o => o.setMowerState(state), Times.Once());
    //     pauseSwitch.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     arrivingSensor.verify(o => o.setMowerState(state), Times.Once());
    //     arrivingSensor.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     leavingSensor.verify(o => o.setMowerState(state), Times.Once());
    //     leavingSensor.verify(o => o.setMowerMetadata(metadata), Times.Once());
    //     motionSensorService.verify(o => o.setMowerState(state), Times.Once());
    //     motionSensorService.verify(o => o.setMowerMetadata(metadata), Times.Once());
    // });
    
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