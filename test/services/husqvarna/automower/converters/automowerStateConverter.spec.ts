import { Mock } from 'moq.ts';

import { PlatformLogger } from '../../../../../src/diagnostics/platformLogger';
import { AutomowerStateConverterImpl } from '../../../../../src/services/husqvarna/automower/converters/automowerStateConverter';

describe('AutomowerStateConverterImpl', () => {
    let log: Mock<PlatformLogger>;

    let target: AutomowerStateConverterImpl;

    beforeEach(() => {
        log = new Mock<PlatformLogger>();

        target = new AutomowerStateConverterImpl(log.object());
    });

    // TODO: Clean this up.
    // it('should return false when mower state is unknown', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.UNKNOWN
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is not applicable', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.NOT_APPLICABLE
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is paused', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.PAUSED
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is in operation', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.IN_OPERATION
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is wait updating', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.WAIT_UPDATING
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is wait power up', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.WAIT_POWER_UP
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is restricted', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.RESTRICTED
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is off', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.OFF
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is stopped', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.STOPPED
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is error and error code is zero', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.ERROR
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return true when mower state is error and error code is non-zero', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 1,
    //         errorCodeTimestamp: 1,
    //         mode: Mode.UNKNOWN,
    //         state: State.ERROR
    //     });

    //     const result = target.check();

    //     expect(result).toBeTruthy();
    // });

    // it('should return false when mower state is fatal error and error code is zero', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.FATAL_ERROR
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return true when mower state is fatal error and error code is non-zero', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 1,
    //         errorCodeTimestamp: 1,
    //         mode: Mode.UNKNOWN,
    //         state: State.FATAL_ERROR
    //     });

    //     const result = target.check();

    //     expect(result).toBeTruthy();
    // });

    // it('should return false when mower state is error at power up and error code is zero', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 0,
    //         errorCodeTimestamp: 0,
    //         mode: Mode.UNKNOWN,
    //         state: State.ERROR_AT_POWER_UP
    //     });

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return true when mower state is error at power up and error code is non-zero', () => {
    //     target.setMowerState({
    //         activity: Activity.UNKNOWN,
    //         errorCode: 1,
    //         errorCodeTimestamp: 1,
    //         mode: Mode.UNKNOWN,
    //         state: State.ERROR_AT_POWER_UP
    //     });

    //     const result = target.check();

    //     expect(result).toBeTruthy();
    // });

    // TODO: Clean this up.
    // it('should return false when mower state is unknown', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.UNKNOWN, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is not applicable', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.NOT_APPLICABLE, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is paused', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.PAUSED, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is unknown', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.IN_OPERATION, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is wait updating', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.WAIT_UPDATING, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is wait power up', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.WAIT_POWER_UP, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is restricted', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.RESTRICTED, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is off', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.OFF, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is error', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.ERROR, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is fatal error', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.FATAL_ERROR, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return false when mower state is error at power up', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.ERROR_AT_POWER_UP, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });

    // it('should return true when stopped and error code is non-zero', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.STOPPED, 
    //         errorCode: 18,
    //         errorCodeTimestamp: 1655819118000            
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeTruthy();
    // });

    // it('should return false when stopped and error code is zero', () => {
    //     const state: MowerState = {
    //         activity: Activity.UNKNOWN,
    //         mode: Mode.MAIN_AREA,
    //         state: State.STOPPED, 
    //         errorCode: 0,
    //         errorCodeTimestamp: 0
    //     };

    //     target.setMowerState(state);

    //     const result = target.check();

    //     expect(result).toBeFalsy();
    // });
});