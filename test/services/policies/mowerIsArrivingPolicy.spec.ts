import { Activity, State } from '../../../src/model';
import { DeterministicMowerIsArrivingPolicy } from '../../../src/services/policies/mowerIsArrivingPolicy';

describe('DeterministicMowerIsArrivingPolicy', () => {
    let target: DeterministicMowerIsArrivingPolicy;

    beforeEach(() => {
        target = new DeterministicMowerIsArrivingPolicy();
    });

    it('should return false when the mower state is not set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower is going home and in operation', () => {
        target.setMowerState({
            activity: Activity.GOING_HOME,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when mower is going home but paused', () => {
        target.setMowerState({
            activity: Activity.GOING_HOME,
            state: State.PAUSED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});