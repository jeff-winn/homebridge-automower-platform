import { CharacteristicSetCallback, CharacteristicValue } from 'homebridge';
import { PauseSwitchImpl } from '../../src/services/pauseSwitch';

export class PauseSwitchImplSpy extends PauseSwitchImpl {
    public unsafeOnSetAsync(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetAsync(on, callback);
    }

    public unsafeSetLastValue(on: boolean): void {
        this.setLastValue(on);
    }

    public unsafeOnSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCallback(value, callback);
    }
}