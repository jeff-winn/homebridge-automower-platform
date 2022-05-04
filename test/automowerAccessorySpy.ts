import { Service } from 'homebridge';
import { AutomowerAccessory } from '../src/automowerAccessory';
import { Mower } from '../src/model';

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

    protected initBatteryService(data: Mower): void {
        this.batteryServiceInitialized = true;

        if (this.shouldRun) {
            super.initBatteryService(data);
        }
    }

    unsafeInitAccessoryInformation(): void {
        this.initAccessoryInformation();
    }

    unsafeInitBatteryService(data: Mower): void {
        this.initBatteryService(data);
    }

    unsafeGetBatteryService(): Service {
        return this.getBatteryService();
    }
}