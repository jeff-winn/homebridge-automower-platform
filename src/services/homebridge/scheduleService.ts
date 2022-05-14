import { API, CharacteristicSetCallback, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../../automowerAccessory';

import { MowerControlService } from '../automower/mowerControlService';
import { AbstractSwitchService } from './abstractSwitchService';

/**
 * A service which manages the schedule enablement of an automower.
 */
export interface ScheduleService {
    /**
     * Initializes the service.
     * @param prepend true to prepend the display name, otherwise false.
     */
    init(prepend: boolean): void;
}

export class ScheduleServiceImpl extends AbstractSwitchService implements ScheduleService {    
    public constructor(private controlService: MowerControlService, accessory: PlatformAccessory<AutomowerContext>, api: API) {
        super('Schedule', accessory, api);
    }

    protected onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        callback();

        return Promise.resolve(undefined);
    }
}