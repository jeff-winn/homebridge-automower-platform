import { Activity, Mode, MowerState, State } from '../../../src/clients/automowerClient';
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

    it('should return false when mower state is unknown', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.UNKNOWN, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is not applicable', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.NOT_APPLICABLE, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is paused', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.PAUSED, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is unknown', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is wait updating', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.WAIT_UPDATING, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is wait power up', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.WAIT_POWER_UP, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is restricted', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.RESTRICTED, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is off', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.OFF, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is error', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.ERROR, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is fatal error', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.FATAL_ERROR, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is error at power up', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.ERROR_AT_POWER_UP, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when stopped and error code is non-zero', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.STOPPED, 
            errorCode: 18,
            errorCodeTimestamp: 1655819118000            
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when stopped and error code is zero', () => {
        const state: MowerState = {
            activity: Activity.UNKNOWN,
            mode: Mode.MAIN_AREA,
            state: State.STOPPED, 
            errorCode: 0,
            errorCodeTimestamp: 0
        };

        target.setMowerState(state);

        const result = target.check();

        expect(result).toBeFalsy();
    });
});