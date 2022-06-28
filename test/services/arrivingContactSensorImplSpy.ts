import { Service } from 'homebridge';
import { ArrivingContactSensorImpl } from '../../src/services/arrivingContactSensor';

export class ArrivingContactSensorImplSpy extends ArrivingContactSensorImpl {
    public displayName?: string;
    public service?: Service;

    protected override createService(displayName: string): Service {
        this.displayName = displayName;
        if (this.service !== undefined) {
            return this.service;
        }

        return super.createService(displayName);
    }

    public unsafeGetLastValue(): boolean | undefined {
        return this.getLastValue();
    }

    public unsafeSetLastValue(value: boolean | undefined): void {
        this.setLastValue(value);
    }
}