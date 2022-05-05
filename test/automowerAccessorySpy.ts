import { Service } from 'homebridge';
import { AutomowerAccessory } from '../src/automowerAccessory';
import { Battery, Mower, MowerState } from '../src/model';

export class AutomowerAccessorySpy extends AutomowerAccessory {
    shouldRun = true;

    batteryServiceInitialized = false;
    accessoryInformationInitialized = false;

    protected override initAccessoryInformation(): void {
        this.accessoryInformationInitialized = true;

        if (this.shouldRun) {
            super.initAccessoryInformation();        
        }        
    }

    protected initBatteryService(): void {
        this.batteryServiceInitialized = true;

        if (this.shouldRun) {
            super.initBatteryService();
        }
    }

    unsafeSetBatteryLevel(battery: Battery): void {
        this.setBatteryLevel(battery);
    }

    unsafeSetChargingState(state: MowerState): void {
        this.setChargingState(state);
    }

    unsafeInitAccessoryInformation(): void {
        this.initAccessoryInformation();
    }

    unsafeInitBatteryService(): void {
        this.initBatteryService();
    }

    unsafeGetBatteryService(): Service {
        return this.getBatteryService();
    }
}