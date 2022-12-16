import {
    PlatformAccessory, UnknownContext
} from 'homebridge';

import { SettingsEvent, StatusEvent } from './events';
import { Mower } from './model';
import { AccessoryInformation } from './services/accessoryInformation';
import { ArrivingSensor } from './services/arrivingSensor';
import { BatteryInformation } from './services/batteryInformation';
import { NameMode } from './services/homebridge/abstractSwitch';
import { LeavingSensor } from './services/leavingSensor';
import { MotionSensor } from './services/motionSensor';
import { PauseSwitch } from './services/pauseSwitch';
import { ScheduleSwitch } from './services/scheduleSwitch';

/**
 * Provides contextual information for an Automower accessory.
 */
export interface AutomowerContext extends UnknownContext {
    mowerId: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
}

/**
 * Represents an automower accessory.
 */
export class AutomowerAccessory {
    public constructor(
        private accessory: PlatformAccessory<AutomowerContext>,
        private batteryInformation: BatteryInformation,
        private accessoryInformation: AccessoryInformation,
        private motionSensor: MotionSensor,
        private arrivingSensor: ArrivingSensor,
        private leavingSensor: LeavingSensor,
        private pauseSwitch: PauseSwitch,
        private scheduleSwitch: ScheduleSwitch) {
    }

    /**
     * Gets the underlying platform accessory.
     * @returns The {@link PlatformAccessory} instance.
     */
    public getUnderlyingAccessory(): PlatformAccessory<AutomowerContext> {
        return this.accessory;
    }

    /**
     * Initializes the accessory information.
     */
    public init(): void {
        this.accessoryInformation.init();
        this.batteryInformation.init();
        this.motionSensor.init();
        this.arrivingSensor.init();
        this.leavingSensor.init();

        this.pauseSwitch.init(NameMode.DEFAULT);
        this.scheduleSwitch.init(NameMode.DISPLAY_NAME);
    }

    /**
     * Refreshes the mower values.
     * @param data The mower data.
     */
    public refresh(data: Mower): void {
        this.batteryInformation.setBatteryLevel(data.attributes.battery);
        this.batteryInformation.setChargingState(data.attributes.mower);

        this.arrivingSensor.setMowerState(data.attributes.mower);
        this.arrivingSensor.setMowerMetadata(data.attributes.metadata);

        this.leavingSensor.setMowerState(data.attributes.mower);
        this.leavingSensor.setMowerMetadata(data.attributes.metadata);

        this.motionSensor.setMowerState(data.attributes.mower);
        this.motionSensor.setMowerMetadata(data.attributes.metadata);

        this.scheduleSwitch.setMowerState(data.attributes.mower);
        this.scheduleSwitch.setCalendar(data.attributes.calendar);
        this.scheduleSwitch.setPlanner(data.attributes.planner);
        this.scheduleSwitch.setMowerMetadata(data.attributes.metadata);
        this.scheduleSwitch.setCuttingHeight(data.attributes.settings.cuttingHeight);

        this.pauseSwitch.setMowerState(data.attributes.mower);
        this.pauseSwitch.setMowerMetadata(data.attributes.metadata);
    }

    /**
     * Gets the mower id.
     * @returns The mower id.
     */
    public getId(): string {
        return this.accessory.context.mowerId;
    }

    /**
     * Occurs when a {@link StatusEvent} has been received from the event stream.
     * @param event The event data.
     */
    public onStatusEventReceived(event: StatusEvent): void {
        this.batteryInformation.setBatteryLevel(event.attributes.battery);
        this.batteryInformation.setChargingState(event.attributes.mower);
        
        this.arrivingSensor.setMowerState(event.attributes.mower);
        this.arrivingSensor.setMowerMetadata(event.attributes.metadata);

        this.leavingSensor.setMowerState(event.attributes.mower);
        this.leavingSensor.setMowerMetadata(event.attributes.metadata);

        this.motionSensor.setMowerState(event.attributes.mower);
        this.motionSensor.setMowerMetadata(event.attributes.metadata);
        
        this.scheduleSwitch.setMowerState(event.attributes.mower);
        this.scheduleSwitch.setPlanner(event.attributes.planner);
        this.scheduleSwitch.setMowerMetadata(event.attributes.metadata);

        this.pauseSwitch.setMowerState(event.attributes.mower);
        this.pauseSwitch.setMowerMetadata(event.attributes.metadata);
    }

    /**
     * Occurs when a {@link SettingsEvent} has been received from the event stream.
     * @param event The event data.
     */
    public onSettingsEventReceived(event: SettingsEvent): void {
        if (event.attributes.calendar !== undefined) {
            this.scheduleSwitch.setCalendar(event.attributes.calendar);
        }

        if (event.attributes.cuttingHeight !== undefined) {
            this.scheduleSwitch.setCuttingHeight(event.attributes.cuttingHeight);
        }
    }
}