import { MowerState, State } from '../../clients/automowerClient';
import { Policy } from './policy';

/**
 * A policy which determines whether the mower is paused.
 */
export interface MowerIsPausedPolicy extends Policy {
    /**
      * Sets the state of the mower.
      * @param mower The mower state.
      */
     setMowerState(mower: MowerState): void;
}

/**
 * A policy which determines whether the mower is considered 'in motion' based on the various states.
 */
export class DeterministicMowerIsPausedPolicy implements MowerIsPausedPolicy {
    private mower?: MowerState;

    public check(): boolean {
        if (this.mower === undefined) {
            return false;
        }

        return this.mower.state === State.PAUSED;
    }

    public setMowerState(mower: MowerState): void {
        this.mower = mower;
    }
}