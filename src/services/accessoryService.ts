import { AccessoryFactory } from '../primitives/accessoryFactory';
import { AutomowerAccessory } from '../automowerAccessory';
import { Mower } from '../model';
import { API, Logging } from 'homebridge';

/**
 * A mechanism to create {@link AutomowerAccessory} instances.
 */
export interface AccessoryService {
    /**
     * Creates an accessory instance.
     * @param data The mower data.
     */
    createAccessory(data: Mower): AutomowerAccessory;
}

/**
 * Describes the model information parsed from the model data.
 */
interface ModelInformation {
    manufacturer: string;
    model: string;
}

export class AccessoryServiceImpl implements AccessoryService {
    constructor(private factory: AccessoryFactory, private api: API, private log: Logging) { }

    createAccessory(mower: Mower): AutomowerAccessory {
        const displayName = mower.attributes.system.name;
        const modelInformation = this.parseModelInformation(mower.attributes.system.model);

        const accessory = this.factory.create(displayName, this.factory.generateUuid(mower.id));

        accessory.context = {
            mowerId: mower.id,
            manufacturer: modelInformation.manufacturer,
            model: modelInformation.model,
            serialNumber: mower.attributes.system.serialNumber.toString()
        };

        const result = new AutomowerAccessory(accessory, this.api, this.log);
        result.init(mower);
        
        return result;
    }

    private parseModelInformation(value: string): ModelInformation {
        const firstIndex = value.indexOf(' ');

        return {
            manufacturer: value.substring(0, firstIndex),
            model: value.substring(firstIndex + 1)
        };
    }
}