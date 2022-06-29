import { Service } from 'homebridge';
import { MotionSensorImpl } from '../../src/services/motionSensor';

export class MotionSensorImplSpy extends MotionSensorImpl {
    public displayName?: string;
    public service?: Service;

    protected override createService(displayName: string): Service {
        this.displayName = displayName;
        if (this.service !== undefined) {
            return this.service;
        }

        return super.createService(displayName);
    }

    public unsafeSetLastMotionValue(value: boolean | undefined): void {
        this.setLastMotionValue(value);
    }

    public unsafeGetLastMotionValue(): boolean | undefined {
        return this.getLastMotionValue();
    }

    public unsafeSetLastFaultedValue(value: boolean | undefined): void {
        this.setLastFaultedValue(value);
    }

    public unsafeGetLastFaultedValue(): boolean | undefined {
        return this.getLastFaultedValue();
    }

    public unsafeGetLastTamperedValue(): boolean | undefined {
        return this.getLastTamperedValue();
    }

    public unsafeSetLastTamperedValue(value: boolean | undefined): void {
        this.setLastTamperedValue(value);
    }
}