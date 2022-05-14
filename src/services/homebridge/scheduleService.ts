import { API, CharacteristicSetCallback, HAPStatus, PlatformAccessory } from 'homebridge';
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

    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        let status: HAPStatus | undefined = undefined;

        try {
            if (on) {
                await this.controlService.resumeSchedule(this.accessory.context.mowerId);
            } else {
                await this.controlService.parkUntilFurtherNotice(this.accessory.context.mowerId);
            }
        } catch (e) {
            status = HAPStatus.SERVICE_COMMUNICATION_FAILURE;
        } finally {
            callback(status);
        }
    }
}