import { Service } from 'homebridge';
import { LeavingContactSensorImpl } from '../../src/services/leavingSensor';

export class LeavingContactSensorImplSpy extends LeavingContactSensorImpl {
    public displayName?: string;
    public service?: Service;

    protected override createService(displayName: string): Service {
        this.displayName = displayName;
        if (this.service !== undefined) {
            return this.service;
        }

        return super.createService(displayName);
    }

    public unsafeGetLastValue(): number | undefined {
        return this.getLastValue();
    }

    public unsafeSetLastValue(value: number | undefined): void {
        this.setLastValue(value);
    }
}