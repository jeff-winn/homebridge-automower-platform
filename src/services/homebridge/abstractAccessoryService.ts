import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';
import { CustomCharacteristics } from './customCharacteristics';

/**
 * An abstract class which represents a base accessory service.
 */
export abstract class AbstractAccessoryService {
    protected readonly Characteristic: typeof Characteristic;
    protected readonly CustomCharacteristic: typeof CustomCharacteristics;
    
    protected readonly Service: typeof Service;

    public constructor(protected accessory: PlatformAccessory<AutomowerContext>, protected api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.CustomCharacteristic = CustomCharacteristics;
        
        this.Service = this.api.hap.Service;
    }
}