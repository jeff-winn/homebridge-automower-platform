import { Activity, MowerSchedule, MowerState, State } from '../../model';
import { SupportsMowerScheduleInformation } from '../mainSwitch';
import { OptionalPolicy } from './policy';

/**
 * A policy which decides whether the mower is enabled.
 */
export interface MowerIsEnabledPolicy extends OptionalPolicy {    
     /**
      * Sets the state of the mower.
      * @param state The mower state.
      */
     setMowerState(state: MowerState): void;
}

/**
 * An abstract {@link MowerIsEnabledPolicy} which supports base functionality indicating whether the policy should be applied.
 */
export abstract class AbstractMowerIsEnabledPolicy implements MowerIsEnabledPolicy {
    private mowerState?: MowerState;

    public shouldApply(): boolean {
        if (this.mowerState === undefined) {
            return false;
        }

        if (this.mowerState.state === State.PAUSED) {
            // The mower was paused, don't worry about updating anything.
            return false;
        }

        return this.shouldApplyCore(this.mowerState);
    }

    protected shouldApplyCore(mowerState: MowerState): boolean {
        return true;
    }

    public check(): boolean {
        if (this.mowerState === undefined) {
            return false;
        }

        return this.checkCore(this.mowerState);
    }

    protected abstract checkCore(mowerState: MowerState): boolean;

    public setMowerState(state: MowerState): void {
        this.mowerState = state;
    }

    protected isMowerMowing(mowerState: MowerState): boolean {
        return mowerState.activity === Activity.MOWING && (mowerState.state === State.IN_OPERATION || mowerState.state === State.LEAVING_HOME || 
            mowerState.state === State.GOING_HOME || mowerState.state === State.CHARGING);
    }
}

/**
 * A policy which determines whether the mower is scheduled based on mower information.
 */
export class DeterministicMowerIsScheduledPolicy extends AbstractMowerIsEnabledPolicy implements SupportsMowerScheduleInformation {
    private mowerSchedule?: MowerSchedule;

    public setMowerSchedule(schedule: MowerSchedule): void {
        this.mowerSchedule = schedule;
    }

    protected shouldApplyCore(mowerState: MowerState): boolean {
        if (this.mowerSchedule === undefined) {
            return false;
        }

        if (!this.mowerSchedule.runContinuously) {
            return mowerState.state !== State.IN_OPERATION;
        }

        return super.shouldApplyCore(mowerState);
    }

    protected checkCore(mowerState: MowerState): boolean {
        if (this.mowerSchedule === undefined) {
            return false;
        }

        return this.isMowerScheduledToRunLater(this.mowerSchedule) || this.isMowerMowing(mowerState);
    }

    protected isMowerScheduledToRunLater(mowerSchedule: MowerSchedule): boolean {
        return mowerSchedule.runOnSchedule && mowerSchedule.runInFuture;
    }
}

/**
 * A policy which determines whether the mower is active based on mower information.
 */
export class DeterministicMowerIsActivePolicy extends AbstractMowerIsEnabledPolicy {
    protected override checkCore(mowerState: MowerState): boolean {
        return this.isMowerMowing(mowerState);
    }
}