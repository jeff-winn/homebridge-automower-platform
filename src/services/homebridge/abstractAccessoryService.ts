import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';
import { CustomCharacteristicDefinitions } from './customCharacteristicDefinitions';

/**
 * An abstract class which represents a base accessory service.
 */
export abstract class AbstractAccessoryService {
    /**
     * Defines the custom characteristics.
     */
    protected readonly CustomCharacteristic = CustomCharacteristicDefinitions;

    /**
     * Defines the built-in characteristics.
     */
    protected readonly Characteristic: typeof Characteristic;

    /**
     * Defines the built-in services.
     */
    protected readonly Service: typeof Service;

    public constructor(protected accessory: PlatformAccessory<AutomowerContext>, protected api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }
}