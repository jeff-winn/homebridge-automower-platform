import {
    PlatformAccessory, UnknownContext
} from 'homebridge';

import { SettingsEvent, StatusEvent } from './clients/automower/automowerEventStreamClient';
import { Mower } from './model';
import { AccessoryInformation } from './services/accessoryInformation';
import { ArrivingSensor } from './services/arrivingSensor';
import { BatteryInformation } from './services/batteryInformation';
import { NameMode } from './services/homebridge/abstractSwitch';
import { LeavingSensor } from './services/leavingSensor';
import { MainSwitch, SupportsCuttingHeightCharacteristic } from './services/mainSwitch';
import { MotionSensor } from './services/motionSensor';
import { PauseSwitch } from './services/pauseSwitch';

/**
 * Provides contextual information for a mower accessory.
 */
export interface MowerContext extends UnknownContext {
    mowerId: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
}

/**
 * Represents a robotic mower accessory.
 */
export class MowerAccessory {
    public constructor(
        private accessory: PlatformAccessory<MowerContext>,
        private batteryInformation: BatteryInformation,
        private accessoryInformation: AccessoryInformation,
        private motionSensor: MotionSensor,
        private arrivingSensor: ArrivingSensor,
        private leavingSensor: LeavingSensor,
        private pauseSwitch: PauseSwitch,
        private mainSwitch: MainSwitch) {
    }

    /**
     * Gets the underlying platform accessory.
     * @returns The {@link PlatformAccessory} instance.
     */
    public getUnderlyingAccessory(): PlatformAccessory<MowerContext> {
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
        this.mainSwitch.init(NameMode.DISPLAY_NAME);
    }

    /**
     * Refreshes the mower data.
     * @param data The mower data.
     */
    public refresh(data: Mower): void {
        this.batteryInformation.setBatteryLevel(data.attributes.battery);
        this.batteryInformation.setChargingState(data.attributes.mower);

        this.arrivingSensor.setMowerState(data.attributes.mower);
        this.arrivingSensor.setMowerConnection(data.attributes.connection);

        this.leavingSensor.setMowerState(data.attributes.mower);
        this.leavingSensor.setMowerConnection(data.attributes.connection);

        this.motionSensor.setMowerState(data.attributes.mower);
        this.motionSensor.setMowerConnection(data.attributes.connection);

        this.mainSwitch.setMowerState(data.attributes.mower);
        this.mainSwitch.setMowerConnection(data.attributes.connection);

        if (data.attributes.settings !== undefined) {
            const s = (this.mainSwitch as unknown) as SupportsCuttingHeightCharacteristic;
            if (s.setCuttingHeight !== undefined) {
                s.setCuttingHeight(data.attributes.settings.cuttingHeight);
            }    
        }

        this.pauseSwitch.setMowerState(data.attributes.mower);
        this.pauseSwitch.setMowerConnection(data.attributes.connection);
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
        // TODO: Clean this up.
        // this.batteryInformation.setBatteryLevel(event.attributes.battery);
        // this.batteryInformation.setChargingState(event.attributes.mower);
        
        // this.arrivingSensor.setMowerState(event.attributes.mower);
        // this.arrivingSensor.setMowerMetadata(event.attributes.metadata);

        // this.leavingSensor.setMowerState(event.attributes.mower);
        // this.leavingSensor.setMowerMetadata(event.attributes.metadata);

        // this.motionSensor.setMowerState(event.attributes.mower);
        // this.motionSensor.setMowerMetadata(event.attributes.metadata);
        
        // this.scheduleSwitch.setMowerState(event.attributes.mower);
        // this.scheduleSwitch.setPlanner(event.attributes.planner);
        // this.scheduleSwitch.setMowerMetadata(event.attributes.metadata);

        // this.pauseSwitch.setMowerState(event.attributes.mower);
        // this.pauseSwitch.setMowerMetadata(event.attributes.metadata);
    }

    /**
     * Occurs when a {@link SettingsEvent} has been received from the event stream.
     * @param event The event data.
     */
    public onSettingsEventReceived(event: SettingsEvent): void {
        // TODO: Clean this up.
        // if (event.attributes.calendar !== undefined) {
        //     this.scheduleSwitch.setCalendar(event.attributes.calendar);
        // }

        // if (event.attributes.cuttingHeight !== undefined) {
        //     this.scheduleSwitch.setCuttingHeight(event.attributes.cuttingHeight);
        // }
    }
}