import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { MowerContext } from '../../automowerAccessory';

/**
 * An abstract class which represents a base accessory service.
 */
export abstract class AbstractAccessoryService {    
    /**
     * Defines the built-in characteristics.
     */
    protected readonly Characteristic: typeof Characteristic;

    /**
     * Defines the built-in services.
     */
    protected readonly Service: typeof Service;

    public constructor(protected accessory: PlatformAccessory<MowerContext>, protected api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }
}