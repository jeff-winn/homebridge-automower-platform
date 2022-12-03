import { PlatformAccessory } from 'homebridge';
import { AutomowerAccessory, AutomowerContext } from '../src/automowerAccessory';
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

    protected createAutomowerAccessoryImpl(accessory: PlatformAccessory<AutomowerContext>): AutomowerAccessory {
        if (this.accessory !== undefined) {
            return this.accessory;
        }

        return super.createAutomowerAccessoryImpl(accessory);
    }

    protected override createPauseSwitch(accessory: PlatformAccessory<AutomowerContext>): PauseSwitch {
        if (this.pauseSwitch !== undefined) {
            return this.pauseSwitch;
        }

        return super.createPauseSwitch(accessory);
    }

    protected override createAccessoryInformation(accessory: PlatformAccessory<AutomowerContext>): AccessoryInformation {
        if (this.accessoryInformation !== undefined) {
            return this.accessoryInformation;
        }

        return super.createAccessoryInformation(accessory);
    }

    protected override createBatteryInformation(accessory: PlatformAccessory<AutomowerContext>): BatteryInformation {
        if (this.batteryInformation !== undefined) {
            return this.batteryInformation;
        }

        return super.createBatteryInformation(accessory);
    }

    protected override createArrivingSensor(accessory: PlatformAccessory<AutomowerContext>): ArrivingSensor {
        if (this.arrivingSensor !== undefined) {
            return this.arrivingSensor;
        }

        return super.createArrivingSensor(accessory);
    }

    protected override createLeavingSensor(accessory: PlatformAccessory<AutomowerContext>): LeavingSensor {
        if (this.leavingSensor !== undefined) {
            return this.leavingSensor;
        }

        return super.createLeavingSensor(accessory);
    }

    protected override createMotionSensor(accessory: PlatformAccessory<AutomowerContext>): MotionSensor {
        if (this.motionSensor !== undefined) {
            return this.motionSensor;
        }

        return super.createMotionSensor(accessory);
    }

    protected override createScheduleSwitch(accessory: PlatformAccessory<AutomowerContext>): ScheduleSwitch {
        if (this.scheduleSwitch !== undefined) {
            return this.scheduleSwitch;
        }

        return super.createScheduleSwitch(accessory);
    }
}