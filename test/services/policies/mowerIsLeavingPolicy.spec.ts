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

    // TODO: Clean this up.
    // it('should return false when the mower state is in operation', () => {
    //     target.setMowerState({
    //         activity: Activity.MOWING,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.MAIN_AREA,
    //         state: State.IN_OPERATION
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return true when the mower state is leaving but not in operation', () => {
    //     target.setMowerState({
    //         activity: Activity.LEAVING,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.MAIN_AREA,
    //         state: State.STOPPED
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return true when the mower state is leaving', () => {
    //     target.setMowerState({
    //         activity: Activity.LEAVING,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.MAIN_AREA,
    //         state: State.IN_OPERATION
    //     });

    //     const result = target.check();

    //     expect(result).toBeTruthy();
    // });
});