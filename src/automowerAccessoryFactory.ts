import { API, PlatformAccessory } from 'homebridge';

import { MowerAccessory, MowerContext } from './automowerAccessory';
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
    createAccessory(data: Mower): MowerAccessory;

    /**
     * Creates an accessory instance from cached accessory information.
     * @param accessory The platform accessory.
     */
    createAccessoryFromCache(accessory: PlatformAccessory<MowerContext>): MowerAccessory;
}

export class AutomowerAccessoryFactoryImpl implements AutomowerAccessoryFactory {
    public constructor(
        private factory: PlatformAccessoryFactory, 
        private api: API, 
        private log: PlatformLogger,
        private container: PlatformContainer,
        private locale: Localization) { }

    public createAccessory(mower: Mower): MowerAccessory {        
        const displayName = mower.attributes.metadata.name;
        const accessory = this.factory.create(displayName, this.factory.generateUuid(mower.id));

        let locationId: string | undefined;
        if (mower.attributes.location !== undefined) {
            locationId = mower.attributes.location.id;
        }

        accessory.context = {
            mowerId: mower.id,
            locationId: locationId,
            manufacturer: mower.attributes.metadata.manufacturer,
            model: mower.attributes.metadata.model,
            serialNumber: mower.attributes.metadata.serialNumber
        };

        return this.createAccessoryCore(accessory);
    }

    public createAccessoryFromCache(accessory: PlatformAccessory<MowerContext>): MowerAccessory {
        return this.createAccessoryCore(accessory);
    }

    protected createAccessoryCore(accessory: PlatformAccessory<MowerContext>): MowerAccessory {
        const result = this.createAutomowerAccessoryImpl(accessory);
        result.init();

        return result;
    }
    
    protected createAutomowerAccessoryImpl(accessory: PlatformAccessory<MowerContext>): MowerAccessory {
        return new MowerAccessory(accessory,
            this.createBatteryInformation(accessory),
            this.createAccessoryInformation(accessory),
            this.createMotionSensor(accessory),
            this.createArrivingSensor(accessory),
            this.createLeavingSensor(accessory),
            this.createPauseSwitch(accessory),            
            this.createScheduleSwitch(accessory));
    }

    protected createPauseSwitch(accessory: PlatformAccessory<MowerContext>): PauseSwitch {
        return new PauseSwitchImpl(
            this.locale.format('PAUSE'),
            this.container.resolve(MowerControlServiceImpl),
            this.container.resolve(DeterministicMowerIsPausedPolicy),
            accessory, this.api, this.log);
    }

    protected createArrivingSensor(accessory: PlatformAccessory<MowerContext>): ArrivingSensor {
        return new ArrivingContactSensorImpl(
            this.locale.format('ARRIVING_SENSOR'),
            this.container.resolve(DeterministicMowerIsArrivingPolicy),
            accessory, this.api, this.log);
    }

    protected createLeavingSensor(accessory: PlatformAccessory<MowerContext>): LeavingSensor {
        return new LeavingContactSensorImpl(
            this.locale.format('LEAVING_SENSOR'),
            this.container.resolve(DeterministicMowerIsLeavingPolicy),
            accessory, this.api, this.log);
    }

    protected createBatteryInformation(accessory: PlatformAccessory<MowerContext>): BatteryInformation {
        return new BatteryInformationImpl(accessory, this.api);
    }

    protected createAccessoryInformation(accessory: PlatformAccessory<MowerContext>): AccessoryInformation {
        return new AccessoryInformationImpl(accessory, this.api);
    }

    protected createScheduleSwitch(accessory: PlatformAccessory<MowerContext>): ScheduleSwitch {
        return new ScheduleSwitchImpl(
            this.locale.format('SCHEDULE'),
            this.container.resolve(MowerControlServiceImpl),
            this.container.resolve(ChangeSettingsServiceImpl),
            this.container.resolve(DeterministicScheduleEnabledPolicy),
            accessory, this.api, this.log);
    }

    protected createMotionSensor(accessory: PlatformAccessory<MowerContext>): MotionSensor {
        return new MotionSensorImpl(
            this.locale.format('MOTION_SENSOR'),
            this.container.resolve(DeterministicMowerInMotionPolicy),
            this.container.resolve(DeterministicMowerFaultedPolicy),
            this.container.resolve(DeterministicMowerTamperedPolicy),
            accessory, this.api, this.log);
    }
}