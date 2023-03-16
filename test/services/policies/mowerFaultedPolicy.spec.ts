import { Activity, State } from '../../../src/model';
import { DeterministicMowerFaultedPolicy } from '../../../src/services/policies/mowerFaultedPolicy';

describe('DeterministicMowerFaultedPolicy', () => {
    let target: DeterministicMowerFaultedPolicy;

    beforeEach(() => {
        target = new DeterministicMowerFaultedPolicy();
    });

    it('should return false when mower state is not available', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower state is faulted', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.FAULTED
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when mower state is not faulted', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});