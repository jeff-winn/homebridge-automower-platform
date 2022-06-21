import { Service } from 'homebridge';
import { MotionSensorServiceImpl } from '../../src/services/motionSensorService';

export class MotionSensorServiceImplSpy extends MotionSensorServiceImpl {
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
}