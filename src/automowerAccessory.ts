import {
    PlatformAccessory, UnknownContext
} from 'homebridge';

import { SettingsEvent, StatusEvent } from './events';
import { Mower } from './model';
import { NameMode } from './services/abstractSwitch';
import { AccessoryInformationService } from './services/accessoryInformationService';
import { BatteryService } from './services/batteryService';
import { MotionSensorService } from './services/motionSensorService';
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
        private batteryService: BatteryService,
        private informationService: AccessoryInformationService,
        private motionSensorService: MotionSensorService,
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
        this.informationService.init();
        this.batteryService.init();
        this.motionSensorService.init();

        this.pauseSwitch.init(NameMode.DEFAULT);
        this.scheduleSwitch.init(NameMode.DISPLAY_NAME);
    }

    /**
     * Refreshes the mower values.
     * @param data The mower data.
     */
    public refresh(data: Mower): void {
        this.batteryService.setBatteryLevel(data.attributes.battery);
        this.batteryService.setChargingState(data.attributes.mower);

        this.scheduleSwitch.setMowerState(data.attributes.mower);
        this.scheduleSwitch.setCalendar(data.attributes.calendar);
        this.scheduleSwitch.setPlanner(data.attributes.planner);

        this.pauseSwitch.setMowerState(data.attributes.mower);

        this.motionSensorService.setMowerState(data.attributes.mower);
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
        this.batteryService.setBatteryLevel(event.attributes.battery);
        this.batteryService.setChargingState(event.attributes.mower);
        
        this.scheduleSwitch.setMowerState(event.attributes.mower);
        this.scheduleSwitch.setPlanner(event.attributes.planner);

        this.pauseSwitch.setMowerState(event.attributes.mower);

        this.motionSensorService.setMowerState(event.attributes.mower);
    }

    /**
     * Occurs when a {@link SettingsEvent} has been received from the event stream.
     * @param event The event data.
     */
    public onSettingsEventReceived(event: SettingsEvent): void {
        if (event.attributes.calendar !== undefined) {
            this.scheduleSwitch.setCalendar(event.attributes.calendar);
        }
    }
}