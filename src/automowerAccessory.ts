import { 
    API, Characteristic, CharacteristicEventTypes, CharacteristicGetCallback, Logging, 
    PlatformAccessory, Service, UnknownContext 
} from 'homebridge';

import { AutomowerPlatform } from './automowerPlatform';
import { StatusEvent } from './events';

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

    private batteryService?: Service;
    private lowBattery?: Characteristic;
    private batteryLevel?: Characteristic;
    private chargingState?: Characteristic;

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
        this.initBatteryService();
    }
    
    protected initAccessoryInformation(): void {
        this.informationService = this.accessory.getService(this.Service.AccessoryInformation)!
            .setCharacteristic(this.Characteristic.Manufacturer, this.accessory.context.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.Name, this.accessory.displayName)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.serialNumber);    
    }    

    protected initBatteryService(): void {
        this.batteryService = this.accessory.getService(this.Service.Battery);
        if (this.batteryService === undefined) {
            this.batteryService = this.accessory.addService(this.Service.Battery);
        }

        this.lowBattery = this.batteryService.getCharacteristic(this.Characteristic.StatusLowBattery);
        if (this.lowBattery !== undefined) {
            this.lowBattery.on(CharacteristicEventTypes.GET, this.onGetStatusLowBattery.bind(this));
        }

        this.batteryLevel = this.batteryService.getCharacteristic(this.Characteristic.BatteryLevel);
        if (this.batteryLevel !== undefined) {
            this.batteryLevel.on(CharacteristicEventTypes.GET, this.onGetBatteryLevel.bind(this));
        }

        this.chargingState = this.batteryService.getCharacteristic(this.Characteristic.ChargingState);
        if (this.chargingState !== undefined) {
            this.chargingState.on(CharacteristicEventTypes.GET, this.onGetChargingState.bind(this));
        }
    }

    private onGetChargingState(callback: CharacteristicGetCallback): void {
        callback(undefined, this.Characteristic.ChargingState.CHARGING);
    }

    private onGetStatusLowBattery(callback: CharacteristicGetCallback): void {
        callback(undefined, this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
    }
    
    private onGetBatteryLevel(callback: CharacteristicGetCallback): void {
        callback(undefined, 100);
    }

    public getUuid(): string {
        return this.accessory.UUID;
    }

    public onStatusEventReceived(_event: StatusEvent): Promise<void> {
        // TODO: Update the characteristics on the associated services.
        return Promise.resolve(undefined);
    }
}