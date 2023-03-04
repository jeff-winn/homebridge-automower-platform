import { MowerState, State } from '../../model';
import { OptionalPolicy } from './policy';

/**
 * A policy which decides whether the mower schedule is enabled.
 */
export interface ScheduleEnabledPolicy extends OptionalPolicy {    
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
    private mowerState?: MowerState;

    public shouldApply(): boolean {
        if (this.mowerState === undefined) {
            return false;
        }

        if (this.mowerState.state === State.PAUSED) {
            // The mower was paused, don't worry about updating anything.
            return false;
        }

        // TODO: Clean this up.
        // if (this.calendar === undefined || this.planner === undefined || this.mowerState === undefined) {
        //     return false;
        // }

        // if (this.mowerState.state === State.PAUSED) {
        //     // The mower was paused, don't worry about updating anything.
        //     return false;
        // }

        // if (!this.isSetToRunContinuously()) {
        //     return this.mowerState.state !== State.IN_OPERATION;
        // }

        return true;
    }

    public check(): boolean {            
        if (this.mowerState === undefined) {
            return false;
        }

        return this.mowerState.enabled;

        // TODO: Clean this up.
        // if (this.isSetToRunContinuously()) {
        //     // The mower is set to run continuously, which means the switch is now being used to control whether the
        //     // mower is actually mowing the yard rather than whether a schedule is enabled.
        //     return this.isMowerActive();
        // } else {
        //     // Checks whether any days have been enabled on any of the schedules.
        //     const anyDaysEnabled = this.isSetToRunOnASchedule();            

        //     // Checks whether the mower is waiting to run in the future (seen when in charge station).
        //     const isFutureScheduled = this.isFutureScheduled();       

        //     return anyDaysEnabled && isFutureScheduled;
        // }
    }

    // protected isMowerActive(): boolean {
    //     return this.mowerState!.state === State.IN_OPERATION;
    // }

    // protected isFutureScheduled(): boolean {      
    //     return this.planner!.nextStartTimestamp > 0 && this.planner!.restrictedReason === RestrictedReason.WEEK_SCHEDULE;
    // }

    // protected isSetToRunOnASchedule(): boolean {
    //     let result = false;

    //     for (const task of this.calendar!.tasks) {
    //         if (task !== undefined && (task.sunday || task.monday || task.tuesday || task.wednesday || 
    //             task.thursday || task.friday || task.saturday)) {
    //             result = true;
    //         }
    //     }

    //     return result;
    // }

    // protected isSetToRunContinuously(): boolean {
    //     const task = this.calendar!.tasks[0];
    //     if (task === undefined) {
    //         return false;
    //     }
        
    //     return this.planner!.nextStartTimestamp === 0 && task.start === 0 && task.duration === 1440 && 
    //         task.sunday && task.monday && task.tuesday && task.wednesday && task.thursday && task.friday && task.saturday;
    // }
    
    public setMowerState(state: MowerState): void {
        this.mowerState = state;
    }    
}