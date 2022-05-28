import { API, CharacteristicSetCallback, 
    HAPStatus, Logging, PlatformAccessory 
} from 'homebridge';

import { AutomowerContext } from '../../automowerAccessory';
import { Calendar, Planner, RestrictedReason } from '../../model';
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
     * Sets the calendar.
     * @param calendar The calendar.
     */
    setCalendar(calendar: Calendar): void;

    /**
     * Sets the planner.
     * @param planner The planner.
     */
    setPlanner(planner: Planner): void;
}

export class ScheduleServiceImpl extends AbstractSwitchService implements ScheduleService {
    private calendar?: Calendar;
    private planner?: Planner;

    public constructor(private controlService: MowerControlService, accessory: PlatformAccessory<AutomowerContext>, 
        api: API, log: Logging) {
        super('Schedule', accessory, api, log);
    }

    protected async onSet(on: boolean, callback: CharacteristicSetCallback): Promise<void> {
        if (on) {
            await this.controlService.resumeSchedule(this.accessory.context.mowerId);
        } else {
            await this.controlService.parkUntilFurtherNotice(this.accessory.context.mowerId);
        }
        
        callback(HAPStatus.SUCCESS);
    }

    public setCalendar(calendar: Calendar): void {    
        this.calendar = calendar;
        this.refreshCharacteristic();
    }

    public setPlanner(planner: Planner): void {
        this.planner = planner;
        this.refreshCharacteristic();
    }

    /**
     * Refreshes the characteristic value based on the deterministic calculation of whether the schedule is currently enabled.
     */
    protected refreshCharacteristic() {
        if (this.calendar === undefined || this.planner === undefined) {
            // Don't actually do anything if both pieces of information to make the decision are not available.
            return;
        }

        let anyDaysEnabled = false;        
        this.calendar.tasks.forEach(task => {
            if (task.sunday || task.monday || task.tuesday || task.wednesday || task.thursday || task.friday || task.saturday) {
                anyDaysEnabled = true;
            }
        });
 
        const newValue = anyDaysEnabled && this.planner.restrictedReason !== RestrictedReason.NOT_APPLICABLE;
        this.updateValue(newValue);
    }
}