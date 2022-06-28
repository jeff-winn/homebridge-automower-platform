import { Service } from 'homebridge';
import { AbstractAccessoryService } from './abstractAccessoryService';

/**
 * A mechanism which manages accessory information displayed within HomeKit.
 */
export interface AccessoryInformation {
    /**
     * Initializes the service.
     */
    init(): void;
}

export class AccessoryInformationImpl extends AbstractAccessoryService implements AccessoryInformation {
    private informationService?: Service;

    public init(): void {
        this.informationService = this.accessory.getService(this.Service.AccessoryInformation);
        if (this.informationService === undefined) {
            this.informationService = this.accessory.addService(this.Service.AccessoryInformation);
        }

        this.informationService
            .setCharacteristic(this.Characteristic.Manufacturer, this.accessory.context.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.Name, this.accessory.displayName)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.serialNumber);
    }

    public getUnderlyingService(): Service | undefined {            
        return this.informationService;
    }
}