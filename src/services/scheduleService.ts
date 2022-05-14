import { API, CharacteristicSetCallback, PlatformAccessory } from 'homebridge';
import { AutomowerContext } from '../automowerAccessory';

import { MowerControlService } from './automower/mowerControlService';
import { SwitchService } from './switchService';

/**
 * A service which manages the schedule enablement of an automower.
 */
export interface ScheduleService {
    /**
     * Initializes the service.
     */
    init(): void;
}

export class ScheduleServiceImpl extends SwitchService implements ScheduleService {    
    public constructor(private controlService: MowerControlService, accessory: PlatformAccessory<AutomowerContext>, api: API) {
        super('Schedule', accessory, api);
    }

    protected onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        callback();

        return Promise.resolve(undefined);
    }
}