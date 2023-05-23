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

    it('should return true when mower is going home', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.GOING_HOME
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when mower is paused', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.PAUSED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});