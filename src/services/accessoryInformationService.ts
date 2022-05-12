import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';

/**
 * A service which manages battery state.
 */
export interface AccessoryInformationService {
    /**
     * Initializes the service.
     */
    init(): void;
}

export class AccessoryInformationServiceImpl implements AccessoryInformationService {
    private readonly Characteristic: typeof Characteristic;
    private readonly Service: typeof Service;

    private informationService?: Service;

    public constructor(private accessory: PlatformAccessory<AutomowerContext>, private api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }

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