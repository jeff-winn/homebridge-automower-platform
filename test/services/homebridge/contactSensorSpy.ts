import { Service } from 'homebridge';
import { AbstractContactSensor } from '../../../src/services/homebridge/abstractContactSensor';

export class ContactSensorSpy extends AbstractContactSensor {
    public unsafeCreateService(displayName: string): Service {
        return this.createService(displayName);
    }

    public unsafeRefreshCharacteristic(): void {
        this.refreshCharacteristic();
    }
}