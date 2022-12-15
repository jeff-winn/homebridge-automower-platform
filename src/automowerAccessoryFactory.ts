import { API, PlatformAccessory } from 'homebridge';

import { AutomowerAccessory, AutomowerContext } from './automowerAccessory';
import { PlatformLogger } from './diagnostics/platformLogger';
import { Mower } from './model';
import { Localization } from './primitives/localization';
import { PlatformAccessoryFactory } from './primitives/platformAccessoryFactory';
import { PlatformContainer } from './primitives/platformContainer';
import { AccessoryInformation, AccessoryInformationImpl } from './services/accessoryInformation';
import { ArrivingContactSensorImpl, ArrivingSensor } from './services/arrivingSensor';
import { BatteryInformation, BatteryInformationImpl } from './services/batteryInformation';
import { ChangeSettingsServiceImpl } from './services/husqvarna/automower/changeSettingsService';
import { MowerControlServiceImpl } from './services/husqvarna/automower/mowerControlService';
import { LeavingContactSensorImpl, LeavingSensor } from './services/leavingSensor';
import { MotionSensor, MotionSensorImpl } from './services/motionSensor';
import { PauseSwitch, PauseSwitchImpl } from './services/pauseSwitch';
import { DeterministicMowerFaultedPolicy } from './services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from './services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from './services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsLeavingPolicy } from './services/policies/mowerIsLeavingPolicy';
import { DeterministicMowerIsPausedPolicy } from './services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from './services/policies/mowerTamperedPolicy';
import { DeterministicScheduleEnabledPolicy } from './services/policies/scheduleEnabledPolicy';
import { ScheduleSwitch, ScheduleSwitchImpl } from './services/scheduleSwitch';

/**
 * A mechanism to create {@link AutomowerAccessory} instances.
 */
export interface AutomowerAccessoryFactory {
    /**
     * Creates an accessory instance.
     * @param data The mower data.
     */
    createAccessory(data: Mower): AutomowerAccessory;

    /**
     * Creates an accessory instance.
     * @param accessory The platform accessory.
     */
    createAutomowerAccessory(accessory: PlatformAccessory<AutomowerContext>): AutomowerAccessory;
}

/**
 * Describes the model information parsed from the model data.
 */
interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class AutomowerAccessoryFactoryImpl implements AutomowerAccessoryFactory {
    public constructor(
        private factory: PlatformAccessoryFactory, 
        private api: API, 
        private log: PlatformLogger,
        private container: PlatformContainer,
        private locale: Localization) { }

    public createAccessory(mower: Mower): AutomowerAccessory {
        const displayName = mower.attributes.system.name;
        const modelInformation = this.parseModelInformation(mower.attributes.system.model);

        const accessory = this.factory.create(displayName, this.factory.generateUuid(mower.id));

        accessory.context = {
            mowerId: mower.id,
            manufacturer: modelInformation.manufacturer,
            model: modelInformation.model,
            serialNumber: mower.attributes.system.serialNumber.toString()
        };

        return this.createAutomowerAccessory(accessory);
    }

    public createAutomowerAccessory(accessory: PlatformAccessory<AutomowerContext>): AutomowerAccessory {
        const result = this.createAutomowerAccessoryImpl(accessory);
        result.init();

        return result;
    }
    
    protected createAutomowerAccessoryImpl(accessory: PlatformAccessory<AutomowerContext>): AutomowerAccessory {
        return new AutomowerAccessory(accessory,
            this.createBatteryInformation(accessory),
            this.createAccessoryInformation(accessory),
            this.createMotionSensor(accessory),
            this.createArrivingSensor(accessory),
            this.createLeavingSensor(accessory),
            this.createPauseSwitch(accessory),            
            this.createScheduleSwitch(accessory));
    }

    protected createPauseSwitch(accessory: PlatformAccessory<AutomowerContext>): PauseSwitch {
        return new PauseSwitchImpl(
            this.locale.format('PAUSE'),
            this.container.resolve(MowerControlServiceImpl),
            this.container.resolve(DeterministicMowerIsPausedPolicy),
            accessory, this.api, this.log);
    }

    protected createArrivingSensor(accessory: PlatformAccessory<AutomowerContext>): ArrivingSensor {
        return new ArrivingContactSensorImpl(
            this.locale.format('ARRIVING_SENSOR'),
            this.container.resolve(DeterministicMowerIsArrivingPolicy),
            accessory, this.api, this.log);
    }

    protected createLeavingSensor(accessory: PlatformAccessory<AutomowerContext>): LeavingSensor {
        return new LeavingContactSensorImpl(
            this.locale.format('LEAVING_SENSOR'),
            this.container.resolve(DeterministicMowerIsLeavingPolicy),
            accessory, this.api, this.log);
    }

    protected createBatteryInformation(accessory: PlatformAccessory<AutomowerContext>): BatteryInformation {
        return new BatteryInformationImpl(accessory, this.api);
    }

    protected createAccessoryInformation(accessory: PlatformAccessory<AutomowerContext>): AccessoryInformation {
        return new AccessoryInformationImpl(accessory, this.api);
    }

    protected createScheduleSwitch(accessory: PlatformAccessory<AutomowerContext>): ScheduleSwitch {
        return new ScheduleSwitchImpl(
            this.locale.format('SCHEDULE'),
            this.container.resolve(MowerControlServiceImpl),
            this.container.resolve(ChangeSettingsServiceImpl),
            this.container.resolve(DeterministicScheduleEnabledPolicy),
            accessory, this.locale, this.api, this.log);
    }

    protected createMotionSensor(accessory: PlatformAccessory<AutomowerContext>): MotionSensor {
        return new MotionSensorImpl(
            this.locale.format('MOTION_SENSOR'),
            this.container.resolve(DeterministicMowerInMotionPolicy),
            this.container.resolve(DeterministicMowerFaultedPolicy),
            this.container.resolve(DeterministicMowerTamperedPolicy),
            accessory, this.api, this.log);
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}