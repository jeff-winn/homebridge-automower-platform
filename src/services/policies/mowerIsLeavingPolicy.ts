import { Activity, MowerState, State } from '../../clients/automowerClient';
import { Policy } from './policy';

/**
 * A policy which decides whether the mower is leaving the charging station.
 */
export interface MowerIsLeavingPolicy extends Policy {
    /**
     * Sets the state of the mower.
     * @param mower The mower state.
     */
    setMowerState(mower: MowerState): void;
}

/**
 * A policy which determines whether the mower is leaving the charging station based on the mower state.
 */
export class DeterministicMowerIsLeavingPolicy implements MowerIsLeavingPolicy {
    private state?: MowerState;

    public setMowerState(mower: MowerState): void {
        this.state = mower;
    }

    public check(): boolean {
        if (this.state === undefined) {
            return false;
        }

        return this.state.activity === Activity.LEAVING && this.state.state === State.IN_OPERATION;
    }
}