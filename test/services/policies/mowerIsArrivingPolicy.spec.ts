import { Activity, Mode, State } from '../../../src/clients/automower/automowerClient';
import { DeterministicMowerIsArrivingPolicy } from '../../../src/services/policies/mowerIsArrivingPolicy';

describe('DeterministicMowerIsArrivingPolicy', () => {
    let target: DeterministicMowerIsArrivingPolicy;

    beforeEach(() => {
        target = new DeterministicMowerIsArrivingPolicy();
    });

    it('should return false when the mower state is not set', () => {
        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return false when the mower state is in operation', () => {
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

    it('should return true when the mower state is going home but not in operation', () => {
        target.setMowerState({
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.STOPPED
        });

        const result = target.check();

        expect(result).toBeFalsy();
    });

    it('should return true when the mower state is going home', () => {
        target.setMowerState({
            activity: Activity.GOING_HOME,
            errorCode: 0,
            errorCodeTimestamp: 0,
            mode: Mode.MAIN_AREA,
            state: State.IN_OPERATION
        });

        const result = target.check();

        expect(result).toBeTruthy();
    });
});