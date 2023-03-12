import { Mock, Times } from 'moq.ts';

import * as model from '../../../../src/model';

import { Activity, AutomowerClient, HeadlightMode, Mode, Mower, OverrideAction, RestrictedReason, State } from '../../../../src/clients/automower/automowerClient';
import { PlatformLogger } from '../../../../src/diagnostics/platformLogger';
import { NotAuthorizedError } from '../../../../src/errors/notAuthorizedError';
import { AccessToken } from '../../../../src/model';
import { AccessTokenManager } from '../../../../src/services/husqvarna/accessTokenManager';
import { AutomowerGetMowersService } from '../../../../src/services/husqvarna/automower/automowerGetMowersService';
import { AutomowerActivityConverter } from '../../../../src/services/husqvarna/automower/converters/automowerActivityConverter';
import { AutomowerStateConverter } from '../../../../src/services/husqvarna/automower/converters/automowerStateConverter';

describe('GetMowersServiceImpl', () => {
    let tokenManager: Mock<AccessTokenManager>;
    let activityConverter: Mock<AutomowerActivityConverter>;
    let stateConverter: Mock<AutomowerStateConverter>;
    let client: Mock<AutomowerClient>;
    let log: Mock<PlatformLogger>;
    let target: AutomowerGetMowersService;

    beforeEach(() => {        
        tokenManager = new Mock<AccessTokenManager>();
        activityConverter = new Mock<AutomowerActivityConverter>();
        stateConverter = new Mock<AutomowerStateConverter>();
        client = new Mock<AutomowerClient>();
        log = new Mock<PlatformLogger>();

        target = new AutomowerGetMowersService(tokenManager.object(), activityConverter.object(), 
            stateConverter.object(), client.object(), log.object());
    });

    it('should flag the token as invalid on getMowers', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };
        
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        tokenManager.setup(x => x.flagAsInvalid()).returns(undefined);
        client.setup(x => x.getMowers(token)).throws(new NotAuthorizedError('Ouch', 'ERR0000'));

        await expect(target.getMowers()).rejects.toThrow(NotAuthorizedError);

        tokenManager.verify(x => x.flagAsInvalid(), Times.Once());
    });

    it('should get all the mowers from the client', async () => {
        const token: AccessToken = {
            value: 'access token',
            provider: 'provider'
        };

        const mower: Mower = {
            id: 'abcd1234',
            type: 'mower',
            attributes: {
                battery: {
                    batteryPercent: 100
                },
                calendar: {
                    tasks: [ ]
                },
                metadata: {
                    connected: true,
                    statusTimestamp: 100
                },
                mower: {
                    activity: Activity.MOWING,
                    errorCode: 0,
                    errorCodeTimestamp: 0,
                    mode: Mode.MAIN_AREA,
                    state: State.IN_OPERATION
                },
                planner: {
                    nextStartTimestamp: 0,
                    override: {
                        action: OverrideAction.NO_SOURCE
                    },
                    restrictedReason: RestrictedReason.NOT_APPLICABLE
                },
                positions: [ ],
                settings: {
                    cuttingHeight: 1,
                    headlight: {
                        mode: HeadlightMode.ALWAYS_ON
                    }
                },
                statistics: {
                    numberOfChargingCycles: 0,
                    numberOfCollisions: 0,
                    totalChargingTime: 0,
                    totalCuttingTime: 0,
                    totalRunningTime: 0,
                    totalSearchingTime: 0
                },
                system: {
                    model: 'hello 12345',
                    name: 'dobby',
                    serialNumber: 123456
                }
            }
        };
    
        tokenManager.setup(x => x.getCurrentToken()).returns(Promise.resolve(token));
        activityConverter.setup(o => o.convert(mower)).returns(model.Activity.MOWING);
        stateConverter.setup(o => o.convert(mower)).returns(model.State.IN_OPERATION);
        client.setup(x => x.getMowers(token)).returns(Promise.resolve([ mower ]));

        const result = await target.getMowers();

        expect(result).toBeDefined();

        const actual = result![0]!;

        expect(actual).toBeDefined();        
        expect(actual).toStrictEqual<model.Mower>({
            id: 'abcd1234',
            attributes: {
                location: undefined,
                battery: {
                    level: 100
                },
                connection: {
                    connected: true
                },
                metadata: {
                    manufacturer: 'hello',
                    model: '12345',
                    name: 'dobby',
                    serialNumber: '123456'
                },
                mower: {
                    activity: model.Activity.MOWING,
                    state: model.State.IN_OPERATION
                },
                schedule: {
                    runContinuously: false,
                    runInFuture: false,
                    runOnSchedule: false
                },
                settings: {
                    cuttingHeight: 1
                }
            }
        });
    });

    // TODO: Clean this up.
    // it('should update the characteristic as true when scheduled to start', () => {
    //     const c = new Mock<Characteristic>();
    //     c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
    //     c.setup(o => o.on(CharacteristicEventTypes.SET, 
    //         It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());        

    //     const cuttingHeight = new Mock<Characteristic>();
    //     cuttingHeight.setup(o => o.on(CharacteristicEventTypes.SET,
    //         It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(cuttingHeight.object());
    
    //     const statusActive = new Mock<Characteristic>();

    //     policy.setup(o => o.setPlanner(It.IsAny())).returns(undefined);
    //     policy.setup(o => o.setCalendar(It.IsAny())).returns(undefined);
    //     policy.setup(o => o.shouldApply()).returns(true);
    //     policy.setup(o => o.check()).returns(true);

    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
    //     service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
    //     service.setup(o => o.testCharacteristic(DISPLAY_NAME)).returns(true);
    //     service.setup(o => o.getCharacteristic(DISPLAY_NAME)).returns(cuttingHeight.object());

    //     platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
    //     log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

    //     target.init(NameMode.DEFAULT);

    //     const calendar: Calendar = {
    //         tasks: [
    //             {
    //                 start: 1,
    //                 duration: 1,
    //                 sunday: true,
    //                 monday: true,
    //                 tuesday: true,
    //                 wednesday: true,
    //                 thursday: true,
    //                 friday: true,
    //                 saturday: true
    //             }
    //         ]
    //     };

    //     const planner: Planner = {
    //         nextStartTimestamp: 12345,
    //         override: { },
    //         restrictedReason: RestrictedReason.WEEK_SCHEDULE
    //     };

    //     target.setCalendar(calendar);
    //     target.setPlanner(planner);

    //     policy.verify(o => o.setCalendar(calendar), Times.Once());
    //     policy.verify(o => o.setPlanner(planner), Times.Once());
    //     c.verify(o => o.updateValue(true), Times.Once());
    // });

    // it('should update the characteristic as false when planner is not scheduled to start', () => {
    //     const c = new Mock<Characteristic>();
    //     c.setup(o => o.updateValue(It.IsAny<boolean>())).returns(c.object());
    //     c.setup(o => o.on(CharacteristicEventTypes.SET, 
    //         It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(c.object());
        
    //     const cuttingHeight = new Mock<Characteristic>();
    //     cuttingHeight.setup(o => o.on(CharacteristicEventTypes.SET,
    //         It.IsAny<(o1: CharacteristicValue, o2: CharacteristicSetCallback) => void>())).returns(cuttingHeight.object());
    
    //     const statusActive = new Mock<Characteristic>();
        
    //     policy.setup(o => o.setPlanner(It.IsAny())).returns(undefined);
    //     policy.setup(o => o.setCalendar(It.IsAny())).returns(undefined);
    //     policy.setup(o => o.shouldApply()).returns(true);
    //     policy.setup(o => o.check()).returns(false);

    //     const service = new Mock<Service>();
    //     service.setup(o => o.getCharacteristic(Characteristic.On)).returns(c.object());
    //     service.setup(o => o.testCharacteristic(Characteristic.StatusActive)).returns(true);
    //     service.setup(o => o.getCharacteristic(Characteristic.StatusActive)).returns(statusActive.object());
    //     service.setup(o => o.testCharacteristic(DISPLAY_NAME)).returns(true);
    //     service.setup(o => o.getCharacteristic(DISPLAY_NAME)).returns(cuttingHeight.object());

    //     platformAccessory.setup(o => o.getServiceById(Service.Switch, 'Schedule')).returns(service.object());
    //     log.setup(o => o.info(It.IsAny(), It.IsAny())).returns(undefined);

    //     target.init(NameMode.DEFAULT);
    //     target.unsafeSetLastValue(true);

    //     const calendar: Calendar = {
    //         tasks: [
    //             {
    //                 start: 1,
    //                 duration: 1,
    //                 sunday: true,
    //                 monday: true,
    //                 tuesday: true,
    //                 wednesday: true,
    //                 thursday: true,
    //                 friday: true,
    //                 saturday: true
    //             }
    //         ]
    //     };

    //     const planner: Planner = {
    //         nextStartTimestamp: 0,
    //         override: { },
    //         restrictedReason: RestrictedReason.NOT_APPLICABLE
    //     };

    //     target.setCalendar(calendar);
    //     target.setPlanner(planner);

    //     policy.verify(o => o.setCalendar(calendar), Times.Once());
    //     policy.verify(o => o.setPlanner(planner), Times.Once());
    //     c.verify(o => o.updateValue(false), Times.Once());
    // });
});