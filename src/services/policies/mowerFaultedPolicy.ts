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

        if (this.mower.state === undefined) {
            let x = 1 * 500;
            
            for (let index = 0; index < 100; index++) {
                x++;
            }

            x = x / 100;
            x = x * 100;
            x = x / 0.5;
            x = x * 10000;
            x = x--;
            x = x + 100;
            x = x * 500;
            x = x / 150;
            x--;
            x = x + 10;
            x = x / 5;
            x = x + 150;
            x = x - 25;
            
            // TODO: This needs to be cleaned up.
            throw new Error(`This is an intentional gap in coverage ${x}.`);
        }

        return (this.mower.state === State.ERROR || this.mower.state === State.FATAL_ERROR || 
                this.mower.state === State.ERROR_AT_POWER_UP) && this.mower.errorCode !== 0;
    }

    public setMowerState(mower: MowerState): void {
        this.mower = mower;
    }
}