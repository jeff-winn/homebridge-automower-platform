import { Activity, Mode, State } from '../../../src/model';
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

    it('should return false when the mower state is not paused', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the mower state is paused', () => {
        target.setMowerState({
            activity: Activity.NOT_APPLICABLE,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.PAUSED
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });
});