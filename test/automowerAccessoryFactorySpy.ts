import { PlatformAccessory } from 'homebridge';
import { AutomowerAccessory, MowerContext } from '../src/automowerAccessory';
import { AutomowerAccessoryFactoryImpl } from '../src/automowerAccessoryFactory';
import { AccessoryInformation } from '../src/services/accessoryInformation';
import { ArrivingSensor } from '../src/services/arrivingSensor';
import { BatteryInformation } from '../src/services/batteryInformation';
import { LeavingSensor } from '../src/services/leavingSensor';
import { MotionSensor } from '../src/services/motionSensor';
import { PauseSwitch } from '../src/services/pauseSwitch';
import { ScheduleSwitch } from '../src/services/scheduleSwitch';

export class AutomowerAccessoryFactorySpy extends AutomowerAccessoryFactoryImpl {
    private accessory?: AutomowerAccessory;

    private scheduleSwitch?: ScheduleSwitch;
    private pauseSwitch?: PauseSwitch;
    private accessoryInformation?: AccessoryInformation;
    private batteryInformation?: BatteryInformation;
    private arrivingSensor?: ArrivingSensor;
    private leavingSensor?: LeavingSensor;
    private motionSensor?: MotionSensor;

    public setAccessory(accessory: AutomowerAccessory): void {
        this.accessory = accessory;
    }

    public setScheduleSwitch(scheduleSwitch: ScheduleSwitch): void {
        this.scheduleSwitch = scheduleSwitch;
    }

    public setPauseSwitch(pauseSwitch: PauseSwitch): void {
        this.pauseSwitch = pauseSwitch;
    }

    public setAccessoryInformation(accessoryInformation: AccessoryInformation): void {
        this.accessoryInformation = accessoryInformation;
    }

    public setBatteryInformation(batteryInformation: BatteryInformation): void {
        this.batteryInformation = batteryInformation;
    }

    public setArrivingSensor(arrivingSensor: ArrivingSensor): void {
        this.arrivingSensor = arrivingSensor;
    }

    public setLeavingSensor(leavingSensor: LeavingSensor): void {
        this.leavingSensor = leavingSensor;
    }

    public setMotionSensor(motionSensor: MotionSensor): void {
        this.motionSensor = motionSensor;
    }

    protected createAutomowerAccessoryImpl(accessory: PlatformAccessory<MowerContext>): AutomowerAccessory {
        if (this.accessory !== undefined) {
            return this.accessory;
        }

        return super.createAutomowerAccessoryImpl(accessory);
    }

    public unsafeCreatePauseSwitch(accessory: PlatformAccessory<MowerContext>): PauseSwitch {
        return this.createPauseSwitch(accessory);
    }

    protected override createPauseSwitch(accessory: PlatformAccessory<MowerContext>): PauseSwitch {
        if (this.pauseSwitch !== undefined) {
            return this.pauseSwitch;
        }

        return super.createPauseSwitch(accessory);
    }

    public unsafeCreateAccessoryInformation(accessory: PlatformAccessory<MowerContext>): AccessoryInformation {
        return this.createAccessoryInformation(accessory);
    }

    protected override createAccessoryInformation(accessory: PlatformAccessory<MowerContext>): AccessoryInformation {
        if (this.accessoryInformation !== undefined) {
            return this.accessoryInformation;
        }

        return super.createAccessoryInformation(accessory);
    }

    public unsafeCreateBatteryInformation(accessory: PlatformAccessory<MowerContext>): BatteryInformation {
        return this.createBatteryInformation(accessory);
    }

    protected override createBatteryInformation(accessory: PlatformAccessory<MowerContext>): BatteryInformation {
        if (this.batteryInformation !== undefined) {
            return this.batteryInformation;
        }

        return super.createBatteryInformation(accessory);
    }

    public unsafeCreateArrivingSensor(accessory: PlatformAccessory<MowerContext>): ArrivingSensor {
        return this.createArrivingSensor(accessory);
    }

    protected override createArrivingSensor(accessory: PlatformAccessory<MowerContext>): ArrivingSensor {
        if (this.arrivingSensor !== undefined) {
            return this.arrivingSensor;
        }

        return super.createArrivingSensor(accessory);
    }

    public unsafeCreateLeavingSensor(accessory: PlatformAccessory<MowerContext>): LeavingSensor {
        return this.createLeavingSensor(accessory);
    }

    protected override createLeavingSensor(accessory: PlatformAccessory<MowerContext>): LeavingSensor {
        if (this.leavingSensor !== undefined) {
            return this.leavingSensor;
        }

        return super.createLeavingSensor(accessory);
    }

    public unsafeCreateMotionSensor(accessory: PlatformAccessory<MowerContext>): MotionSensor {
        return this.createMotionSensor(accessory);
    }

    protected override createMotionSensor(accessory: PlatformAccessory<MowerContext>): MotionSensor {
        if (this.motionSensor !== undefined) {
            return this.motionSensor;
        }

        return super.createMotionSensor(accessory);
    }

    public unsafeCreateScheduleSwitch(accessory: PlatformAccessory<MowerContext>): ScheduleSwitch {
        return this.createScheduleSwitch(accessory);
    }

    protected override createScheduleSwitch(accessory: PlatformAccessory<MowerContext>): ScheduleSwitch {
        if (this.scheduleSwitch !== undefined) {
            return this.scheduleSwitch;
        }

        return super.createScheduleSwitch(accessory);
    }
}