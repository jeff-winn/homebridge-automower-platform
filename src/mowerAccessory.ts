import {
    PlatformAccessory, UnknownContext
} from 'homebridge';

import { MowerSettingsChangedEvent, MowerStatusChangedEvent } from './events';
import { Mower } from './model';
import { AccessoryInformation } from './services/accessoryInformation';
import { ArrivingSensor } from './services/arrivingSensor';
import { BatteryInformation } from './services/batteryInformation';
import { NameMode } from './services/homebridge/abstractSwitch';
import { LeavingSensor } from './services/leavingSensor';
import { MainSwitch, supportsCuttingHeight, supportsMowerSchedule } from './services/mainSwitch';
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

        if (data.attributes.settings !== undefined && supportsCuttingHeight(this.mainSwitch)) {
            this.mainSwitch.setCuttingHeight(data.attributes.settings.cuttingHeight);
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
     * Occurs when a {@link MowerStatusChangedEvent} has been received from the event stream.
     * @param event The event data.
     */
    public onStatusEventReceived(event: MowerStatusChangedEvent): void {
        if (event.attributes.battery !== undefined) {
            this.batteryInformation.setBatteryLevel(event.attributes.battery);
        }        

        if (event.attributes.mower !== undefined) {
            this.batteryInformation.setChargingState(event.attributes.mower);
            this.arrivingSensor.setMowerState(event.attributes.mower);
            this.leavingSensor.setMowerState(event.attributes.mower);
            this.motionSensor.setMowerState(event.attributes.mower);
            this.mainSwitch.setMowerState(event.attributes.mower);
            this.pauseSwitch.setMowerState(event.attributes.mower);
        }

        if (event.attributes.connection !== undefined) {
            this.arrivingSensor.setMowerConnection(event.attributes.connection);
            this.leavingSensor.setMowerConnection(event.attributes.connection);
            this.motionSensor.setMowerConnection(event.attributes.connection);
            this.mainSwitch.setMowerConnection(event.attributes.connection);
            this.pauseSwitch.setMowerConnection(event.attributes.connection);
        }
    }

    /**
     * Occurs when a {@link MowerSettingsChangedEvent} has been received from the event stream.
     * @param event The event data.
     */
    public onSettingsEventReceived(event: MowerSettingsChangedEvent): void {
        if (event.attributes.settings !== undefined && supportsCuttingHeight(this.mainSwitch)) {
            this.mainSwitch.setCuttingHeight(event.attributes.settings.cuttingHeight);
        }

        if (event.attributes.schedule !== undefined && supportsMowerSchedule(this.mainSwitch)) {
            this.mainSwitch.setMowerSchedule(event.attributes.schedule);
        }
    }
}
