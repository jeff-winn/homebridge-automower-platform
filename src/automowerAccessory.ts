import { 
    PlatformAccessory, UnknownContext 
} from 'homebridge';

import { SettingsEvent, StatusEvent } from './events';
import { Mower } from './model';
import { AccessoryInformationService } from './services/homebridge/accessoryInformationService';
import { BatteryService } from './services/homebridge/batteryService';
import { ScheduleSwitch } from './services/homebridge/scheduleSwitch';

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

        // The display name should be prepended, unless there are multiple switches available.
        this.scheduleSwitch.init(true);
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