import { CharacteristicSetCallback, CharacteristicValue } from 'homebridge';
import { AutomowerMainSwitchImpl, MainSwitchImpl } from '../../src/services/mainSwitch';

export class MainSwitchImplSpy extends MainSwitchImpl {
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

export class AutomowerMainSwitchImplSpy extends AutomowerMainSwitchImpl {
    public unsafeSetLastValue(on: boolean): void {
        this.setLastValue(on);
    }

    public unsafeOnSetCuttingHeightCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCuttingHeightCallback(value, callback);
    }

    public unsafeSetCuttingHeightCallbackAsync(value: number, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCuttingHeightCallbackAsync(value, callback);
    }

    public unsafeOnSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCallback(value, callback);
    }

    public unsafeOnSetCallbackAsync(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCallbackAsync(on, callback);
    }
}