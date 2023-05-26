import { CharacteristicSetCallback, CharacteristicValue } from 'homebridge';
import { AutomowerMainSwitchImpl, MainSwitchImpl } from '../../src/services/mainSwitch';

export class MainSwitchImplSpy extends MainSwitchImpl {
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

export class AutomowerMainSwitchImplSpy extends AutomowerMainSwitchImpl {
    public unsafeOnSetAsync(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetAsync(on, callback);
    }

    public unsafeSetLastValue(on: boolean): void {
        this.setLastValue(on);
    }

    public unsafeOnSetCuttingHeightCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCuttingHeightCallback(value, callback);
    }

    public unsafeSetCuttingHeightAsync(value: number, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCuttingHeightAsync(value, callback);
    }

    public unsafeOnSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCallback(value, callback);
    }
}