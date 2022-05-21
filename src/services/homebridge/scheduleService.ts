import { API, CharacteristicSetCallback, 
    HAPStatus, PlatformAccessory 
} from 'homebridge';

import { AutomowerContext } from '../../automowerAccessory';
import { InvalidStateError } from '../../errors/invalidStateError';
import { Planner } from '../../model';
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

    /**
     * Sets the schedule state.
     * @param planner The planner.
     */
    setScheduleState(planner: Planner): void;
}

export class ScheduleServiceImpl extends AbstractSwitchService implements ScheduleService {
    public constructor(private controlService: MowerControlService, accessory: PlatformAccessory<AutomowerContext>, api: API) {
        super('Schedule', accessory, api);
    }

    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        if (on) {
            await this.controlService.resumeSchedule(this.accessory.context.mowerId);
        } else {
            await this.controlService.parkUntilFurtherNotice(this.accessory.context.mowerId);
        }
        
        callback(HAPStatus.SUCCESS);
    }

    public setScheduleState(planner: Planner): void {
        if (this.on === undefined) {
            throw new InvalidStateError('The service has not been initialized.');            
        }

        this.on.updateValue(planner.nextStartTimestamp > 0);
    }
}