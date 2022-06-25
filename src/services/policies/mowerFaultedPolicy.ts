import { MowerState, State } from '../../model';
import { Policy } from './policy';

/**
 * A policy which decides whether the mower has faulted.
 */
export interface MowerFaultedPolicy extends Policy {    
    /**
      * Sets the state of the mower.
      * @param mower The mower state.
      */
    setMowerState(mower: MowerState): void;
}

/**
 * A policy which determines whether the mower is considered 'faulted' based on the various states allowed.
 */
export class DeterministicMowerFaultedPolicy implements MowerFaultedPolicy {
    private mower?: MowerState;

    public check(): boolean {
        if (this.mower === undefined) {
            return false;
        }


        return (this.mower.state === State.ERROR || this.mower.state === State.FATAL_ERROR || 
                this.mower.state === State.ERROR_AT_POWER_UP) && this.mower.errorCode !== 0;
    }

    public setMowerState(mower: MowerState): void {
        this.mower = mower;
    }
}