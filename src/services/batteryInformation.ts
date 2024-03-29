import { API, Characteristic, PlatformAccessory, Service } from 'homebridge';
import { Activity, Battery, MowerState, State } from '../model';
import { MowerContext } from '../mowerAccessory';
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
}

export class BatteryInformationImpl extends AbstractAccessoryService implements BatteryInformation {       
    private lastBattery?: Battery;
    private lastState?: MowerState;

    private batteryService?: Service;
    private lowBattery?: Characteristic;
    private batteryLevel?: Characteristic;
    private chargingState?: Characteristic;

    public constructor(accessory: PlatformAccessory<MowerContext>, api: API) {
        super(accessory, api);
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
    
    public setChargingState(state: MowerState): void {
        this.lastState = state;
        this.refreshChargingState();
    }

    private refreshChargingState(): void {
        if (this.chargingState === undefined) {        
            throw new Error('The service has not been initialized.');
        }

        if (this.lastState !== undefined && (this.lastState.state === State.CHARGING || 
            (this.lastState.activity === Activity.PARKED && this.lastBattery !== undefined && this.lastBattery.level < 100))) {
            this.chargingState.updateValue(this.Characteristic.ChargingState.CHARGING);
        } else {
            this.chargingState.updateValue(this.Characteristic.ChargingState.NOT_CHARGING);
        }
    }

    public setBatteryLevel(battery: Battery): void {
        if (this.batteryLevel === undefined || this.lowBattery === undefined) {
            throw new Error('The service has not been initialized.');
        }

        this.batteryLevel.updateValue(battery.level);

        if (battery.level <= 20) {
            this.lowBattery.updateValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW);
        } else {
            this.lowBattery.updateValue(this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL);
        }

        this.lastBattery = battery;
        this.refreshChargingState();
    }
}