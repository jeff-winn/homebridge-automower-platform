import * as model from '../../../../model';

import { Mower, RestrictedReason } from '../../../../clients/automower/automowerClient';

/**
 * A mechanism which converts a {@link Mower} to a {@link model.MowerSchedule} instance.
 */
export interface AutomowerMowerScheduleConverter {
    /**
     * Converts the item.
     * @param mower The mower service item.
     */
    convert(mower: Mower): model.MowerSchedule;
}

export class AutomowerMowerScheduleConverterImpl implements AutomowerMowerScheduleConverter {
    public convert(mower: Mower): model.MowerSchedule {
        return {
            runContinuously: this.isSetToRunContinuously(mower),
            runInFuture: this.isSetToRunInFuture(mower),
            runOnSchedule: this.isSetToRunOnASchedule(mower)
        };
    }

    protected isSetToRunInFuture(mower: Mower): boolean {      
        return mower.attributes.planner.nextStartTimestamp > 0 && mower.attributes.planner.restrictedReason === RestrictedReason.WEEK_SCHEDULE;
    }

    protected isSetToRunOnASchedule(mower: Mower): boolean {
        let result = false;

        for (const task of mower.attributes.calendar.tasks) {
            if (task !== undefined && (task.sunday || task.monday || task.tuesday || task.wednesday || 
                task.thursday || task.friday || task.saturday)) {
                result = true;
            }
        }

        return result;
    }

    protected isSetToRunContinuously(mower: Mower): boolean {
        const task = mower.attributes.calendar.tasks[0];
        if (task === undefined) {
            return false;
        }
        
        return mower.attributes.planner.nextStartTimestamp === 0 && task.start === 0 && task.duration === 1440 && 
            task.sunday && task.monday && task.tuesday && task.wednesday && task.thursday && task.friday && task.saturday;
    }
}