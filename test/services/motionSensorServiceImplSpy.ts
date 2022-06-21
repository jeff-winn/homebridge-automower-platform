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

    public unsafeSetLastValue(value: boolean | undefined): void {
        this.setLastValue(value);
    }

    public unsafeGetLastValue(): boolean | undefined {
        return this.getLastValue();
    }
}