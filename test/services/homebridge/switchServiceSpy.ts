import { CharacteristicSetCallback, CharacteristicValue, Service } from 'homebridge';
import { AbstractSwitchService } from '../../../src/services/homebridge/abstractSwitchService';

export class SwitchServiceSpy extends AbstractSwitchService {
    public serviceName: string | undefined;
    public service: Service | undefined;
    public onSetCalled = false;

    public unsafeOnSetCallback(value: CharacteristicValue, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSetCallback(value, callback);
    }

    protected onSet(): Promise<void> {
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
}