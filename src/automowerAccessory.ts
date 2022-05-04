import { 
    API, Characteristic, Logging, PlatformAccessory, Service, UnknownContext 
} from 'homebridge';

import { StatusEvent } from './events';
import { Activity, Battery, Mower, MowerState } from './model';

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

    constructor(private accessory: PlatformAccessory<AutomowerContext>, private api: API, private log: Logging) {        
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }

    /**
     * Gets the underlying platform accessory.
     * @returns The {@link PlatformAccessory} instance.
     */
    public getUnderlyingAccessory(): PlatformAccessory<AutomowerContext> {
        return this.accessory;
    }

    /**
     * Initializes the accessory information.
     * @param data The mower data.
     */
    public init(data: Mower): void {
        this.initAccessoryInformation();
        this.initBatteryService(data);
    }
    
    protected initAccessoryInformation(): void {
        this.informationService = this.accessory.getService(this.Service.AccessoryInformation)!
            .setCharacteristic(this.Characteristic.Manufacturer, this.accessory.context.manufacturer)
            .setCharacteristic(this.Characteristic.Model, this.accessory.context.model)
            .setCharacteristic(this.Characteristic.Name, this.accessory.displayName)
            .setCharacteristic(this.Characteristic.SerialNumber, this.accessory.context.serialNumber);    
    }
    
    protected getBatteryService(): Service {
        let result = this.accessory.getService(this.Service.Battery);
        if (result === undefined) {
            result = this.accessory.addService(this.Service.Battery);
        }

        return result;
    }

    protected initBatteryService(data: Mower): void {
        this.batteryService = this.getBatteryService();

        this.lowBattery = this.batteryService.getCharacteristic(this.Characteristic.StatusLowBattery);
        this.batteryLevel = this.batteryService.getCharacteristic(this.Characteristic.BatteryLevel);
        this.chargingState = this.batteryService.getCharacteristic(this.Characteristic.ChargingState);

        this.setBatteryLevel(data.attributes.battery);
        this.setChargingState(data.attributes.mower);
    }

    private setChargingState(state: MowerState) {  
        if (this.chargingState === undefined) {        
            return;
        }

        if (state.activity === Activity.CHARGING) {
            this.chargingState.setValue(this.Characteristic.ChargingState.CHARGING);
        } else {
            this.chargingState.setValue(this.Characteristic.ChargingState.NOT_CHARGING);
        }
    }

    private setBatteryLevel(battery: Battery): void {
        if (this.batteryLevel !== undefined) {
            this.batteryLevel.setValue(battery.batteryPercent);  
        }
        
        if (this.lowBattery !== undefined) {
            if (battery.batteryPercent <= 20) {
                this.lowBattery.setValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
            } else {
                this.lowBattery.setValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
            }
        }
    }

    public getId(): string {
        return this.accessory.context.mowerId;
    }

    public onStatusEventReceived(event: StatusEvent): void {
        this.setBatteryLevel(event.attributes.battery);
        this.setChargingState(event.attributes.mower);
    }
}