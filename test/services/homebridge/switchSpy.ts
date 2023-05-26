import { CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { AbstractSwitch } from '../../../src/services/homebridge/abstractSwitch';

export class SwitchSpy extends AbstractSwitch {
    public serviceName: string | undefined;
    public service: Service | undefined;
    public onSetCalled = false;

    public unsafeOnSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): void {
        this.onSetCallback(value, callback);
    }

    protected override onSetAsync(): Promise<void> {
        this.onSetCalled = true;
        return Promise.resolve(undefined);
    }

    protected override createService(displayName: string): Service {
        this.serviceName = displayName;
        if (this.service !== undefined) {
            return this.service;
        }

        return super.createService(displayName);
    }

    public unsafeCreateService(displayName: string): Service {
        return this.createService(displayName);
    }

    public unsafeUpdateValue(on: boolean): void {
        this.updateValue(on);
    }

    public unsafeSetLastValue(value: boolean): void {
        this.setLastValue(value);
    }
}