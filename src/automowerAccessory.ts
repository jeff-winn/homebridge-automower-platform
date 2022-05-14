import { 
    PlatformAccessory, UnknownContext 
} from 'homebridge';

import { StatusEvent } from './events';
import { Mower } from './model';
import { AccessoryInformationService } from './services/homebridge/accessoryInformationService';
import { BatteryService } from './services/homebridge/batteryService';
import { ScheduleService } from './services/homebridge/scheduleService';

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
        private scheduleService: ScheduleService) { 
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
        this.scheduleService.init(true);
    }

    /**
     * Refreshes the mower values.
     * @param data The mower data.
     */
    public refresh(data: Mower): void {
        this.batteryService.setBatteryLevel(data.attributes.battery);
        this.batteryService.setChargingState(data.attributes.mower);
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
    }
}