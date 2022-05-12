import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';

/**
 * An abstract class which represents a base accessory service.
 */
export abstract class BaseAccessoryService {
    protected readonly Characteristic: typeof Characteristic;
    protected readonly Service: typeof Service;

    public constructor(protected accessory: PlatformAccessory<AutomowerContext>, protected api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }
}