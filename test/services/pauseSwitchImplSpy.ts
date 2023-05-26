import { CharacteristicSetCallback, CharacteristicValue } from 'homebridge';
import { PauseSwitchImpl } from '../../src/services/pauseSwitch';

export class PauseSwitchImplSpy extends PauseSwitchImpl {    
    public unsafeSetLastValue(on: boolean): void {
        this.setLastValue(on);
    }

    public unsafeOnSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCallback(value, callback);
    }

    public unsafeOnSetCallbackAsync(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCallbackAsync(on, callback);
    }
}