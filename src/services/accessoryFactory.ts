import { API, Logging, PlatformAccessory } from 'homebridge';

import { PlatformAccessoryFactory } from '../primitives/platformAccessoryFactory';
import { AutomowerAccessory, AutomowerContext } from '../automowerAccessory';
import { Mower } from '../model';
import { AccessoryInformationService, AccessoryInformationServiceImpl } from './accessoryInformationService';
import { BatteryService, BatteryServiceImpl } from './batteryService';

/**
 * A mechanism to create {@link AutomowerAccessory} instances.
 */
export interface AccessoryFactory {
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

export class AccessoryFactoryImpl implements AccessoryFactory {
    public constructor(private factory: PlatformAccessoryFactory, private api: API, private log: Logging) { }

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
            this.createAccessoryInformationService(accessory));

        result.init();

        return result;
    }

    protected createBatteryService(accessory: PlatformAccessory<AutomowerContext>): BatteryService {
        return new BatteryServiceImpl(accessory, this.api);       
    }

    protected createAccessoryInformationService(accessory: PlatformAccessory<AutomowerContext>): AccessoryInformationService {
        return new AccessoryInformationServiceImpl(accessory, this.api);
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}