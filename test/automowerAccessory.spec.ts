import { PlatformAccessory } from 'homebridge';
import { It, Mock, Times } from 'moq.ts';

import { AutomowerAccessory, AutomowerContext } from '../src/automowerAccessory';
import { AutomowerEventTypes, StatusEvent } from '../src/events';
import { Activity, Battery, Calendar, Mode, Mower, MowerState, OverrideAction, Planner, RestrictedReason, State } from '../src/model';
import { NameMode } from '../src/services/abstractSwitch';
import { AccessoryInformation } from '../src/services/accessoryInformation';
import { ArrivingSensor } from '../src/services/arrivingSensor';
import { BatteryService } from '../src/services/batteryService';
import { MotionSensor } from '../src/services/motionSensor';
import { PauseSwitch } from '../src/services/pauseSwitch';
import { ScheduleSwitch } from '../src/services/scheduleSwitch';

describe('AutomowerAccessory', () => {
    let accessory: Mock<PlatformAccessory<AutomowerContext>>;
    let batteryService: Mock<BatteryService>;
    let informationService: Mock<AccessoryInformation>;
    let motionSensorService: Mock<MotionSensor>;
    let arrivingSensor: Mock<ArrivingSensor>;
    let pauseSwitch: Mock<PauseSwitch>;
    let scheduleSwitch: Mock<ScheduleSwitch>;

    let target: AutomowerAccessory;

    beforeEach(() => {
        accessory = new Mock<PlatformAccessory<AutomowerContext>>();
        batteryService = new Mock<BatteryService>();
        informationService = new Mock<AccessoryInformation>();    
        motionSensorService = new Mock<MotionSensor>();
        pauseSwitch = new Mock<PauseSwitch>();
        arrivingSensor = new Mock<ArrivingSensor>();
        scheduleSwitch = new Mock<ScheduleSwitch>();
    
        target = new AutomowerAccessory(accessory.object(), batteryService.object(), 
            informationService.object(), motionSensorService.object(), arrivingSensor.object(), 
            pauseSwitch.object(), scheduleSwitch.object());
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
        pauseSwitch.setup(o => o.init(NameMode.DEFAULT)).returns(undefined);
        scheduleSwitch.setup(o => o.init(NameMode.DISPLAY_NAME)).returns(undefined);

        target.init();
        
        batteryService.verify(o => o.init(), Times.Once());
        informationService.verify(o => o.init(), Times.Once());
        arrivingSensor.verify(o => o.init(), Times.Once());
        motionSensorService.verify(o => o.init(), Times.Once());
        pauseSwitch.verify(o => o.init(NameMode.DEFAULT), Times.Once());
        scheduleSwitch.verify(o => o.init(NameMode.DISPLAY_NAME), Times.Once());
    });

    it('should refresh the services', () => {
        const battery: Battery = {
            batteryPercent: 100
        };

        const state: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.NOT_APPLICABLE
        };

        const calendar: Calendar = {
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        };

        const planner: Planner = {
            nextStartTimestamp: 0,
            override: {
                action: OverrideAction.NOT_ACTIVE
            },
            restrictedReason: RestrictedReason.NOT_APPLICABLE
        };

        const mower: Mower = {
            id: '12345',
            type: 'abcd1234',
            attributes: {
                battery: battery,
                calendar: calendar,
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: state,
                planner: planner,
                positions: [],
                system: {
                    model: 'model',
                    name: 'name',
                    serialNumber: 1234                    
                }
            }
        };

        batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
        batteryService.setup(o => o.setChargingState(state)).returns(undefined);
        scheduleSwitch.setup(o => o.setPlanner(planner)).returns(undefined);
        scheduleSwitch.setup(o => o.setCalendar(calendar)).returns(undefined);
        scheduleSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        pauseSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        arrivingSensor.setup(o => o.setMowerState(state)).returns(undefined);
        motionSensorService.setup(o => o.setMowerState(state)).returns(undefined);

        target.refresh(mower);

        batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
        batteryService.verify(o => o.setChargingState(state), Times.Once());
        scheduleSwitch.verify(o => o.setPlanner(planner), Times.Once());
        scheduleSwitch.verify(o => o.setCalendar(calendar), Times.Once());
        scheduleSwitch.verify(o => o.setMowerState(state), Times.Once());
        pauseSwitch.verify(o => o.setMowerState(state), Times.Once());
        arrivingSensor.verify(o => o.setMowerState(state), Times.Once());
        motionSensorService.verify(o => o.setMowerState(state), Times.Once());
    });
    
    it('returns the accessory uuid', () => {
        const id = '12345';
        
        accessory.setup(x => x.context.mowerId).returns(id);

        const result = target.getId();
        expect(result).toBe(id);
    });

    it('should not refresh the calendar when settings event is received with no calendar data', () => {
        batteryService.setup(o => o.init()).returns(undefined);
        informationService.setup(o => o.init()).returns(undefined);
        scheduleSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
        scheduleSwitch.setup(o => o.setCalendar(It.IsAny())).returns(undefined);
        pauseSwitch.setup(o => o.init(NameMode.DEFAULT)).returns(undefined);
        arrivingSensor.setup(o => o.init()).returns(undefined);
        motionSensorService.setup(o => o.init()).returns(undefined);

        target.init();
        target.onSettingsEventReceived({
            id: '1234',
            type: AutomowerEventTypes.SETTINGS,
            attributes: {
                calendar: undefined
            }
        });
        
        scheduleSwitch.verify(o => o.setCalendar(It.IsAny()), Times.Never());
    });

    it('should refresh the calendar when settings event is received', () => {
        const calendar: Calendar = {
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true                    
                }
            ]
        };

        batteryService.setup(o => o.init()).returns(undefined);
        informationService.setup(o => o.init()).returns(undefined);
        scheduleSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
        scheduleSwitch.setup(o => o.setCalendar(calendar)).returns(undefined);
        pauseSwitch.setup(o => o.init(It.IsAny())).returns(undefined);
        arrivingSensor.setup(o => o.init()).returns(undefined);
        motionSensorService.setup(o => o.init()).returns(undefined);

        target.init();
        target.onSettingsEventReceived({
            id: '1234',
            type: AutomowerEventTypes.SETTINGS,
            attributes: {
                calendar: calendar
            }
        });
        
        scheduleSwitch.verify(o => o.setCalendar(calendar), Times.Once());
    });

    it('should refresh all services when status event is received', () => {
        const battery: Battery = {
            batteryPercent: 100
        };

        const state: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.NOT_APPLICABLE
        };

        const planner: Planner = {
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.NONE
        };

        const event: StatusEvent = {
            id: '12345',
            type: AutomowerEventTypes.STATUS,
            attributes: {
                battery: battery,
                metadata: {
                    connected: true,
                    statusTimestamp: 1
                },
                mower: state,
                planner: planner
            }
        };

        batteryService.setup(o => o.setBatteryLevel(battery)).returns(undefined);
        batteryService.setup(o => o.setChargingState(state)).returns(undefined);
        scheduleSwitch.setup(o => o.setPlanner(planner)).returns(undefined);
        scheduleSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        pauseSwitch.setup(o => o.setMowerState(state)).returns(undefined);
        arrivingSensor.setup(o => o.setMowerState(state)).returns(undefined);
        motionSensorService.setup(o => o.setMowerState(state)).returns(undefined);

        target.onStatusEventReceived(event);

        batteryService.verify(o => o.setBatteryLevel(battery), Times.Once());
        batteryService.verify(o => o.setChargingState(state), Times.Once());
        scheduleSwitch.verify(o => o.setPlanner(planner), Times.Once());
        scheduleSwitch.verify(o => o.setMowerState(state), Times.Once());
        pauseSwitch.verify(o => o.setMowerState(state), Times.Once());
        arrivingSensor.verify(o => o.setMowerState(state), Times.Once());
        motionSensorService.verify(o => o.setMowerState(state), Times.Once());
    });
});