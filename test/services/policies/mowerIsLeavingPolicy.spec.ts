import { Activity, State } from '../../../src/model';
import { DeterministicMowerIsLeavingPolicy } from '../../../src/services/policies/mowerIsLeavingPolicy';

describe('DeterministicMowerIsLeavingPolicy', () => {
    let target: DeterministicMowerIsLeavingPolicy;

    beforeEach(() => {
        target = new DeterministicMowerIsLeavingPolicy();
    });

    it('should return false when the mower state is not set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower is leaving home', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.LEAVING_HOME
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

    it('should return false when mower is faulted', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.FAULTED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower is tampered', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.TAMPERED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});