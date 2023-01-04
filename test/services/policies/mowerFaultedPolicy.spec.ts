import { Activity, Mode, State } from '../../../src/clients/automowerClient';
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

    it('should return false when mower state is unknown', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.UNKNOWN
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is not applicable', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.NOT_APPLICABLE
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is paused', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.PAUSED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is in operation', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is wait updating', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.WAIT_UPDATING
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is wait power up', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.WAIT_POWER_UP
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is restricted', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.RESTRICTED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is off', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.OFF
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is stopped', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.STOPPED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when mower state is error and error code is zero', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.ERROR
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower state is error and error code is non-zero', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 1,
            errorCodeTimestamp: 1,
            mode: Mode.UNKNOWN,
            state: State.ERROR
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when mower state is fatal error and error code is zero', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.FATAL_ERROR
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower state is fatal error and error code is non-zero', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 1,
            errorCodeTimestamp: 1,
            mode: Mode.UNKNOWN,
            state: State.FATAL_ERROR
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when mower state is error at power up and error code is zero', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.UNKNOWN,
            state: State.ERROR_AT_POWER_UP
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower state is error at power up and error code is non-zero', () => {
        target.setMowerState({
            activity: Activity.UNKNOWN,
            errorCode: 1,
            errorCodeTimestamp: 1,
            mode: Mode.UNKNOWN,
            state: State.ERROR_AT_POWER_UP
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });
});