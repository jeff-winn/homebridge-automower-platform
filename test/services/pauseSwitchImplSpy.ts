import { CharacteristicSetCallback } from 'homebridge';
import { PauseSwitchImpl } from '../../src/services/pauseSwitch';

export class PauseSwitchImplSpy extends PauseSwitchImpl {
    public unsafeOnSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSet(on, callback);
    }

    public unsafeSetLastValue(on: boolean): void {
        this.setLastValue(on);
    }
}