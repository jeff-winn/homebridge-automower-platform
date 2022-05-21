import { Characteristic, Service } from 'homebridge';
import { InvalidStateError } from '../../errors/invalidStateError';

import { Activity, Battery, MowerState } from '../../model';
import { AbstractAccessoryService } from './abstractAccessoryService';

/**
 * A service which manages battery state.
 */
export interface BatteryService {
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
}

export class BatteryServiceImpl extends AbstractAccessoryService implements BatteryService {        
    private batteryService?: Service;
    private lowBattery?: Characteristic;
    private batteryLevel?: Characteristic;
    private chargingState?: Characteristic;

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
    }
    
    public setChargingState(state: MowerState) {  
        if (this.chargingState === undefined) {        
            throw new InvalidStateError('The service has not been initialized.');
        }

        if (state.activity === Activity.CHARGING) {
            this.chargingState.updateValue(this.Characteristic.ChargingState.CHARGING);
        } else {
            this.chargingState.updateValue(this.Characteristic.ChargingState.NOT_CHARGING);
        }
    }

    public setBatteryLevel(battery: Battery): void {
        if (this.batteryLevel === undefined || this.lowBattery === undefined) {
            throw new InvalidStateError('The service has not been initialized.');
        }

        this.batteryLevel.updateValue(battery.batteryPercent);          

        if (battery.batteryPercent <= 20) {
            this.lowBattery.updateValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        } else {
            this.lowBattery.updateValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }
    }
}