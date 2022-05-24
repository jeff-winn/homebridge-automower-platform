import { CharacteristicSetCallback } from 'homebridge';
import { ScheduleServiceImpl } from '../../../src/services/homebridge/scheduleService';

export class ScheduleServiceImplSpy extends ScheduleServiceImpl {
    public unsafeOnSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        return this.onSet(on, callback);
    }
}