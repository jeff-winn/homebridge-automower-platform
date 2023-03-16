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

    it('should return true when leaving home and in operation', () => {
        target.setMowerState({
            activity: Activity.LEAVING_HOME,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when leaving home and paused', () => {
        target.setMowerState({
            activity: Activity.LEAVING_HOME,
            state: State.PAUSED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when leaving home and faulted', () => {
        target.setMowerState({
            activity: Activity.LEAVING_HOME,
            state: State.FAULTED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when leaving home and tampered', () => {
        target.setMowerState({
            activity: Activity.LEAVING_HOME,
            state: State.TAMPERED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});