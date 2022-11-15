import { Characteristic, Service } from 'homebridge';

import { Activity, Battery, MowerState, Statistics } from '../model';
import { AbstractAccessoryService } from './homebridge/abstractAccessoryService';

/**
 * A mechanism which manages the battery state.
 */
export interface BatteryInformation {
    /**
     * Initializes the service.
     */
    init(): void;

    /**
     * Sets the battery level.
     * @param battery The battery information.
     */
    setBatteryLevel(battery: Battery): void;    

    /**
     * Sets the charging state.
     * @param state The state of the mower.
     */
    setChargingState(state: MowerState): void;

    /**
     * Sets the charging cycles.
     * @param statistics The statistics of the mower.
     */
    setChargingCycles(statistics: Statistics): void;
}

export class BatteryInformationImpl extends AbstractAccessoryService implements BatteryInformation {        
    private batteryService?: Service;
    private lowBattery?: Characteristic;
    private batteryLevel?: Characteristic;
    private chargingState?: Characteristic;
    private chargingCycles?: Characteristic;

    public getUnderlyingService(): Service | undefined {
        return this.batteryService;
    }

    public init(): void {
        this.batteryService = this.accessory.getService(this.Service.Battery);
        if (this.batteryService === undefined) {
            this.batteryService = this.accessory.addService(this.Service.Battery);
        }

        this.lowBattery = this.batteryService.getCharacteristic(this.Characteristic.StatusLowBattery);
        this.batteryLevel = this.batteryService.getCharacteristic(this.Characteristic.BatteryLevel);
        this.chargingState = this.batteryService.getCharacteristic(this.Characteristic.ChargingState);

        this.chargingCycles = this.batteryService.getCharacteristic(this.CustomCharacteristic.ChargingCycles);
        if (this.chargingCycles === undefined) {
            this.chargingCycles = this.batteryService.addCharacteristic(this.CustomCharacteristic.ChargingCycles);
        }
    }
    
    public setChargingState(state: MowerState) {  
        if (this.chargingState === undefined) {        
            throw new Error('The service has not been initialized.');
        }

        if (state.activity === Activity.CHARGING) {
            this.chargingState.updateValue(this.Characteristic.ChargingState.CHARGING);
        } else {
            this.chargingState.updateValue(this.Characteristic.ChargingState.NOT_CHARGING);
        }
    }

    public setBatteryLevel(battery: Battery): void {
        if (this.batteryLevel === undefined || this.lowBattery === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.batteryLevel.updateValue(battery.batteryPercent);          

        if (battery.batteryPercent <= 20) {
            this.lowBattery.updateValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        } else {
            this.lowBattery.updateValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }
    }

    public setChargingCycles(statistics: Statistics): void {
        if (this.chargingCycles === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.chargingCycles.updateValue(statistics.numberOfChargingCycles);
    }
}