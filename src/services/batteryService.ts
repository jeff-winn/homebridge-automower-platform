import { 
    API,
    Characteristic, PlatformAccessory, Service 
} from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';

import { Activity, Battery, MowerState } from '../model';

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

export class BatteryServiceImpl implements BatteryService {
    private readonly Characteristic: typeof Characteristic;
    private readonly Service: typeof Service;
        
    private batteryService?: Service;
    private lowBattery?: Characteristic;
    private batteryLevel?: Characteristic;
    private chargingState?: Characteristic;

    public constructor(private accessory: PlatformAccessory<AutomowerContext>, private api: API) {
        this.Characteristic = this.api.hap.Characteristic;
        this.Service = this.api.hap.Service;
    }

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
            return;
        }

        if (state.activity === Activity.CHARGING) {
            this.chargingState.setValue(this.Characteristic.ChargingState.CHARGING);
        } else {
            this.chargingState.setValue(this.Characteristic.ChargingState.NOT_CHARGING);
        }
    }

    public setBatteryLevel(battery: Battery): void {
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
}