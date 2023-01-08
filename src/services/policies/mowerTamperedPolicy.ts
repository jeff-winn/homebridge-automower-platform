import { MowerState, State } from '../../clients/automower/automowerClient';
import { Policy } from './policy';

/**
 * A policy which decides whether the mower has tampered with (not necessarily by a human).
 */
export interface MowerTamperedPolicy extends Policy {    
    /**
      * Sets the state of the mower.
      * @param mower The mower state.
      */
    setMowerState(mower: MowerState): void;
}

/**
 * A policy which determines whether the mower is considered 'tampered' with based on the various states allowed.
 */
export class DeterministicMowerTamperedPolicy implements MowerTamperedPolicy {
    private mower?: MowerState;

    public check(): boolean {
        if (this.mower === undefined) {
            return false;
        }

        return this.mower.state === State.STOPPED && this.mower.errorCode !== 0;
    }

    public setMowerState(mower: MowerState): void {
        this.mower = mower;
    }
}