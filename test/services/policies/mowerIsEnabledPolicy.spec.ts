import { Activity, State } from '../../../src/model';
import { DeterministicMowerIsActivePolicy, DeterministicMowerIsScheduledPolicy } from '../../../src/services/policies/mowerIsEnabledPolicy';

describe('DeterministicMowerIsScheduledPolicy', () => {
    let target: DeterministicMowerIsScheduledPolicy;

    beforeEach(() => {
        target = new DeterministicMowerIsScheduledPolicy();
    });

    it('should not apply when the mower schedule is not set', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should not apply when the mower is not set to run continuously and in operation', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: false,
            runInFuture: true,
            runOnSchedule: true
        });

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should apply when the mower is in operation', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: true,
            runInFuture: true,
            runOnSchedule: true
        });

        const result = target.shouldApply();

        expect(result).toBeTruthy();
    });

    it('should return false when checked without a schedule', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        expect(target.check()).toBeFalsy();
    });

    it('should return true when run continuously and in operation', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: true,
            runInFuture: true,
            runOnSchedule: true
        });
        
        expect(target.check()).toBeTruthy();
    });

    it('should return true when run on schedule and run in future', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: false,
            runInFuture: true,
            runOnSchedule: true
        });
        
        expect(target.check()).toBeTruthy();
    });

    it('should return false when run on schedule and not run in future', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: false,
            runInFuture: false,
            runOnSchedule: true
        });
        
        expect(target.check()).toBeFalsy();
    });

    it('should return false when not run on schedule and run in future', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: false,
            runInFuture: true,
            runOnSchedule: false
        });
        
        expect(target.check()).toBeFalsy();
    });

    it('should return false when not run on schedule and not run in future', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            state: State.IN_OPERATION
        });

        target.setMowerSchedule({
            runContinuously: false,
            runInFuture: false,
            runOnSchedule: false
        });
        
        expect(target.check()).toBeFalsy();
    });
});

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

    it('should return true when mower state is leaving home', () => {
        target.setMowerState({
            activity: Activity.LEAVING_HOME,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when mower is parked', () => {
        target.setMowerState({
            activity: Activity.PARKED,
            state: State.OFF
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });
});