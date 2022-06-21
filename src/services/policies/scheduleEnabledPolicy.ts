import { InvalidStateError } from '../../errors/invalidStateError';
import { Calendar, MowerState, Planner, RestrictedReason, State } from '../../model';
import { OptionalPolicy } from './policy';

/**
 * A policy which decides whether the mower schedule is enabled.
 */
export interface ScheduleEnabledPolicy extends OptionalPolicy {   
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
 
     /**
      * Sets the state of the mower.
      * @param state The mower state.
      */
     setMowerState(state: MowerState): void;
}

/**
 * A policy which determines whether the mower schedule is enabled based on mower information.
 */
export class DeterministicScheduleEnabledPolicy implements ScheduleEnabledPolicy {
    private calendar?: Calendar;
    private planner?: Planner;
    private mowerState?: MowerState;

    public shouldApply(): boolean {
        return this.calendar !== undefined && this.planner !== undefined &&
            (this.mowerState === undefined || this.mowerState.state !== State.IN_OPERATION);
    }

    public check(): boolean {
        if (this.calendar === undefined || this.planner === undefined) {
            throw new InvalidStateError('The calendar and planner are both required.');
        }
        
        // Checks whether any days have been enabled on any of the schedules.
        let anyDaysEnabled = false;        
        this.calendar.tasks.forEach(task => {
            if (task.sunday || task.monday || task.tuesday || task.wednesday || task.thursday || task.friday || task.saturday) {
                anyDaysEnabled = true;
            }
        });

        // Checks whether the mower is waiting to run in the future (seen when in charge station).
        const isFutureScheduled = this.planner.nextStartTimestamp > 0 && 
            this.planner.restrictedReason === RestrictedReason.WEEK_SCHEDULE;        

        return anyDaysEnabled && isFutureScheduled;
    }
    
    public setCalendar(calendar: Calendar): void {
        this.calendar = calendar;
    }

    public setPlanner(planner: Planner): void {
        this.planner = planner;
    }
    
    public setMowerState(state: MowerState): void {
        this.mowerState = state;
    }    
}