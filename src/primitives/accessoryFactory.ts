import { API, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';

/**
 * A mechanism capable of creating platform accessories.
 */
export interface AccessoryFactory {
    /**
     * Generates a UUID based on the data provided.
     * @param data The data to use while generating the id.
     */
    generateUuid(data: string): string;

    /**
     * Creates a new accessory.
     * @param displayName The display name.
     * @param uuid The UUID of the device.
     */
    create(displayName: string, uuid: string): PlatformAccessory<AutomowerContext>;
}

export class AccessoryFactoryImpl implements AccessoryFactory {
    constructor(private api: API) { }

    generateUuid(data: string): string {
        return this.api.hap.uuid.generate(data);
    }

    public create(displayName: string, uuid: string): PlatformAccessory<AutomowerContext> {
        return new this.api.platformAccessory(displayName, uuid);
    }
}