import { CharacteristicSetCallback } from 'homebridge';
import { ScheduleSwitchImpl } from '../../src/services/scheduleSwitch';

export class ScheduleSwitchImplSpy extends ScheduleSwitchImpl {
    public unsafeOnSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCallback(on, callback);
    }

    public unsafeSetLastValue(on: boolean): void {
        this.setLastValue(on);
    }

    public unsafeSetCuttingHeight(value: number, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCuttingHeightCallback(value, callback);
    }
}