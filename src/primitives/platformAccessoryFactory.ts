import { API, PlatformAccessory } from 'homebridge';
import { MowerContext } from '../mowerAccessory';

/**
 * A mechanism capable of creating platform accessories.
 */
export interface PlatformAccessoryFactory {
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
    create(displayName: string, uuid: string): PlatformAccessory<MowerContext>;
}

export class PlatformAccessoryFactoryImpl implements PlatformAccessoryFactory {
    public constructor(private api: API) { }

    public generateUuid(data: string): string {
        return this.api.hap.uuid.generate(data);
    }

    public create(displayName: string, uuid: string): PlatformAccessory<MowerContext> {
        return new this.api.platformAccessory(displayName, uuid);
    }
}