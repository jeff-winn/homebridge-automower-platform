import { CharacteristicSetCallback } from 'homebridge';
import { AbstractSwitchService } from '../../../src/services/homebridge/abstractSwitchService';

export class SwitchServiceSpy extends AbstractSwitchService {
    protected onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return Promise.resolve(undefined);
    }
}