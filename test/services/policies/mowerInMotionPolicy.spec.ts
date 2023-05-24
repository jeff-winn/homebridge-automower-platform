import { Activity, State } from '../../../src/model';
import { DeterministicMowerInMotionPolicy } from '../../../src/services/policies/mowerInMotionPolicy';

describe('DeterministicMowerInMotionPolicy', () => {
    let target: DeterministicMowerInMotionPolicy;

    beforeEach(() => {
        target = new DeterministicMowerInMotionPolicy();
    });

    it('should return false when the mower state has not been set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower is going home to park', () => {
        target.setMowerState({
            activity: Activity.PARKED,
            state: State.GOING_HOME
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when mower is going home to charge', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.GOING_HOME
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when mower is leaving home', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.LEAVING_HOME
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when mower is mowing', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });
});