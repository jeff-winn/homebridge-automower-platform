import { InvalidStateError } from '../../../../src/errors/invalidStateError';
import { Activity, Calendar, Mode, RestrictedReason, State } from '../../../../src/model';
import { DeterministicScheduleEnabledPolicy } from '../../../../src/services/homebridge/policies/scheduleEnabledPolicy';

describe('DeterministicScheduleEnabledPolicy', () => {
    let target: DeterministicScheduleEnabledPolicy;

    beforeEach(() => {
        target = new DeterministicScheduleEnabledPolicy();
    });

    it('should return true when the mower state is undefined', () => {
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

        expect(result).toBeTruthy();
    });

    it('should return false when the mower is in operation', () => {
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
    
    it('should update the characteristic as false when calendar is not scheduled to start', () => {
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

        const result = target.apply();

        expect(result).toBeFalsy();
    });

    it('should update the characteristic as false when calendar and planner is not scheduled to start', () => {
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
            restrictedReason: RestrictedReason.NOT_APPLICABLE
        });

        const result = target.apply();

        expect(result).toBeFalsy();
    });

    it('should throw an error when calendar is undefined', () => {
        target.setPlanner({
            nextStartTimestamp: 0,
            override: { },
            restrictedReason: RestrictedReason.NONE
        });

        let thrown = false;
        try {
            target.apply();
        } catch (e) {
            if (e instanceof InvalidStateError) {
                thrown = true;
            } else {
                throw e;
            }
        }

        expect(thrown).toBeTruthy();
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

        let thrown = false;
        try {
            target.apply();
        } catch (e) {
            if (e instanceof InvalidStateError) {
                thrown = true;
            } else {
                throw e;
            }
        }

        expect(thrown).toBeTruthy();
    });
});