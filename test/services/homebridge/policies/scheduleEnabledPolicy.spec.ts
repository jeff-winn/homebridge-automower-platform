import { Calendar, RestrictedReason } from '../../../../src/model';
import { DeterministicScheduleEnabledPolicy } from '../../../../src/services/homebridge/policies/scheduleEnabledPolicy';

describe('DeterministicScheduleEnabledPolicy', () => {
    let target: DeterministicScheduleEnabledPolicy;

    beforeEach(() => {
        target = new DeterministicScheduleEnabledPolicy();
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
});