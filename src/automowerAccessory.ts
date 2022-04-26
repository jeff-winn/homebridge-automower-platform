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
    private motionSensorService?: Service;

    private motionDetected?: Characteristic;

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
        this.initMotionSensorService();
    }
    
    protected initAccessoryInformation(): void {
        this.informationService = this.accessory.getService(this.Service.AccessoryInformation)!
            .setCharacteristic(this.Characteristic.Manufacturer, this.accessory.context.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.Name, this.accessory.displayName)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.serialNumber);    
    }    

    protected initMotionSensorService(): void {
        this.motionSensorService = this.accessory.getService(this.Service.MotionSensor);
        if (this.motionSensorService === undefined) {
            this.motionSensorService = this.accessory.addService(this.Service.MotionSensor, this.accessory.displayName);
        }

        this.motionDetected = this.motionSensorService.getCharacteristic(this.Characteristic.MotionDetected);
        if (this.motionDetected !== undefined) {
            this.motionDetected.on(CharacteristicEventTypes.GET, this.onGetMotionDetected.bind(this));
        }
    }
    
    private onGetMotionDetected(callback: CharacteristicGetCallback): void {
        callback(undefined, true);
    }

    private setMotionDetected(value: boolean): void {
        if (this.motionDetected === undefined || this.motionDetected.value === value) {
            return;
        }

        this.motionDetected.setValue(value);
    }

    public getUuid(): string {
        return this.accessory.UUID;
    }

    public onStatusEventReceived(_event: StatusEvent): Promise<void> {
        // TODO: Update the characteristics on the associated services.
        return Promise.resolve(undefined);
    }
}