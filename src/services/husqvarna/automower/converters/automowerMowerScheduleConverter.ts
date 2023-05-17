import * as model from '../../../../model';

import { Calendar, Mower, Planner, RestrictedReason, Task } from '../../../../clients/automower/automowerClient';

/**
 * A mechanism which converts a {@link Mower} to a {@link model.MowerSchedule} instance.
 */
export interface AutomowerMowerScheduleConverter {
    /**
     * Converts the mower.
     * @param mower The mower to convert.
     */
    convertMower(mower: Mower): model.MowerSchedule;

    /**
     * Converts the planner and calendar.
     * @param planner The planner to convert.
     * @param calendar The calendar to convert.
     */
    convertPlannerAndCalendar(planner: Planner, calendar: Calendar): model.MowerSchedule;
}

export class AutomowerMowerScheduleConverterImpl implements AutomowerMowerScheduleConverter {
    public convertMower(mower: Mower): model.MowerSchedule {
        return this.convertPlannerAndCalendar(mower.attributes.planner, mower.attributes.calendar);
    }

    public convertPlannerAndCalendar(planner: Planner, calendar: Calendar): model.MowerSchedule {
        return {
            runContinuously: this.isSetToRunContinuously(calendar),
            runInFuture: this.isSetToRunInFuture(planner),
            runOnSchedule: this.isSetToRunOnASchedule(calendar)
        };
    }

    protected isSetToRunInFuture(planner: Planner): boolean {      
        return planner.nextStartTimestamp > 0 && planner.restrictedReason === RestrictedReason.WEEK_SCHEDULE;
    }

    protected isSetToRunOnASchedule(calendar: Calendar): boolean {
        let result = false;

        for (const task of calendar.tasks) {
            if (task !== undefined && this.isAnyDayOfWeekTask(task) && !this.isAlwaysRunTask(task)) {
                result = true;
            }
        }

        return result;
    }

    protected isSetToRunContinuously(calendar: Calendar): boolean {
        if (calendar.tasks.length !== 1) {
            // If set to run continuously, there will only be a single task.
            return false;
        }

        const task = calendar.tasks[0];
        if (task === undefined) {
            return false;
        }
        
        return this.isAlwaysRunTask(task);
    }

    private isAnyDayOfWeekTask(task: Task): boolean {
        return task.sunday || task.monday || task.tuesday || task.wednesday || task.thursday || task.friday || task.saturday;
    }

    private isAlwaysRunTask(task: Task): boolean {
        return task.start === 0 && task.duration === 1440 && 
            task.sunday && task.monday && task.tuesday && task.wednesday && task.thursday && task.friday && task.saturday;
    }
}