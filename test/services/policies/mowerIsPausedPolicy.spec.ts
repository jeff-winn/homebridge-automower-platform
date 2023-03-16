import { Activity, State } from '../../../src/model';
import { DeterministicMowerIsPausedPolicy } from '../../../src/services/policies/mowerIsPausedPolicy';

describe('DeterministicMowerIsPausedPolicy', () => {
    let target: DeterministicMowerIsPausedPolicy;

    beforeEach(() => {
        target = new DeterministicMowerIsPausedPolicy();
    });

    it('should return false when the mower state is not set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when the mower is in operation', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the mower is paused', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.PAUSED
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });
});