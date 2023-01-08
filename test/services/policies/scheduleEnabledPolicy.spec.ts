import { Activity, Calendar, Mode, RestrictedReason, State } from '../../../src/clients/automower/automowerClient';
import { DeterministicScheduleEnabledPolicy } from '../../../src/services/policies/scheduleEnabledPolicy';

describe('DeterministicScheduleEnabledPolicy', () => {
    let target: DeterministicScheduleEnabledPolicy;

    beforeEach(() => {
        target = new DeterministicScheduleEnabledPolicy();
    });

    it('should not apply the policy when the mower is paused', () => {
        target.setMowerState({
            activity: Activity.NOT_APPLICABLE,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.PAUSED
        });

        target.setCalendar({
            tasks: [ ]
        });
        
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
        });  

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should apply the policy when the mower is set to run continously', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        });

        target.setCalendar({
            tasks: [
                {
                    start: 0,
                    duration: 1440, // 24 hours
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true
                }
            ]
        });
        
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
        });  

        const result = target.shouldApply();

        expect(result).toBeTruthy();
    });

    it('should return false when mower is not in operation and scheduled to run continuously', () => {
        target.setMowerState({
            activity: Activity.PARKED_IN_CS,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.HOME,
            state: State.NOT_APPLICABLE
        });

        target.setCalendar({
            tasks: [
                {
                    start: 0,
                    duration: 1440, // 24 hours
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true
                }
            ]
        });
        
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { }            
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when mower is in operation and scheduled to run continuously', () => {
        target.setMowerState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        });

        target.setCalendar({
            tasks: [
                {
                    start: 0,
                    duration: 1440, // 24 hours
                    sunday: true,
                    monday: true,
                    tuesday: true,
                    wednesday: true,
                    thursday: true,
                    friday: true,
                    saturday: true
                }
            ]
        });
        
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { }            
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when the calendar is defined with an empty value', () => {
        target.setCalendar({
            tasks: [
                undefined!
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
        });

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

    it('should return false when the mower state is undefined', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });
        
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
        });

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should return false when the mower is in operation and not set to run continuously', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });
        
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
        });

        target.setMowerState({
            activity: Activity.MOWING,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        });

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should return false when nothing is set', () => {
        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should return false when calendar is not set', () => {
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
        });

        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });

    it('should return false when planner is not set', () => {
        const calendar: Calendar = {
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        };

        target.setCalendar(calendar);
        
        const result = target.shouldApply();

        expect(result).toBeFalsy();
    });
    
    it('should return false when calendar is not scheduled to start', () => {
        const calendar: Calendar = {
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        };

        target.setCalendar(calendar);
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when the planner has park overridden', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: true,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.PARK_OVERRIDE
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the only task is scheduled to start', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: true,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 1653984000000,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return true when one of the calendar tasks is scheduled to start', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                },
                {
                    start: 1,
                    duration: 1,
                    sunday: true,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 1653984000000,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });

    it('should return false when calendar is not scheduled to start', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });

        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.WEEK_SCHEDULE
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should throw an error when calendar is undefined', () => {
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.NONE
        });

        expect(() => target.check()).toThrowError();
    });

    it('should throw an error when planner is undefined', () => {
        target.setCalendar({
            tasks: [
                {
                    start: 1,
                    duration: 1,
                    sunday: false,
                    monday: false,
                    tuesday: false,
                    wednesday: false,
                    thursday: false,
                    friday: false,
                    saturday: false
                }
            ]
        });
        
        expect(() => target.check()).toThrowError();
    });
});