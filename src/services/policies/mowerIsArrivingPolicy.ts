import { MowerState, State } from '../../model';
import { Policy } from './policy';

/**
 * A policy which decides whether the mower is arriving at the charging station.
 */
export interface MowerIsArrivingPolicy extends Policy {
    /**
     * Sets the state of the mower.
     * @param mower The mower state.
     */
    setMowerState(mower: MowerState): void;
}

/**
 * A policy which determines whether the mower is arriving at the charging station based on the mower state.
 */
export class DeterministicMowerIsArrivingPolicy implements MowerIsArrivingPolicy {
    private state?: MowerState;

    public setMowerState(mower: MowerState): void {
        this.state = mower;
    }

    public check(): boolean {
        if (this.state === undefined) {
            return false;
        }

        return this.state.state === State.GOING_HOME;
    }
}