import { API, Characteristic, Logging, PlatformAccessory, Service, UnknownContext } from 'homebridge';
import { AutomowerPlatform } from './automowerPlatform';

/**
 * Provides contextual information for an Automower accessory.
 */
export interface AutomowerContext extends UnknownContext {
    mowerId: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
}

/**
 * Represents an automower accessory.
 */
export class AutomowerAccessory {
    private readonly Characteristic: typeof Characteristic;
    private readonly Service: typeof Service;

    private readonly informationService: Service;

    constructor(private platform: AutomowerPlatform, private accessory: PlatformAccessory<AutomowerContext>, 
        private api: API, private log: Logging) {
        
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;        

        this.informationService = this.accessory.getService(this.Service.AccessoryInformation)!
            .setCharacteristic(this.Characteristic.Manufacturer, accessory.context.manufacturer)
            .setCharacteristic(this.Characteristic.Model, accessory.context.model)
            .setCharacteristic(this.Characteristic.Name, accessory.displayName)
            .setCharacteristic(this.Characteristic.SerialNumber, accessory.context.serialNumber);
    }

    public getUuid(): string {
        return this.accessory.UUID;
    }
}