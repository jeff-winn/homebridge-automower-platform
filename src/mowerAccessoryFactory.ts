import { API, PlatformAccessory } from 'homebridge';
import { InjectionToken } from 'tsyringe';

import { AutomowerPlatformConfig } from './automowerPlatform';
import { PlatformLogger } from './diagnostics/platformLogger';
import { DeviceType, Mower } from './model';
import { AutomowerAccessory, MowerAccessory, MowerContext } from './mowerAccessory';
import { Localization } from './primitives/localization';
import { PlatformAccessoryFactory } from './primitives/platformAccessoryFactory';
import { PlatformContainer } from './primitives/platformContainer';
import { AccessoryInformation, AccessoryInformationImpl } from './services/accessoryInformation';
import { ArrivingContactSensorImpl, ArrivingSensor } from './services/arrivingSensor';
import { BatteryInformation, BatteryInformationImpl } from './services/batteryInformation';
import { AutomowerMowerControlService } from './services/husqvarna/automower/automowerMowerControlService';
import { ChangeSettingsServiceImpl } from './services/husqvarna/automower/changeSettingsService';
import { GardenaManualMowerControlService } from './services/husqvarna/gardena/gardenaMowerControlService';
import { MowerControlService, SupportsPauseControl } from './services/husqvarna/mowerControlService';
import { LeavingContactSensorImpl, LeavingSensor } from './services/leavingSensor';
import { AutomowerMainSwitchImpl, MainSwitch, MainSwitchImpl, SupportsCuttingHeightCharacteristic, SupportsMowerScheduleInformation } from './services/mainSwitch';
import { MotionSensor, MotionSensorImpl } from './services/motionSensor';
import { PauseSwitch, PauseSwitchImpl } from './services/pauseSwitch';
import { DeterministicMowerFaultedPolicy } from './services/policies/mowerFaultedPolicy';
import { DeterministicMowerInMotionPolicy } from './services/policies/mowerInMotionPolicy';
import { DeterministicMowerIsArrivingPolicy } from './services/policies/mowerIsArrivingPolicy';
import { DeterministicMowerIsActivePolicy } from './services/policies/mowerIsEnabledPolicy';
import { DeterministicMowerIsLeavingPolicy } from './services/policies/mowerIsLeavingPolicy';
import { DeterministicMowerIsPausedPolicy } from './services/policies/mowerIsPausedPolicy';
import { DeterministicMowerTamperedPolicy } from './services/policies/mowerTamperedPolicy';

/**
 * A mechanism to create {@link MowerAccessory} instances.
 */
export interface MowerAccessoryFactory {
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

export class MowerAccessoryFactoryImpl implements MowerAccessoryFactory {
    public constructor(
        private readonly factory: PlatformAccessoryFactory, 
        private readonly api: API, 
        private readonly log: PlatformLogger,
        private readonly container: PlatformContainer,
        private readonly locale: Localization,
        private readonly config: AutomowerPlatformConfig) { }

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
        if (this.config.device_type !== undefined && this.config.device_type === DeviceType.GARDENA) {
            return new MowerAccessory(accessory,
                this.createBatteryInformation(accessory),
                this.createAccessoryInformation(accessory),
                this.createMotionSensor(accessory),
                this.createArrivingSensor(accessory),
                this.createLeavingSensor(accessory),
                this.createMainSwitch(accessory));
        }

        return new AutomowerAccessory(accessory,
            this.createBatteryInformation(accessory),
            this.createAccessoryInformation(accessory),
            this.createMotionSensor(accessory),
            this.createArrivingSensor(accessory),
            this.createLeavingSensor(accessory),
            this.createAutomowerMainSwitch(accessory),
            this.createPauseSwitch(accessory));
    }

    protected createPauseSwitch(accessory: PlatformAccessory<MowerContext>): PauseSwitch {
        return new PauseSwitchImpl(
            this.locale.format('PAUSE'), // WARNING: Changing the name will cause a breaking change!
            this.container.resolve(this.getPauseControlServiceClass()),
            this.container.resolve(DeterministicMowerIsPausedPolicy),
            accessory, this.api, this.log);
    }

    protected createArrivingSensor(accessory: PlatformAccessory<MowerContext>): ArrivingSensor {
        return new ArrivingContactSensorImpl(
            this.locale.format('ARRIVING_SENSOR'), // WARNING: Changing the name will cause a breaking change!
            this.container.resolve(DeterministicMowerIsArrivingPolicy),
            accessory, this.api, this.log);
    }

    protected createLeavingSensor(accessory: PlatformAccessory<MowerContext>): LeavingSensor {
        return new LeavingContactSensorImpl(
            this.locale.format('LEAVING_SENSOR'), // WARNING: Changing the name will cause a breaking change!
            this.container.resolve(DeterministicMowerIsLeavingPolicy),
            accessory, this.api, this.log);
    }

    protected createBatteryInformation(accessory: PlatformAccessory<MowerContext>): BatteryInformation {
        return new BatteryInformationImpl(accessory, this.api);
    }

    protected createAccessoryInformation(accessory: PlatformAccessory<MowerContext>): AccessoryInformation {
        return new AccessoryInformationImpl(accessory, this.api);
    }

    protected createMainSwitch(accessory: PlatformAccessory<MowerContext>): MainSwitch {        
        return new MainSwitchImpl(
            this.locale.format('SCHEDULE'), // WARNING: Changing the name will cause a breaking change!
            this.container.resolve(this.getContolServiceClass()),
            this.container.resolve(DeterministicMowerIsActivePolicy),
            accessory, this.api, this.log);
    }

    protected createAutomowerMainSwitch(accessory: PlatformAccessory<MowerContext>): MainSwitch & SupportsCuttingHeightCharacteristic & SupportsMowerScheduleInformation {
        return new AutomowerMainSwitchImpl(
            this.locale.format('SCHEDULE'), // WARNING: Changing the name will cause a breaking change!
            this.container.resolve(this.getContolServiceClass()),
            this.container.resolve(ChangeSettingsServiceImpl),
            this.container.resolve(DeterministicMowerIsActivePolicy),
            accessory, this.api, this.log);
    }

    protected createMotionSensor(accessory: PlatformAccessory<MowerContext>): MotionSensor {
        return new MotionSensorImpl(
            this.locale.format('MOTION_SENSOR'), // WARNING: Changing the name will cause a breaking change!
            this.container.resolve(DeterministicMowerInMotionPolicy),
            this.container.resolve(DeterministicMowerFaultedPolicy),
            this.container.resolve(DeterministicMowerTamperedPolicy),
            accessory, this.api, this.log);
    }

    protected getContolServiceClass(): InjectionToken<MowerControlService> {
        if (this.config.device_type === DeviceType.AUTOMOWER) {
            return AutomowerMowerControlService;
        } else if (this.config.device_type === DeviceType.GARDENA) {
            return GardenaManualMowerControlService;
        }

        return AutomowerMowerControlService;
    }

    protected getPauseControlServiceClass(): InjectionToken<MowerControlService & SupportsPauseControl> {
        if (this.config.device_type === DeviceType.AUTOMOWER) {
            return AutomowerMowerControlService;
        }

        return AutomowerMowerControlService;
    }
}