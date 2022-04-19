import { API, Characteristic, Logging, PlatformAccessory, Service, UnknownContext } from 'homebridge';
import { AutomowerPlatform } from './automowerPlatform';
import { StatusEvent } from './clients/events';

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

    private informationService?: Service;

    constructor(private platform: AutomowerPlatform, private accessory: PlatformAccessory<AutomowerContext>, 
        private api: API, private log: Logging) {
        
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;        
    }

    /**
     * Initializes the accessory information.
     */
    public init(): void {
        this.initAccessoryInformation();
    }
    
    protected initAccessoryInformation(): void {
        this.informationService = this.accessory.getService(this.Service.AccessoryInformation)!
            .setCharacteristic(this.Characteristic.Manufacturer, this.accessory.context.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.Name, this.accessory.displayName)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.serialNumber);    
    }    

    public getUuid(): string {
        return this.accessory.UUID;
    }

    public onStatusEventReceived(event: StatusEvent): Promise<void> {
        // TODO: Update the characteristics on the associated services.
        return Promise.resolve(undefined);
    }
}