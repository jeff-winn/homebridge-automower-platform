import { Activity, State } from '../../../src/model';
import { DeterministicMowerIsActivePolicy } from '../../../src/services/policies/mowerIsEnabledPolicy';

describe('DeterministicMowerIsActivePolicy', () => {
    let target: DeterministicMowerIsActivePolicy;

    beforeEach(() => {
        target = new DeterministicMowerIsActivePolicy();
    });

    it('should not apply when the mower state is not set', () => {
        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });
    
    it('should not apply when the mower is paused', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.PAUSED
        });

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should always apply by default', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.shouldApply();

        expect(result).toBeTruthy();
    });

    it('should return false when mower state is not set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower state is mowing', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when mower state is disabled', () => {
        target.setMowerState({
            activity: Activity.PARKED,
            state: State.READY
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});