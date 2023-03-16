import { Activity, State } from '../../../src/model';
import { DeterministicMowerTamperedPolicy } from '../../../src/services/policies/mowerTamperedPolicy';

describe('DeterministicMowerTamperedPolicy', () => {
    let target: DeterministicMowerTamperedPolicy;

    beforeEach(() => {
        target = new DeterministicMowerTamperedPolicy();
    });

    it('should return false when mower state has not been set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the mower state is in operation', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the mower state is tampered', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.TAMPERED
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });
});