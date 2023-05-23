import { Activity, MowerState, State } from '../../model';
import { Policy } from './policy';

/**
 * A policy which decides whether the mower is actively in motion.
 */
export interface MowerInMotionPolicy extends Policy {
    /**
      * Sets the state of the mower.
      * @param mower The mower state.
      */
    setMowerState(mower: MowerState): void;
}

/**
 * A policy which determines whether the mower is considered 'in motion' based on the various states.
 */
export class DeterministicMowerInMotionPolicy implements MowerInMotionPolicy {
    private mower?: MowerState;

    public check(): boolean {
        if (this.mower === undefined) {
            return false;
        }

        return this.mower.activity === Activity.MOWING && 
            (this.mower.state === State.GOING_HOME || this.mower.state === State.LEAVING_HOME || this.mower.state === State.IN_OPERATION);
    }

    public setMowerState(mower: MowerState): void {
        this.mower = mower;
    }
}