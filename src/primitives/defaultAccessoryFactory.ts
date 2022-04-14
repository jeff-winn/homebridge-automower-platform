import { API, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';
import { AccessoryFactory } from '../accessoryFactory';

export class DefaultAccessoryFactory implements AccessoryFactory {
    constructor(private api: API) { }

    generateUuid(data: string): string {
        return this.api.hap.uuid.generate(data);
    }

    public create(displayName: string, uuid: string): PlatformAccessory<AutomowerContext> {
        return new this.api.platformAccessory(displayName, uuid);
    }
}