import { Activity, Mode, MowerState, State } from '../../../src/model';
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

    it('should return false when the mower activity is charging', () => {
        const state: MowerState = {
            activity: Activity.CHARGING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the mower activity is going home', () => {
        const state: MowerState = {
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when the mower activity is leaving', () => {
        const state: MowerState = {
            activity: Activity.LEAVING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when the mower activity is going home', () => {
        const state: MowerState = {
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when the mower activity is not applicable', () => {
        const state: MowerState = {
            activity: Activity.NOT_APPLICABLE,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when the mower activity is parked in charge station', () => {
        const state: MowerState = {
            activity: Activity.PARKED_IN_CS,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when the mower activity is stopped in garden', () => {
        const state: MowerState = {
            activity: Activity.STOPPED_IN_GARDEN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when the mower activity is unknown', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });
});