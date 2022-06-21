import { API, PlatformAccessory } from 'homebridge';

import { AutomowerAccessory, AutomowerContext } from '../automowerAccessory';
import { PlatformLogger } from '../diagnostics/platformLogger';
import { Mower } from '../model';
import { AccessoryInformationService, AccessoryInformationServiceImpl } from '../services/accessoryInformationService';
import { MowerControlServiceImpl } from '../services/automower/mowerControlService';
import { BatteryService, BatteryServiceImpl } from '../services/batteryService';
import { MotionSensorService, MotionSensorServiceImpl } from '../services/motionSensorService';
import { DeterministicMowerInMotionPolicy } from '../services/policies/mowerInMotionPolicy';
import { DeterministicScheduleEnabledPolicy } from '../services/policies/scheduleEnabledPolicy';
import { ScheduleSwitch, ScheduleSwitchImpl } from '../services/scheduleSwitch';
import { PlatformAccessoryFactory } from './platformAccessoryFactory';
import { PlatformContainer } from './platformContainer';

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
        private container: PlatformContainer) { }

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
        const result = new AutomowerAccessory(accessory,
            this.createBatteryService(accessory),
            this.createAccessoryInformationService(accessory),
            this.createMotionSensorService(accessory),
            this.createScheduleSwitch(accessory));

        result.init();

        return result;
    }

    protected createBatteryService(accessory: PlatformAccessory<AutomowerContext>): BatteryService {
        return new BatteryServiceImpl(accessory, this.api);
    }

    protected createAccessoryInformationService(accessory: PlatformAccessory<AutomowerContext>): AccessoryInformationService {
        return new AccessoryInformationServiceImpl(accessory, this.api);
    }

    protected createScheduleSwitch(accessory: PlatformAccessory<AutomowerContext>): ScheduleSwitch {
        return new ScheduleSwitchImpl(
            'Schedule',
            this.container.resolve(MowerControlServiceImpl),
            this.container.resolve(DeterministicScheduleEnabledPolicy),
            accessory, this.api, this.log);
    }

    protected createMotionSensorService(accessory: PlatformAccessory<AutomowerContext>): MotionSensorService {
        return new MotionSensorServiceImpl(
            'Motion Sensor',
            this.container.resolve(DeterministicMowerInMotionPolicy),
            accessory, this.api);
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}